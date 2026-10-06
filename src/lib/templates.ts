import { Project, SupportedLanguage } from '../types';

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

export const DEFAULT_PROJECTS: Project[] = [
  {
    id: 'project-nodejs-quickstart',
    name: 'Node.js Quickstart',
    description: 'Modern Node.js runtime test with performance metrics and algorithms',
    defaultFile: 'main.js',
    createdAt: Date.now() - 3600000,
    updatedAt: Date.now(),
    files: [
      {
        id: 'f1',
        name: 'main.js',
        path: 'main.js',
        language: 'javascript',
        content: `// BILZX CODEX — Node.js Execution Test
console.log("==========================================");
console.log("  BILZX CODEX — CODE. RUN. BUILD.");
console.log("  Node.js Runtime Environment");
console.log("==========================================\\n");

// Test 1: Platform & Environment Info
console.log("Node Version :", process.version);
console.log("Platform     :", process.platform);
console.log("Architecture :", process.arch);
console.log("Timestamp    :", new Date().toISOString());

// Test 2: Computational Benchmark
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

console.log("\\n[Calculation Benchmark]");
const start = performance.now();
const n = 50;
const result = fibonacci(n);
const duration = (performance.now() - start).toFixed(3);

console.log(\`Fibonacci(\${n}) = \${result} (calculated in \${duration}ms)\`);

// Test 3: Array & Object Transformations
const developers = [
  { name: "BilzxDev", role: "Creator", level: "Senior" },
  { name: "User", role: "Developer", level: "Explorer" },
  { name: "Node Runner", role: "Runtime", level: "Active" }
];

console.log("\\n[Registered System Entities]:");
console.table(developers);

console.log("\\n>>> Execution completed successfully.");
`,
      },
      {
        id: 'f2',
        name: 'package.json',
        path: 'package.json',
        language: 'json',
        content: `{
  "name": "bilzx-nodejs-quickstart",
  "version": "1.0.0",
  "description": "Node.js starter project on BILZX CODEX",
  "main": "main.js",
  "scripts": {
    "start": "node main.js"
  }
}
`,
      },
      {
        id: 'f3',
        name: 'README.md',
        path: 'README.md',
        language: 'bash',
        content: `# Node.js Quickstart
Click RUN or press Ctrl+Enter / Cmd+Enter to execute this code in the real Node.js runner.
`,
      },
    ],
  },
  {
    id: 'project-python-starter',
    name: 'Python Analytics & Math',
    description: 'Python 3 script demonstrating data structures, math, and system details',
    defaultFile: 'main.py',
    createdAt: Date.now() - 7200000,
    updatedAt: Date.now(),
    files: [
      {
        id: 'py1',
        name: 'main.py',
        path: 'main.py',
        language: 'python',
        content: `# BILZX CODEX — Python Runtime Test
import sys
import math
import time

print("==========================================")
print("  BILZX CODEX — CODE. RUN. BUILD.")
print("  Python Runtime Environment")
print("==========================================\\n")

# Python System Info
print(f"Python Version: {sys.version.split()[0]}")
print(f"Platform:       {sys.platform}")
print(f"Executable:     {sys.executable}")

# Matrix / Math calculations
print("\\n[Computing Prime Numbers up to 50]:")
def is_prime(num):
    if num < 2:
        return False
    for i in range(2, int(math.isqrt(num)) + 1):
        if num % i == 0:
            return False
    return True

primes = [x for x in range(2, 51) if is_prime(x)]
print(f"Primes found: {primes}")
print(f"Total count:  {len(primes)}")

# Statistical summary
data = [12, 45, 67, 89, 23, 45, 91, 102, 34, 56]
mean = sum(data) / len(data)
variance = sum((x - mean) ** 2 for x in data) / len(data)
std_dev = math.sqrt(variance)

print("\\n[Statistical Analysis]:")
print(f"Dataset:            {data}")
print(f"Mean:               {mean:.2f}")
print(f"Standard Deviation: {std_dev:.2f}")

print("\\n>>> Python test executed successfully in BILZX CODEX.")
`,
      },
      {
        id: 'py2',
        name: 'requirements.txt',
        path: 'requirements.txt',
        language: 'bash',
        content: `# requirements.txt
# Manage packages using the BILZX CODEX Python Package Manager
requests>=2.31.0
`,
      },
    ],
  },
  {
    id: 'project-html-web-app',
    name: 'Interactive HTML5 Canvas',
    description: 'Live HTML/CSS/JavaScript preview with canvas particle animation',
    defaultFile: 'index.html',
    createdAt: Date.now() - 10800000,
    updatedAt: Date.now(),
    files: [
      {
        id: 'h1',
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
        <span class="stat-value" id="particles-count">60</span>
        <span class="stat-label">PARTICLES</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">OK</span>
        <span class="stat-label">STATUS</span>
      </div>
    </div>

    <canvas id="canvas"></canvas>
    
    <div class="controls">
      <button id="add-btn" class="neo-btn">Add Particles</button>
      <button id="color-btn" class="neo-btn secondary">Change Color</button>
      <button id="clear-btn" class="neo-btn danger">Reset</button>
    </div>
  </div>

  <script src="script.js"></script>
</body>
</html>
`,
      },
      {
        id: 'h2',
        name: 'style.css',
        path: 'style.css',
        language: 'css',
        content: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace;
}

body {
  background: #F3F4F6;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.card {
  background: #FFFFFF;
  border: 3px solid #000000;
  box-shadow: 6px 6px 0px #000000;
  border-radius: 8px;
  width: 100%;
  max-width: 520px;
  padding: 24px;
}

.header {
  border-bottom: 2px solid #000000;
  padding-bottom: 14px;
  margin-bottom: 16px;
}

.badge {
  background: #DBEAFE;
  color: #1D4ED8;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1px;
  padding: 3px 8px;
  border: 1.5px solid #000000;
  display: inline-block;
  margin-bottom: 6px;
}

h1 {
  font-size: 26px;
  font-weight: 900;
  color: #18181B;
  letter-spacing: -0.5px;
}

.subtitle {
  font-size: 13px;
  font-weight: 700;
  color: #2563EB;
  margin-top: 2px;
}

.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 16px;
}

.stat-item {
  background: #F9FAFB;
  border: 2px solid #000000;
  padding: 8px;
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 18px;
  font-weight: 900;
  color: #18181B;
}

.stat-label {
  font-size: 10px;
  font-weight: 700;
  color: #6B7280;
}

canvas {
  width: 100%;
  height: 220px;
  background: #18181B;
  border: 2px solid #000000;
  border-radius: 4px;
  display: block;
  margin-bottom: 16px;
}

.controls {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.neo-btn {
  flex: 1;
  min-width: 100px;
  background: #2563EB;
  color: #FFFFFF;
  border: 2px solid #000000;
  box-shadow: 2px 2px 0px #000000;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  transition: transform 0.1s, box-shadow 0.1s;
}

.neo-btn:active {
  transform: translate(2px, 2px);
  box-shadow: 0px 0px 0px #000000;
}

.neo-btn.secondary {
  background: #DBEAFE;
  color: #1D4ED8;
}

.neo-btn.danger {
  background: #FEE2E2;
  color: #DC2626;
}
`,
      },
      {
        id: 'h3',
        name: 'script.js',
        path: 'script.js',
        language: 'javascript',
        content: `const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const fpsEl = document.getElementById('fps');
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

const colors = ['#2563EB', '#60A5FA', '#93C5FD', '#FFFFFF', '#38BDF8'];
let colorIndex = 0;
let particles = [];

class Particle {
  constructor() {
    this.reset();
  }
  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.vx = (Math.random() - 0.5) * 2;
    this.vy = (Math.random() - 0.5) * 2;
    this.radius = Math.random() * 3 + 1.5;
    this.color = colors[colorIndex];
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

for (let i = 0; i < 60; i++) {
  particles.push(new Particle());
}

let lastTime = performance.now();
let frames = 0;
let lastFpsUpdate = performance.now();

function animate(now) {
  frames++;
  if (now - lastFpsUpdate >= 500) {
    fpsEl.textContent = Math.round((frames * 1000) / (now - lastFpsUpdate));
    frames = 0;
    lastFpsUpdate = now;
  }

  ctx.fillStyle = 'rgba(24, 24, 27, 0.25)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw connecting lines
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 80) {
        ctx.beginPath();
        ctx.strokeStyle = \`rgba(37, 99, 235, \${1 - dist / 80})\`;
        ctx.lineWidth = 0.6;
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
      }
    }
  }

  particles.forEach(p => {
    p.update();
    p.draw();
  });

  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);

addBtn.onclick = () => {
  for (let i = 0; i < 20; i++) particles.push(new Particle());
  countEl.textContent = particles.length;
};

colorBtn.onclick = () => {
  colorIndex = (colorIndex + 1) % colors.length;
  particles.forEach(p => p.color = colors[colorIndex]);
};

clearBtn.onclick = () => {
  particles = [];
  for (let i = 0; i < 20; i++) particles.push(new Particle());
  countEl.textContent = particles.length;
};
`,
      },
    ],
  },
];
