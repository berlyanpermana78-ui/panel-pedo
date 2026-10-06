import React, { useState, useEffect, useRef } from 'react';
import { Project, ProjectFile, ExecutionState, EditorSettings } from './types';
import {
  loadProjects,
  saveProjects,
  loadActiveProjectId,
  saveActiveProjectId,
  loadSettings,
  saveSettings,
} from './lib/storage';
import { DEFAULT_PROJECTS, detectLanguageFromFilename } from './lib/project/templates';
import { exportProjectToZipSecure, downloadProjectZipBlob } from './lib/project/exporter';
import { importProjectFromZipSecure } from './lib/project/importer';
import { createProjectSnapshot } from './lib/ai/fixer';

// Landing Page Components
import { Navbar } from './components/landing/Navbar';
import { Hero } from './components/landing/Hero';
import { VideoSection } from './components/landing/VideoSection';
import { Features } from './components/landing/Features';
import { SupportedLanguages } from './components/landing/SupportedLanguages';
import { WorkspaceShowcase } from './components/landing/WorkspaceShowcase';
import { RuntimeSystem } from './components/landing/RuntimeSystem';
import { PackageManagerSection } from './components/landing/PackageManagerSection';
import { HowItWorks } from './components/landing/HowItWorks';
import { SecuritySection } from './components/landing/SecuritySection';
import { AboutSection } from './components/landing/AboutSection';
import { Footer } from './components/landing/Footer';

// Dashboard Components
import { DashboardNavbar } from './components/dashboard/DashboardNavbar';
import { apiRequest, describeApiError } from './lib/api-client';
import { useRuntimeServer } from './lib/runtime-status';
import { FileExplorer } from './components/dashboard/FileExplorer';
import { CodeEditor } from './components/dashboard/CodeEditor';
import { HtmlPreview } from './components/dashboard/HtmlPreview';
import { ConsoleOutput } from './components/dashboard/ConsoleOutput';
import { PackageManagerModal } from './components/dashboard/PackageManagerModal';
import { ProjectModal } from './components/dashboard/ProjectModal';
import { SettingsModal } from './components/dashboard/SettingsModal';
import { MobileBottomNav, MobileTab } from './components/dashboard/MobileBottomNav';

// Major Feature Upgrade Components
import { AIAssistantPanel } from './components/dashboard/AIAssistantPanel';
import { BugAnalyzerModal } from './components/dashboard/BugAnalyzerModal';
import { DeploymentModal } from './components/dashboard/DeploymentModal';
import { TemplatesModal } from './components/dashboard/TemplatesModal';
import { BugReportModal } from './components/dashboard/BugReportModal';
import { SqlPlaygroundModal } from './components/dashboard/SqlPlaygroundModal';
import { Rocket, ShieldAlert, Layers, Package, Bug, Settings, X, Database } from 'lucide-react';

