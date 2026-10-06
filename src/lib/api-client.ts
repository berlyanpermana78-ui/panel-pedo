/**
 * API client terpusat BILZX CODEX.
 *
 * Aturan: JANGAN pernah memanggil `response.json()` langsung. Semua pemanggilan
 * /api/* lewat `apiRequest`, yang memeriksa status HTTP dan Content-Type
 * sebelum mem-parse JSON, sehingga error seperti
 *   Unexpected token 'T', "The page c"... is not valid JSON
 * tidak pernah muncul lagi — diganti pesan yang jelas, mis.
 *   API endpoint /api/run returned 404
 */

export type ApiErrorKind = 'http' | 'non-json' | 'invalid-json' | 'network' | 'timeout' | 'api';

export class ApiError extends Error {
  readonly endpoint: string;
  readonly status: number | null;
  readonly code: string;
  readonly kind: ApiErrorKind;
  readonly requestId: string | null;
  readonly details: unknown;

  constructor(
    message: string,
    init: {
      endpoint: string;
      status?: number | null;
      code?: string;
      kind: ApiErrorKind;
      requestId?: string | null;
      details?: unknown;
    }
  ) {
    super(message);
    this.name = 'ApiError';
    this.endpoint = init.endpoint;
    this.status = init.status ?? null;
    this.code = init.code ?? 'API_ERROR';
    this.kind = init.kind;
    this.requestId = init.requestId ?? null;
    this.details = init.details ?? null;
  }
}

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
  signal?: AbortSignal;
  timeoutMs?: number;
  /** Override base URL (test). Default: VITE_API_BASE_URL atau relative "/api/...". */
  baseUrl?: string;
}

const envBase = (): string => {
  try {
    return ((import.meta as any).env?.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') || '';
  } catch {
    return '';
  }
};

function withQuery(endpoint: string, query?: ApiRequestOptions['query']): string {
  if (!query) return endpoint;
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v !== undefined && v !== null) params.set(k, String(v));
  }
  const qs = params.toString();
  return qs ? `${endpoint}${endpoint.includes('?') ? '&' : '?'}${qs}` : endpoint;
}

/**
 * Memanggil endpoint API dan mengembalikan `data` dari envelope
 * `{ success: true, data }`. Melempar ApiError untuk semua kegagalan.
 */
export async function apiRequest<T = unknown>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
  const { body, query, signal, timeoutMs = 60000, baseUrl } = options;
  const method = (options.method ?? 'GET').toUpperCase();
  const url = (baseUrl ?? envBase()) + withQuery(endpoint, query);

  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);
  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener('abort', () => controller.abort(), { once: true });
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers: body !== undefined ? { 'Content-Type': 'application/json', Accept: 'application/json' } : { Accept: 'application/json' },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache: 'no-store',
      credentials: 'same-origin',
      signal: controller.signal,
    });
  } catch (err: any) {
    clearTimeout(timer);
    if (timedOut) {
      throw new ApiError(`API endpoint ${endpoint} timed out after ${Math.round(timeoutMs / 1000)}s`, {
        endpoint,
        kind: 'timeout',
        code: 'CLIENT_TIMEOUT',
      });
    }
    if (err?.name === 'AbortError') throw err; // dibatalkan oleh pemanggil
    // Hanya fetch yang benar-benar gagal (tidak ada response) yang dianggap network error;
    // pesan asli browser disertakan agar penyebabnya tidak tersamar.
    const cause = err?.message ? String(err.message) : 'unknown';
    const target = /^https?:\/\//.test(url) ? url : (typeof location !== 'undefined' ? location.origin : '') + url;
    throw new ApiError(`Could not reach API endpoint ${endpoint} (${method}): ${cause} [${target}]`, {
      endpoint,
      kind: 'network',
      code: 'NETWORK_ERROR',
      details: cause,
    });
  }
  clearTimeout(timer);

  const requestId = response.headers.get('x-request-id');
  const contentType = response.headers.get('content-type') || '';

  // 1. Bukan JSON (HTML 404/500 dari platform, proxy, dll.)
  if (!contentType.includes('application/json')) {
    const text = await response.text().catch(() => '');
    throw new ApiError(
      response.ok
        ? `API endpoint ${endpoint} returned a non-JSON response (${response.status})`
        : `API endpoint ${endpoint} returned ${response.status}`,
      {
        endpoint,
        status: response.status,
        kind: 'non-json',
        code: response.status === 404 ? 'NOT_FOUND' : 'NON_JSON_RESPONSE',
        requestId,
        details: text.slice(0, 200),
      }
    );
  }

  // 2. JSON, tapi rusak
  let payload: any;
  try {
    payload = await response.json();
  } catch {
    throw new ApiError(`API endpoint ${endpoint} returned invalid JSON (${response.status})`, {
      endpoint,
      status: response.status,
      kind: 'invalid-json',
      code: 'INVALID_JSON_RESPONSE',
      requestId,
    });
  }

  // 3. Envelope error dari API kita
  if (payload && payload.success === false) {
    const err = payload.error || {};
    throw new ApiError(err.message || `API endpoint ${endpoint} returned ${response.status}`, {
      endpoint,
      status: response.status,
      kind: 'api',
      code: err.code || 'API_ERROR',
      requestId: err.requestId || requestId,
      details: err.details,
    });
  }

  if (!response.ok) {
    throw new ApiError(`API endpoint ${endpoint} returned ${response.status}`, {
      endpoint,
      status: response.status,
      kind: 'http',
      requestId,
    });
  }

  if (!payload || payload.success !== true) {
    throw new ApiError(`API endpoint ${endpoint} returned an unexpected response shape`, {
      endpoint,
      status: response.status,
      kind: 'invalid-json',
      code: 'UNEXPECTED_SHAPE',
      requestId,
    });
  }

  return payload.data as T;
}

/** Ringkasan error untuk UI ("Runtime Server Error"). */
export function describeApiError(err: unknown): {
  title: string;
  message: string;
  endpoint: string | null;
  status: number | null;
  requestId: string | null;
  code: string | null;
} {
  if (err instanceof ApiError) {
    return {
      title: err.code === 'RUNTIME_UNAVAILABLE' ? 'Runtime Unavailable' : 'Runtime Server Error',
      message: err.message,
      endpoint: err.endpoint,
      status: err.status,
      requestId: err.requestId,
      code: err.code,
    };
  }
  return {
    title: 'Runtime Server Error',
    message: err instanceof Error ? err.message : 'Unknown error',
    endpoint: null,
    status: null,
    requestId: null,
    code: null,
  };
}
