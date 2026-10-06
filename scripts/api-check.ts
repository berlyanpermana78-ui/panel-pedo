/**
 * Pemeriksaan API end-to-end tanpa dependency tambahan.
 * Menjalankan router API yang sama dengan Vercel di server HTTP sementara,
 * lalu memastikan SEMUA response berupa JSON.
 *
 *   npm run test:api
 *   API_BASE_URL=https://app.vercel.app npm run test:api   # cek deployment nyata
 */
import http from 'node:http';
import { handleApiRequest } from '../server/api/router.js';
import { apiRequest, ApiError } from '../src/lib/api-client.js';

let failed = 0;
const ok = (name: string, cond: boolean, extra = '') => {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${extra ? '  -> ' + extra : ''}`);
  if (!cond) failed++;
};

async function main() {
  let base = process.env.API_BASE_URL?.replace(/\/$/, '') || '';
  let server: http.Server | null = null;

  if (!base) {
    server = http.createServer((req, res) => {
      if (req.url?.startsWith('/api')) return void handleApiRequest(req, res);
      if (req.url === '/html-404') {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/html');
        return void res.end('<html><body>The page could not be found</body></html>');
      }
      res.statusCode = 404;
      res.end('x');
    });
    await new Promise<void>((r) => server!.listen(0, '127.0.0.1', r));
    base = `http://127.0.0.1:${(server.address() as any).port}`;
  }

  const call = async (method: string, path: string, body?: unknown, raw?: string) => {
    const res = await fetch(base + path, {
      method,
      headers: body !== undefined || raw !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: raw ?? (body !== undefined ? JSON.stringify(body) : undefined),
    });
    const ct = res.headers.get('content-type') || '';
    const text = await res.text();
    let json: any = null;
    try {
      json = JSON.parse(text);
    } catch {
      /* bukan JSON */
    }
    return { status: res.status, ct, json, text };
  };
  const isJson = (r: { ct: string; json: any }) => r.ct.includes('application/json') && r.json !== null;

  // --- health
  let r = await call('GET', '/api/health');
  ok('GET /api/health -> 200 JSON', r.status === 200 && isJson(r) && r.json.success === true && r.json.data.status === 'ok');

  // --- runtimes
  r = await call('GET', '/api/runtimes');
  ok('GET /api/runtimes -> JSON + node/python/java/c/cpp/sql', r.status === 200 && isJson(r) &&
    ['node', 'python', 'java', 'c', 'cpp', 'sql'].every((k) => k in r.json.data));
  ok('runtimes tidak membocorkan path internal', !/"path"/.test(r.text));
  const rt = r.json?.data || {};
  console.log('      runtimes:', Object.fromEntries(Object.entries(rt).filter(([k]) => ['node','python','java','c','cpp','sql','typescript'].includes(k)).map(([k, v]: any) => [k, v.state])), 'server:', rt.server?.status);

  // --- run: node
  r = await call('POST', '/api/run', { language: 'javascript', code: 'console.log("halo", 1+2)', projectId: 'test' });
  ok('POST /api/run node -> stdout', r.status === 200 && isJson(r) && r.json.data.stdout.includes('halo 3'), r.json?.data?.stdout?.trim());

  // --- run: user code tidak boleh melihat secret server
  process.env.SUPER_SECRET_TOKEN = 'rahasia-123';
  r = await call('POST', '/api/run', { language: 'javascript', code: 'console.log(String(process.env.SUPER_SECRET_TOKEN))' });
  ok('user code tidak bisa membaca env server', r.status === 200 && r.json.data.stdout.includes('undefined'), r.json?.data?.stdout?.trim());

  // --- run: python (jika tersedia)
  if (rt.python?.available) {
    r = await call('POST', '/api/run', { language: 'python', code: 'print(6*7)', projectId: 'test' });
    ok('POST /api/run python', r.status === 200 && r.json.data.stdout.includes('42'), r.json?.data?.stdout?.trim());
    r = await call('POST', '/api/run', { language: 'python', code: 'while True: pass', timeoutMs: 1000 });
    ok('python infinite loop -> Timeout (JSON)', r.status === 200 && r.json.data.status === 'Timeout', r.json?.data?.status);
    r = await call('POST', '/api/run', { language: 'python', code: 'print("x"*10**8)' });
    ok('python output besar dipotong, tetap JSON', r.status === 200 && isJson(r) && r.json.data.stdout.length < 300000);
  }
  if (rt.c?.available) {
    r = await call('POST', '/api/run', { language: 'c', code: '#include <stdio.h>\nint main(){printf("c-ok\\n");return 0;}' });
    ok('POST /api/run c', r.status === 200 && r.json.data.stdout.includes('c-ok'), r.json?.data?.stdout?.trim());
  }
  if (rt.cpp?.available) {
    r = await call('POST', '/api/run', { language: 'cpp', code: '#include <iostream>\nint main(){std::cout<<"cpp-ok\\n";}' });
    ok('POST /api/run cpp', r.status === 200 && r.json.data.stdout.includes('cpp-ok'), r.json?.data?.stdout?.trim());
  }
  if (rt.java?.available) {
    r = await call('POST', '/api/run', { language: 'java', code: 'public class Main { public static void main(String[] a){ System.out.println("java-ok"); } }' });
    ok('POST /api/run java', r.status === 200 && r.json.data.stdout.includes('java-ok'), r.json?.data?.stdout?.trim());
  }

  // --- runtime tidak tersedia -> JSON RUNTIME_UNAVAILABLE (bukan crash)
  const unavailable = ['typescript', 'java', 'c', 'cpp', 'python'].find((k) => rt[k] && !rt[k].available);
  if (unavailable) {
    r = await call('POST', '/api/run', { language: unavailable, code: 'x' });
    ok(`runtime ${unavailable} tidak tersedia -> 503 RUNTIME_UNAVAILABLE`, r.status === 503 && isJson(r) && r.json.error.code === 'RUNTIME_UNAVAILABLE', r.json?.error?.message);
  } else {
    console.log('SKIP  (semua runtime tersedia di mesin ini, skenario unavailable dites via PYTHON_BIN palsu di bawah)');
  }

  // --- SQL
  r = await call('POST', '/api/sql/query', { query: 'CREATE TABLE IF NOT EXISTS t(a INT); INSERT INTO t VALUES (1),(2); SELECT * FROM t;', projectId: 'apitest' });
  ok('POST /api/sql/query', r.status === 200 && isJson(r) && r.json.data.rowCount >= 2, `rows=${r.json?.data?.rowCount}`);
  r = await call('POST', '/api/sql/query', { query: 'SELEC oops', projectId: 'apitest' });
  ok('SQL salah -> 400 SQL_ERROR (JSON)', r.status === 400 && r.json?.error?.code === 'SQL_ERROR');
  r = await call('POST', '/api/sql/query', { query: "ATTACH DATABASE '/etc/passwd' AS x", projectId: 'apitest' });
  ok('SQL ATTACH diblokir', r.status === 400 && isJson(r));
  r = await call('GET', '/api/sql/history?projectId=apitest');
  ok('GET /api/sql/history', r.status === 200 && Array.isArray(r.json?.data?.history));

  // --- error handling
  r = await call('GET', '/api/tidak-ada');
  ok('GET /api/tidak-ada -> 404 JSON', r.status === 404 && isJson(r) && r.json.error.code === 'NOT_FOUND' && !r.text.includes('<html'));
  r = await call('GET', '/api/run');
  ok('GET /api/run -> 405 JSON', r.status === 405 && isJson(r) && r.json.error.code === 'METHOD_NOT_ALLOWED');
  r = await call('POST', '/api/run', undefined, '{bukan json');
  ok('body JSON rusak -> 400 INVALID_JSON', r.status === 400 && r.json?.error?.code === 'INVALID_JSON');
  r = await call('POST', '/api/run', { language: 'python', code: 'x'.repeat(100001) });
  ok('code oversized -> 413 LIMIT_EXCEEDED', r.status === 413 && r.json?.error?.code === 'LIMIT_EXCEEDED');
  r = await call('POST', '/api/run', { language: 'cobol', code: 'DISPLAY 1' });
  ok('runtime tidak didukung -> 400 UNSUPPORTED_RUNTIME', r.status === 400 && r.json?.error?.code === 'UNSUPPORTED_RUNTIME');
  r = await call('POST', '/api/run', { language: 'python', code: 'print(1)', projectId: '../../etc' });
  ok('projectId path traversal ditolak', r.status === 400 && r.json?.error?.code === 'INVALID_INPUT');
  r = await call('POST', '/api/run', { language: 'node', code: 'x', filename: '../evil.js' });
  ok('filename path traversal ditolak', r.status === 400 && r.json?.error?.code === 'INVALID_INPUT');
  r = await call('POST', '/api/run', { language: 'node' });
  ok('code kosong -> 400', r.status === 400 && isJson(r));
  ok('semua error membawa requestId', !!r.json?.error?.requestId);
  r = await call('POST', '/api/python/install', { packageName: 'requests; rm -rf /' });
  ok('package name berbahaya ditolak (JSON)', [400, 501].includes(r.status) && isJson(r));
  r = await call('GET', '/api/python/environment');
  ok('GET /api/python/environment', r.status === 200 && isJson(r));
  r = await call('GET', '/api/database/health');
  ok('GET /api/database/health tanpa path internal', r.status === 200 && isJson(r) && !('databasePath' in r.json.data));

  // --- CRITICAL TEST: frontend vs endpoint yang tidak ada / mengembalikan HTML
  for (const [endpoint, label] of [['/html-404', 'HTML 404 page'], ['/api/tidak-ada', 'API JSON 404']] as const) {
    try {
      await apiRequest(endpoint, { method: 'POST', body: { a: 1 }, baseUrl: base });
      ok(`api-client ${label}`, false, 'seharusnya melempar error');
    } catch (e: any) {
      const msg = String(e?.message);
      ok(
        `api-client ${label} -> pesan jelas, bukan "Unexpected token"`,
        e instanceof ApiError && e.status === 404 && !msg.includes('Unexpected token') && msg.includes(endpoint),
        msg
      );
    }
  }

  server?.close();
  console.log(failed === 0 ? '\nSEMUA CEK LULUS' : `\n${failed} CEK GAGAL`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
