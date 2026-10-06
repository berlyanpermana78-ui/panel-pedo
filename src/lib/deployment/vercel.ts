import { Project } from '../../types';
import { detectProjectMetadata } from '../project/detector';

export interface VercelConfig {
  version: number;
  buildCommand?: string;
  outputDirectory?: string;
  framework?: string;
  routes?: Array<{ src: string; dest: string }>;
}

export function generateVercelConfiguration(project: Project): { config: VercelConfig; configJson: string; readme: string } {
  const meta = detectProjectMetadata(project.files);

  let framework = 'other';
  let buildCommand = meta.buildCommand;
  let outputDirectory = meta.outputDirectory;

  if (meta.projectType === 'nextjs') {
    framework = 'nextjs';
  } else if (meta.projectType === 'react') {
    framework = 'vite';
  }

  const config: VercelConfig = {
    version: 2,
    buildCommand: buildCommand.includes('npm') ? buildCommand : undefined,
    outputDirectory: outputDirectory !== '.' ? outputDirectory : undefined,
    framework: framework !== 'other' ? framework : undefined,
  };

  const configJson = JSON.stringify(config, null, 2);

  const readme = `# Panduan Deployment Vercel — ${project.name}

Project ini telah dikonfigurasi untuk deployment ke Vercel melalui BILZX CODEX Pre-Deployment Generator.

### Langkah-langkah:
1. Pasang Vercel CLI jika belum terpasang:
   \`\`\`bash
   npm i -g vercel
   \`\`\`
2. Jalankan perintah deploy di folder project:
   \`\`\`bash
   vercel
   \`\`\`
3. Untuk deployment produksi:
   \`\`\`bash
   vercel --prod
   \`\`\`

**Konfigurasi Terdeteksi:**
- Framework: ${meta.framework}
- Build Command: \`${meta.buildCommand}\`
- Output Directory: \`${meta.outputDirectory}\`
`;

  return { config, configJson, readme };
}
