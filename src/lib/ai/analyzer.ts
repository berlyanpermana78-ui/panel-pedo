import { Project, ProjectFile, BugReportItem, AnalysisReport } from '../../types';
import { calculateFixConfidence } from './confidence';

export function analyzeProjectCode(project: Project): AnalysisReport {
  const issues: BugReportItem[] = [];

  // Read package.json & requirements.txt for cross-reference
  const packageJsonFile = project.files.find((f) => f.name.toLowerCase() === 'package.json');
  const requirementsTxtFile = project.files.find((f) => f.name.toLowerCase() === 'requirements.txt');

  let declaredNodeDeps: Set<string> = new Set();
  let isPackageJsonValid = true;

  if (packageJsonFile) {
    try {
      const parsed = JSON.parse(packageJsonFile.content);
      const all = { ...(parsed.dependencies || {}), ...(parsed.devDependencies || {}) };
      declaredNodeDeps = new Set(Object.keys(all));
    } catch (e: any) {
      isPackageJsonValid = false;
      issues.push({
        id: 'bug_pkg_json_syntax',
        fileId: packageJsonFile.id,
        fileName: packageJsonFile.name,
        line: 1,
        type: 'Invalid package.json',
        severity: 'critical',
        message: 'Format package.json tidak valid (JSON Syntax Error).',
        cause: e.message || 'Sintaks JSON tidak sesuai standar.',
        suggestedFix: 'Perbaiki koma penutup, tanda kurung kurawal, atau tanda petik dua pada package.json.',
        originalSnippet: packageJsonFile.content.slice(0, 100),
        confidence: 94,
        isAutoFixable: false,
      });
    }
  }

  let declaredPythonDeps: Set<string> = new Set();
  if (requirementsTxtFile) {
    requirementsTxtFile.content.split('\n').forEach((line) => {
      const trimmed = line.trim().split(/[=<>~]/)[0].toLowerCase();
      if (trimmed && !trimmed.startsWith('#')) {
        declaredPythonDeps.add(trimmed);
      }
    });
  }

  // Analyze each file
  for (const file of project.files) {
    const lines = file.content.split('\n');

    // 1. JSON file checks
    if (file.name.endsWith('.json') && file.id !== packageJsonFile?.id) {
      try {
        JSON.parse(file.content);
      } catch (err: any) {
        issues.push({
          id: `bug_json_${file.id}`,
          fileId: file.id,
          fileName: file.name,
          line: 1,
          type: 'Invalid JSON',
          severity: 'critical',
          message: `Struktur JSON pada "${file.name}" tidak dapat diparsing.`,
          cause: err.message,
          suggestedFix: 'Periksa sintaks kurung siku, kurung kurawal, dan tanda kutip ganda.',
          originalSnippet: file.content.slice(0, 120),
          confidence: 92,
          isAutoFixable: false,
        });
      }
    }

    // 2. JavaScript & TypeScript checks
    if (file.language === 'javascript' || file.language === 'typescript') {
      // Check unbalanced brackets
      let openBraces = 0;
      let openParens = 0;
      let openBrackets = 0;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineNum = i + 1;
        const trimmed = line.trim();

        // Skip comments
        if (trimmed.startsWith('//') || trimmed.startsWith('/*')) continue;

        // Unbalanced bracket tracker
        for (const char of line) {
          if (char === '{') openBraces++;
          if (char === '}') openBraces--;
          if (char === '(') openParens++;
          if (char === ')') openParens--;
          if (char === '[') openBrackets++;
          if (char === ']') openBrackets--;
        }

        // Detect missing imports for common libraries (e.g. using express() or axios without import)
        if (trimmed.includes('axios.') || trimmed.startsWith('axios(')) {
          const hasAxiosImport = file.content.includes("from 'axios'") || file.content.includes("from \"axios\"") || file.content.includes("require('axios')");
          if (!hasAxiosImport) {
            issues.push({
              id: `bug_missing_import_axios_${file.id}_${lineNum}`,
              fileId: file.id,
              fileName: file.name,
              line: lineNum,
              type: 'Missing Import',
              severity: 'critical',
              message: "Identifier 'axios' digunakan tetapi tidak diimpor.",
              cause: "Modul axios dipanggil sebelum deklarasi import.",
              suggestedFix: "Tambahkan: import axios from 'axios';",
              originalSnippet: line,
              patchCode: `import axios from 'axios';\n` + file.content,
              confidence: 95,
              isAutoFixable: true,
              missingPackage: 'axios',
              packageManager: 'npm',
            });
          }
        }

        // Detect imports against package.json
        const importMatch = line.match(/(?:import\s+.*?\s+from\s+['"]([^'"]+)['"]|require\(['"]([^'"]+)['"]\))/);
        if (importMatch) {
          const pkgName = importMatch[1] || importMatch[2];
          // If not a relative path or node built-in
          if (
            pkgName &&
            !pkgName.startsWith('.') &&
            !pkgName.startsWith('/') &&
            !['fs', 'path', 'http', 'https', 'crypto', 'os', 'child_process', 'url', 'util', 'stream', 'events'].includes(pkgName) &&
            !pkgName.startsWith('node:')
          ) {
            const rootPkg = pkgName.startsWith('@') ? pkgName.split('/').slice(0, 2).join('/') : pkgName.split('/')[0];
            if (isPackageJsonValid && packageJsonFile && !declaredNodeDeps.has(rootPkg)) {
              issues.push({
                id: `bug_missing_dep_${file.id}_${rootPkg}`,
                fileId: file.id,
                fileName: file.name,
                line: lineNum,
                type: 'Missing Dependency',
                severity: 'critical',
                message: `Package "${rootPkg}" diimpor tetapi belum terdaftar di dependencies package.json.`,
                cause: `File ${file.name} membutuhkan pustaka "${rootPkg}".`,
                suggestedFix: `Pasang dependensi "${rootPkg}" ke dalam project.`,
                originalSnippet: line,
                confidence: 96,
                isAutoFixable: true,
                missingPackage: rootPkg,
                packageManager: 'npm',
              });
            }
          }
        }

        // Detect missing await on Promise-like async patterns
        if (line.includes('fetch(') && !line.includes('await ') && !line.includes('.then(') && !line.includes('return fetch')) {
          issues.push({
            id: `bug_unhandled_promise_${file.id}_${lineNum}`,
            fileId: file.id,
            fileName: file.name,
            line: lineNum,
            type: 'Potential Runtime Error',
            severity: 'warning',
            message: 'Pemanggilan fetch() tidak di-await atau tidak di-chain dengan .then().',
            cause: 'Operasi asinkron dapat mengembalikan Promise yang belum terselesaikan.',
            suggestedFix: 'Tambahkan await pada pemanggilan fetch(...) atau tangani dengan .then().',
            originalSnippet: line,
            confidence: 84,
            isAutoFixable: false,
          });
        }

        // Unused console log in production warning
        if (line.includes('console.log(') && !file.name.includes('test') && !file.name.includes('quickstart')) {
          // just an info issue
        }
      }

      if (openBraces !== 0 || openParens !== 0 || openBrackets !== 0) {
        issues.push({
          id: `bug_unbalanced_brackets_${file.id}`,
          fileId: file.id,
          fileName: file.name,
          line: lines.length,
          type: 'Syntax Error',
          severity: 'critical',
          message: 'Terdapat kurung kurawal/buka-tutup yang tidak berpasangan.',
          cause: `Indikasi penutupan blok yang kurang (${openBraces !== 0 ? `Braces ${openBraces}` : ''} ${openParens !== 0 ? `Parens ${openParens}` : ''}).`,
          suggestedFix: 'Pastikan setiap tanda kurung { ( [ memiliki penutup yang bersesuaian.',
          originalSnippet: lines.slice(-3).join('\n'),
          confidence: 88,
          isAutoFixable: false,
        });
      }
    }

    // 3. Python file checks
    if (file.language === 'python') {
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineNum = i + 1;
        const trimmed = line.trim();

        if (trimmed.startsWith('#')) continue;

        // Missing imports / dependencies in Python
        const pyImportMatch = line.match(/^(?:import|from)\s+([a-zA-Z0-9_]+)/);
        if (pyImportMatch) {
          const modName = pyImportMatch[1].toLowerCase();
          const standardLibs = [
            'sys', 'os', 'math', 'time', 'json', 'random', 're', 'datetime',
            'collections', 'itertools', 'functools', 'urllib', 'typing',
            'threading', 'subprocess', 'pathlib', 'logging', 'hashlib'
          ];

          if (!standardLibs.includes(modName)) {
            if (requirementsTxtFile && !declaredPythonDeps.has(modName)) {
              issues.push({
                id: `bug_py_missing_dep_${file.id}_${modName}`,
                fileId: file.id,
                fileName: file.name,
                line: lineNum,
                type: 'Missing Dependency',
                severity: 'critical',
                message: `Modul Python "${modName}" tidak terdaftar di requirements.txt.`,
                cause: `Eksekusi Python akan melempar ModuleNotFoundError: No module named '${modName}'.`,
                suggestedFix: `Tambahkan "${modName}" ke requirements.txt dan jalankan instalasi package.`,
                originalSnippet: line,
                confidence: 96,
                isAutoFixable: true,
                missingPackage: modName,
                packageManager: 'pip',
              });
            }
          }
        }

        // Unmatched quotation marks
        const singleQuotes = (line.match(/'/g) || []).length;
        const doubleQuotes = (line.match(/"/g) || []).length;
        if (!line.includes('"""') && !line.includes("'''")) {
          if (singleQuotes % 2 !== 0 || doubleQuotes % 2 !== 0) {
            issues.push({
              id: `bug_py_quotes_${file.id}_${lineNum}`,
              fileId: file.id,
              fileName: file.name,
              line: lineNum,
              type: 'Python Syntax Error',
              severity: 'critical',
              message: 'Tanda kutip string tidak berpasangan.',
              cause: 'String literal tidak tertutup pada baris ini.',
              suggestedFix: 'Tutup string dengan tanda kutip tunggal atau ganda yang sesuai.',
              originalSnippet: line,
              confidence: 91,
              isAutoFixable: false,
            });
          }
        }
      }
    }
  }

  const criticalCount = issues.filter((i) => i.severity === 'critical').length;
  const warningCount = issues.filter((i) => i.severity === 'warning').length;
  const infoCount = issues.filter((i) => i.severity === 'info').length;

  return {
    timestamp: Date.now(),
    scannedFilesCount: project.files.length,
    issues,
    criticalCount,
    warningCount,
    infoCount,
    healthy: criticalCount === 0,
    summary:
      criticalCount === 0 && warningCount === 0
        ? 'Project sehat: tidak ditemukan kesalahan sintaks atau dependensi yang terputus.'
        : `Ditemukan ${criticalCount} isu kritis dan ${warningCount} peringatan pada ${project.files.length} file.`,
  };
}
