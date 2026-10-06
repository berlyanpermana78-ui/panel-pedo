import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { dataDir, storageMode } from '../config.js';

export interface DatabaseHealth {
  status: 'healthy' | 'degraded' | 'offline';
  driver: 'node:sqlite' | 'json_fallback';
  /** ephemeral = hilang saat instance serverless di-recycle (Vercel); persistent = disk lokal */
  storage: 'ephemeral' | 'persistent';
  totalExecutionsCount: number;
  totalQueriesCount: number;
  uptimeSeconds: number;
}

export interface ExecutionRecord {
  id: string;
  project_id: string;
  runtime: string;
  language: string;
  file: string;
  command: string;
  status: string;
  exit_code: number | null;
  duration_ms: number;
  stdout: string;
  stderr: string;
  created_at: string;
}

export interface QueryRecord {
  query_id: string;
  project_id: string;
  query: string;
  status: 'success' | 'error';
  rows: number;
  duration_ms: number;
  created_at: string;
}

export class DatabaseManager {
  private db: any = null;
  private initPromise: Promise<void> | null = null;
  private driver: 'node:sqlite' | 'json_fallback' = 'json_fallback';
  private inMemoryExecutions: ExecutionRecord[] = [];
  private inMemoryQueries: QueryRecord[] = [];

  /** Dihitung lazy: tidak ada akses filesystem saat module di-import / build. */
  private get dbPath(): string {
    return path.join(dataDir(), 'bilzx-codex.db');
  }

  /** Inisialisasi lazy & idempotent. Gagal => fallback in-memory, tidak pernah melempar. */
  private ensure(): Promise<void> {
    if (!this.initPromise) {
      this.initPromise = this.initialize().catch(() => {
        this.db = null;
        this.driver = 'json_fallback';
      });
    }
    return this.initPromise;
  }

  private async initialize(): Promise<void> {
    await fs.mkdir(path.dirname(this.dbPath), { recursive: true });

    try {
      const { DatabaseSync } = await import('node:sqlite');
      this.db = new DatabaseSync(this.dbPath);
      this.driver = 'node:sqlite';
      this.runMigrations();
    } catch {
      this.driver = 'json_fallback';
    }
  }

