import type { RuntimeAdapter, ExecutionOptions, ExecutionResult, RuntimeAvailability, RuntimeState } from './types.js';
import { isVercel } from '../config.js';

/** Runtime yang tidak mungkin tersedia di Vercel Functions (tidak ada compiler / npx). */
const UNSUPPORTED_ON_VERCEL = new Set(['typescript', 'java', 'c', 'cpp']);
import { NodeRuntimeAdapter } from './node.js';
import { TypeScriptRuntimeAdapter } from './typescript.js';
import { PythonRuntimeAdapter } from './python.js';
import { JavaRuntimeAdapter } from './java.js';
import { CRuntimeAdapter } from './c.js';
import { CppRuntimeAdapter } from './cpp.js';
import { SqlRuntimeAdapter } from './sql.js';

export class RuntimeManager {
  private adapters: Map<string, RuntimeAdapter> = new Map();

  constructor() {
    this.registerAdapter(new NodeRuntimeAdapter());
    this.registerAdapter(new TypeScriptRuntimeAdapter());
    this.registerAdapter(new PythonRuntimeAdapter());
    this.registerAdapter(new JavaRuntimeAdapter());
    this.registerAdapter(new CRuntimeAdapter());
    this.registerAdapter(new CppRuntimeAdapter());
    this.registerAdapter(new SqlRuntimeAdapter());
  }

  registerAdapter(adapter: RuntimeAdapter) {
    this.adapters.set(adapter.id, adapter);
  }

  getAdapter(idOrLang: string): RuntimeAdapter | null {
    const key = idOrLang.toLowerCase().trim();

    if (this.adapters.has(key)) {
      return this.adapters.get(key)!;
    }

    // Mapping aliases
    if (key === 'javascript' || key === 'js' || key === 'mjs' || key === 'cjs') {
      return this.adapters.get('node')!;
    }
    if (key === 'ts' || key === 'tsx' || key === 'typescript') {
      return this.adapters.get('typescript')!;
    }
    if (key === 'py' || key === 'python' || key === 'python3') {
      return this.adapters.get('python')!;
    }
    if (key === 'java') {
      return this.adapters.get('java')!;
    }
    if (key === 'c') {
      return this.adapters.get('c')!;
    }
    if (key === 'cpp' || key === 'c++' || key === 'cc' || key === 'cxx') {
      return this.adapters.get('cpp')!;
    }
    if (key === 'sql' || key === 'sqlite') {
      return this.adapters.get('sql')!;
    }

    return null;
  }

  private resolveState(id: string, available: boolean): RuntimeState {
    if (available) return 'available';
    return isVercel() && UNSUPPORTED_ON_VERCEL.has(id) ? 'unsupported' : 'unavailable';
  }

  async getAllRuntimesStatus(): Promise<Record<string, RuntimeAvailability>> {
    const results: Record<string, RuntimeAvailability> = {};
    const promises: Promise<void>[] = [];

    for (const [id, adapter] of this.adapters.entries()) {
      promises.push(
        adapter
          .checkAvailability()
          .then((avail) => {
            results[id] = { ...avail, state: this.resolveState(id, avail.available) };
          })
          .catch(() => {
            results[id] = {
              available: false,
              version: null,
              state: this.resolveState(id, false),
              message: 'Detection failed',
            };
          })
      );
    }

    await Promise.all(promises);

    // Also populate aliases for client convenience
    results['javascript'] = results['node'];
    results['gcc'] = {
      state: results['c']?.compiler === 'gcc' ? 'available' : 'unavailable',
      available: Boolean(results['c']?.compiler === 'gcc'),
      version: results['c']?.compiler === 'gcc' ? results['c'].compilerVersion || results['c'].version : null,
    };
    results['clang'] = {
      state: results['c']?.compiler === 'clang' ? 'available' : 'unavailable',
      available: Boolean(results['c']?.compiler === 'clang'),
      version: results['c']?.compiler === 'clang' ? results['c'].compilerVersion || results['c'].version : null,
    };

    return results;
  }

  async execute(language: string, options: ExecutionOptions): Promise<ExecutionResult> {
    const adapter = this.getAdapter(language);
    if (!adapter) {
      return {
        success: false,
        stdout: '',
        stderr: `Language runtime "${language}" is not supported for server-side execution.`,
        exitCode: 1,
        duration: 0,
        status: 'Error',
        runtime: language,
        error: 'Unsupported runtime',
      };
    }

    return await adapter.execute(options);
  }

  async compile(language: string, options: ExecutionOptions): Promise<ExecutionResult> {
    const adapter = this.getAdapter(language);
    if (!adapter) {
      return {
        success: false,
        stdout: '',
        stderr: `Compiler for "${language}" is not supported.`,
        exitCode: 1,
        duration: 0,
        status: 'Error',
        runtime: language,
      };
    }

    if (typeof adapter.compile === 'function') {
      return await adapter.compile(options);
    }

    return {
      success: true,
      stdout: `${adapter.name} is an interpreted runtime and does not require explicit ahead-of-time compilation.`,
      stderr: '',
      exitCode: 0,
      duration: 0,
      status: 'Success',
      runtime: adapter.name,
    };
  }
}

export const runtimeManager = new RuntimeManager();
