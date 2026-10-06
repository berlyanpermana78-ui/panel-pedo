import type { IncomingMessage, ServerResponse } from 'node:http';
import { ApiError, readJsonBody, newRequestId, sendError, sendSuccess } from './http.js';
import { runtimeUnavailable } from '../errors.js';
import {
  ID_REGEX,
  environmentName,
  isProduction,
  isVercel,
  MAX_REQUEST_TIMEOUT_MS,
  maxCodeSize,
  platformName,
  storageMode,
} from '../config.js';
import { runtimeManager } from '../runtime/manager.js';
import type { SqlRuntimeAdapter } from '../runtime/sql.js';
import type { ExecutionResult, RuntimeAvailability } from '../runtime/types.js';
import { dbManager } from '../database/manager.js';
import {
  getInstalledPackages,
  getPythonEnvironment,
  getRequirementsTxt,
  installPackage,
  searchPyPi,
  uninstallPackage,
} from '../pythonManager.js';

type Method = 'GET' | 'POST';

interface Ctx {
  req: IncomingMessage;
  query: URLSearchParams;
  requestId: string;
  body: () => Promise<Record<string, unknown>>;
}

type Handler = (ctx: Ctx) => Promise<unknown>;

const LANGUAGE_REGEX = /^[a-zA-Z0-9+#.-]{1,20}$/;
const FILENAME_REGEX = /^[a-zA-Z0-9_][a-zA-Z0-9_.-]{0,99}$/;

// ---------------------------------------------------------------------------
// Validasi input
// ---------------------------------------------------------------------------

function readString(body: Record<string, unknown>, key: string, maxLen: number, required = true): string | undefined {
  const value = body[key];
  if (value === undefined || value === null || value === '') {
    if (required) throw new ApiError(400, 'INVALID_INPUT', `Field "${key}" is required`);
    return undefined;
  }
  if (typeof value !== 'string') throw new ApiError(400, 'INVALID_INPUT', `Field "${key}" must be a string`);
  if (value.length > maxLen) throw new ApiError(400, 'INVALID_INPUT', `Field "${key}" is too long`);
  return value;
}

function readProjectId(value: unknown, fallback = 'default'): string {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value !== 'string' || !ID_REGEX.test(value)) {
    throw new ApiError(400, 'INVALID_INPUT', 'Invalid projectId (use letters, numbers, "-" or "_", max 64 chars)');
  }
  return value;
}

function readCode(body: Record<string, unknown>, key = 'code'): string {
  const value = body[key];
  if (typeof value !== 'string' || !value.trim()) {
    throw new ApiError(400, 'INVALID_INPUT', `Field "${key}" is required`);
  }
  if (Buffer.byteLength(value, 'utf-8') > maxCodeSize()) {
    throw new ApiError(413, 'LIMIT_EXCEEDED', 'Code or output exceeds the allowed limit', {
      limit: maxCodeSize(),
    });
  }
  return value;
}

function readFilename(value: unknown): string | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value !== 'string' || !FILENAME_REGEX.test(value) || value.includes('..')) {
    throw new ApiError(400, 'INVALID_INPUT', 'Invalid filename');
  }
  return value;
}

function readTimeout(value: unknown): number | undefined {
  if (value === undefined || value === null) return undefined;
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) throw new ApiError(400, 'INVALID_INPUT', 'Invalid timeoutMs');
  return Math.min(Math.max(Math.floor(n), 100), MAX_REQUEST_TIMEOUT_MS);
}

function readArgs(value: unknown): string[] | undefined {
  if (value === undefined || value === null) return undefined;
  if (!Array.isArray(value) || value.length > 20 || value.some((a) => typeof a !== 'string' || a.length > 200)) {
    throw new ApiError(400, 'INVALID_INPUT', 'Invalid args (max 20 strings, 200 chars each)');
  }
  return value as string[];
}

function resolveAdapter(body: Record<string, unknown>) {
  const language = readString(body, 'language', 20)!;
  if (!LANGUAGE_REGEX.test(language)) {
    throw new ApiError(400, 'UNSUPPORTED_RUNTIME', 'Unsupported runtime', { language: language.slice(0, 20) });
  }
  const adapter = runtimeManager.getAdapter(language);
  if (!adapter) {
    throw new ApiError(400, 'UNSUPPORTED_RUNTIME', `Runtime "${language}" is not supported`, { language });
  }
  return { language, adapter };
}

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

