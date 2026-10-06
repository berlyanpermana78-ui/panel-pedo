import fs from 'node:fs/promises';
import path from 'node:path';
import { checkBinaryVersion, runProcessSafe } from './runtime/base.js';
import { ApiError, runtimeUnavailable } from './errors.js';
import { installTimeoutMs, isVercel, projectDir as getProjectDir, pythonBin } from './config.js';
import type { PythonPackage } from './types.js';

// Validate package name strictly to prevent argument or injection attacks
const PACKAGE_NAME_REGEX = /^[a-zA-Z0-9_.-]+(==[a-zA-Z0-9_.-]+|>=[a-zA-Z0-9_.-]+|<=[a-zA-Z0-9_.-]+|~=[a-zA-Z0-9_.-]+)?$/;

const UNSUPPORTED_MESSAGE = 'Python package management is not supported in this deployment environment';

function assertSupported(): void {
  if (isVercel()) {
    throw new ApiError(501, 'UNSUPPORTED_IN_DEPLOYMENT', UNSUPPORTED_MESSAGE);
  }
}

async function requirePython(): Promise<void> {
  const status = await checkBinaryVersion(pythonBin(), ['--version']);
  if (!status.available) throw runtimeUnavailable('python');
}

function validatePackage(packageName: unknown): string {
  if (typeof packageName !== 'string' || !PACKAGE_NAME_REGEX.test(packageName.trim())) {
    throw new ApiError(
      400,
      'INVALID_INPUT',
      'Invalid package name format. Only standard PyPI names (e.g. requests, numpy>=1.20) are accepted.'
    );
  }
  return packageName.trim();
}

async function ensureProjectVenv(dir: string): Promise<string> {
  await fs.mkdir(dir, { recursive: true });
  const venvDir = path.join(dir, '.venv');
  const venvPython = path.join(venvDir, 'bin', 'python');

  try {
    await fs.access(venvPython);
    return venvPython;
  } catch {
    const { exitCode, stderr } = await runProcessSafe(pythonBin(), ['-m', 'venv', venvDir], dir, 60000);
    if (exitCode !== 0) {
      throw new ApiError(
        500,
        'VENV_CREATION_FAILED',
        'Failed to create the project virtual environment',
        stderr.trim().slice(-500) || null
      );
    }
    return venvPython;
  }
}

export interface PythonEnvironmentInfo {
  python: { available: boolean; version: string | null; state: 'available' | 'unavailable' | 'unsupported' };
  packageManager: { supported: boolean; reason?: string };
}

export async function getPythonEnvironment(): Promise<PythonEnvironmentInfo> {
  const status = await checkBinaryVersion(pythonBin(), ['--version']);
  return {
    python: {
      available: status.available,
      version: status.version,
      state: status.available ? 'available' : 'unavailable',
    },
    packageManager: isVercel() ? { supported: false, reason: UNSUPPORTED_MESSAGE } : { supported: status.available },
  };
}

export async function getInstalledPackages(projectId: string): Promise<{
  available: boolean;
  packages: PythonPackage[];
  message?: string;
}> {
  if (isVercel()) {
    return { available: false, packages: [], message: UNSUPPORTED_MESSAGE };
  }
  const pythonStatus = await checkBinaryVersion(pythonBin(), ['--version']);
  if (!pythonStatus.available) {
    return { available: false, packages: [], message: 'Python runtime tidak tersedia' };
  }

  const dir = getProjectDir(projectId);
  let pythonPath = pythonBin();
  try {
    pythonPath = await ensureProjectVenv(dir);
  } catch {
    pythonPath = pythonBin(); // read-only: boleh membaca paket sistem
  }

  const { stdout, stderr, exitCode, timedOut } = await runProcessSafe(
    pythonPath,
    ['-m', 'pip', 'list', '--format=json'],
    dir,
    10000
  );
  if (timedOut) return { available: false, packages: [], message: 'Timeout listing packages' };
  if (exitCode !== 0) {
    return { available: false, packages: [], message: stderr.trim().slice(-300) || `pip list exited with code ${exitCode}` };
  }
  try {
    const list = JSON.parse(stdout);
    const packages: PythonPackage[] = Array.isArray(list)
      ? list.map((item: any) => ({ name: String(item.name), version: String(item.version) }))
      : [];
    return { available: true, packages };
  } catch {
    return { available: false, packages: [], message: 'Failed to parse package list JSON' };
  }
}

/**
 * Install a package into project environment (hanya non-Vercel).
 */
export async function installPackage(projectId: string, packageName: string): Promise<{ output: string }> {
  assertSupported();
  const cleanPackage = validatePackage(packageName);
  await requirePython();

  const dir = getProjectDir(projectId);
  const pythonPath = await ensureProjectVenv(dir);
  const timeout = installTimeoutMs();

  const { stdout, stderr, exitCode, timedOut } = await runProcessSafe(
    pythonPath,
    ['-m', 'pip', 'install', cleanPackage, '--no-input', '--disable-pip-version-check'],
    dir,
    timeout
  );
  const output = (stdout + stderr).trim();

  if (timedOut) {
    throw new ApiError(504, 'INSTALL_TIMEOUT', `Installation timed out after ${Math.round(timeout / 1000)}s`);
  }
  if (exitCode !== 0) {
    throw new ApiError(422, 'PACKAGE_INSTALL_FAILED', 'pip install failed', output.slice(-2000) || `exit code ${exitCode}`);
  }

  // Update project requirements.txt
  try {
    const reqFile = path.join(dir, 'requirements.txt');
    let currentContent = '';
    try {
      currentContent = await fs.readFile(reqFile, 'utf-8');
    } catch {
      currentContent = '';
    }
    const baseName = cleanPackage.split(/[=<>~]/)[0].toLowerCase();
    const lines = currentContent.split('\n').filter((line) => {
      const trimmed = line.trim();
      return trimmed && !trimmed.toLowerCase().startsWith(baseName);
    });
    lines.push(cleanPackage);
    await fs.writeFile(reqFile, lines.join('\n') + '\n', 'utf-8');
  } catch {
    // ignore requirements.txt error
  }

  return { output: output.slice(-4000) || `Package ${cleanPackage} installed successfully.` };
}

