import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { randomUUID } from 'node:crypto';
import type { RuntimeAdapter, ExecutionOptions, ExecutionResult, RuntimeAvailability, ValidationResult } from './types.js';
import { checkBinaryVersion, runProcessSafe } from './base.js';

export class CppRuntimeAdapter implements RuntimeAdapter {
  id = 'cpp';
  name = 'C++ (Clang++ / G++)';
  extensions = ['.cpp', '.cc', '.cxx'];

  private preferredCompiler = '';

  async detect(): Promise<boolean> {
    const res = await this.checkAvailability();
    return res.available;
  }

  async checkAvailability(): Promise<RuntimeAvailability> {
    // Priority: clang++ -> g++
    const clangpp = await checkBinaryVersion('clang++', ['--version']);
    if (clangpp.available) {
      this.preferredCompiler = 'clang++';
      return {
        available: true,
        version: clangpp.version,
        compiler: 'clang++',
        compilerVersion: clangpp.version,
      };
    }

    const gpp = await checkBinaryVersion('g++', ['--version']);
    if (gpp.available) {
      this.preferredCompiler = 'g++';
      return {
        available: true,
        version: gpp.version,
        compiler: 'g++',
        compilerVersion: gpp.version,
      };
    }

    return {
      available: false,
      version: null,
      message: 'C++ compiler unavailable (clang++ / g++ tidak ditemukan)',
    };
  }

  async getVersion(): Promise<string | null> {
    const res = await this.checkAvailability();
    return res.version;
  }

  async validate(code: string): Promise<ValidationResult> {
    const avail = await this.checkAvailability();
    if (!avail.available || !this.preferredCompiler) {
      return { valid: true, warnings: ['C++ compiler unavailable for syntax check.'] };
    }

    const tmpDir = path.join(os.tmpdir(), `check-cpp-${randomUUID()}`);
    try {
      await fs.mkdir(tmpDir, { recursive: true });
      const srcFile = path.join(tmpDir, 'test.cpp');
      await fs.writeFile(srcFile, code, 'utf-8');

      const { stderr, exitCode } = await runProcessSafe(this.preferredCompiler, ['-std=c++17', '-fsyntax-only', 'test.cpp'], tmpDir, 3000);
      if (exitCode === 0) return { valid: true };
      return { valid: false, errors: [stderr.trim()] };
    } catch (e: any) {
      return { valid: false, errors: [e.message] };
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
    }
  }

  async compile(options: ExecutionOptions): Promise<ExecutionResult> {
    const avail = await this.checkAvailability();
    if (!avail.available || !this.preferredCompiler) {
      return {
        success: false,
        stdout: '',
        stderr: 'C++ compiler (clang++/g++) unavailable pada server ini.',
        exitCode: 1,
        duration: 0,
        status: 'Runtime Unavailable',
        runtime: this.name,
      };
    }

    const runId = randomUUID();
    const tmpDir = path.join(os.tmpdir(), `bilzx-cpp-${runId}`);
    const srcFile = path.join(tmpDir, 'main.cpp');

    const startTime = Date.now();
    try {
      await fs.mkdir(tmpDir, { recursive: true });
      await fs.writeFile(srcFile, options.code, 'utf-8');

      const cmd = `${this.preferredCompiler} -std=c++17 -O2 -Wall main.cpp -o app_bin`;
      const { stdout, stderr, exitCode, timedOut } = await runProcessSafe(
        this.preferredCompiler,
        ['-std=c++17', '-O2', '-Wall', 'main.cpp', '-o', 'app_bin'],
        tmpDir,
        options.timeoutMs || 8000
      );

      const duration = Date.now() - startTime;
      if (timedOut) {
        return {
          success: false,
          stdout,
          stderr: 'C++ Compilation timed out',
          exitCode: null,
          duration,
          status: 'Timeout',
          command: cmd,
          runtime: this.name,
        };
      }

      if (exitCode !== 0) {
        return {
          success: false,
          stdout,
          stderr: stderr || 'C++ compilation error',
          exitCode,
          duration,
          status: 'Compilation Error',
          command: cmd,
          runtime: this.name,
        };
      }

      return {
        success: true,
        stdout: `✓ C++ Compilation successful (${this.preferredCompiler})`,
        stderr,
        exitCode: 0,
        duration,
        status: 'Success',
        command: cmd,
        runtime: this.name,
      };
    } catch (err: any) {
      return {
        success: false,
        stdout: '',
        stderr: err.message,
        exitCode: 1,
        duration: Date.now() - startTime,
        status: 'Error',
        runtime: this.name,
      };
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
    }
  }

  async execute(options: ExecutionOptions): Promise<ExecutionResult> {
    const avail = await this.checkAvailability();
    if (!avail.available || !this.preferredCompiler) {
      return {
        success: false,
        stdout: '',
        stderr: 'C++ compiler (clang++/g++) unavailable pada server.',
        exitCode: 1,
        duration: 0,
        status: 'Runtime Unavailable',
        runtime: this.name,
      };
    }

    if (options.compileOnly) {
      return this.compile(options);
    }

    const runId = randomUUID();
    const tmpDir = path.join(os.tmpdir(), `bilzx-cpp-${runId}`);
    const srcFile = path.join(tmpDir, 'main.cpp');
    const binFile = path.join(tmpDir, 'app_bin');

    const startTime = Date.now();
    try {
      await fs.mkdir(tmpDir, { recursive: true });
      await fs.writeFile(srcFile, options.code, 'utf-8');

      // 1. Compile
      const comp = await runProcessSafe(
        this.preferredCompiler,
        ['-std=c++17', '-O2', 'main.cpp', '-o', 'app_bin'],
        tmpDir,
        8000
      );

      if (comp.exitCode !== 0) {
        return {
          success: false,
          stdout: '',
          stderr: comp.stderr || 'C++ compilation error',
          exitCode: comp.exitCode,
          duration: Date.now() - startTime,
          status: 'Compilation Error',
          command: `${this.preferredCompiler} -std=c++17 main.cpp -o app_bin`,
          runtime: this.name,
        };
      }

      // 2. Execute binary
      const timeout = options.timeoutMs || 5000;
      const { stdout, stderr, exitCode, timedOut } = await runProcessSafe(
        binFile,
        options.args || [],
        tmpDir,
        timeout
      );

      const duration = Date.now() - startTime;
      const compilationNotice = `$ ${this.preferredCompiler} -std=c++17 main.cpp -o app_bin\n✓ Compilation successful\n$ ./app_bin\n`;

      if (timedOut) {
        return {
          success: false,
          stdout: compilationNotice + stdout,
          stderr: stderr + '\nExecution timed out',
          exitCode: null,
          duration,
          status: 'Timeout',
          command: `./app_bin`,
          runtime: this.name,
        };
      }

      const success = exitCode === 0;
      return {
        success,
        stdout: compilationNotice + stdout,
        stderr,
        exitCode,
        duration,
        status: success ? 'Success' : 'Error',
        command: `./app_bin`,
        runtime: this.name,
      };
    } catch (err: any) {
      return {
        success: false,
        stdout: '',
        stderr: err.message,
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