  private runMigrations() {
    if (!this.db) return;

    // 1. executions table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS executions (
        id TEXT PRIMARY KEY,
        project_id TEXT,
        runtime TEXT,
        language TEXT,
        file TEXT,
        command TEXT,
        status TEXT,
        exit_code INTEGER,
        duration_ms INTEGER,
        stdout TEXT,
        stderr TEXT,
        created_at TEXT
      );
    `);

    // 2. query_history table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS query_history (
        query_id TEXT PRIMARY KEY,
        project_id TEXT,
        query TEXT,
        status TEXT,
        rows INTEGER,
        duration_ms INTEGER,
        created_at TEXT
      );
    `);

    // 3. projects & snapshots
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT,
        description TEXT,
        updated_at INTEGER
      );
      CREATE TABLE IF NOT EXISTS snapshots (
        id TEXT PRIMARY KEY,
        project_id TEXT,
        description TEXT,
        created_at INTEGER
      );
    `);
  }

  async recordExecution(rec: Omit<ExecutionRecord, 'id' | 'created_at'>): Promise<ExecutionRecord> {
    await this.ensure();
    const fullRecord: ExecutionRecord = {
      ...rec,
      id: 'exec_' + randomUUID(),
      created_at: new Date().toISOString(),
    };

    if (this.db && this.driver === 'node:sqlite') {
      try {
        const stmt = this.db.prepare(`
          INSERT INTO executions (
            id, project_id, runtime, language, file, command, status, exit_code, duration_ms, stdout, stderr, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        stmt.run(
          fullRecord.id,
          fullRecord.project_id,
          fullRecord.runtime,
          fullRecord.language,
          fullRecord.file,
          fullRecord.command,
          fullRecord.status,
          fullRecord.exit_code,
          fullRecord.duration_ms,
          fullRecord.stdout.slice(0, 5000),
          fullRecord.stderr.slice(0, 5000),
          fullRecord.created_at
        );
      } catch {
        this.inMemoryExecutions.unshift(fullRecord);
      }
    } else {
      this.inMemoryExecutions.unshift(fullRecord);
      if (this.inMemoryExecutions.length > 500) {
        this.inMemoryExecutions.pop();
      }
    }

    return fullRecord;
  }

  async getExecutions(limit = 50): Promise<ExecutionRecord[]> {
    await this.ensure();
    if (this.db && this.driver === 'node:sqlite') {
      try {
        const stmt = this.db.prepare(`
          SELECT * FROM executions ORDER BY created_at DESC LIMIT ?
        `);
        return stmt.all(limit) as ExecutionRecord[];
      } catch {
        return this.inMemoryExecutions.slice(0, limit);
      }
    }
    return this.inMemoryExecutions.slice(0, limit);
  }

  async recordQueryHistory(rec: Omit<QueryRecord, 'query_id' | 'created_at'>): Promise<QueryRecord> {
    await this.ensure();
    const fullRecord: QueryRecord = {
      ...rec,
      query_id: 'q_' + randomUUID(),
      created_at: new Date().toISOString(),
    };

    if (this.db && this.driver === 'node:sqlite') {
      try {
        const stmt = this.db.prepare(`
          INSERT INTO query_history (query_id, project_id, query, status, rows, duration_ms, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        stmt.run(
          fullRecord.query_id,
          fullRecord.project_id,
          fullRecord.query.slice(0, 4000),
          fullRecord.status,
          fullRecord.rows,
          fullRecord.duration_ms,
          fullRecord.created_at
        );
      } catch {
        this.inMemoryQueries.unshift(fullRecord);
      }
    } else {
      this.inMemoryQueries.unshift(fullRecord);
      if (this.inMemoryQueries.length > 500) {
        this.inMemoryQueries.pop();
      }
    }

    return fullRecord;
  }

  async getQueryHistory(projectId = 'default', limit = 50): Promise<QueryRecord[]> {
    await this.ensure();
    if (this.db && this.driver === 'node:sqlite') {
      try {
        const stmt = this.db.prepare(`
          SELECT * FROM query_history WHERE project_id = ? ORDER BY created_at DESC LIMIT ?
        `);
        return stmt.all(projectId, limit) as QueryRecord[];
      } catch {
        return this.inMemoryQueries.filter((q) => q.project_id === projectId).slice(0, limit);
      }
    }
    return this.inMemoryQueries.filter((q) => q.project_id === projectId).slice(0, limit);
  }

  async getHealth(): Promise<DatabaseHealth> {
    await this.ensure();
    let executionsCount = this.inMemoryExecutions.length;
    let queriesCount = this.inMemoryQueries.length;

    if (this.db && this.driver === 'node:sqlite') {
      try {
        const eStmt = this.db.prepare('SELECT COUNT(*) as count FROM executions');
        executionsCount = (eStmt.get() as any)?.count || 0;
        const qStmt = this.db.prepare('SELECT COUNT(*) as count FROM query_history');
        queriesCount = (qStmt.get() as any)?.count || 0;
      } catch {
        // ignore
      }
    }

    return {
      status: this.driver === 'node:sqlite' ? 'healthy' : 'degraded',
      driver: this.driver,
      storage: storageMode(),
      totalExecutionsCount: executionsCount,
      totalQueriesCount: queriesCount,
      uptimeSeconds: Math.floor(process.uptime()),
    };
  }

  async backup(): Promise<{ success: boolean; backupFile?: string; error?: string }> {
    await this.ensure();
    if (storageMode() === 'ephemeral') {
      return { success: false, error: 'Backup is not supported on ephemeral storage' };
    }
    if (this.driver !== 'node:sqlite') {
      return { success: false, error: 'No database file to back up' };
    }
    try {
      const backupDir = path.join(path.dirname(this.dbPath), 'backups');
      await fs.mkdir(backupDir, { recursive: true });
      const name = `backup-${Date.now()}.db`;
      await fs.copyFile(this.dbPath, path.join(backupDir, name));
      // hanya nama file yang dikembalikan (bukan path internal)
      return { success: true, backupFile: name };
    } catch {
      return { success: false, error: 'Backup failed' };
    }
  }
}

export const dbManager = new DatabaseManager();
