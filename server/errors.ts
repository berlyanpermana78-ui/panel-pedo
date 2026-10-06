export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: unknown;
  readonly headers?: Record<string, string>;

  constructor(status: number, code: string, message: string, details: unknown = null, headers?: Record<string, string>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
    this.headers = headers;
  }
}

export const RUNTIME_LABELS: Record<string, string> = {
  node: 'Node.js',
  typescript: 'TypeScript',
  python: 'Python',
  java: 'Java',
  c: 'C',
  cpp: 'C++',
  sql: 'SQL',
};

export function runtimeUnavailable(runtimeId: string): ApiError {
  const label = RUNTIME_LABELS[runtimeId] || runtimeId;
  return new ApiError(
    503,
    'RUNTIME_UNAVAILABLE',
    `${label} runtime is not available in this deployment environment`,
    { runtime: runtimeId }
  );
}
