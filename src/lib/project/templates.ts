import { Project, ProjectFile, SupportedLanguage } from '../../types';

export function detectLanguageFromFilename(filename: string): SupportedLanguage {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'js':
    case 'mjs':
    case 'cjs':
      return 'javascript';
    case 'ts':
    case 'tsx':
      return 'typescript';
    case 'py':
    case 'python':
      return 'python';
    case 'java':
      return 'java';
    case 'c':
    case 'h':
      return 'c';
    case 'cpp':
    case 'cc':
    case 'cxx':
    case 'hpp':
      return 'cpp';
    case 'sql':
      return 'sql';
    case 'html':
    case 'htm':
      return 'html';
    case 'css':
      return 'css';
    case 'json':
      return 'json';
    case 'sh':
    case 'bash':
      return 'bash';
    default:
      return 'javascript';
  }
}

export interface ProjectTemplateItem {
  id: string;
  name: string;
  category:
    | 'Web'
    | 'Node.js'
    | 'TypeScript'
    | 'React'
    | 'Next.js'
    | 'Python'
    | 'Java'
    | 'C / C++'
    | 'SQL'
    | 'Empty';
  description: string;
  defaultFile: string;
  files: ProjectFile[];
}

export const TEMPLATES_CATALOG: ProjectTemplateItem[] = [
  // 1. Web (HTML / CSS / JS Canvas)
  {
    id: 'web-html5-canvas',
    name: 'HTML5 Interactive Canvas',
    category: 'Web',
    description: 'Aplikasi web interaktif dengan partikel canvas 60 FPS, styling CSS modern, dan kontrol animasi.',
    defaultFile: 'index.html',
    files: [
      {
        id: 'w1',
        name: 'index.html',
        path: 'index.html',
        language: 'html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BILZX CODEX — Interactive Canvas</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="card">
    <div class="header">
      <span class="badge">LIVE PREVIEW</span>
      <h1>BILZX CODEX</h1>
      <p class="subtitle">CODE. RUN. BUILD.</p>
    </div>
    
    <div class="stats">
      <div class="stat-item">
        <span class="stat-value" id="fps">60</span>
        <span class="stat-label">FPS</span>
      </div>
      <div class="stat-item">
        <span class="stat-value" id="particles-count">40</span>
        <span class="stat-label">PARTICLES</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">STABLE</span>
        <span class="stat-label">STATUS</span>
      </div>
    </div>

    <canvas id="canvas"></canvas>
    
    <div class="controls">
      <button id="add-btn" class="neo-btn">Add Particles</button>
      <button id="color-btn" class="neo-btn secondary">Change Theme</button>
      <button id="clear-btn" class="neo-btn danger">Reset</button>
    </div>
  </div>

  <script src="script.js"></script>
</body>
</html>`,
      },
      {
        id: 'w2',
        name: 'style.css',
        path: 'style.css',
        language: 'css',
        content: `* { margin: 0; padding: 0; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace; }
body { background: #F3F4F6; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 16px; }
.card { background: #FFFFFF; border: 3px solid #000000; box-shadow: 6px 6px 0px #000000; border-radius: 8px; width: 100%; max-width: 520px; padding: 24px; }
.header { border-bottom: 2px solid #000000; padding-bottom: 14px; margin-bottom: 16px; }
.badge { background: #DBEAFE; color: #1D4ED8; font-size: 11px; font-weight: 800; letter-spacing: 1px; padding: 3px 8px; border: 1.5px solid #000000; display: inline-block; margin-bottom: 6px; }
h1 { font-size: 26px; font-weight: 900; color: #18181B; }
.subtitle { font-size: 13px; font-weight: 700; color: #2563EB; }
.stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 16px; }
.stat-item { background: #F9FAFB; border: 2px solid #000000; padding: 8px; text-align: center; }
.stat-value { display: block; font-size: 18px; font-weight: 900; color: #18181B; }
.stat-label { font-size: 10px; font-weight: 700; color: #6B7280; }
canvas { width: 100%; height: 200px; background: #18181B; border: 2px solid #000000; border-radius: 4px; display: block; margin-bottom: 16px; }
.controls { display: flex; gap: 8px; flex-wrap: wrap; }
.neo-btn { flex: 1; min-width: 90px; background: #2563EB; color: #FFFFFF; border: 2px solid #000000; box-shadow: 2px 2px 0px #000000; padding: 8px 12px; font-size: 12px; font-weight: 800; cursor: pointer; }
.neo-btn.secondary { background: #DBEAFE; color: #1D4ED8; }
.neo-btn.danger { background: #FEE2E2; color: #DC2626; }`,
      },
      {
        id: 'w3',
        name: 'script.js',
        path: 'script.js',
        language: 'javascript',
        content: `const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const countEl = document.getElementById('particles-count');
const addBtn = document.getElementById('add-btn');
const colorBtn = document.getElementById('color-btn');
const clearBtn = document.getElementById('clear-btn');

function resize() {
  canvas.width = canvas.clientWidth * window.devicePixelRatio;
  canvas.height = canvas.clientHeight * window.devicePixelRatio;
}
window.addEventListener('resize', resize);
resize();

const palettes = [
  ['#2563EB', '#60A5FA', '#93C5FD', '#FFFFFF'],
  ['#10B981', '#34D399', '#6EE7B7', '#FFFFFF'],
  ['#F59E0B', '#FBBF24', '#FDE68A', '#FFFFFF']
];
let paletteIdx = 0;
let particles = [];

class Particle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.vx = (Math.random() - 0.5) * 2;
    this.vy = (Math.random() - 0.5) * 2;
    this.radius = Math.random() * 3 + 1;
    this.color = palettes[paletteIdx][Math.floor(Math.random() * palettes[paletteIdx].length)];
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
    if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}

for (let i = 0; i < 40; i++) particles.push(new Particle());

function animate() {
  ctx.fillStyle = 'rgba(24, 24, 27, 0.25)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => { p.update(); p.draw(); });
  requestAnimationFrame(animate);
}
animate();

addBtn.onclick = () => {
  for (let i = 0; i < 15; i++) particles.push(new Particle());
  countEl.textContent = particles.length;
};
colorBtn.onclick = () => {
  paletteIdx = (paletteIdx + 1) % palettes.length;
  particles.forEach(p => p.color = palettes[paletteIdx][Math.floor(Math.random() * palettes[paletteIdx].length)]);
};
clearBtn.onclick = () => {
  particles = [];
  for (let i = 0; i < 20; i++) particles.push(new Particle());
  countEl.textContent = particles.length;
};`,
      },
      {
        id: 'w4',
        name: 'README.md',
        path: 'README.md',
        language: 'bash',
        content: `# HTML5 Canvas Interactive
Project web interaktif dengan live preview dan sandboxed iframe. Tekan tombol **Preview** untuk melihat hasil seketika.`,
      },
    ],
  },

  // 2. Node.js Quickstart
  {
    id: 'node-quickstart',
    name: 'Node.js Quickstart',
    category: 'Node.js',
    description: 'Script komputasi JavaScript V8 murni dengan benchmark performa dan tabel output.',
    defaultFile: 'main.js',
    files: [
      {
        id: 'n1',
        name: 'main.js',
        path: 'main.js',
        language: 'javascript',
        content: `// BILZX CODEX — Node.js Execution Test
console.log("==========================================");
console.log("  BILZX CODEX — CODE. RUN. BUILD.");
console.log("  Node.js Runtime Environment");
console.log("==========================================\\n");

console.log("Node Version :", process.version);
console.log("Platform     :", process.platform);
console.log("Architecture :", process.arch);
console.log("Timestamp    :", new Date().toISOString());

// Fibonacci benchmark
function fibonacci(n) {
  if (n <= 1) return n;
  let a = 0, b = 1;
  for (let i = 2; i <= n; i++) {
    const c = a + b;
    a = b;
    b = c;
  }
  return b;
}

const n = 50;
const start = performance.now();
const res = fibonacci(n);
const duration = (performance.now() - start).toFixed(3);
console.log(\`\\nFibonacci(\${n}) = \${res} (computed in \${duration}ms)\`);

console.log("\\n>>> Execution completed successfully.");`,
      },
      {
        id: 'n2',
        name: 'package.json',
        path: 'package.json',
        language: 'json',
        content: `{
  "name": "bilzx-node-quickstart",
  "version": "1.0.0",
  "main": "main.js",
  "scripts": {
    "start": "node main.js"
  }
}`,
      },
      {
        id: 'n3',
        name: 'README.md',
        path: 'README.md',
        language: 'bash',
        content: `# Node.js Quickstart
Jalankan kode dengan menekan tombol **RUN** atau gunakan shortcut \`Ctrl+Enter\`.`,
      },
    ],
  },

  // 3. TypeScript Node.js
  {
    id: 'node-typescript',
    name: 'TypeScript Node.js',
    category: 'Node.js',
    description: 'Lingkungan TypeScript dengan interface data, generics, dan compiler type definitions.',
    defaultFile: 'main.ts',
    files: [
      {
        id: 'ts1',
        name: 'main.ts',
        path: 'main.ts',
        language: 'typescript',
        content: `// BILZX CODEX — TypeScript Environment
interface Developer {
  id: string;
  name: string;
  role: 'Frontend' | 'Backend' | 'Fullstack' | 'DevOps';
  skills: string[];
}

class WorkspaceManager {
  private developers: Developer[] = [];

  addDeveloper(dev: Developer): void {
    this.developers.push(dev);
    console.log(\`[REGISTERED]: \${dev.name} as \${dev.role}\`);
  }

  listDevelopers(): Developer[] {
    return this.developers;
  }
}

const manager = new WorkspaceManager();
manager.addDeveloper({
  id: 'dev-01',
  name: 'BilzxDev',
  role: 'Fullstack',
  skills: ['TypeScript', 'Node.js', 'Next.js', 'Python'],
});

console.log("\\nWorkspace Team Registry:", manager.listDevelopers());
console.log(">>> TypeScript checked successfully.");`,
      },
      {
        id: 'ts2',
        name: 'tsconfig.json',
        path: 'tsconfig.json',
        language: 'json',
        content: `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "skipLibCheck": true
  }
}`,
      },
      {
        id: 'ts3',
        name: 'package.json',
        path: 'package.json',
        language: 'json',
        content: `{
  "name": "bilzx-ts-starter",
  "version": "1.0.0",
  "main": "main.ts",
  "devDependencies": {
    "typescript": "^5.4.0"
  }
}`,
      },
      {
        id: 'ts4',
        name: 'README.md',
        path: 'README.md',
        language: 'bash',
        content: `# TypeScript Starter
Proyek TypeScript terstruktur dengan tsconfig.json dan type safety.`,
      },
    ],
  },

  // 4. Express API Server
  {
    id: 'node-express-api',
    name: 'Express API Server',
    category: 'Node.js',
    description: 'REST API service dengan router, middleware JSON, health check, dan route mock data.',
    defaultFile: 'server.js',
    files: [
      {
        id: 'e1',
        name: 'server.js',
        path: 'server.js',
        language: 'javascript',
        content: `// BILZX CODEX — Express API Example
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// In-memory data store
const projects = [
  { id: 1, name: "Alpha Service", status: "running" },
  { id: 2, name: "Beta Worker", status: "idle" }
];

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.get('/api/projects', (req, res) => {
  res.json({ total: projects.length, data: projects });
});

app.post('/api/projects', (req, res) => {
  const { name } = req.body;
  const newProject = { id: projects.length + 1, name: name || 'New Project', status: 'created' };
  projects.push(newProject);
  res.status(201).json(newProject);
});

console.log("Express API definitions loaded. Ready for execution.");`,
      },
      {
        id: 'e2',
        name: 'package.json',
        path: 'package.json',
        language: 'json',
        content: `{
  "name": "bilzx-express-api",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.19.2"
  }
}`,
      },
      {
        id: 'e3',
        name: 'README.md',
        path: 'README.md',
        language: 'bash',
        content: `# Express REST API Server
Starter server Express dengan route \`/api/health\` dan \`/api/projects\`.`,
      },
    ],
  },

  // 5. React SPA
  {
    id: 'react-spa',
    name: 'React SPA',
    category: 'React',
    description: 'Komponen modular React dengan state hooks, render cards, dan styling modern.',
    defaultFile: 'App.jsx',
    files: [
      {
        id: 'r1',
        name: 'App.jsx',
        path: 'App.jsx',
        language: 'javascript',
        content: `import React, { useState } from 'react';

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="container">
      <header>
        <h1>BILZX CODEX — React SPA</h1>
        <p>Modern React Component Architecture</p>
      </header>

      <main>
        <button onClick={() => setCount(c => c + 1)}>
          Count is: {count}
        </button>
      </main>
    </div>
  );
}`,
      },
      {
        id: 'r2',
        name: 'package.json',
        path: 'package.json',
        language: 'json',
        content: `{
  "name": "bilzx-react-spa",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  }
}`,
      },
      {
        id: 'r3',
        name: 'README.md',
        path: 'README.md',
        language: 'bash',
        content: `# React SPA Template
Modular Single Page Application menggunakan React 18 hooks.`,
      },
    ],
  },

  // 6. Vite React
  {
    id: 'vite-react',
    name: 'Vite React App',
    category: 'React',
    description: 'Vite + React dengan fast refresh, CSS framework support, dan konfigurasi vite.config.ts.',
    defaultFile: 'src/App.tsx',
    files: [
      {
        id: 'vr1',
        name: 'App.tsx',
        path: 'src/App.tsx',
        language: 'typescript',
        content: `import React, { useState } from 'react';

export default function App() {
  const [tasks, setTasks] = useState<string[]>([
    'Explore BILZX CODEX',
    'Run Node.js & Python scripts',
    'Test local AI assistant'
  ]);

  return (
    <div style={{ padding: '24px', fontFamily: 'monospace' }}>
      <h2>⚡ Vite + React Workspace</h2>
      <ul>
        {tasks.map((task, i) => (
          <li key={i}>{task}</li>
        ))}
      </ul>
    </div>
  );
}`,
      },
      {
        id: 'vr2',
        name: 'vite.config.ts',
        path: 'vite.config.ts',
        language: 'typescript',
        content: `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});`,
      },
      {
        id: 'vr3',
        name: 'package.json',
        path: 'package.json',
        language: 'json',
        content: `{
  "name": "bilzx-vite-react",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.2.0"
  }
}`,
      },
      {
        id: 'vr4',
        name: 'README.md',
        path: 'README.md',
        language: 'bash',
        content: `# Vite + React
Starter project Vite siap dideploy ke Vercel atau Netlify.`,
      },
    ],
  },

  // 7. Next.js App Router
  {
    id: 'nextjs-starter',
    name: 'Next.js App Router',
    category: 'Next.js',
    description: 'Next.js App Router dengan Server & Client Components, Layouts, dan API routes.',
    defaultFile: 'app/page.tsx',
    files: [
      {
        id: 'nx1',
        name: 'page.tsx',
        path: 'app/page.tsx',
        language: 'typescript',
        content: `import React from 'react';

export default function HomePage() {
  return (
    <main style={{ padding: '32px', fontFamily: 'sans-serif' }}>
      <h1>BILZX CODEX — Next.js App Router</h1>
      <p>Server-rendered React Framework for the Web</p>
      
      <div style={{ marginTop: '20px', padding: '16px', background: '#DBEAFE', border: '2px solid #000' }}>
        <strong>Ready for Vercel & Netlify Deployment</strong>
      </div>
    </main>
  );
}`,
      },
      {
        id: 'nx2',
        name: 'layout.tsx',
        path: 'app/layout.tsx',
        language: 'typescript',
        content: `export const metadata = {
  title: 'BILZX CODEX Next.js App',
  description: 'Built with BILZX CODEX Developer Workspace',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}`,
      },
      {
        id: 'nx3',
        name: 'package.json',
        path: 'package.json',
        language: 'json',
        content: `{
  "name": "bilzx-nextjs-app",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "^14.2.3",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  }
}`,
      },
      {
        id: 'nx4',
        name: 'README.md',
        path: 'README.md',
        language: 'bash',
        content: `# Next.js App Router
Template Next.js modern dengan dukungan App Router, SSR, dan konfigurasi Vercel otomatis.`,
      },
    ],
  },

  // 8. Python Analytics & Math
  {
    id: 'python-analytics',
    name: 'Python Analytics & Math',
    category: 'Python',
    description: 'Skrip analisis data CPython dengan komputasi prima, mean, deviasi standar, dan requirements.txt.',
    defaultFile: 'main.py',
    files: [
      {
        id: 'py1',
        name: 'main.py',
        path: 'main.py',
        language: 'python',
        content: `# BILZX CODEX — Python Analytics
import sys
import math

print("==========================================")
print("  BILZX CODEX — CODE. RUN. BUILD.")
print("  Python Analytics Environment")
print("==========================================\\n")

print(f"Python Version: {sys.version.split()[0]}")
print(f"Platform:       {sys.platform}")

# Prime Numbers calculation
def is_prime(num):
    if num < 2: return False
    for i in range(2, int(math.isqrt(num)) + 1):
        if num % i == 0: return False
    return True

primes = [x for x in range(2, 60) if is_prime(x)]
print(f"\\nPrimes up to 60 ({len(primes)} found): {primes}")

# Dataset calculations
data = [24, 45, 68, 92, 115, 34, 76, 88]
mean = sum(data) / len(data)
variance = sum((x - mean) ** 2 for x in data) / len(data)
std_dev = math.sqrt(variance)

print("\\n[Statistical Analysis]:")
print(f"Dataset : {data}")
print(f"Mean    : {mean:.2f}")
print(f"Std Dev : {std_dev:.2f}")

print("\\n>>> Python script executed successfully.")`,
      },
      {
        id: 'py2',
        name: 'requirements.txt',
        path: 'requirements.txt',
        language: 'bash',
        content: `# requirements.txt
requests>=2.31.0
numpy>=1.24.0`,
      },
      {
        id: 'py3',
        name: 'README.md',
        path: 'README.md',
        language: 'bash',
        content: `# Python Analytics
Tekan **RUN** untuk mengeksekusi script pada runner CPython server nyata.`,
      },
    ],
  },

  // 9. Python CLI Application
  {
    id: 'python-cli',
    name: 'Python CLI Tool',
    category: 'Python',
    description: 'Aplikasi Command Line Interface Python dengan formatting tabel dan pemrosesan string.',
    defaultFile: 'cli.py',
    files: [
      {
        id: 'pc1',
        name: 'cli.py',
        path: 'cli.py',
        language: 'python',
        content: `# BILZX CODEX — Python CLI Tool
import time
import os

def display_banner():
    print("""
+-----------------------------------+
|  BILZX CODEX CLI UTILITY v1.0.0   |
|  CODE. RUN. BUILD.                |
+-----------------------------------+
""")

def process_command(cmd, args):
    if cmd == "info":
        print(f"Working Directory : {os.getcwd()}")
        print(f"Timestamp         : {time.strftime('%Y-%m-%d %H:%M:%S')}")
    elif cmd == "stats":
        words = args.split()
        print(f"Word Count : {len(words)}")
        print(f"Char Count : {len(args)}")
    else:
        print(f"Unknown command: '{cmd}'. Try 'info' or 'stats'.")

display_banner()
process_command("info", "")
process_command("stats", "The quick brown fox jumps over the lazy dog")`,
      },
      {
        id: 'pc2',
        name: 'requirements.txt',
        path: 'requirements.txt',
        language: 'bash',
        content: `# requirements.txt
colorama>=0.4.6`,
      },
      {
        id: 'pc3',
        name: 'README.md',
        path: 'README.md',
        language: 'bash',
        content: `# Python CLI Tool
Contoh aplikasi terminal dengan banner dan argument processor.`,
      },
    ],
  },

  // 10. Python Micro-API
  {
    id: 'python-api',
    name: 'Python Micro-API',
    category: 'Python',
    description: 'Struktur micro-service backend Python dengan data model dan JSON response serializer.',
    defaultFile: 'app.py',
    files: [
      {
        id: 'pa1',
        name: 'app.py',
        path: 'app.py',
        language: 'python',
        content: `# BILZX CODEX — Python Micro-API
import json

class MicroService:
    def __init__(self, name):
        self.name = name
        self.routes = {}

    def route(self, path):
        def decorator(f):
            self.routes[path] = f
            return f
        return decorator

    def handle(self, path):
        handler = self.routes.get(path)
        if handler:
            return 200, handler()
        return 404, {"error": "Route not found"}

app = MicroService("bilzx-micro-api")

@app.route("/health")
def health():
    return {"status": "ok", "service": "BILZX Micro-API", "version": "1.0.0"}

@app.route("/items")
def items():
    return [{"id": 101, "name": "Code Engine"}, {"id": 102, "name": "Runtime Sandbox"}]

# Simulate router requests
print("[TEST ROUTE]: /health")
code, res = app.handle("/health")
print(f"Status {code} => {json.dumps(res, indent=2)}")

print("\\n[TEST ROUTE]: /items")
code, res = app.handle("/items")
print(f"Status {code} => {json.dumps(res, indent=2)}")`,
      },
      {
        id: 'pa2',
        name: 'requirements.txt',
        path: 'requirements.txt',
        language: 'bash',
        content: `# requirements.txt
pydantic>=2.0.0`,
      },
      {
        id: 'pa3',
        name: 'README.md',
        path: 'README.md',
        language: 'bash',
        content: `# Python Micro-API
Micro-framework API modular di Python 3.`,
      },
    ],
  },

  // 11. TypeScript Sandbox
  {
    id: 'typescript-sandbox',
    name: 'TypeScript Runtime',
    category: 'TypeScript',
    description: 'Eksekusi TypeScript modern dengan static typing, interfaces, dan compilation langsung.',
    defaultFile: 'main.ts',
    files: [
      {
        id: 'ts1',
        name: 'main.ts',
        path: 'main.ts',
        language: 'typescript',
        content: `// BILZX CODEX — TypeScript Engine
interface Developer {
  name: string;
  role: string;
  languages: string[];
}

const team: Developer[] = [
  { name: "Bilal", role: "Creator", languages: ["TypeScript", "Python", "C++"] },
  { name: "BilzxDev", role: "Core Architect", languages: ["Java", "Rust", "Go"] }
];

console.log("==========================================");
console.log("  BILZX CODEX — TypeScript Sandbox");
console.log("==========================================\\n");

team.forEach(dev => {
  console.log(\`Developer: \${dev.name} (\${dev.role}) => \${dev.languages.join(", ")}\`);
});

console.log("\\n✓ TypeScript compiled & executed successfully.");`,
      },
      {
        id: 'ts2',
        name: 'tsconfig.json',
        path: 'tsconfig.json',
        language: 'json',
        content: `{\n  "compilerOptions": {\n    "target": "ES2022",\n    "module": "ESNext",\n    "strict": true\n  }\n}\n`,
      },
    ],
  },

  // 12. Java 21 Starter
  {
    id: 'java-quickstart',
    name: 'Java 21 Engine',
    category: 'Java',
    description: 'Kompilasi javac dan eksekusi JVM dengan OOP, data streams, dan logging terstruktur.',
    defaultFile: 'Main.java',
    files: [
      {
        id: 'jv1',
        name: 'Main.java',
        path: 'Main.java',
        language: 'java',
        content: `// BILZX CODEX — Java 21 Platform
import java.util.List;
import java.util.stream.Collectors;

public class Main {
    public static void main(String[] args) {
        System.out.println("==========================================");
        System.out.println("  BILZX CODEX — Java Runtime Engine");
        System.out.println("  Runtime : " + System.getProperty("java.runtime.name"));
        System.out.println("  Version : Java " + System.getProperty("java.version"));
        System.out.println("==========================================\\n");

        List<String> modules = List.of("Monaco Editor", "Multi Runtime", "Bug Analyzer", "Local AI", "SQL Studio");
        String formatted = modules.stream()
            .map(m -> "  [OK] " + m)
            .collect(Collectors.joining("\\n"));

        System.out.println("Loaded System Modules:");
        System.out.println(formatted);

        System.out.println("\\n✓ Java javac compile & JVM execution completed.");
    }
}`,
      },
      {
        id: 'jv2',
        name: 'README.md',
        path: 'README.md',
        language: 'bash',
        content: `# Java 21 Quickstart\nJalankan Main.java untuk menguji kompilasi javac dan runtime JVM.`,
      },
    ],
  },

  // 13. C Systems Sandbox
  {
    id: 'c-quickstart',
    name: 'C Systems Sandbox',
    category: 'C / C++',
    description: 'Kompilasi C dengan Clang / GCC ke binary sandbox terisolasi dengan proteksi timeout & memory.',
    defaultFile: 'main.c',
    files: [
      {
        id: 'c1',
        name: 'main.c',
        path: 'main.c',
        language: 'c',
        content: `// BILZX CODEX — C Systems Runtime (Clang/GCC)
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct {
    char name[32];
    int score;
} Player;

int main() {
    printf("==========================================\\n");
    printf("  BILZX CODEX — C Systems Sandbox\\n");
    printf("  Compiler: Clang / GCC Isolated Binary\\n");
    printf("==========================================\\n\\n");

    Player players[3];
    strcpy(players[0].name, "Bilal");
    players[0].score = 980;

    strcpy(players[1].name, "Alpha");
    players[1].score = 850;

    strcpy(players[2].name, "Zephyr");
    players[2].score = 920;

    printf("Scoreboard:\\n");
    for (int i = 0; i < 3; i++) {
        printf("  #%d %-10s : %d pts\\n", i + 1, players[i].name, players[i].score);
    }

    printf("\\n✓ C source compiled & executed with zero exit code.\\n");
    return 0;
}`,
      },
      {
        id: 'c2',
        name: 'README.md',
        path: 'README.md',
        language: 'bash',
        content: `# C Language Sandbox\nProgram C dikompilasi secara otomatis ke temporary binary dan dibersihkan setelah selesai.`,
      },
    ],
  },

  // 14. C++ Modern STL
  {
    id: 'cpp-quickstart',
    name: 'C++ Modern STL',
    category: 'C / C++',
    description: 'Modern C++ dengan Standard Template Library (STL), lambdas, smart vectors, dan algoritma.',
    defaultFile: 'main.cpp',
    files: [
      {
        id: 'cpp1',
        name: 'main.cpp',
        path: 'main.cpp',
        language: 'cpp',
        content: `// BILZX CODEX — Modern C++ Sandbox (Clang++ / G++)
#include <iostream>
#include <vector>
#include <numeric>
#include <algorithm>
#include <string>

int main() {
    std::cout << "==========================================\\n";
    std::cout << "  BILZX CODEX — C++ Modern STL Sandbox\\n";
    std::cout << "==========================================\\n\\n";

    std::vector<int> numbers = {12, 45, 68, 23, 89, 34, 91};
    std::sort(numbers.begin(), numbers.end());

    int sum = std::accumulate(numbers.begin(), numbers.end(), 0);
    double avg = static_cast<double>(sum) / numbers.size();

    std::cout << "Sorted Numbers: ";
    for (int n : numbers) std::cout << n << " ";
    std::cout << "\\n";

    std::cout << "Total Elements: " << numbers.size() << "\\n";
    std::cout << "Sum           : " << sum << "\\n";
    std::cout << "Average       : " << avg << "\\n";

    std::cout << "\\n✓ C++ binary compiled & run cleanly.\\n";
    return 0;
}`,
      },
      {
        id: 'cpp2',
        name: 'README.md',
        path: 'README.md',
        language: 'bash',
        content: `# Modern C++ Project\nMendukung pustaka standar C++, vektor, lambda, dan algoritma.`,
      },
    ],
  },

  // 15. SQL Online Database
  {
    id: 'sql-database-starter',
    name: 'SQLite Online Database',
    category: 'SQL',
    description: 'Database SQL interaktif dengan tabel, data seeding, agregasi GROUP BY, dan query analytics.',
    defaultFile: 'database.sql',
    files: [
      {
        id: 'sql1',
        name: 'database.sql',
        path: 'database.sql',
        language: 'sql',
        content: `-- BILZX CODEX — SQLite Database Studio
CREATE TABLE IF NOT EXISTS developers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  rating REAL DEFAULT 5.0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO developers (name, specialty, rating) VALUES
  ('Bilal', 'Full-Stack & Systems', 4.95),
  ('BilzxDev', 'Compiler & AI Architecture', 5.00),
  ('Sarah', 'Frontend & UI/UX', 4.88),
  ('David', 'Database & DevOps', 4.92);

-- Query analytics
SELECT 
  specialty,
  COUNT(*) AS dev_count,
  ROUND(AVG(rating), 2) AS avg_rating
FROM developers
GROUP BY specialty;

SELECT * FROM developers ORDER BY rating DESC;`,
      },
      {
        id: 'sql2',
        name: 'README.md',
        path: 'README.md',
        language: 'bash',
        content: `# SQLite Database Project\nEksekusi query ini dengan tombol RUN atau buka SQL Studio untuk inspeksi skema interaktif.`,
      },
    ],
  },

  // 16. Empty Project
  {
    id: 'empty-project',
    name: 'Empty Project',
    category: 'Empty',
    description: 'Workspace kosong murni untuk memulai coding dari awal sesuai kebutuhan Anda.',
    defaultFile: 'main.js',
    files: [
      {
        id: 'b1',
        name: 'main.js',
        path: 'main.js',
        language: 'javascript',
        content: `// BILZX CODEX — Empty Workspace
console.log("Hello BILZX CODEX!");
`,
      },
      {
        id: 'b2',
        name: 'README.md',
        path: 'README.md',
        language: 'bash',
        content: `# Empty Project
Ketik kode Anda dan jalankan di runner BILZX CODEX.`,
      },
    ],
  },
];

export const DEFAULT_PROJECTS: Project[] = [
  {
    id: 'project-nodejs-quickstart',
    name: 'Node.js Quickstart',
    description: 'Modern Node.js runtime test with performance metrics and algorithms',
    defaultFile: 'main.js',
    templateType: 'node-quickstart',
    createdAt: Date.now() - 3600000,
    updatedAt: Date.now(),
    files: TEMPLATES_CATALOG[1].files,
  },
  {
    id: 'project-python-starter',
    name: 'Python Analytics & Math',
    description: 'Python 3 script demonstrating data structures, math, and system details',
    defaultFile: 'main.py',
    templateType: 'python-analytics',
    createdAt: Date.now() - 7200000,
    updatedAt: Date.now(),
    files: TEMPLATES_CATALOG[7].files,
  },
  {
    id: 'project-html-web-app',
    name: 'Interactive HTML5 Canvas',
    description: 'Live HTML/CSS/JavaScript preview with canvas particle animation',
    defaultFile: 'index.html',
    templateType: 'web-html5-canvas',
    createdAt: Date.now() - 10800000,
    updatedAt: Date.now(),
    files: TEMPLATES_CATALOG[0].files,
  },
];