function publicRuntime(r: RuntimeAvailability) {
  return {
    available: r.available,
    version: r.version,
    state: r.state ?? (r.available ? 'available' : 'unavailable'),
    ...(r.message ? { message: r.message } : {}),
    ...(r.compiler ? { compiler: r.compiler, compilerVersion: r.compilerVersion ?? null } : {}),
  };
}

const health: Handler = async () => ({
  service: 'BILZX CODEX',
  status: 'ok',
  environment: environmentName(),
  platform: platformName(),
  version: '1.0.0',
});

const runtimes: Handler = async () => {
  // Deteksi runtime dilakukan LAZY, hanya saat endpoint ini dipanggil.
  const raw = await runtimeManager.getAllRuntimesStatus();
  const data: Record<string, unknown> = {};
  for (const [id, value] of Object.entries(raw)) data[id] = publicRuntime(value);

  data.html = { available: true, version: null, state: 'available', type: 'sandboxed-iframe' };

  const executable = ['node', 'typescript', 'python', 'java', 'c', 'cpp'];
  const availableCount = executable.filter((id) => raw[id]?.available).length;
  const status = availableCount === 0 ? 'unavailable' : availableCount === executable.length ? 'online' : 'limited';

  data.server = {
    status,
    environment: environmentName(),
    platform: platformName(),
    persistence: storageMode(),
  };
  return data;
};

async function recordExecution(
  projectId: string,
  language: string,
  filename: string | undefined,
  result: ExecutionResult
): Promise<void> {
  try {
    await dbManager.recordExecution({
      project_id: projectId,
      runtime: result.runtime || language,
      language,
      file: filename || 'main',
      command: result.command || '',
      status: result.status,
      exit_code: result.exitCode,
      duration_ms: result.duration,
      stdout: result.stdout || '',
      stderr: result.stderr || '',
    });
  } catch {
    // riwayat bersifat best-effort
  }
}

const run: Handler = async ({ body }) => {
  const b = await body();
  const { language, adapter } = resolveAdapter(b);
  const code = readCode(b);
  const projectId = readProjectId(b.projectId);
  const filename = readFilename(b.filename);

  const result = await runtimeManager.execute(language, {
    code,
    projectId,
    filename,
    args: readArgs(b.args),
    timeoutMs: readTimeout(b.timeoutMs),
  });

  if (result.status === 'Runtime Unavailable') throw runtimeUnavailable(adapter.id);

  await recordExecution(projectId, language, filename, result);
  return result;
};

const compile: Handler = async ({ body }) => {
  const b = await body();
  const { language, adapter } = resolveAdapter(b);
  const code = readCode(b);
  const projectId = readProjectId(b.projectId);

  const result = await runtimeManager.compile(language, {
    code,
    projectId,
    filename: readFilename(b.filename),
    timeoutMs: readTimeout(b.timeoutMs),
  });

  if (result.status === 'Runtime Unavailable') throw runtimeUnavailable(adapter.id);
  return result;
};

const sqlQuery: Handler = async ({ body }) => {
  const b = await body();
  const query = readCode(b, 'query');
  const projectId = readProjectId(b.projectId);

  const adapter = runtimeManager.getAdapter('sql') as SqlRuntimeAdapter;
  const availability = await adapter.checkAvailability();
  if (!availability.available) throw runtimeUnavailable('sql');

  const started = Date.now();
  const result = await adapter.executeSql(query, projectId);

  try {
    await dbManager.recordQueryHistory({
      project_id: projectId,
      query,
      status: result.success ? 'success' : 'error',
      rows: result.success ? result.data?.rowCount ?? 0 : 0,
      duration_ms: result.success ? result.data?.durationMs ?? 0 : Date.now() - started,
    });
  } catch {
    // best-effort
  }

  if (!result.success || !result.data) {
    throw new ApiError(400, 'SQL_ERROR', result.error || 'SQL execution failed');
  }
  return result.data;
};

const sqlHistory: Handler = async ({ query }) => {
  const projectId = readProjectId(query.get('projectId') ?? undefined);
  return { history: await dbManager.getQueryHistory(projectId) };
};

const executions: Handler = async () => ({ executions: await dbManager.getExecutions() });
const databaseHealth: Handler = async () => dbManager.getHealth();

