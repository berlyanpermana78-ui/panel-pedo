import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { randomUUID } from 'node:crypto';
import type { RuntimeAdapter, ExecutionOptions, ExecutionResult, RuntimeAvailability, ValidationResult } from './types.js';
import { checkBinaryVersion, runProcessSafe } from './base.js';
import { pythonBin, runTimeoutMs, projectDir } from '../config.js';

export class PythonRuntimeAdapter implements RuntimeAdapter {
  id = 'python';
  name = 'Python 3';
  extensions = ['.py'];

  private get bin(): string {
    return pythonBin();
  }

  async detect(): Promise<boolean> {
    const res = await this.checkAvailability();
    return res.available;
  }

  async checkAvailability(): Promise<RuntimeAvailability> {
    const res = await checkBinaryVersion(this.bin, ['--version']);
    return {
      available: res.available,
      version: res.version,
            message: res.available ? undefined : 'Python runtime unavailable',
    };
  }

  async getVersion(): Promise<string | null> {
    const res = await this.checkAvailability();
    return res.version;
  }

  async validate(code: string): Promise<ValidationResult> {
    const tmpFile = path.join(os.tmpdir(), `check-${randomUUID()}.py`);
    try {
      await fs.writeFile(tmpFile, code, 'utf-8');
      const { stderr, exitCode } = await runProcessSafe(this.bin, ['-m', 'py_compile', tmpFile], os.tmpdir(), 3000);
      await fs.rm(tmpFile, { force: true }).catch(() => {});
      if (exitCode === 0) {
        return { valid: true };
      }
      return { valid: false, errors: [stderr.trim() || 'Python syntax error'] };
    } catch (e: any) {
      return { valid: false, errors: [e.message] };
    }
  }

  async execute(options: ExecutionOptions): Promise<ExecutionResult> {
    const avail = await this.checkAvailability();
    if (!avail.available) {
      return {
        success: false,
        stdout: '',
        stderr: 'Python runtime unavailable pada server.',
        exitCode: 1,
        duration: 0,
        status: 'Runtime Unavailable',
        runtime: this.name,
      };
    }

    const runId = randomUUID();
    const tmpDir = path.join(os.tmpdir(), `bilzx-py-${runId}`);
    const filename = options.filename && !options.filename.includes('/') ? options.filename : 'main.py';
    const filePath = path.join(tmpDir, filename);

    // Check project venv if exists
    let pythonCmd = this.bin;
    if (options.projectId) {
      const venvPy = path.join(projectDir(options.projectId), '.venv', 'bin', 'python');
      try {
        await fs.access(venvPy);
        pythonCmd = venvPy;
      } catch {
        pythonCmd = this.bin;
      }
    }

    const startTime = Date.now();
    try {
      await fs.mkdir(tmpDir, { recursive: true });
      await fs.writeFile(filePath, options.code, 'utf-8');

      const cmd = `${pythonCmd} ${filename}`;
      const timeout = options.timeoutMs || runTimeoutMs();
      const { stdout, stderr, exitCode, timedOut } = await runProcessSafe(
        pythonCmd,
        [filename, ...(options.args || [])],
        tmpDir,
        timeout
      );

      const duration = Date.now() - startTime;
      if (timedOut) {
        return {
          success: false,
          stdout,
          stderr,
          exitCode: null,
          duration,
          status: 'Timeout',
          command: cmd,
          runtime: this.name,
          error: 'Execution timed out',
        };
      }

      const success = exitCode === 0;
      return {
        success,
        stdout,
        stderr,
        exitCode,
        duration,
        status: success ? 'Success' : 'Error',
        command: cmd,
        runtime: this.name,
        error: success ? undefined : (stderr || `Exited with code ${exitCode}`),
      };
    } catch (err: any) {
      return {
        success: false,
        stdout: '',
        stderr: err.message || 'Python execution error',
        exitCode: 1,
        duration: Date.now() - startTime,
        status: 'Error',
        runtime: this.name,
      };
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
    }
  }
}