/**
 * Uninstall a package from project environment (hanya non-Vercel).
 */
export async function uninstallPackage(projectId: string, packageName: string): Promise<{ output: string }> {
  assertSupported();
  const cleanPackage = validatePackage(packageName).split(/[=<>~]/)[0];
  await requirePython();

  const dir = getProjectDir(projectId);
  const pythonPath = await ensureProjectVenv(dir);

  const { stdout, stderr, exitCode, timedOut } = await runProcessSafe(
    pythonPath,
    ['-m', 'pip', 'uninstall', '-y', cleanPackage],
    dir,
    30000
  );
  const output = (stdout + stderr).trim();

  if (timedOut) throw new ApiError(504, 'UNINSTALL_TIMEOUT', 'Uninstall timed out');
  if (exitCode !== 0) {
    throw new ApiError(422, 'PACKAGE_UNINSTALL_FAILED', 'pip uninstall failed', output.slice(-2000) || `exit code ${exitCode}`);
  }

  try {
    const reqFile = path.join(dir, 'requirements.txt');
    const currentContent = await fs.readFile(reqFile, 'utf-8');
    const baseName = cleanPackage.toLowerCase();
    const lines = currentContent.split('\n').filter((line) => {
      const trimmed = line.trim();
      return trimmed && !trimmed.toLowerCase().startsWith(baseName);
    });
    await fs.writeFile(reqFile, lines.join('\n') + '\n', 'utf-8');
  } catch {
    // ignore
  }

  return { output: output.slice(-4000) || `Package ${cleanPackage} uninstalled successfully.` };
}

/**
 * Search PyPI (network ke pypi.org; fallback ke daftar paket populer tanpa nomor versi palsu)
 */
export async function searchPyPi(query: string): Promise<PythonPackage[]> {
  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    return [];
  }

  const cleanQuery = query.trim().toLowerCase().slice(0, 50);

  // Try direct PyPI package query first
  try {
    const res = await fetch(`https://pypi.org/pypi/${encodeURIComponent(cleanQuery)}/json`, {
      headers: { 'User-Agent': 'BILZX-CODEX/1.0.0' },
      signal: AbortSignal.timeout(4000),
    });

    if (res.ok) {
      const data = await res.json();
      const info = data.info || {};
      return [
        {
          name: info.name || cleanQuery,
          version: info.version || 'latest',
          summary: info.summary || 'Python library available on PyPI',
        },
      ];
    }
  } catch {
    // continue to fallback
  }

  // Fallback popular / standard library recommendations that match query
  const commonPackages: PythonPackage[] = [
    { name: 'requests', version: 'latest', summary: 'A simple, yet elegant, HTTP library for Python.' },
    { name: 'numpy', version: 'latest', summary: 'Fundamental package for array computing in Python.' },
    { name: 'pandas', version: 'latest', summary: 'Powerful data structures for data analysis, time series, and statistics.' },
    { name: 'matplotlib', version: 'latest', summary: 'Python plotting package for publication quality figures.' },
    { name: 'scipy', version: 'latest', summary: 'Fundamental algorithms for scientific computing in Python.' },
    { name: 'beautifulsoup4', version: 'latest', summary: 'Screen-scraping library for HTML and XML.' },
    { name: 'flask', version: 'latest', summary: 'A simple framework for building complex web applications.' },
    { name: 'fastapi', version: 'latest', summary: 'FastAPI framework, high performance, easy to learn, fast to code, ready for production.' },
    { name: 'pydantic', version: 'latest', summary: 'Data validation and settings management using python type annotations.' },
    { name: 'pytest', version: 'latest', summary: 'pytest: simple powerful testing with Python.' },
    { name: 'pillow', version: 'latest', summary: 'Python Imaging Library (Fork).' },
    { name: 'httpx', version: 'latest', summary: 'A next generation HTTP client for Python.' },
    { name: 'colorama', version: 'latest', summary: 'Cross-platform colored terminal text.' },
    { name: 'rich', version: 'latest', summary: 'Render rich text, tables, progress bars, and syntax highlighted code in terminal.' },
  ];

  return commonPackages.filter((pkg) =>
    pkg.name.toLowerCase().includes(cleanQuery) ||
    (pkg.summary && pkg.summary.toLowerCase().includes(cleanQuery))
  );
}

/**
 * Get project requirements.txt content
 */
export async function getRequirementsTxt(projectId: string): Promise<string> {
  const placeholder = '# requirements.txt\n# Packages installed in this project will appear here\n';
  if (isVercel()) return placeholder;
  const reqFile = path.join(getProjectDir(projectId), 'requirements.txt');
  try {
    return await fs.readFile(reqFile, 'utf-8');
  } catch {
    return placeholder;
  }
}
