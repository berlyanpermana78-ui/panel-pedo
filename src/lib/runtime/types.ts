export interface ValidationResult {
  valid: boolean;
  errors?: string[];
  warnings?: string[];
}

export interface ExecutionOptions {
  code: string;
  projectId?: string;
  filename?: string;
  timeoutMs?: number;
  args?: string[];
  compileOnly?: boolean;
}

export interface ExecutionResult {
  success: boolean;
  stdout: string;
  stderr: string;
  exitCode: number | null;
  duration: number; // in milliseconds
  status: 'Success' | 'Error' | 'Timeout' | 'Runtime Unavailable' | 'Compilation Error';
  command?: string;
  runtime?: string;
  error?: string;
}

export interface RuntimeAvailability {
  available: boolean;
  version: string | null;
  path?: string;
  message?: string;
  compiler?: string;
  compilerVersion?: string | null;
}

export interface RuntimeAdapter {
  id: string;
  name: string;
  extensions: string[];
  detect(): Promise<boolean>;
  checkAvailability(): Promise<RuntimeAvailability>;
  getVersion(): Promise<string | null>;
  validate(code: string): Promise<ValidationResult>;
  execute(options: ExecutionOptions): Promise<ExecutionResult>;
  compile?(options: ExecutionOptions): Promise<ExecutionResult>;
}

export interface SystemRuntimesMap {
  node: RuntimeAvailability;
  javascript: RuntimeAvailability;
  typescript: RuntimeAvailability;
  python: RuntimeAvailability;
  java: RuntimeAvailability;
  c: RuntimeAvailability;
  cpp: RuntimeAvailability;
  sql: RuntimeAvailability;
}
