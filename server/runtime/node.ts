import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { randomUUID } from 'node:crypto';
import type { RuntimeAdapter, ExecutionOptions, ExecutionResult, RuntimeAvailability, ValidationResult } from './types.js';
import { checkBinaryVersion, runProcessSafe } from './base.js';
import { nodeBin, runTimeoutMs } from '../config.js';

export class NodeRuntimeAdapter implements RuntimeAdapter {
  id = 'node';
  name = 'Node.js / JavaScript';
  extensions = ['.js', '.mjs', '.cjs'];

  private get bin(): string {
    return nodeBin();
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
            message: res.available ? undefined : 'Node.js runtime unavailable',
    };
  }

  async getVersion(): Promise<string | null> {
    const res = await this.checkAvailability();
    return res.version;
  }

  async validate(code: string): Promise<ValidationResult> {
    // Quick syntax check using node --check
    const tmpFile = path.join(os.tmpdir(), `check-${randomUUID()}.js`);
    try {
      await fs.writeFile(tmpFile, code, 'utf-8');
      const { stderr, exitCode } = await runProcessSafe(this.bin, ['--check', tmpFile], os.tmpdir(), 3000);
      await fs.rm(tmpFile, { force: true }).catch(() => {});
      if (exitCode === 0) {
        return { valid: true };
      }
      return { valid: false, errors: [stderr.trim() || 'Syntax error'] };
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
        stderr: 'Node.js runtime unavailable pada host sistem.',
        exitCode: 1,
        duration: 0,
        status: 'Runtime Unavailable',
        runtime: this.name,
      };
    }

    const runId = randomUUID();
    const tmpDir = path.join(os.tmpdir(), `bilzx-node-${runId}`);
    const filename = options.filename && !options.filename.includes('/') ? options.filename : 'main.js';
    const filePath = path.join(tmpDir, filename);

    const startTime = Date.now();
    try {
      await fs.mkdir(tmpDir, { recursive: true });
      await fs.writeFile(filePath, options.code, 'utf-8');

      const cmd = `${this.bin} ${filename}`;
      const timeout = options.timeoutMs || runTimeoutMs();
      const { stdout, stderr, exitCode, timedOut } = await runProcessSafe(
        this.bin,
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
      };
    } catch (err: any) {
      return {
        success: false,
        stdout: '',
        stderr: err.message || 'Node execution error',
        exitCode: 1,
        duration: Date.now() - startTime,
        status: 'Error',
        runtime: this.name,
        error: err.message,
      };
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
    }
  }
}
