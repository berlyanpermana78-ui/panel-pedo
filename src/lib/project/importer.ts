import JSZip from 'jszip';
import { Project, ProjectFile } from '../../types';
import { validateZipArchive } from '../security/archive';
import { sanitizePath } from '../security/paths';
import { detectLanguageFromFilename } from './templates';
import { detectProjectMetadata } from './detector';

export interface ImportZipResult {
  success: boolean;
  project?: Project;
  error?: string;
  metadata?: {
    framework: string;
    runtime: string;
    packageManager: string;
    filesExtracted: number;
  };
}

export async function importProjectFromZipSecure(file: File): Promise<ImportZipResult> {
  try {
    // Basic file validation
    if (!file.name.toLowerCase().endsWith('.zip')) {
      return { success: false, error: 'File yang dipilih bukan arsip .zip yang valid.' };
    }

    if (file.size > 25 * 1024 * 1024) {
      return { success: false, error: 'Ukuran file ZIP melebihi batas 25MB.' };
    }

    const zip = await JSZip.loadAsync(file);

    // 1. Security Scan: Path traversal & Zip-bomb checks
    const validation = await validateZipArchive(zip);
    if (!validation.isValid) {
      return { success: false, error: validation.error || 'Arsip ZIP gagal melewati validasi keamanan.' };
    }

    // 2. Extract safe files
    const files: ProjectFile[] = [];
    const entries: Array<{ path: string; fileObj: JSZip.JSZipObject }> = [];

    zip.forEach((relativePath, fileObj) => {
      if (
        !fileObj.dir &&
        !relativePath.startsWith('__MACOSX/') &&
        !relativePath.includes('/.DS_Store') &&
        !relativePath.includes('Thumbs.db')
      ) {
        entries.push({ path: relativePath, fileObj });
      }
    });

    for (const entry of entries) {
      const cleanPath = sanitizePath(entry.path);
      const name = cleanPath.split('/').pop() || cleanPath;

      // Skip binary, media, or git files
      if (cleanPath.startsWith('.git/') || cleanPath.startsWith('node_modules/') || cleanPath.startsWith('.venv/')) {
        continue;
      }

      try {
        const content = await entry.fileObj.async('string');
        files.push({
          id: 'f_' + Math.random().toString(36).slice(2, 9),
          name,
          path: cleanPath,
          language: detectLanguageFromFilename(name),
          content,
        });
      } catch {
        // If file cannot be read as text, skip binary
        continue;
      }
    }

    if (files.length === 0) {
      return { success: false, error: 'Tidak ada file teks atau source code yang dapat diekstrak dari arsip ini.' };
    }

    // 3. Project Type & Runtime Detection
    const detected = detectProjectMetadata(files);
    const projectName = file.name.replace(/\.zip$/i, '').trim() || 'Imported Workspace';

    const defaultFile =
      files.find((f) => f.name === detected.entryFile)?.name ||
      files.find((f) => f.name === 'main.js' || f.name === 'index.html' || f.name === 'main.py' || f.name === 'page.tsx')?.name ||
      files[0]?.name ||
      'main.js';

    const project: Project = {
      id: 'proj_' + Date.now(),
      name: projectName,
      description: `Imported from ZIP • ${detected.framework} (${detected.packageManager})`,
      defaultFile,
      templateType: detected.projectType,
      files,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      snapshots: [
        {
          id: 'snap_init_' + Date.now(),
          timestamp: Date.now(),
          description: 'Initial import snapshot',
          files: JSON.parse(JSON.stringify(files)),
        },
      ],
    };

    return {
      success: true,
      project,
      metadata: {
        framework: detected.framework,
        runtime: detected.runtime,
        packageManager: detected.packageManager,
        filesExtracted: files.length,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      error: 'Gagal memproses arsip ZIP: ' + (err?.message || 'Format arsip rusak atau tidak didukung'),
    };
  }
}
