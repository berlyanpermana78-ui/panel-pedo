# BILZX CODEX

**CODE. RUN. BUILD.** — BilzxDev · v1.0.0

Workspace coding online berbasis **Vite + React** dengan API runtime (Node, TypeScript, Python, Java, C, C++, SQL).
Siap dideploy ke **Vercel** (API sebagai Vercel Function) dan tetap bisa dijalankan lokal / self-host (Termux, VPS, Pterodactyl).

## Arsitektur

```
/
├── api/[...path].ts        # SATU Vercel Function untuk semua /api/* (selalu JSON, termasuk 404)
├── server/
│   ├── api/                # router.ts (semua endpoint), http.ts (JSON helper, body reader, error)
│   ├── runtime/            # RuntimeManager + adapter Node/TS/Python/Java/C/C++/SQL
│   ├── database/           # metadata & riwayat (node:sqlite, lazy init)
│   ├── config.ts           # env + deteksi Vercel (dibaca lazy)
│   ├── errors.ts           # ApiError + RUNTIME_UNAVAILABLE
│   └── pythonManager.ts    # pip/venv (hanya non-Vercel)
├── server.ts               # server lokal/self-host (dist + API), BUKAN dipakai Vercel
├── src/lib/api-client.ts   # satu-satunya cara frontend memanggil /api/*
├── scripts/api-check.ts    # tes API (npm run test:api)
├── vercel.json
└── vite.config.ts          # dev: middleware API yang sama dengan Vercel
```

| Mode | Frontend | API |
|---|---|---|
| `npm run dev` | Vite (HMR) | middleware Vite → `server/api/router.ts` |
| `npm run build && npm start` | `dist/` | `server.ts` → router yang sama |
| Vercel | CDN (`dist/`) | `api/[...path].ts` → router yang sama |

## Kontrak API

Semua endpoint **selalu** `Content-Type: application/json`.

```jsonc
// sukses
{ "success": true, "data": { } }
// gagal
{ "success": false, "error": { "code": "RUNTIME_UNAVAILABLE", "message": "...", "details": null, "requestId": "req_ab12cd34ef56" } }
```

Header `X-Request-Id` ikut di setiap response (sama dengan `requestId` di error) untuk debugging.

| Endpoint | Keterangan |
|---|---|
| `GET /api/health` | ringan, tidak menjalankan runtime |
| `GET /api/runtimes` | deteksi runtime **lazy** (saat dipanggil); `state`: `available` / `unavailable` / `unsupported` |
| `POST /api/run` | `{language, code, projectId?, filename?, timeoutMs?, args?}` |
| `POST /api/compile` | sama seperti `/run`, hanya kompilasi/validasi |
| `POST /api/sql/query`, `GET /api/sql/history` | SQLite playground |
| `GET /api/executions`, `GET /api/database/health`, `POST /api/database/backup` | metadata |
| `GET /api/python/{packages,search,requirements,environment}`, `POST /api/python/{install,uninstall}` | package manager |

Kode error: `NOT_FOUND` (404), `METHOD_NOT_ALLOWED` (405), `INVALID_JSON` / `INVALID_INPUT` / `UNSUPPORTED_RUNTIME` (400),
`LIMIT_EXCEEDED` (413), `RUNTIME_UNAVAILABLE` (503), `UNSUPPORTED_IN_DEPLOYMENT` (501), `INTERNAL_SERVER_ERROR` (500).

## Environment variable

Lihat `.env.example`. Tidak ada secret yang dibutuhkan.

| Variabel | Default | Fungsi |
|---|---|---|
| `PORT` | `3000` | hanya `npm run dev` / `npm start` (diabaikan di Vercel) |
| `NODE_BIN` | `node` | `node` = pakai Node yang menjalankan server |
| `PYTHON_BIN` | `python3` | binary Python |
| `PYTHON_RUN_TIMEOUT` | `5000` | timeout eksekusi (ms) |
| `PYTHON_INSTALL_TIMEOUT` | `120000` | timeout `pip install` (ms) |
| `MAX_CODE_SIZE` | `100000` | batas ukuran kode (byte) → `LIMIT_EXCEEDED` |
| `MAX_OUTPUT_SIZE` | `100000` | batas output (karakter); lebih dari itu dipotong |
| `DATA_DIR` | `./data` | lokasi metadata (di Vercel otomatis ke tmp) |
| `VITE_API_BASE_URL` | *(kosong)* | opsional; default pakai path relatif `/api/...` |

`VERCEL=1` diset otomatis oleh Vercel.

## Deploy ke Vercel

```bash
npm install
npm run build
```

1. Push ke Git, import project di Vercel (preset **Vite** terdeteksi otomatis lewat `vercel.json`).
2. Tidak ada env var wajib. Opsional: samakan variabel di atas lewat Project Settings → Environment Variables.
3. Setelah deploy, cek `https://<app>.vercel.app/api/health` dan `/api/runtimes` → keduanya harus JSON.

### Batasan Vercel (jujur)

Vercel Functions **bukan VPS**. Di sana:

- **Node.js** dan **SQL (node:sqlite)** tersedia. **Python** hanya jika binary ada di image function.
- **Java, C, C++, TypeScript (npx/tsx)** biasanya **tidak tersedia** → UI menampilkan *Unsupported in this deployment* dan API membalas `RUNTIME_UNAVAILABLE` (tidak ada output palsu).
- Package manager Python (`pip`) dinonaktifkan (`UNSUPPORTED_IN_DEPLOYMENT`).
- Filesystem read-only kecuali tmp ⇒ riwayat eksekusi & sesi SQL bersifat **ephemeral** (hilang saat instance di-recycle).
- Kode user berjalan sebagai proses anak di function yang sama dengan environment bersih (tanpa env server), timeout, dan batas output — **ini bukan sandbox kuat**. Untuk eksekusi kode publik skala besar gunakan layanan sandbox terpisah (VPS/container/Firecracker).

Untuk semua runtime lengkap + penyimpanan persisten, deploy ke VPS/Pterodactyl dengan `npm run build && npm start`.

## Tes

```bash
npm run test:api                         # tes lokal terhadap router API
API_BASE_URL=https://app.vercel.app npm run test:api   # tes deployment nyata
npm run typecheck
```
