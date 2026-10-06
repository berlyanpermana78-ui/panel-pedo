import JSZip from 'jszip';
import { Project, ProjectFile } from '../types';
import { detectLanguageFromFilename } from './templates';

export async function exportProjectAsZip(project: Project): Promise<Blob> {
  const zip = new JSZip();
  const folder = zip.folder(project.name.toLowerCase().replace(/[^a-z0-9_-]/g, '-')) || zip;

  for (const file of project.files) {
    folder.file(file.path, file.content);
  }

  return await zip.generateAsync({ type: 'blob' });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function importProjectFromZip(file: File): Promise<Project> {
  const zip = await JSZip.loadAsync(file);
  const files: ProjectFile[] = [];
  const projectName = file.name.replace(/\.zip$/i, '') || 'Imported Project';

  const entries: Array<{ path: string; fileObj: JSZip.JSZipObject }> = [];
  zip.forEach((relativePath, fileObj) => {
    if (!fileObj.dir && !relativePath.startsWith('__MACOSX/') && !relativePath.includes('/.DS_Store')) {
      entries.push({ path: relativePath, fileObj });
    }
  });

  for (const entry of entries) {
    const content = await entry.fileObj.async('string');
    const name = entry.path.split('/').pop() || entry.path;
    files.push({
      id: 'f_' + Math.random().toString(36).slice(2, 9),
      name,
      path: entry.path,
      language: detectLanguageFromFilename(name),
      content,
    });
  }

  const defaultFile = files.find((f) => f.name === 'main.js' || f.name === 'index.html' || f.name === 'main.py')?.name || files[0]?.name || 'index.js';

  return {
    id: 'proj_' + Date.now(),
    name: projectName,
    description: 'Imported from ZIP package',
    defaultFile,
    files: files.length > 0 ? files : [{
      id: 'f_default',
      name: 'main.js',
      path: 'main.js',
      language: 'javascript',
      content: '// Imported project\nconsole.log("Hello from imported project!");\n',
    }],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}