export default function App() {
  const [view, setView] = useState<'landing' | 'dashboard'>('landing');

  // Project and workspace state
  const [projects, setProjects] = useState<Project[]>(() => loadProjects());
  const [activeProjectId, setActiveProjectId] = useState<string>(() =>
    loadActiveProjectId(projects)
  );

  const activeProject =
    projects.find((p) => p.id === activeProjectId) || projects[0] || DEFAULT_PROJECTS[0];

  const [activeFileId, setActiveFileId] = useState<string>(() => {
    const defaultF = activeProject.files.find((f) => f.name === activeProject.defaultFile);
    return defaultF ? defaultF.id : activeProject.files[0]?.id || '';
  });

  const activeFile =
    activeProject.files.find((f) => f.id === activeFileId) || activeProject.files[0] || null;

  // Editor and Runtime Execution state
  const [settings, setSettings] = useState<EditorSettings>(() => loadSettings());
  const [executionState, setExecutionState] = useState<ExecutionState>({
    isRunning: false,
    status: 'Ready',
    stdout: '',
    stderr: '',
    exitCode: null,
    duration: 0,
  });

  // UI Panels and Modals state
  const [showPreview, setShowPreview] = useState(false);
  const [isConsoleExpanded, setIsConsoleExpanded] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>('editor');

  // Modals state
  const [isPackageManagerOpen, setIsPackageManagerOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const runtimeServer = useRuntimeServer(view === 'dashboard');

  // New Upgrade Modals state
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [isAnalyzerOpen, setIsAnalyzerOpen] = useState(false);
  const [isDeploymentOpen, setIsDeploymentOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isBugReportOpen, setIsBugReportOpen] = useState(false);
  const [isSqlPlaygroundOpen, setIsSqlPlaygroundOpen] = useState(false);
  const [isMobileMoreOpen, setIsMobileMoreOpen] = useState(false);

  // Hidden file input for secure ZIP import
  const zipInputRef = useRef<HTMLInputElement>(null);

  // Sync projects with localStorage
  useEffect(() => {
    saveProjects(projects);
  }, [projects]);

  // Sync active project id
  useEffect(() => {
    saveActiveProjectId(activeProjectId);
  }, [activeProjectId]);

  // Update settings handler
  const handleUpdateSettings = (newSettings: EditorSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  // Change project handler
  const handleSelectProject = (projectId: string) => {
    setActiveProjectId(projectId);
    const targetProject = projects.find((p) => p.id === projectId);
    if (targetProject && targetProject.files.length > 0) {
      const def = targetProject.files.find((f) => f.name === targetProject.defaultFile);
      setActiveFileId(def ? def.id : targetProject.files[0].id);
    }
  };

  // Content change in active file
  const handleEditorChange = (newContent: string) => {
    if (!activeFile) return;
    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id !== activeProject.id) return proj;
        return {
          ...proj,
          updatedAt: Date.now(),
          files: proj.files.map((file) =>
            file.id === activeFile.id ? { ...file, content: newContent } : file
          ),
        };
      })
    );
  };

  // Apply AI Patch with automated snapshot
  const handleApplyAIPatch = (fileId: string, newContent: string) => {
    const { updatedProject } = createProjectSnapshot(activeProject, 'AI Patch modification');
    const updatedFiles = updatedProject.files.map((f) => (f.id === fileId ? { ...f, content: newContent } : f));

    const finalProject: Project = {
      ...updatedProject,
      files: updatedFiles,
      updatedAt: Date.now(),
    };

    setProjects((prev) => prev.map((p) => (p.id === activeProject.id ? finalProject : p)));
  };

  // Create new file in active project
  const handleCreateFile = (name: string) => {
    const extLang = detectLanguageFromFilename(name);
    let sampleContent = '// ' + name + '\n';
    if (extLang === 'python') {
      sampleContent = '# ' + name + '\nprint("Hello from ' + name + '")\n';
    } else if (extLang === 'sql') {
      sampleContent = '-- ' + name + '\nCREATE TABLE IF NOT EXISTS sample (\n  id INTEGER PRIMARY KEY,\n  name TEXT\n);\n\nSELECT * FROM sample;\n';
    } else if (extLang === 'java') {
      const className = name.replace(/\.java$/, '') || 'Main';
      sampleContent = `public class ${className} {\n    public static void main(String[] args) {\n        System.out.println("Hello from ${className}!");\n    }\n}\n`;
    } else if (extLang === 'c') {
      sampleContent = `#include <stdio.h>\n\nint main() {\n    printf("Hello from ${name}!\\n");\n    return 0;\n}\n`;
    } else if (extLang === 'cpp') {
      sampleContent = `#include <iostream>\n\nint main() {\n    std::cout << "Hello from ${name}!" << std::endl;\n    return 0;\n}\n`;
    } else if (extLang === 'typescript') {
      sampleContent = `// ${name}\ninterface AppConfig {\n  name: string;\n  version: string;\n}\n\nconst config: AppConfig = {\n  name: "BILZX CODEX",\n  version: "1.0.0"\n};\n\nconsole.log("TypeScript execution:", config);\n`;
    } else if (extLang === 'html') {
      sampleContent = `<!DOCTYPE html>\n<html>\n<head>\n  <meta charset="UTF-8">\n  <title>${name}</title>\n</head>\n<body>\n  <h1>${name}</h1>\n</body>\n</html>\n`;
    }

    const newFile: ProjectFile = {
      id: 'f_' + Math.random().toString(36).slice(2, 9),
      name,
      path: name,
      language: extLang,
      content: sampleContent,
    };

    setProjects((prev) =>
      prev.map((proj) =>
        proj.id === activeProject.id
          ? {
              ...proj,
              updatedAt: Date.now(),
              files: [...proj.files, newFile],
            }
          : proj
      )
    );
    setActiveFileId(newFile.id);
  };

  // Rename file
  const handleRenameFile = (fileId: string, newName: string) => {
    setProjects((prev) =>
      prev.map((proj) =>
        proj.id === activeProject.id
          ? {
              ...proj,
              updatedAt: Date.now(),
              files: proj.files.map((f) =>
                f.id === fileId
                  ? {
                      ...f,
                      name: newName,
                      path: newName,
                      language: detectLanguageFromFilename(newName),
                    }
                  : f
              ),
            }
          : proj
      )
    );
  };

  // Delete file
  const handleDeleteFile = (fileId: string) => {
    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id !== activeProject.id) return proj;
        const remaining = proj.files.filter((f) => f.id !== fileId);
        return {
          ...proj,
          updatedAt: Date.now(),
          files: remaining,
        };
      })
    );

    if (activeFileId === fileId) {
      const remainingFiles = activeProject.files.filter((f) => f.id !== fileId);
      if (remainingFiles.length > 0) {
        setActiveFileId(remainingFiles[0].id);
      }
    }
  };

  // Reset project to template defaults
  const handleResetProject = () => {
    const original = DEFAULT_PROJECTS.find((p) => p.id === activeProject.id);
    if (!original) {
      alert('Tidak ada template bawaan untuk project custom ini.');
      return;
    }
    if (confirm(`Reset seluruh file dalam project "${activeProject.name}" ke kondisi awal?`)) {
      setProjects((prev) =>
        prev.map((p) => (p.id === activeProject.id ? { ...original, updatedAt: Date.now() } : p))
      );
      setActiveFileId(original.files[0]?.id || '');
    }
  };

  // Create new project with multi-runtime template support
  const handleCreateProject = (
    name: string,
    templateType:
      | 'node'
      | 'typescript'
      | 'python'
      | 'java'
      | 'c'
      | 'cpp'
      | 'sql'
      | 'html'
      | 'blank'
  ) => {
    let files: ProjectFile[] = [];
    let defaultFile = 'main.js';

    if (templateType === 'python') {
      defaultFile = 'main.py';
      files = [
        {
          id: 'f_py1',
          name: 'main.py',
          path: 'main.py',
          language: 'python',
          content: `# BILZX CODEX — Python Analytics & Math\nimport sys\nimport math\n\nprint("Python Version:", sys.version.split()[0])\nprint("Pi approximation:", math.pi)\n`,
        },
        {
          id: 'f_py2',
          name: 'requirements.txt',
          path: 'requirements.txt',
          language: 'bash',
          content: `# requirements.txt\nrequests>=2.31.0\n`,
        },
      ];
    } else if (templateType === 'typescript') {
      defaultFile = 'main.ts';
      files = [
        {
          id: 'f_ts1',
          name: 'main.ts',
          path: 'main.ts',
          language: 'typescript',
          content: `// BILZX CODEX — TypeScript Runtime Engine\ninterface SystemMetric {\n  engine: string;\n  status: 'active' | 'standby';\n  uptimeSeconds: number;\n}\n\nconst metric: SystemMetric = {\n  engine: "BILZX TypeScript V8",\n  status: "active",\n  uptimeSeconds: 120\n};\n\nconsole.log("System Metric:", metric);\n`,
        },
        {
          id: 'f_ts2',
          name: 'tsconfig.json',
          path: 'tsconfig.json',
          language: 'json',
          content: `{\n  "compilerOptions": {\n    "target": "ES2022",\n    "module": "ESNext",\n    "moduleResolution": "bundler",\n    "strict": true\n  }\n}\n`,
        },
      ];
    } else if (templateType === 'java') {
      defaultFile = 'Main.java';
      files = [
        {
          id: 'f_jv1',
          name: 'Main.java',
          path: 'Main.java',
          language: 'java',
          content: `// BILZX CODEX — Java 21 Engine\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("==========================================");\n        System.out.println("  BILZX CODEX — Java Runtime Engine");\n        System.out.println("  Version: Java " + System.getProperty("java.version"));\n        System.out.println("==========================================\\n");\n        \n        System.out.println("✓ Compilation and execution completed successfully!");\n    }\n}\n`,
        },
        {
          id: 'f_jv2',
          name: 'README.md',
          path: 'README.md',
          language: 'bash',
          content: `# Java Project\nCompile and run using the javac + java execution pipeline.`,
        },
      ];
    } else if (templateType === 'c') {
      defaultFile = 'main.c';
      files = [
        {
          id: 'f_c1',
          name: 'main.c',
          path: 'main.c',
          language: 'c',
          content: `// BILZX CODEX — C Language (Clang / GCC)\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    printf("==========================================\\n");\n    printf("  BILZX CODEX — C Sandbox Runtime\\n");\n    printf("==========================================\\n\\n");\n    \n    printf("✓ C program compiled and executed successfully!\\n");\n    return 0;\n}\n`,
        },
        {
          id: 'f_c2',
          name: 'README.md',
          path: 'README.md',
          language: 'bash',
          content: `# C Systems Project\nCompiled into a sandboxed temporary binary with memory & timeout protections.`,
        },
      ];
    } else if (templateType === 'cpp') {
      defaultFile = 'main.cpp';
      files = [
        {
          id: 'f_cpp1',
          name: 'main.cpp',
          path: 'main.cpp',
          language: 'cpp',
          content: `// BILZX CODEX — C++ (Clang++ / G++)\n#include <iostream>\n#include <vector>\n#include <numeric>\n\nint main() {\n    std::cout << "==========================================\\n";\n    std::cout << "  BILZX CODEX — C++ Modern Sandbox\\n";\n    std::cout << "==========================================\\n\\n";\n    \n    std::vector<int> numbers = {10, 20, 30, 40, 50};\n    int sum = std::accumulate(numbers.begin(), numbers.end(), 0);\n    \n    std::cout << "Sum of vector elements: " << sum << "\\n";\n    std::cout << "✓ C++ compiled and executed successfully!\\n";\n    return 0;\n}\n`,
        },
        {
          id: 'f_cpp2',
          name: 'README.md',
          path: 'README.md',
          language: 'bash',
          content: `# C++ Project\nFull STL and modern C++ support with clang++ and g++.`,
        },
      ];
    } else if (templateType === 'sql') {
      defaultFile = 'database.sql';
      files = [
        {
          id: 'f_sql1',
          name: 'database.sql',
          path: 'database.sql',
          language: 'sql',
          content: `-- BILZX CODEX — SQLite Online Database\nCREATE TABLE IF NOT EXISTS products (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  name TEXT NOT NULL,\n  price REAL NOT NULL,\n  category TEXT\n);\n\nINSERT INTO products (name, price, category) VALUES\n  ('BILZX Pro License', 49.99, 'Software'),\n  ('Cloud Runtime Pass', 19.99, 'Cloud'),\n  ('AI Coding Credits', 9.99, 'AI');\n\nSELECT category, COUNT(*) AS total_items, AVG(price) AS average_price\nFROM products\nGROUP BY category;\n`,
        },
        {
          id: 'f_sql2',
          name: 'README.md',
          path: 'README.md',
          language: 'bash',
          content: `# SQLite Database Project\nExecute SQL scripts directly or open the SQL Studio modal to inspect tables & query history.`,
        },
      ];
    } else if (templateType === 'html') {
      defaultFile = 'index.html';
      files = DEFAULT_PROJECTS[2]?.files || [];
    } else if (templateType === 'blank') {
      defaultFile = 'main.js';
      files = [
        {
          id: 'f_init',
          name: 'main.js',
          path: 'main.js',
          language: 'javascript',
          content: '// BILZX CODEX — Empty Workspace\nconsole.log("Hello BILZX CODEX!");\n',
        },
      ];
    } else {
      defaultFile = 'main.js';
      files = DEFAULT_PROJECTS[0]?.files || [];
    }

    const newProj: Project = {
      id: 'proj_' + Date.now(),
      name,
      description: `Project berbasis ${templateType.toUpperCase()}`,
      defaultFile,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      files,
      snapshots: [
        {
          id: 'snap_init_' + Date.now(),
          timestamp: Date.now(),
          description: 'Initial creation',
          files: JSON.parse(JSON.stringify(files)),
        },
      ],
    };

    setProjects((prev) => [newProj, ...prev]);
    setActiveProjectId(newProj.id);
    setActiveFileId(files[0]?.id || '');
    setIsProjectModalOpen(false);
  };

  // Add project from templates catalog
  const handleCreateFromTemplatesCatalog = (newProj: Project) => {
    setProjects((prev) => [newProj, ...prev]);
    setActiveProjectId(newProj.id);
    setActiveFileId(newProj.files[0]?.id || '');
    setIsTemplatesOpen(false);
  };

  // Rename project
  const handleRenameProject = (id: string, newName: string) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, name: newName, updatedAt: Date.now() } : p))
    );
  };

  // Delete project
  const handleDeleteProject = (id: string) => {
    const remaining = projects.filter((p) => p.id !== id);
    if (remaining.length === 0) return;
    setProjects(remaining);
    if (activeProjectId === id) {
      setActiveProjectId(remaining[0].id);
      setActiveFileId(remaining[0].files[0]?.id || '');
    }
  };

  // Export ZIP (Secure, secret-filtered)
  const handleExportZip = async () => {
    try {
      const blob = await exportProjectToZipSecure(activeProject, { scope: 'sourceOnly', includeEnv: false });
      const safeName = activeProject.name.toLowerCase().replace(/[^a-z0-9_-]/g, '-') || 'project';
      downloadProjectZipBlob(blob, `${safeName}.zip`);
    } catch (err: any) {
      alert('Gagal mengekspor ZIP: ' + (err?.message || 'Unknown error'));
    }
  };

  // Import ZIP (Security scanned against path traversal)
  const handleImportZip = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await importProjectFromZipSecure(file);
      if (result.success && result.project) {
        setProjects((prev) => [result.project!, ...prev]);
        setActiveProjectId(result.project.id);
        setActiveFileId(result.project.files[0]?.id || '');
        alert(`Project "${result.project.name}" berhasil diimpor dengan aman! (${result.metadata?.framework})`);
      } else {
        alert('Gagal mengimpor ZIP: ' + (result.error || 'Format tidak didukung'));
      }
    } catch (err: any) {
      alert('Gagal mengimpor arsip ZIP: ' + (err?.message || 'Format ZIP rusak'));
    } finally {
      if (zipInputRef.current) zipInputRef.current.value = '';
    }
  };

  // Trigger Code Execution
  const handleRunCode = async () => {
    if (!activeFile) return;

    // If current file is HTML, automatically open preview
    if (activeFile.language === 'html') {
      setShowPreview(true);
      setMobileTab('preview');
      setExecutionState({
        isRunning: false,
        status: 'Success',
        stdout: `HTML preview loaded for ${activeFile.name}.`,
        stderr: '',
        exitCode: 0,
        duration: 0,
      });
      return;
    }

    setExecutionState({
      isRunning: true,
      status: 'Running',
      stdout: '',
      stderr: '',
      exitCode: null,
      duration: 0,
    });

    if (window.innerWidth < 640) {
      setMobileTab('console');
    }

    const startTime = Date.now();

    try {
      const data = await apiRequest<{
        success: boolean;
        status?: ExecutionState['status'];
        stdout?: string;
        stderr?: string;
        exitCode?: number | null;
        duration?: number;
        error?: string;
      }>('/api/run', {
        method: 'POST',
        body: {
          language: activeFile.language,
          code: activeFile.content,
          projectId: activeProject.id,
        },
        timeoutMs: 45000,
      });
      const elapsed = Date.now() - startTime;

      setExecutionState({
        isRunning: false,
        status: data.status || (data.success ? 'Success' : 'Error'),
        stdout: data.stdout || '',
        stderr: data.stderr || '',
        exitCode: data.exitCode !== undefined ? data.exitCode : (data.success ? 0 : 1),
        duration: data.duration || elapsed,
        error: data.error,
      });
    } catch (err: any) {
      const elapsed = Date.now() - startTime;
      const info = describeApiError(err);
      const userLevel = ['UNSUPPORTED_RUNTIME', 'INVALID_INPUT', 'LIMIT_EXCEEDED', 'RUNTIME_UNAVAILABLE'].includes(info.code || '');

      setExecutionState({
        isRunning: false,
        status: info.code === 'RUNTIME_UNAVAILABLE' ? 'Runtime Unavailable' : 'Error',
        stdout: '',
        stderr: userLevel ? info.message : '',
        exitCode: 1,
        duration: elapsed,
        error: info.message,
        // Error infrastruktur (404/500/non-JSON/network) => panel "Runtime Server Error"
        apiError: userLevel ? undefined : info,
      });
    }
  };

  const handleClearConsole = () => {
    setExecutionState((prev) => ({
      ...prev,
      stdout: '',
      stderr: '',
      status: 'Ready',
      exitCode: null,
      duration: 0,
      apiError: undefined,
    }));
  };

  const handleFixWithAI = () => {
    setIsAIAssistantOpen(true);
  };

  return (
    <div className="w-full min-h-screen bg-[#F3F4F6] text-[#18181B] flex flex-col font-sans">
      {/* Hidden file input for importing project zip */}
      <input
        ref={zipInputRef}
        type="file"
        accept=".zip"
        onChange={handleImportZip}
        className="hidden"
      />

      {view === 'landing' ? (
        /* LANDING PAGE VIEW */
        <div className="flex-1 flex flex-col">
          <Navbar onOpenDashboard={() => setView('dashboard')} />
          <main className="flex-1">
            <Hero onOpenDashboard={() => setView('dashboard')} />
            <VideoSection />
            <Features />
            <SupportedLanguages />
            <WorkspaceShowcase />
            <RuntimeSystem />
            <PackageManagerSection />
            <HowItWorks />
            <SecuritySection />
            <AboutSection />
          </main>
          <Footer onOpenDashboard={() => setView('dashboard')} />
        </div>
      ) : (
        /* DASHBOARD WORKSPACE VIEW */
        <div className="h-screen w-full flex flex-col overflow-hidden bg-[#F3F4F6]">
          {/* Top Navbar */}
          <DashboardNavbar
            currentProject={activeProject}
            activeFile={activeFile}
            executionState={executionState}
            runtimeServerStatus={runtimeServer.status}
            onRefreshRuntimeServer={runtimeServer.refresh}
            showPreview={showPreview}
            onTogglePreview={() => setShowPreview(!showPreview)}
            onRunCode={handleRunCode}
            onOpenPackageManager={() => setIsPackageManagerOpen(true)}
            onOpenSettings={() => setIsSettingsModalOpen(true)}
            onOpenProjectModal={() => setIsProjectModalOpen(true)}
            onExportZip={handleExportZip}
            onImportZip={() => zipInputRef.current?.click()}
            onBackToLanding={() => setView('landing')}
            onOpenAIAssistant={() => setIsAIAssistantOpen(true)}
            onOpenAnalyzer={() => setIsAnalyzerOpen(true)}
            onOpenDeployment={() => setIsDeploymentOpen(true)}
            onOpenTemplates={() => setIsTemplatesOpen(true)}
            onOpenBugReport={() => setIsBugReportOpen(true)}
            onOpenSqlPlayground={() => setIsSqlPlaygroundOpen(true)}
          />

          {/* DESKTOP LAYOUT (>= sm screen) */}
          <div className="hidden sm:flex flex-1 overflow-hidden min-h-0 relative">
            {/* Left: File Explorer (240px) */}
            <div className="w-60 shrink-0 h-full">
              <FileExplorer
                project={activeProject}
                activeFileId={activeFileId}
                onSelectFile={(id) => setActiveFileId(id)}
                onCreateFile={handleCreateFile}
                onRenameFile={handleRenameFile}
                onDeleteFile={handleDeleteFile}
                onResetProject={handleResetProject}
              />
            </div>

            {/* Center + Right: Editor & Split Panels */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              {/* Top Split: Editor and Preview */}
              <div className="flex-1 flex overflow-hidden min-h-0">
                {/* Editor Container */}
                <div className={`flex-1 h-full overflow-hidden ${showPreview ? 'w-1/2' : 'w-full'}`}>
                  <CodeEditor
                    file={activeFile}
                    settings={settings}
                    onChangeContent={handleEditorChange}
                    onRunTrigger={handleRunCode}
                  />
                </div>

                {/* HTML Preview (if open) */}
                {showPreview && (
                  <div className="w-1/2 h-full overflow-hidden">
                    <HtmlPreview
                      project={activeProject}
                      onClose={() => setShowPreview(false)}
                    />
                  </div>
                )}
              </div>

              {/* Bottom: Console Output (resizable height) */}
              <div
                className={`transition-all duration-200 shrink-0 ${
                  isConsoleExpanded ? 'h-72' : 'h-40'
                }`}
              >
                <ConsoleOutput
                  executionState={executionState}
                  onClearConsole={handleClearConsole}
                  onFixWithAI={handleFixWithAI}
                  isExpanded={isConsoleExpanded}
                  onToggleExpand={() => setIsConsoleExpanded(!isConsoleExpanded)}
                />
              </div>
            </div>

            {/* Slide-in BILZX AI Assistant Panel */}
            <AIAssistantPanel
              isOpen={isAIAssistantOpen}
              onClose={() => setIsAIAssistantOpen(false)}
              project={activeProject}
              activeFile={activeFile}
              consoleError={executionState.stderr}
              onApplyPatch={handleApplyAIPatch}
            />
          </div>

          {/* MOBILE LAYOUT (< sm screen) */}
          <div className="sm:hidden flex-1 flex flex-col overflow-hidden min-h-0">
            {mobileTab === 'editor' && (
              <div className="flex-1 h-full overflow-hidden">
                <CodeEditor
                  file={activeFile}
                  settings={settings}
                  onChangeContent={handleEditorChange}
                  onRunTrigger={handleRunCode}
                />
              </div>
            )}

            {mobileTab === 'files' && (
              <div className="flex-1 h-full overflow-hidden">
                <FileExplorer
                  project={activeProject}
                  activeFileId={activeFileId}
                  onSelectFile={(id) => {
                    setActiveFileId(id);
                    setMobileTab('editor');
                  }}
                  onCreateFile={handleCreateFile}
                  onRenameFile={handleRenameFile}
                  onDeleteFile={handleDeleteFile}
                  onResetProject={handleResetProject}
                />
              </div>
            )}

            {mobileTab === 'ai' && (
              <div className="flex-1 h-full overflow-hidden">
                <AIAssistantPanel
                  isOpen={true}
                  onClose={() => setMobileTab('editor')}
                  project={activeProject}
                  activeFile={activeFile}
                  consoleError={executionState.stderr}
                  onApplyPatch={handleApplyAIPatch}
                />
              </div>
            )}

            {mobileTab === 'preview' && (
              <div className="flex-1 h-full overflow-hidden">
                <HtmlPreview project={activeProject} />
              </div>
            )}

            {mobileTab === 'console' && (
              <div className="flex-1 h-full overflow-hidden">
                <ConsoleOutput
                  executionState={executionState}
                  onClearConsole={handleClearConsole}
                  onFixWithAI={() => setMobileTab('ai')}
                />
              </div>
            )}

            {/* Mobile Bottom Navigation Bar */}
            <MobileBottomNav
              activeTab={mobileTab}
              onChangeTab={(tab) => {
                if (tab === 'more') {
                  setIsMobileMoreOpen(true);
                } else {
                  setMobileTab(tab);
                }
              }}
              hasConsoleOutput={Boolean(executionState.stdout || executionState.stderr || executionState.apiError)}
            />
          </div>

          {/* Mobile "More" Drawer Modal */}
          {isMobileMoreOpen && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:hidden">
              <div className="w-full bg-white border-t-3 border-black p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b-2 border-black">
                  <span className="font-black text-xs uppercase text-gray-700">Fitur & Modul Tambahan</span>
                  <button onClick={() => setIsMobileMoreOpen(false)} className="p-1">
                    <X className="w-5 h-5 text-gray-700" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-black">
                  <button
                    onClick={() => {
                      setIsMobileMoreOpen(false);
                      setIsAnalyzerOpen(true);
                    }}
                    className="p-3 bg-white border-2 border-black text-rose-700 flex items-center space-x-2"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span>Code Analyzer</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsMobileMoreOpen(false);
                      setIsDeploymentOpen(true);
                    }}
                    className="p-3 bg-white border-2 border-black text-purple-700 flex items-center space-x-2"
                  >
                    <Rocket className="w-4 h-4" />
                    <span>Deploy Scanner</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsMobileMoreOpen(false);
                      setIsTemplatesOpen(true);
                    }}
                    className="p-3 bg-white border-2 border-black text-blue-700 flex items-center space-x-2"
                  >
                    <Layers className="w-4 h-4" />
                    <span>Templates</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsMobileMoreOpen(false);
                      setIsPackageManagerOpen(true);
                    }}
                    className="p-3 bg-white border-2 border-black text-purple-700 flex items-center space-x-2"
                  >
                    <Package className="w-4 h-4" />
                    <span>Packages</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsMobileMoreOpen(false);
                      setIsSqlPlaygroundOpen(true);
                    }}
                    className="p-3 bg-white border-2 border-black text-emerald-800 flex items-center space-x-2"
                  >
                    <Database className="w-4 h-4" />
                    <span>SQL Studio</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsMobileMoreOpen(false);
                      setIsBugReportOpen(true);
                    }}
                    className="p-3 bg-white border-2 border-black text-amber-700 flex items-center space-x-2"
                  >
                    <Bug className="w-4 h-4" />
                    <span>Report Bug</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsMobileMoreOpen(false);
                      setIsSettingsModalOpen(true);
                    }}
                    className="p-3 bg-white border-2 border-black text-gray-800 flex items-center space-x-2"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modals */}
          <PackageManagerModal
            isOpen={isPackageManagerOpen}
            onClose={() => setIsPackageManagerOpen(false)}
            project={activeProject}
          />

          <ProjectModal
            isOpen={isProjectModalOpen}
            onClose={() => setIsProjectModalOpen(false)}
            projects={projects}
            activeProjectId={activeProjectId}
            onSelectProject={handleSelectProject}
            onCreateProject={handleCreateProject}
            onRenameProject={handleRenameProject}
            onDeleteProject={handleDeleteProject}
          />

          <SettingsModal
            isOpen={isSettingsModalOpen}
            onClose={() => setIsSettingsModalOpen(false)}
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
          />

          <BugAnalyzerModal
            isOpen={isAnalyzerOpen}
            onClose={() => setIsAnalyzerOpen(false)}
            project={activeProject}
            onUpdateProject={(up) => {
              setProjects((prev) => prev.map((p) => (p.id === up.id ? up : p)));
            }}
          />

          <DeploymentModal
            isOpen={isDeploymentOpen}
            onClose={() => setIsDeploymentOpen(false)}
            project={activeProject}
            onOpenAnalyzer={() => setIsAnalyzerOpen(true)}
          />

          <TemplatesModal
            isOpen={isTemplatesOpen}
            onClose={() => setIsTemplatesOpen(false)}
            onCreateProjectFromTemplate={handleCreateFromTemplatesCatalog}
          />

          <BugReportModal
            isOpen={isBugReportOpen}
            onClose={() => setIsBugReportOpen(false)}
            project={activeProject}
            executionState={executionState}
          />

          <SqlPlaygroundModal
            isOpen={isSqlPlaygroundOpen}
            onClose={() => setIsSqlPlaygroundOpen(false)}
            projectId={activeProject.id}
          />
        </div>
      )}
    </div>
  );
}
