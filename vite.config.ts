import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, type Plugin } from 'vite';

/**
 * Development: mount router API yang SAMA dengan yang dipakai Vercel
 * (api/[...path].ts) di bawah /api. Tanpa ini, request /api/* akan jatuh
 * ke SPA fallback (index.html) dan memunculkan error JSON "Unexpected token".
 */
function bilzxApiPlugin(): Plugin {
  const isApi = (url?: string) => !!url && (url === '/api' || url.startsWith('/api/') || url.startsWith('/api?'));

  const fallbackJson = (res: import('node:http').ServerResponse, err: unknown) => {
    console.error('[api] failed to load API router:', err);
    if (res.headersSent) return res.end();
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(
      JSON.stringify({
        success: false,
        error: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal server error', requestId: null },
      })
    );
  };

  return {
    name: 'bilzx-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!isApi(req.url)) return next();
        try {
          // ssrLoadModule => perubahan kode server ikut ter-reload saat development
          const mod = await server.ssrLoadModule('/server/api/router.ts');
          await mod.handleApiRequest(req, res);
        } catch (err) {
          fallbackJson(res, err);
        }
      });
    },
    configurePreviewServer(server) {
      // `vite preview` hanya menyajikan file statis. Agar /api/* tidak jatuh ke
      // index.html, balas JSON yang jelas (gunakan `npm start` untuk API + hasil build).
      server.middlewares.use((req, res, next) => {
        if (!isApi(req.url)) return next();
        res.statusCode = 501;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(
          JSON.stringify({
            success: false,
            error: {
              code: 'API_NOT_AVAILABLE',
              message: 'API is not served by "vite preview". Use "npm run dev" or "npm start".',
              requestId: null,
            },
          })
        );
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), bilzxApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: Number(process.env.PORT) || 3000,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    preview: {
      port: Number(process.env.PORT) || 3000,
    },
  };
});
