import { Project } from '../../types';
import { detectProjectMetadata } from '../project/detector';

export interface InfinityCompatibilityResult {
  isCompatible: boolean;
  status: 'compatible' | 'warning' | 'incompatible';
  title: string;
  recommendation: string;
  readme: string;
}

export function checkInfinityHostingCompatibility(project: Project): InfinityCompatibilityResult {
  const meta = detectProjectMetadata(project.files);

  if (meta.projectType === 'html') {
    return {
      isCompatible: true,
      status: 'compatible',
      title: 'Sepenuhnya Kompatibel (Static Web)',
      recommendation: 'Dapat langsung diunggah ke direktori htdocs Infinity Hosting melalui File Manager / FTP.',
      readme: `# Panduan Deployment Infinity Hosting — ${project.name}

Project bertipe Static HTML/CSS/JS dan kompatibel penuh dengan shared hosting Infinity.

### Langkah Deployment:
1. Akses cPanel Infinity Hosting Anda.
2. Buka Online File Manager atau gunakan FTP client (FileZilla).
3. Unggah seluruh file isi folder ini ke dalam folder \`/htdocs/\`.
4. Buka domain/subdomain Anda untuk memverifikasi halaman web.
`,
    };
  }

  if (meta.projectType === 'react') {
    return {
      isCompatible: true,
      status: 'warning',
      title: 'Kompatibel dengan Static Build (dist)',
      recommendation: 'Lakukan build terlebih dahulu (\`npm run build\`), lalu unggah hasil folder \`dist\` ke htdocs.',
      readme: `# Panduan Deployment Infinity Hosting — ${project.name} (Vite/React)

Catatan: Infinity Hosting adalah web server statis/PHP dan tidak menjalankan runtime Node.js aktif di background.

### Langkah Deployment:
1. Build aplikasi secara lokal atau di lingkungan CI:
   \`\`\`bash
   npm run build
   \`\`\`
2. Unggah seluruh file di dalam folder \`dist/\` ke direktori \`/htdocs/\` di Infinity Hosting.
3. Pastikan file \`.htaccess\` terpasang di \`/htdocs/\` untuk routing SPA:
   \`\`\`apache
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     RewriteRule ^index\\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /index.html [L]
   </IfModule>
   \`\`\`
`,
    };
  }

  // Next.js or Node.js backend
  return {
    isCompatible: false,
    status: 'incompatible',
    title: 'Peringatan Kompatibilitas Runtime',
    recommendation: 'Server-side Node.js / Next.js SSR membutuhkan runtime server aktif yang tidak didukung pada shared web hosting standar. Disarankan menggunakan target Vercel atau VPS.',
    readme: `# Catatan Kompatibilitas Infinity Hosting — ${project.name}

Peringatan: Project ini menggunakan arsitektur ${meta.framework} yang memerlukan proses Node.js aktif di background.
Infinity Hosting menyediakan server Apache/PHP dan tidak menjalankan daemon Node.js / SSR server.

### Opsi yang Tersedia:
1. Gunakan target **Vercel** atau **Netlify** untuk menjalankan aplikasi ${meta.framework} secara optimal.
2. Jika aplikasi murni presentasional tanpa API Route atau Server Action, Anda dapat mengekspor versi statis (\`output: "export"\` di Next.js) sebelum mengunggah ke htdocs.
`,
  };
}