const databaseBackup: Handler = async () => {
  if (isVercel()) {
    throw new ApiError(501, 'UNSUPPORTED_IN_DEPLOYMENT', 'Database backup is not supported in this deployment environment');
  }
  const result = await dbManager.backup();
  if (!result.success) throw new ApiError(500, 'BACKUP_FAILED', result.error || 'Backup failed');
  return { backupFile: result.backupFile };
};

const pythonPackages: Handler = async ({ query }) =>
  getInstalledPackages(readProjectId(query.get('projectId') ?? undefined));

const pythonSearch: Handler = async ({ query }) => {
  const q = (query.get('q') ?? '').trim();
  if (q.length > 100) throw new ApiError(400, 'INVALID_INPUT', 'Query is too long');
  return { packages: await searchPyPi(q) };
};

/** Frontend mengirim `package`; `packageName` diterima sebagai alias. */
function readPackageField(b: Record<string, unknown>): string {
  const raw = b.package ?? b.packageName;
  if (typeof raw !== 'string' || !raw.trim() || raw.length > 100) {
    throw new ApiError(400, 'INVALID_INPUT', 'Field "package" is required');
  }
  return raw;
}

const pythonInstall: Handler = async ({ body }) => {
  const b = await body();
  return installPackage(readProjectId(b.projectId), readPackageField(b));
};

const pythonUninstall: Handler = async ({ body }) => {
  const b = await body();
  return uninstallPackage(readProjectId(b.projectId), readPackageField(b));
};

const pythonRequirements: Handler = async ({ query }) => ({
  content: await getRequirementsTxt(readProjectId(query.get('projectId') ?? undefined)),
});

const pythonEnvironment: Handler = async () => getPythonEnvironment();

const routes: Record<string, Partial<Record<Method, Handler>>> = {
  health: { GET: health },
  runtimes: { GET: runtimes },
  run: { POST: run },
  compile: { POST: compile },
  executions: { GET: executions },
  'sql/query': { POST: sqlQuery },
  'sql/history': { GET: sqlHistory },
  'database/health': { GET: databaseHealth },
  'database/backup': { POST: databaseBackup },
  'python/packages': { GET: pythonPackages },
  'python/search': { GET: pythonSearch },
  'python/install': { POST: pythonInstall },
  'python/uninstall': { POST: pythonUninstall },
  'python/requirements': { GET: pythonRequirements },
  'python/environment': { GET: pythonEnvironment },
};

// ---------------------------------------------------------------------------
// Entry point (dipakai oleh Vercel, server.ts, dan middleware Vite)
// ---------------------------------------------------------------------------

/**
 * Menangani SATU request API dan SELALU membalas JSON — termasuk 404, 405,
 * body rusak, dan error tak terduga. Fungsi ini tidak pernah melempar.
 */
export async function handleApiRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const requestId = newRequestId();
  res.setHeader('X-Request-Id', requestId);

  try {
    const rawUrl = (req as IncomingMessage & { originalUrl?: string }).originalUrl || req.url || '/';
    const url = new URL(rawUrl, 'http://localhost');
    const routeKey = url.pathname.replace(/^\/api\/?/, '').replace(/\/+$/, '');
    const method = (req.method || 'GET').toUpperCase();

    const route = routes[routeKey];
    if (!route) {
      sendError(res, 404, 'NOT_FOUND', `API endpoint ${url.pathname.slice(0, 100)} was not found`, requestId);
      return;
    }

    const handler = route[method as Method];
    if (!handler) {
      const allowed = Object.keys(route).join(', ');
      sendError(res, 405, 'METHOD_NOT_ALLOWED', `Method ${method} is not allowed on this endpoint`, requestId, { allowed }, {
        Allow: allowed,
      });
      return;
    }

    const data = await handler({
      req,
      query: url.searchParams,
      requestId,
      body: () => readJsonBody(req),
    });
    sendSuccess(res, data);
  } catch (err) {
    if (err instanceof ApiError) {
      sendError(res, err.status, err.code, err.message, requestId, err.details, err.headers);
      return;
    }
    // Detail lengkap hanya di log server, tidak pernah ke client.
    console.error(`[api] ${requestId} unhandled error:`, err);
    sendError(
      res,
      500,
      'INTERNAL_SERVER_ERROR',
      'Internal server error',
      requestId,
      !isProduction() && err instanceof Error ? err.message : null
    );
  }
}
