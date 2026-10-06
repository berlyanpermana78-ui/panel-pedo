import fs from 'node:fs/promises';
import path from 'node:path';
import { dataDir, ID_REGEX, sanitizeId, maxCodeSize } from '../config.js';
import type { RuntimeAdapter, ExecutionOptions, ExecutionResult, RuntimeAvailability, ValidationResult } from './types.js';

export interface SqlQueryResult {
  columns: string[];
  rows: any[][];
  rowCount: number;
  durationMs: number;
  commandType: string;
  truncated: boolean;
  schema?: Array<{ tableName: string; columns: Array<{ name: string; type: string }> }>;
}

export class SqlRuntimeAdapter implements RuntimeAdapter {
  id = 'sql';
  name = 'SQLite Online Engine';
  extensions = ['.sql'];

  /** Dihitung lazy: di Vercel menunjuk ke tmp (ephemeral), lokal ke ./data. */
  private get dbPath(): string {
    return path.join(dataDir(), 'sql-playground');
  }

  async detect(): Promise<boolean> {
    const res = await this.checkAvailability();
    return res.available;
  }

  async checkAvailability(): Promise<RuntimeAvailability> {
    try {
      const sqliteModule = await import('node:sqlite');
      if (sqliteModule && sqliteModule.DatabaseSync) {
        return {
          available: true,
          version: 'SQLite 3 (node:sqlite Native)',
        };
      }
    } catch {
      // node:sqlite tidak ada di versi Node ini
    }

    // Tidak ada "engine palsu": jika node:sqlite tidak ada, SQL dinyatakan tidak tersedia.
    return {
      available: false,
      version: null,
      message: 'node:sqlite is not available (requires Node.js >= 22.13)',
    };
  }

  async getVersion(): Promise<string | null> {
    const res = await this.checkAvailability();
    return res.version;
  }

  async validate(code: string): Promise<ValidationResult> {
    if (!code || !code.trim()) {
      return { valid: false, errors: ['Query SQL kosong.'] };
    }
    if (code.length > maxCodeSize()) {
      return { valid: false, errors: ['Query SQL melebihi batas ukuran.'] };
    }
    return { valid: true };
  }

  /**
   * Executes SQL in an isolated database session.
   */
  async executeSql(query: string, projectId = 'default'): Promise<{
    success: boolean;
    data?: SqlQueryResult;
    error?: string;
  }> {
    if (!ID_REGEX.test(projectId)) {
      return { success: false, error: 'Invalid projectId' };
    }
    if (/\b(ATTACH|DETACH)\b/i.test(query) || /load_extension/i.test(query)) {
      return { success: false, error: 'ATTACH, DETACH, and load_extension are not allowed in the SQL playground.' };
    }

    await fs.mkdir(this.dbPath, { recursive: true });
    const sessionDbFile = path.join(this.dbPath, `session-${sanitizeId(projectId)}.db`);

    const startTime = Date.now();
    let db: any = null;

    try {
      const { DatabaseSync } = await import('node:sqlite');
      db = new DatabaseSync(sessionDbFile);

      // Split multiple statements if any
      const statements = query
        .split(';')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      let lastColumns: string[] = [];
      let lastRows: any[][] = [];
      let lastCommand = 'QUERY';
      let totalRowCount = 0;
      let isTruncated = false;

      for (const stmt of statements) {
        const firstWord = stmt.split(/\s+/)[0].toUpperCase();
        lastCommand = firstWord;

        if (firstWord === 'SELECT' || firstWord === 'PRAGMA' || firstWord === 'EXPLAIN') {
          const prepared = db.prepare(stmt);
          const results = prepared.all() as Record<string, any>[];

          if (results.length > 0) {
            lastColumns = Object.keys(results[0]);
            totalRowCount = results.length;

            const limited = results.slice(0, 1000);
            if (results.length > 1000) {
              isTruncated = true;
            }

            lastRows = limited.map((row) => lastColumns.map((col) => row[col]));
          } else {
            lastColumns = [];
            lastRows = [];
            totalRowCount = 0;
          }
        } else {
          // DDL / DML statements (CREATE, INSERT, UPDATE, DELETE, etc.)
          db.exec(stmt);
          lastColumns = ['status'];
          lastRows = [[`Query executed successfully (${firstWord})`]];
          totalRowCount = 1;
        }
      }

      // Fetch active schema tables
      const schemaStmt = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';");
      const tables = schemaStmt.all() as Array<{ name: string }>;
      const schema: Array<{ tableName: string; columns: Array<{ name: string; type: string }> }> = [];

      for (const t of tables) {
        try {
          const quoted = '"' + String(t.name).replace(/"/g, '""') + '"';
          const colStmt = db.prepare(`PRAGMA table_info(${quoted});`);
          const cols = colStmt.all() as Array<{ name: string; type: string }>;
          schema.push({
            tableName: t.name,
            columns: cols.map((c) => ({ name: c.name, type: c.type || 'TEXT' })),
          });
        } catch {
          // ignore
        }
      }

      const durationMs = Date.now() - startTime;
      return {
        success: true,
        data: {
          columns: lastColumns,
          rows: lastRows,
          rowCount: totalRowCount,
          durationMs,
          commandType: lastCommand,
          truncated: isTruncated,
          schema,
        },
      };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'SQLite error',
      };
    } finally {
      try {
        db?.close();
      } catch {
        // ignore
      }
    }
  }

  async execute(options: ExecutionOptions): Promise<ExecutionResult> {
    const res = await this.executeSql(options.code, options.projectId);

    if (res.success && res.data) {
      // Build formatted console table output
      const { columns, rows, rowCount, durationMs, commandType, truncated } = res.data;
      let output = `[SQL PLAYGROUND] Command: ${commandType} (${durationMs}ms)\n`;

      if (columns.length > 0 && rows.length > 0) {
        // Simple ASCII table
        const colWidths = columns.map((col, idx) => {
          const maxValLen = Math.max(...rows.slice(0, 20).map((r) => String(r[idx] ?? '').length));
          return Math.max(col.length, maxValLen, 4);
        });

        const headerLine = '| ' + columns.map((c, i) => c.padEnd(colWidths[i])).join(' | ') + ' |';
        const separator = '+-' + colWidths.map((w) => '-'.repeat(w)).join('-+-') + '-+';

        output += separator + '\n' + headerLine + '\n' + separator + '\n';
        rows.slice(0, 50).forEach((r) => {
          output += '| ' + r.map((val, i) => String(val ?? '').padEnd(colWidths[i])).join(' | ') + ' |\n';
        });
        output += separator + '\n';
        output += `Total: ${rowCount} rows returned.` + (truncated ? ' (Truncated to first 1000 rows)' : '');
      } else {
        output += `Statement executed successfully. No rows returned.`;
      }

      return {
        success: true,
        stdout: output,
        stderr: '',
        exitCode: 0,
        duration: durationMs,
        status: 'Success',
        command: `SQL (${commandType})`,
        runtime: this.name,
      };
    } else {
      return {
        success: false,
        stdout: '',
        stderr: res.error || 'SQL Query Error',
        exitCode: 1,
        duration: 0,
        status: 'Error',
        command: 'SQL Query',
        runtime: this.name,
        error: res.error,
      };
    }
  }
}
