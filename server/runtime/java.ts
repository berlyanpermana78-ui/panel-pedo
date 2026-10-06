import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { randomUUID } from 'node:crypto';
import type { RuntimeAdapter, ExecutionOptions, ExecutionResult, RuntimeAvailability, ValidationResult } from './types.js';
import { checkBinaryVersion, runProcessSafe } from './base.js';

export class JavaRuntimeAdapter implements RuntimeAdapter {
  id = 'java';
  name = 'Java (JVM & Javac)';
  extensions = ['.java'];

  private javaBin = process.env.JAVA_BIN || 'java';
  private javacBin = process.env.JAVAC_BIN || 'javac';

  async detect(): Promise<boolean> {
    const res = await this.checkAvailability();
    return res.available;
  }

  async checkAvailability(): Promise<RuntimeAvailability> {
    const [javaCheck, javacCheck] = await Promise.all([
      checkBinaryVersion(this.javaBin, ['-version']),
      checkBinaryVersion(this.javacBin, ['-version']),
    ]);

    if (javaCheck.available) {
      return {
        available: true,
        version: javaCheck.version || 'Java Virtual Machine',
        compiler: javacCheck.available ? 'javac' : undefined,
        compilerVersion: javacCheck.version,
      };
    }

    return {
      available: false,
      version: null,
      message: 'Java runtime unavailable pada server ini.',
    };
  }

  async getVersion(): Promise<string | null> {
    const res = await this.checkAvailability();
    return res.version;
  }

  async validate(code: string): Promise<ValidationResult> {
    const avail = await this.checkAvailability();
    if (!avail.compiler) {
      return { valid: true, warnings: ['Javac compiler not found; validation skipped.'] };
    }

    const tmpDir = path.join(os.tmpdir(), `check-java-${randomUUID()}`);
    try {
      await fs.mkdir(tmpDir, { recursive: true });
      const className = this.extractClassName(code) || 'Main';
      const filePath = path.join(tmpDir, `${className}.java`);
      await fs.writeFile(filePath, code, 'utf-8');

      const { stderr, exitCode } = await runProcessSafe(this.javacBin, [`${className}.java`], tmpDir, 4000);
      if (exitCode === 0) {
        return { valid: true };
      }
      return { valid: false, errors: [stderr.trim() || 'Java compilation error'] };
    } catch (e: any) {
      return { valid: false, errors: [e.message] };
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
    }
  }

  private extractClassName(code: string): string {
    const match = code.match(/public\s+class\s+([A-Za-z0-9_]+)/);
    if (match) return match[1];
    const match2 = code.match(/class\s+([A-Za-z0-9_]+)/);
    return match2 ? match2[1] : 'Main';
  }

  async compile(options: ExecutionOptions): Promise<ExecutionResult> {
    const avail = await this.checkAvailability();
    if (!avail.compiler) {
      return {
        success: false,
        stdout: '',
        stderr: 'Javac compiler unavailable. Pastikan JDK terpasang pada host.',
        exitCode: 1,
        duration: 0,
        status: 'Runtime Unavailable',
        runtime: this.name,
      };
    }

    const runId = randomUUID();
    const tmpDir = path.join(os.tmpdir(), `bilzx-java-${runId}`);
    const className = this.extractClassName(options.code) || 'Main';
    const filename = `${className}.java`;
    const filePath = path.join(tmpDir, filename);

    const startTime = Date.now();
    try {
      await fs.mkdir(tmpDir, { recursive: true });
      await fs.writeFile(filePath, options.code, 'utf-8');

      const cmd = `${this.javacBin} ${filename}`;
      const { stdout, stderr, exitCode, timedOut } = await runProcessSafe(
        this.javacBin,
        [filename],
        tmpDir,
        options.timeoutMs || 8000
      );

      const duration = Date.now() - startTime;
      if (timedOut) {
        return {
          success: false,
          stdout,
          stderr: 'Compilation timed out',
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
          stderr: stderr || 'Compilation error',
          exitCode,
          duration,
          status: 'Compilation Error',
          command: cmd,
          runtime: this.name,
        };
      }

      return {
        success: true,
        stdout: `✓ Compilation successful (${className}.class generated)`,
        stderr: '',
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
    if (!avail.available) {
      return {
        success: false,
        stdout: '',
        stderr: 'Java runtime unavailable pada server.',
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
    const tmpDir = path.join(os.tmpdir(), `bilzx-java-${runId}`);
    const className = this.extractClassName(options.code) || 'Main';
    const filename = `${className}.java`;
    const filePath = path.join(tmpDir, filename);

    const startTime = Date.now();
    try {
      await fs.mkdir(tmpDir, { recursive: true });
      await fs.writeFile(filePath, options.code, 'utf-8');

      // 1. Compile with javac if available
      let compilationLog = '';
      if (avail.compiler) {
        const comp = await runProcessSafe(this.javacBin, [filename], tmpDir, 8000);
        if (comp.exitCode !== 0) {
          return {
            success: false,
            stdout: '',
            stderr: comp.stderr || 'Java compilation error',
            exitCode: comp.exitCode,
            duration: Date.now() - startTime,
            status: 'Compilation Error',
            command: `javac ${filename}`,
            runtime: this.name,
          };
        }
        compilationLog = `$ javac ${filename}\n✓ Compilation successful\n\n$ java ${className}\n`;
      } else {
        // Tanpa javac: gunakan mode source-launcher (Java 11+): `java Main.java`
        compilationLog = `$ java ${filename}\n`;
      }

      // 2. Execute with java
      const timeout = options.timeoutMs || 8000;
      const { stdout, stderr, exitCode, timedOut } = await runProcessSafe(
        this.javaBin,
        [avail.compiler ? className : filename, ...(options.args || [])],
        tmpDir,
        timeout
      );

      const duration = Date.now() - startTime;
      if (timedOut) {
        return {
          success: false,
          stdout: compilationLog + stdout,
          stderr: stderr + '\nExecution timed out',
          exitCode: null,
          duration,
          status: 'Timeout',
          command: `java ${className}`,
          runtime: this.name,
        };
      }

      const success = exitCode === 0;
      return {
        success,
        stdout: compilationLog + stdout,
        stderr,
        exitCode,
        duration,
        status: success ? 'Success' : 'Error',
        command: `java ${className}`,
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
