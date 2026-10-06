import { spawn, type ChildProcess } from 'node:child_process';
import os from 'node:os';
import { maxOutputSize } from '../config.js';

export function truncateOutput(text: string): string {
  const limit = maxOutputSize();
  if (text.length > limit) {
    return text.slice(0, limit) + `\n\n[Output exceeded maximum size (${limit} chars) and was truncated]`;
  }
  return text;
}

export interface ProcessResult {
  stdout: string;
  stderr: string;
  exitCode: number | null;
  timedOut: boolean;
  truncated: boolean;
}

function killTree(proc: ChildProcess): void {
  try {
    if (process.platform !== 'win32' && proc.pid) {
      // proses di-spawn detached => kill seluruh process group (anak & cucu)
      process.kill(-proc.pid, 'SIGKILL');
      return;
    }
  } catch {
    // fallback ke kill biasa
  }
  try {
    proc.kill('SIGKILL');
  } catch {
    // ignore
  }
}

/**
 * Menjalankan binary TANPA shell (argv array => aman dari shell injection),
 * dengan timeout, batas output, environment bersih (tanpa secret server),
 * dan cleanup process group. Hanya dipanggil saat request meminta eksekusi.
 */
export function runProcessSafe(
  command: string,
  args: string[],
  cwd: string,
  timeoutMs = 5000,
  extraEnv: Record<string, string> = {}
): Promise<ProcessResult> {
  return new Promise((resolve) => {
    const limit = maxOutputSize();
    let stdout = '';
    let stderr = '';
    let timedOut = false;
    let truncated = false;
    let settled = false;

    const sanitizedEnv: NodeJS.ProcessEnv = {
      PATH: process.env.PATH || '',
      LANG: 'en_US.UTF-8',
      LC_ALL: 'en_US.UTF-8',
      HOME: cwd,
      TMPDIR: os.tmpdir(),
      PYTHONUNBUFFERED: '1',
      NODE_ENV: 'sandbox',
      ...extraEnv,
    };

    let proc: ChildProcess;
    const finish = (exitCode: number | null, extraStderr = '') => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({
        stdout: truncateOutput(stdout),
        stderr: truncateOutput(stderr + extraStderr),
        exitCode,
        timedOut,
        truncated,
      });
    };

    let timer: NodeJS.Timeout;
    try {
      proc = spawn(command, args, {
        cwd,
        env: sanitizedEnv,
        stdio: ['ignore', 'pipe', 'pipe'],
        windowsHide: true,
        detached: process.platform !== 'win32',
      });
    } catch (err: any) {
      resolve({
        stdout: '',
        stderr: `Failed to spawn ${command}: ${err?.message || 'unknown error'}`,
        exitCode: 1,
        timedOut: false,
        truncated: false,
      });
      return;
    }

    timer = setTimeout(() => {
      timedOut = true;
      killTree(proc);
      finish(null, `\nExecution timed out (${timeoutMs}ms)`);
    }, timeoutMs);

    const collect = (which: 'out' | 'err') => (chunk: Buffer) => {
      if (settled) return;
      if (which === 'out') stdout += chunk.toString();
      else stderr += chunk.toString();
      if (stdout.length + stderr.length > limit * 2) {
        // output liar: hentikan proses supaya tidak memenuhi memori
        truncated = true;
        killTree(proc);
        finish(null);
      }
    };

    proc.stdout?.on('data', collect('out'));
    proc.stderr?.on('data', collect('err'));
    proc.on('error', (err) => finish(1, `\nProcess error: ${err.message}`));
    proc.on('close', (code) => finish(code));
  });
}

// Cache singkat agar deteksi runtime tidak men-spawn proses di setiap request.
const detectionCache = new Map<string, { available: boolean; version: string | null; message?: string; timestamp: number }>();

export async function checkBinaryVersion(
  command: string,
  args: string[] = ['--version'],
  timeoutMs = 2500
): Promise<{ available: boolean; version: string | null; message?: string }> {
  const cacheKey = `${command}:${args.join(' ')}`;
  const cached = detectionCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < 30000) {
    return { available: cached.available, version: cached.version, message: cached.message };
  }

  const { stdout, stderr, exitCode } = await runProcessSafe(command, args, os.tmpdir(), timeoutMs);
  const out = (stdout || stderr).trim();

  let result: { available: boolean; version: string | null; message?: string };
  if (exitCode === 0 && out) {
    result = {
      available: true,
      version: out
        .split('\n')[0]
        .replace(/^(gcc|g\+\+|clang|clang\+\+|Python|javac|java|node)\s*/i, '')
        .trim(),
    };
  } else {
    result = { available: false, version: null, message: 'runtime unavailable' };
  }

  detectionCache.set(cacheKey, { ...result, timestamp: Date.now() });
  return result;
}
