import os from 'node:os';
import path from 'node:path';

/**
 * Konfigurasi terpusat. Semua nilai dibaca secara lazy (fungsi), tidak ada
 * side effect saat module di-import, sehingga aman untuk build & cold start.
 */
const num = (name: string, fallback: number): number => {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
};

export const isVercel = (): boolean =>
  ['1', 'true'].includes(String(process.env.VERCEL ?? '').toLowerCase());

export const isProduction = (): boolean => process.env.NODE_ENV === 'production' || isVercel();

export const environmentName = (): string =>
  process.env.VERCEL_ENV || (isProduction() ? 'production' : 'development');

export const platformName = (): 'vercel' | 'self-hosted' => (isVercel() ? 'vercel' : 'self-hosted');

export const maxCodeSize = (): number => num('MAX_CODE_SIZE', 100000);
export const maxOutputSize = (): number => num('MAX_OUTPUT_SIZE', 100000);
export const runTimeoutMs = (): number => num('PYTHON_RUN_TIMEOUT', 5000);
export const installTimeoutMs = (): number => num('PYTHON_INSTALL_TIMEOUT', 120000);

/** Batas maksimum timeout yang boleh diminta client (di bawah maxDuration Vercel). */
export const MAX_REQUEST_TIMEOUT_MS = 30000;

/**
 * NODE_BIN=node (default) berarti "pakai Node yang sedang menjalankan server".
 * Ini lebih andal daripada mengandalkan PATH (Termux, Lambda, Pterodactyl).
 */
export const nodeBin = (): string => {
  const bin = process.env.NODE_BIN;
  return bin && bin !== 'node' ? bin : process.execPath;
};

export const pythonBin = (): string => process.env.PYTHON_BIN || 'python3';

/**
 * Lokasi penyimpanan metadata (riwayat eksekusi, sesi SQL).
 * - Vercel: filesystem read-only kecuali tmp -> bersifat EPHEMERAL.
 * - Lokal / self-host: ./data (atau DATA_DIR) -> persisten.
 */
export const dataDir = (): string => {
  if (process.env.DATA_DIR) return path.resolve(process.env.DATA_DIR);
  if (isVercel()) return path.join(os.tmpdir(), 'bilzx-codex');
  return path.join(process.cwd(), 'data');
};

export const storageMode = (): 'ephemeral' | 'persistent' => (isVercel() ? 'ephemeral' : 'persistent');

export const ID_REGEX = /^[a-zA-Z0-9_-]{1,64}$/;

export const sanitizeId = (value: string): string =>
  value.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64) || 'default';

/** Direktori project Python (venv, requirements.txt). Hanya dipakai di non-Vercel. */
export const projectDir = (projectId: string): string =>
  path.join(process.cwd(), 'user-projects', sanitizeId(projectId));
