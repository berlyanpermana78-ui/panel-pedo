import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { randomUUID } from 'node:crypto';
import type { RuntimeAdapter, ExecutionOptions, ExecutionResult, RuntimeAvailability, ValidationResult } from './types.js';
import { checkBinaryVersion, runProcessSafe } from './base.js';
import { isVercel } from '../config.js';

export class TypeScriptRuntimeAdapter implements RuntimeAdapter {
  id = 'typescript';
  name = 'TypeScript Engine';
  extensions = ['.ts', '.tsx'];

  async detect(): Promise<boolean> {
    const res = await this.checkAvailability();
    return res.available;
  }

  async checkAvailability(): Promise<RuntimeAvailability> {
    // Vercel Functions tidak menyediakan npx/tsx; jangan men-spawn apa pun di sana.
    if (isVercel()) {
      return {
        available: false,
        version: null,
        message: 'TypeScript runtime is not supported in this deployment environment',
      };
    }

    // --no-install: jangan pernah mengunduh paket saat deteksi/eksekusi
    const tsxCheck = await checkBinaryVersion('npx', ['--no-install', 'tsx', '--version']);
    if (tsxCheck.available) {
      return {
        available: true,
        version: tsxCheck.version || 'TSX / TypeScript V8',
        compiler: 'tsx',
        compilerVersion: tsxCheck.version,
      };
    }

    const tscCheck = await checkBinaryVersion('npx', ['--no-install', 'tsc', '--version']);
    if (tscCheck.available) {
      return {
        available: true,
        version: tscCheck.version || 'tsc',
        compiler: 'tsc',
      };
    }

    return {
      available: false,
      version: null,
      message: 'TypeScript runtime unavailable',
    };
  }

  async getVersion(): Promise<string | null> {
    const res = await this.checkAvailability();
    return res.version;
  }

  async validate(code: string): Promise<ValidationResult> {
    const tmpFile = path.join(os.tmpdir(), `check-${randomUUID()}.ts`);
    try {
      await fs.writeFile(tmpFile, code, 'utf-8');
      const { stderr, exitCode } = await runProcessSafe('npx', ['--no-install', 'tsc', '--noEmit', tmpFile], os.tmpdir(), 5000);
      await fs.rm(tmpFile, { force: true }).catch(() => {});
      if (exitCode === 0) {
        return { valid: true };
      }
      return { valid: false, errors: [stderr.trim()] };
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
        stderr: 'TypeScript runtime unavailable pada server ini.',
        exitCode: 1,
        duration: 0,
        status: 'Runtime Unavailable',
        runtime: this.name,
      };
    }

    const runId = randomUUID();
    const tmpDir = path.join(os.tmpdir(), `bilzx-ts-${runId}`);
    const filename = options.filename && !options.filename.includes('/') ? options.filename : 'main.ts';
    const filePath = path.join(tmpDir, filename);

    const startTime = Date.now();
    try {
      await fs.mkdir(tmpDir, { recursive: true });
      await fs.writeFile(filePath, options.code, 'utf-8');

      // Execute via tsx directly
      const cmd = `tsx ${filename}`;
      const timeout = options.timeoutMs || 8000;
      const { stdout, stderr, exitCode, timedOut } = await runProcessSafe(
        'npx',
        ['--no-install', 'tsx', filename, ...(options.args || [])],
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
        stderr: err.message || 'TypeScript execution error',
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
