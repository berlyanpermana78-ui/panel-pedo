/**
 * Server lokal / self-host (Termux, VPS, Pterodactyl): menyajikan hasil build
 * (dist/) + API yang SAMA dengan Vercel. File ini TIDAK dipakai oleh Vercel —
 * di Vercel, /api/* ditangani oleh api/[...path].ts dan static oleh CDN.
 *
 * Development memakai `npm run dev` (Vite + middleware API).
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { handleApiRequest } from './server/api/router.js';

const DIST_DIR = path.resolve(process.cwd(), 'dist');
const PORT = Number(process.env.PORT) || 3000;

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.map': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
};

function serveFile(res: http.ServerResponse, filePath: string): void {
  const ext = path.extname(filePath).toLowerCase();
  res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream');
  if (filePath.includes(`${path.sep}assets${path.sep}`)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  }
  fs.createReadStream(filePath).on('error', () => res.end()).pipe(res);
}

const server = http.createServer(async (req, res) => {
  const pathname = new URL(req.url || '/', 'http://localhost').pathname;

  // /api/* SELALU ke API (JSON), tidak pernah ke SPA fallback.
  if (pathname === '/api' || pathname.startsWith('/api/')) {
    await handleApiRequest(req, res);
    return;
  }

  if (!fs.existsSync(path.join(DIST_DIR, 'index.html'))) {
    res.statusCode = 503;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('Frontend belum di-build. Jalankan: npm run build');
    return;
  }

  let decoded = '/';
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    res.statusCode = 400;
    res.end('Bad request');
    return;
  }

  // Cegah path traversal keluar dari dist/
  const candidate = path.resolve(DIST_DIR, '.' + decoded);
  if (candidate.startsWith(DIST_DIR + path.sep) && fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
    serveFile(res, candidate);
    return;
  }

  // Path dengan ekstensi file yang tidak ada => 404 asli (bukan index.html)
  if (path.extname(decoded)) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('Not found');
    return;
  }

  // SPA fallback
  res.setHeader('Cache-Control', 'no-cache');
  serveFile(res, path.join(DIST_DIR, 'index.html'));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`BILZX CODEX berjalan di http://localhost:${PORT}`);
});
