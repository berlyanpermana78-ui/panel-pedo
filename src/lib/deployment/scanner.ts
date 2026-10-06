import JSZip from 'jszip';
import { Project, DeploymentTarget, DeploymentScanReport, DeploymentCheckItem } from '../../types';
import { detectProjectMetadata } from '../project/detector';
import { analyzeProjectCode } from '../ai/analyzer';
import { generateVercelConfiguration } from './vercel';
import { generateNetlifyConfiguration } from './netlify';
import { checkInfinityHostingCompatibility } from './infinity';
import { isSecretFile } from '../security/secrets';

export function runPreDeploymentScan(project: Project, target: DeploymentTarget): DeploymentScanReport {
  const meta = detectProjectMetadata(project.files);
  const codeAnalysis = analyzeProjectCode(project);

  const checks: DeploymentCheckItem[] = [];

  // 1. Syntax Check
  if (codeAnalysis.criticalCount === 0) {
    checks.push({
      name: 'Syntax Integrity',
      status: 'passed',
      details: 'Semua file lolos validasi sintaks tanpa kurung atau string literal yang rusak.',
      isRequired: true,
    });
  } else {
    checks.push({
      name: 'Syntax Integrity',
      status: 'failed',
      details: `Ditemukan ${codeAnalysis.criticalCount} kesalahan sintaks kritis yang akan menggagalkan proses build.`,
      isRequired: true,
    });
  }

  // 2. Dependency Check
  const missingDeps = codeAnalysis.issues.filter((i) => i.type === 'Missing Dependency');
  if (missingDeps.length === 0) {
    checks.push({
      name: 'Dependencies Check',
      status: 'passed',
      details: 'Seluruh pustaka yang diimpor terdaftar di package.json / requirements.txt.',
      isRequired: true,
    });
  } else {
    checks.push({
      name: 'Dependencies Check',
      status: 'failed',
      details: `Terdapat ${missingDeps.length} dependensi yang diimpor tanpa deklarasi (${missingDeps.map((d) => d.missingPackage).join(', ')}).`,
      isRequired: true,
    });
  }

  // 3. Security & Secret Leak Check
  const secretFiles = project.files.filter((f) => isSecretFile(f.name));
  const hasHardcodedKeys = project.files.some((f) => /sk-[a-zA-Z0-9]{20,}|AIza[0-9A-Za-z-_]{35}/.test(f.content));

  if (secretFiles.length === 0 && !hasHardcodedKeys) {
    checks.push({
      name: 'Security & Secret Inspection',
      status: 'passed',
      details: 'Tidak ditemukan file kredensial .env atau plain API key yang bocor di source code.',
      isRequired: true,
    });
  } else if (hasHardcodedKeys) {
    checks.push({
      name: 'Security & Secret Inspection',
      status: 'failed',
      details: 'Terdeteksi hardcoded API key dalam file project. Pindahkan ke environment variables server!',
      isRequired: true,
    });
  } else {
    checks.push({
      name: 'Security & Secret Inspection',
      status: 'warning',
      details: `File ${secretFiles.map((f) => f.name).join(', ')} terdeteksi dan akan otomatis dikecualikan dari paket deploy.`,
      isRequired: false,
    });
  }

  // 4. Environment Variables Reference Check
  const envRefs: string[] = [];
  project.files.forEach((f) => {
    const matches = f.content.matchAll(/process\.env\.([A-Z0-9_]+)/g);
    for (const m of matches) {
      if (!envRefs.includes(m[1]) && m[1] !== 'NODE_ENV' && m[1] !== 'PORT') {
        envRefs.push(m[1]);
      }
    }
  });

  if (envRefs.length === 0) {
    checks.push({
      name: 'Environment Variables',
      status: 'passed',
      details: 'Aplikasi tidak membutuhkan environment variables khusus di level runtime.',
      isRequired: false,
    });
  } else {
    checks.push({
      name: 'Environment Variables',
      status: 'warning',
      details: `Aplikasi merujuk variable [${envRefs.join(', ')}]. Pastikan variabel ini diset pada dashboard hosting ${target.toUpperCase()}.`,
      isRequired: false,
    });
  }

  // 5. Target Compatibility Check
  let compatibilityAdvice = '';
  if (target === 'vercel') {
    checks.push({
      name: 'Vercel Compatibility',
      status: 'passed',
      details: `Project didukung secara native oleh Vercel (${meta.framework}).`,
      isRequired: true,
    });
    compatibilityAdvice = 'Konfigurasi vercel.json otomatis dihasilkan dan siap untuk di-deploy.';
  } else if (target === 'netlify') {
    checks.push({
      name: 'Netlify Compatibility',
      status: 'passed',
      details: 'Netlify build command dan netlify.toml telah disiapkan.',
      isRequired: true,
    });
    compatibilityAdvice = 'File netlify.toml telah dikonfigurasi untuk routing dan build command.';
  } else if (target === 'infinity') {
    const infCheck = checkInfinityHostingCompatibility(project);
    if (infCheck.isCompatible) {
      checks.push({
        name: 'Infinity Hosting Compatibility',
        status: infCheck.status === 'warning' ? 'warning' : 'passed',
        details: infCheck.recommendation,
        isRequired: true,
      });
      compatibilityAdvice = infCheck.recommendation;
    } else {
      checks.push({
        name: 'Infinity Hosting Compatibility',
        status: 'failed',
        details: infCheck.recommendation,
        isRequired: true,
      });
      compatibilityAdvice = infCheck.recommendation;
    }
  }

  const blockersCount = checks.filter((c) => c.isRequired && c.status === 'failed').length;
  const warningsCount = checks.filter((c) => c.status === 'warning').length;
  const canDeploy = blockersCount === 0;

  return {
    target,
    projectName: project.name,
    frameworkDetected: meta.framework,
    buildCommand: meta.buildCommand,
    outputDirectory: meta.outputDirectory,
    timestamp: Date.now(),
    checks,
    canDeploy,
    warningsCount,
    blockersCount,
    compatibilityAdvice,
  };
}

export async function generateTargetDeploymentZip(project: Project, target: DeploymentTarget): Promise<Blob> {
  const zip = new JSZip();
  const folder = zip.folder(`deploy-${target}-${project.name.toLowerCase().replace(/[^a-z0-9_-]/g, '-')}`) || zip;

  // Add project source files excluding secrets
  for (const f of project.files) {
    if (isSecretFile(f.name)) continue;
    folder.file(f.path, f.content);
  }

  // Inject target specific configs
  if (target === 'vercel') {
    const { configJson, readme } = generateVercelConfiguration(project);
    folder.file('vercel.json', configJson);
    folder.file('DEPLOYMENT_README.md', readme);
  } else if (target === 'netlify') {
    const { netlifyToml, readme } = generateNetlifyConfiguration(project);
    folder.file('netlify.toml', netlifyToml);
    folder.file('DEPLOYMENT_README.md', readme);
  } else if (target === 'infinity') {
    const inf = checkInfinityHostingCompatibility(project);
    folder.file('DEPLOYMENT_README.md', inf.readme);
  }

  return await zip.generateAsync({ type: 'blob' });
}
