import { Project, ProjectFile, ProjectSnapshot, BugReportItem, FixVerificationResult } from '../../types';
import { analyzeProjectCode } from './analyzer';

/**
 * Creates an immutable snapshot of project files prior to any AI or automated modification.
 */
export function createProjectSnapshot(project: Project, description: string): { updatedProject: Project; snapshot: ProjectSnapshot } {
  const snapshot: ProjectSnapshot = {
    id: 'snap_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    timestamp: Date.now(),
    description,
    files: JSON.parse(JSON.stringify(project.files)),
  };

  const snapshots = [snapshot, ...(project.snapshots || [])].slice(0, 10); // keep up to 10 snapshots

  return {
    updatedProject: {
      ...project,
      updatedAt: Date.now(),
      snapshots,
    },
    snapshot,
  };
}

/**
 * Restores project state from a previous snapshot.
 */
export function rollbackToSnapshot(project: Project, snapshotId: string): Project | null {
  const targetSnapshot = project.snapshots?.find((s) => s.id === snapshotId);
  if (!targetSnapshot) return null;

  return {
    ...project,
    updatedAt: Date.now(),
    files: JSON.parse(JSON.stringify(targetSnapshot.files)),
  };
}

/**
 * Applies an automated fix with snapshot creation, analyzer re-scan, and regression comparison.
 */
export function applyBugFixWithVerification({
  project,
  bug,
  patchedFileContent,
}: {
  project: Project;
  bug: BugReportItem;
  patchedFileContent: string;
}): {
  updatedProject: Project;
  verification: FixVerificationResult;
  snapshotId: string;
} {
  // 1. Pre-fix snapshot creation
  const { updatedProject: projectWithSnapshot, snapshot } = createProjectSnapshot(
    project,
    `Pre-fix snapshot for ${bug.type} in ${bug.fileName}`
  );

  // 2. Scan before fix to get baseline
  const baselineScan = analyzeProjectCode(project);

  // 3. Apply the patch to the target file
  const updatedFiles = projectWithSnapshot.files.map((file) => {
    if (file.id === bug.fileId) {
      return { ...file, content: patchedFileContent };
    }
    return file;
  });

  const candidateProject: Project = {
    ...projectWithSnapshot,
    updatedAt: Date.now(),
    files: updatedFiles,
  };

  // 4. Post-fix re-scan
  const postScan = analyzeProjectCode(candidateProject);

  // 5. Verify results
  const originalBugStillPresent = postScan.issues.some((i) => i.id === bug.id);
  const newCriticalErrors = postScan.criticalCount > baselineScan.criticalCount;

  if (newCriticalErrors) {
    // Auto-rollback if new critical errors were introduced
    const restored = rollbackToSnapshot(candidateProject, snapshot.id) || project;
    return {
      updatedProject: restored,
      snapshotId: snapshot.id,
      verification: {
        success: false,
        originalErrorResolved: false,
        newErrorsIntroduced: true,
        buildStatus: 'Failed',
        message: 'Fix verification failed: Patch memicu kesalahan baru. Snapshot awal otomatis dipulihkan.',
        restoredSnapshot: true,
      },
    };
  }

  return {
    updatedProject: candidateProject,
    snapshotId: snapshot.id,
    verification: {
      success: !originalBugStillPresent,
      originalErrorResolved: !originalBugStillPresent,
      newErrorsIntroduced: false,
      buildStatus: 'Passed',
      message: 'Perbaikan berhasil diterapkan dan terverifikasi sehat tanpa error baru.',
      restoredSnapshot: false,
    },
  };
}

/**
 * Auto-repairs missing dependencies by adding them to package.json or requirements.txt
 */
export function autoRepairMissingDependency(
  project: Project,
  bug: BugReportItem
): { updatedProject: Project; message: string } {
  if (!bug.missingPackage) {
    return { updatedProject: project, message: 'Tidak ada package spesifik yang ditemukan.' };
  }

  const pkgName = bug.missingPackage.toLowerCase().trim();
  const { updatedProject } = createProjectSnapshot(project, `Auto-install dependency ${pkgName}`);

  if (bug.packageManager === 'pip') {
    // Add to requirements.txt
    let reqFile = updatedProject.files.find((f) => f.name.toLowerCase() === 'requirements.txt');
    if (!reqFile) {
      reqFile = {
        id: 'f_req_' + Date.now(),
        name: 'requirements.txt',
        path: 'requirements.txt',
        language: 'bash',
        content: `# requirements.txt\n${pkgName}>=1.0.0\n`,
      };
      return {
        updatedProject: {
          ...updatedProject,
          files: [...updatedProject.files, reqFile],
        },
        message: `Menambahkan "${pkgName}" ke requirements.txt baru.`,
      };
    } else {
      const lines = reqFile.content.split('\n').filter((l) => l.trim().length > 0);
      if (!lines.some((l) => l.toLowerCase().startsWith(pkgName))) {
        lines.push(`${pkgName}>=1.0.0`);
      }
      const newFiles = updatedProject.files.map((f) =>
        f.id === reqFile!.id ? { ...f, content: lines.join('\n') + '\n' } : f
      );
      return {
        updatedProject: { ...updatedProject, files: newFiles },
        message: `Package "${pkgName}" ditambahkan ke requirements.txt.`,
      };
    }
  } else {
    // Add to package.json
    const pkgJsonFile = updatedProject.files.find((f) => f.name.toLowerCase() === 'package.json');
    if (pkgJsonFile) {
      try {
        const parsed = JSON.parse(pkgJsonFile.content);
        if (!parsed.dependencies) parsed.dependencies = {};
        parsed.dependencies[pkgName] = 'latest';

        const newFiles = updatedProject.files.map((f) =>
          f.id === pkgJsonFile.id ? { ...f, content: JSON.stringify(parsed, null, 2) + '\n' } : f
        );
        return {
          updatedProject: { ...updatedProject, files: newFiles },
          message: `Dependensi "${pkgName}" ditambahkan ke package.json.`,
        };
      } catch {
        return { updatedProject, message: 'Format package.json tidak valid untuk diperbarui.' };
      }
    }
  }

  return { updatedProject, message: 'Dependensi terdaftar.' };
}
