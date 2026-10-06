import { Project } from '../../types';
import { detectProjectMetadata } from '../project/detector';

export function generateNetlifyConfiguration(project: Project): { netlifyToml: string; readme: string } {
  const meta = detectProjectMetadata(project.files);

  const publishDir = meta.outputDirectory === '.' ? '.' : meta.outputDirectory;
  const buildCommand = meta.buildCommand.includes('npm') ? meta.buildCommand : 'npm run build';

  const netlifyToml = `[build]
  command = "${buildCommand}"
  publish = "${publishDir}"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
`;

  const readme = `# Panduan Deployment Netlify — ${project.name}

Dikonfigurasi secara otomatis oleh BILZX CODEX Deployment Generator.

### Langkah Deploy:
1. Drag & drop folder ini ke Netlify Dashboard (https://app.netlify.com/drop)
   ATAU
2. Menggunakan Netlify CLI:
   \`\`\`bash
   npm install -g netlify-cli
   netlify deploy --prod
   \`\`\`

**Konfigurasi Terpasang:**
- File: \`netlify.toml\`
- Build Command: \`${buildCommand}\`
- Publish Directory: \`${publishDir}\`
`;

  return { netlifyToml, readme };
}
