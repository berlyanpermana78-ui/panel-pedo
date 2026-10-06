import type { IncomingMessage, ServerResponse } from 'node:http';
import { randomUUID } from 'node:crypto';
import { ApiError } from '../errors.js';
import { maxCodeSize } from '../config.js';

export { ApiError };

export const newRequestId = (): string => `req_${randomUUID().replace(/-/g, '').slice(0, 12)}`;

const BASE_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
};

/** Semua response API lewat fungsi ini => selalu JSON. */
export function sendJson(
  res: ServerResponse,
  status: number,
  payload: unknown,
  extraHeaders: Record<string, string> = {}
): void {
  if (res.headersSent) {
    try {
      res.end();
    } catch {
      // ignore
    }
    return;
  }
  const body = JSON.stringify(payload);
  for (const [key, value] of Object.entries({ ...BASE_HEADERS, ...extraHeaders })) {
    res.setHeader(key, value);
  }
  res.statusCode = status;
  res.setHeader('Content-Length', Buffer.byteLength(body));
  res.end(body);
}

export const sendSuccess = (res: ServerResponse, data: unknown, status = 200): void =>
  sendJson(res, status, { success: true, data });

export function sendError(
  res: ServerResponse,
  status: number,
  code: string,
  message: string,
  requestId: string,
  details: unknown = null,
  extraHeaders: Record<string, string> = {}
): void {
  sendJson(
    res,
    status,
    { success: false, error: { code, message, details, requestId } },
    extraHeaders
  );
}

/** Batas ukuran body mentah (JSON meng-escape karakter, jadi lebih besar dari MAX_CODE_SIZE). */
const bodyLimit = (): number => Math.max(65536, maxCodeSize() * 4 + 16384);

function parseJsonText(text: string): Record<string, unknown> {
  if (!text.trim()) return {};
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new ApiError(400, 'INVALID_JSON', 'Request body is not valid JSON');
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new ApiError(400, 'INVALID_JSON', 'Request body must be a JSON object');
  }
  return parsed as Record<string, unknown>;
}

/**
 * Membaca body JSON. Mendukung:
 * - Vercel (req.body sudah di-parse oleh platform, bisa melempar jika JSON rusak)
 * - Node http / Vite middleware (stream mentah)
 */
export async function readJsonBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  const anyReq = req as IncomingMessage & { body?: unknown };

  let platformBody: unknown;
  try {
    platformBody = anyReq.body;
  } catch {
    throw new ApiError(400, 'INVALID_JSON', 'Request body is not valid JSON');
  }

  if (platformBody !== undefined && platformBody !== null) {
    if (typeof platformBody === 'string') return parseJsonText(platformBody);
    if (Buffer.isBuffer(platformBody)) return parseJsonText(platformBody.toString('utf-8'));
    if (typeof platformBody === 'object' && !Array.isArray(platformBody)) {
      if (Buffer.byteLength(JSON.stringify(platformBody)) > bodyLimit()) {
        throw new ApiError(413, 'LIMIT_EXCEEDED', 'Code or output exceeds the allowed limit');
      }
      return platformBody as Record<string, unknown>;
    }
    throw new ApiError(400, 'INVALID_JSON', 'Request body must be a JSON object');
  }

  const limit = bodyLimit();
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buf.length;
    if (size > limit) {
      req.resume();
      throw new ApiError(413, 'LIMIT_EXCEEDED', 'Code or output exceeds the allowed limit');
    }
    chunks.push(buf);
  }
  return parseJsonText(Buffer.concat(chunks).toString('utf-8'));
}
