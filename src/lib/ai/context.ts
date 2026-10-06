import { Project, ProjectFile, AIContext, AIContextOptions } from '../../types';

export const DEFAULT_CONTEXT_OPTIONS: AIContextOptions = {
  currentFile: true,
  selectedCode: true,
  openFiles: false,
  entireProject: false,
  errorOutput: true,
  dependencies: true,
};

const MAX_CONTEXT_TOTAL_CHARS = 8000;
const MAX_FILE_CHARS = 4000;

export function buildControlledContext({
  project,
  activeFile,
  selectedText,
  consoleError,
  options = DEFAULT_CONTEXT_OPTIONS,
}: {
  project: Project;
  activeFile: ProjectFile | null;
  selectedText?: string;
  consoleError?: string;
  options?: AIContextOptions;
}): AIContext {
  let totalChars = 0;
  const context: AIContext = {
    totalChars: 0,
  };

  // 1. Selected Code (Highest priority)
  if (options.selectedCode && selectedText && selectedText.trim()) {
    const trimmed = selectedText.slice(0, 2000);
    context.selectedCode = trimmed;
    totalChars += trimmed.length;
  }

  // 2. Active File
  if (options.currentFile && activeFile) {
    context.activeFileName = activeFile.name;
    const trimmedContent = activeFile.content.slice(0, MAX_FILE_CHARS);
    context.activeFileContent = trimmedContent;
    totalChars += trimmedContent.length;
  }

  // 3. Console Error Output
  if (options.errorOutput && consoleError && consoleError.trim()) {
    const trimmedError = consoleError.slice(0, 1500);
    context.consoleError = trimmedError;
    totalChars += trimmedError.length;
  }

  // 4. Dependencies
  if (options.dependencies) {
    const pkgJson = project.files.find((f) => f.name.toLowerCase() === 'package.json');
    const reqTxt = project.files.find((f) => f.name.toLowerCase() === 'requirements.txt');

    const deps: string[] = [];
    if (pkgJson) {
      try {
        const parsed = JSON.parse(pkgJson.content);
        const all = { ...(parsed.dependencies || {}), ...(parsed.devDependencies || {}) };
        deps.push(`Node/npm: ${Object.keys(all).slice(0, 15).join(', ') || 'none'}`);
      } catch {
        // ignore
      }
    }
    if (reqTxt) {
      const lines = reqTxt.content
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l && !l.startsWith('#'))
        .slice(0, 15);
      if (lines.length > 0) {
        deps.push(`Python/pip: ${lines.join(', ')}`);
      }
    }

    if (deps.length > 0) {
      context.dependenciesSummary = deps.join(' | ');
      totalChars += context.dependenciesSummary.length;
    }
  }

  // 5. Entire Project Structure
  if (options.entireProject) {
    const structure = project.files.map((f) => `• ${f.path} (${f.language}, ${f.content.length} bytes)`).join('\n');
    context.projectStructure = structure.slice(0, 1000);
    totalChars += context.projectStructure.length;
  }

  context.totalChars = Math.min(totalChars, MAX_CONTEXT_TOTAL_CHARS);
  return context;
}
