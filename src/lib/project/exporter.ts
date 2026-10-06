import JSZip from 'jszip';
import { Project, ProjectFile } from '../../types';
import { isSecretFile } from '../security/secrets';

export type ExportScope = 'sourceOnly' | 'sourceAndConfig' | 'full';

export interface ExportOptions {
  scope: ExportScope;
  includeEnv?: boolean;
}

export async function exportProjectToZipSecure(
  project: Project,
  options: ExportOptions = { scope: 'sourceOnly', includeEnv: false }
): Promise<Blob> {
  const zip = new JSZip();
  const folderName = project.name.toLowerCase().replace(/[^a-z0-9_-]/g, '-') || 'bilzx-project';
  const folder = zip.folder(folderName) || zip;

  const configFilenames = [
    'package.json',
    'tsconfig.json',
    'requirements.txt',
    'vite.config.ts',
    'vite.config.js',
    'next.config.js',
    'next.config.mjs',
    'tailwind.config.js',
    'postcss.config.js',
    'vercel.json',
    'netlify.toml',
  ];

  for (const file of project.files) {
    const filename = file.name.toLowerCase();

    // 1. Strict secret exclusion
    if (!options.includeEnv && isSecretFile(file.name)) {
      continue;
    }

    // 2. Ignore virtual environments and node modules if any
    if (
      file.path.startsWith('node_modules/') ||
      file.path.startsWith('.venv/') ||
      file.path.startsWith('.git/')
    ) {
      continue;
    }

    // 3. Filter based on export scope
    if (options.scope === 'sourceOnly') {
      // Exclude build tools/configs unless essential
      if (
        filename.startsWith('vite.config') ||
        filename.startsWith('next.config') ||
        filename.startsWith('postcss.config') ||
        filename.startsWith('tailwind.config')
      ) {
        continue;
      }
    }

    folder.file(file.path, file.content);
  }

  // Always generate a clean BILZX project descriptor
  folder.file(
    'BILZX_WORKSPACE.json',
    JSON.stringify(
      {
        app: 'BILZX CODEX',
        brand: 'BilzxDev',
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        projectName: project.name,
        totalFiles: project.files.length,
      },
      null,
      2
    )
  );

  return await zip.generateAsync({ type: 'blob' });
}

export function downloadProjectZipBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
