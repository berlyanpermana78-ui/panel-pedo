import { Project, ProjectFile } from '../../types';

export interface ProjectDetectionResult {
  framework: string;
  projectType: 'nextjs' | 'react' | 'nodejs' | 'python' | 'html' | 'custom';
  runtime: 'node' | 'python' | 'html';
  packageManager: 'npm' | 'yarn' | 'pnpm' | 'pip' | 'none';
  hasTypeScript: boolean;
  hasRequirementsTxt: boolean;
  hasPackageJson: boolean;
  entryFile: string;
  buildCommand: string;
  devCommand: string;
  outputDirectory: string;
}

export function detectProjectMetadata(files: ProjectFile[]): ProjectDetectionResult {
  const fileNames = files.map((f) => f.name.toLowerCase());
  const filePaths = files.map((f) => f.path.toLowerCase());

  const hasPackageJson = fileNames.includes('package.json');
  const hasRequirementsTxt = fileNames.includes('requirements.txt');
  const hasTsConfig = fileNames.includes('tsconfig.json');
  const hasViteConfig = fileNames.some((n) => n.startsWith('vite.config'));
  const hasNextConfig = fileNames.some((n) => n.startsWith('next.config'));

  // Read package.json if available
  let packageJsonData: any = null;
  if (hasPackageJson) {
    try {
      const pkgFile = files.find((f) => f.name.toLowerCase() === 'package.json');
      if (pkgFile) {
        packageJsonData = JSON.parse(pkgFile.content);
      }
    } catch {
      // ignore JSON parse error
    }
  }

  const allDependencies = {
    ...(packageJsonData?.dependencies || {}),
    ...(packageJsonData?.devDependencies || {}),
  };

  const hasNextDep = Boolean(allDependencies['next']);
  const hasReactDep = Boolean(allDependencies['react']);
  const hasExpressDep = Boolean(allDependencies['express']);
  const hasTypeScript = hasTsConfig || Boolean(allDependencies['typescript']) || fileNames.some((n) => n.endsWith('.ts') || n.endsWith('.tsx'));

  // 1. Next.js Detection
  if (hasNextConfig || hasNextDep || filePaths.some((p) => p.startsWith('app/') || p.startsWith('pages/'))) {
    return {
      framework: 'Next.js' + (hasTypeScript ? ' (TypeScript)' : ''),
      projectType: 'nextjs',
      runtime: 'node',
      packageManager: 'npm',
      hasTypeScript,
      hasRequirementsTxt,
      hasPackageJson,
      entryFile: files.find((f) => f.path.includes('page.') || f.path.includes('index.'))?.name || 'app/page.tsx',
      buildCommand: 'npm run build',
      devCommand: 'npm run dev',
      outputDirectory: '.next',
    };
  }

  // 2. React / Vite Detection
  if (hasViteConfig || hasReactDep) {
    return {
      framework: hasViteConfig ? 'Vite + React' : 'React SPA',
      projectType: 'react',
      runtime: 'node',
      packageManager: 'npm',
      hasTypeScript,
      hasRequirementsTxt,
      hasPackageJson,
      entryFile: files.find((f) => f.name === 'App.tsx' || f.name === 'App.jsx' || f.name === 'main.tsx' || f.name === 'index.html')?.name || 'index.html',
      buildCommand: 'npm run build',
      devCommand: 'npm run dev',
      outputDirectory: 'dist',
    };
  }

  // 3. Express / Node.js Detection
  if (hasExpressDep) {
    return {
      framework: 'Express API Server',
      projectType: 'nodejs',
      runtime: 'node',
      packageManager: 'npm',
      hasTypeScript,
      hasRequirementsTxt,
      hasPackageJson,
      entryFile: files.find((f) => f.name === 'server.js' || f.name === 'server.ts' || f.name === 'app.js' || f.name === 'main.js')?.name || 'server.js',
      buildCommand: hasTypeScript ? 'npm run build' : 'node server.js',
      devCommand: 'node server.js',
      outputDirectory: 'dist',
    };
  }

  if (hasPackageJson || fileNames.some((n) => n.endsWith('.js') && !fileNames.includes('index.html'))) {
    return {
      framework: 'Node.js V8 Environment',
      projectType: 'nodejs',
      runtime: 'node',
      packageManager: 'npm',
      hasTypeScript,
      hasRequirementsTxt,
      hasPackageJson,
      entryFile: files.find((f) => f.name === 'main.js' || f.name === 'index.js')?.name || 'main.js',
      buildCommand: 'node main.js',
      devCommand: 'node main.js',
      outputDirectory: 'dist',
    };
  }

  // 4. Python Detection
  if (hasRequirementsTxt || fileNames.some((n) => n.endsWith('.py'))) {
    return {
      framework: 'Python 3 Application',
      projectType: 'python',
      runtime: 'python',
      packageManager: 'pip',
      hasTypeScript: false,
      hasRequirementsTxt,
      hasPackageJson: false,
      entryFile: files.find((f) => f.name === 'main.py' || f.name === 'app.py')?.name || 'main.py',
      buildCommand: 'python3 main.py',
      devCommand: 'python3 main.py',
      outputDirectory: '.',
    };
  }

  // 5. HTML Static Web App
  return {
    framework: 'HTML5 / CSS / JavaScript Static',
    projectType: 'html',
    runtime: 'html',
    packageManager: 'none',
    hasTypeScript: false,
    hasRequirementsTxt: false,
    hasPackageJson: false,
    entryFile: files.find((f) => f.name.endsWith('.html'))?.name || 'index.html',
    buildCommand: 'None (Client-side render)',
    devCommand: 'Live Preview',
    outputDirectory: '.',
  };
}
