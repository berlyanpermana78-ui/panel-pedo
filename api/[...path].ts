import type { IncomingMessage, ServerResponse } from 'node:http';

/**
 * Satu-satunya Vercel Function untuk seluruh /api/*.
 * Semua route (health, runtimes, run, compile, sql/*, python/*, ...) ditangani
 * oleh server/api/router.ts, sehingga:
 *  - jumlah function = 1 (aman untuk batas plan Hobby),
 *  - /api/* yang tidak dikenal tetap menghasilkan JSON 404 (bukan HTML).
 */
export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  try {
    const { handleApiRequest } = await import('../server/api/router.js');
    await handleApiRequest(req, res);
  } catch (err) {
    // Jaring pengaman terakhir (mis. gagal import module): tetap JSON.
    console.error('[api] fatal handler error:', err);
    if (!res.headersSent) {
      const body = JSON.stringify({
        success: false,
        error: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal server error', requestId: null },
      });
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Cache-Control', 'no-store');
      res.end(body);
    } else {
      res.end();
    }
  }
}
