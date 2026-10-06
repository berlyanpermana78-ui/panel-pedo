export type SupportedLanguage =
  | 'javascript'
  | 'typescript'
  | 'python'
  | 'java'
  | 'c'
  | 'cpp'
  | 'sql'
  | 'html'
  | 'css'
  | 'json'
  | 'bash';

export interface ProjectFile {
  id: string;
  name: string;
  path: string;
  language: SupportedLanguage;
  content: string;
  isFolder?: boolean;
}

export interface ProjectSnapshot {
  id: string;
  timestamp: number;
  description: string;
  files: ProjectFile[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  defaultFile: string;
  templateType?: string;
  files: ProjectFile[];
  snapshots?: ProjectSnapshot[];
  createdAt: number;
  updatedAt: number;
}

export interface ExecutionState {
  isRunning: boolean;
  status: 'Ready' | 'Running' | 'Success' | 'Error' | 'Timeout' | 'Runtime Unavailable';
  stdout: string;
  stderr: string;
  exitCode: number | null;
  duration: number;
  timestamp?: number;
  error?: string;
  /** Diisi bila panggilan ke API gagal (bukan error dari kode user). */
  apiError?: ApiErrorInfo;
}

export interface ApiErrorInfo {
  title: string;
  message: string;
  endpoint: string | null;
  status: number | null;
  requestId: string | null;
  code: string | null;
}

export type RuntimeState = 'available' | 'unavailable' | 'unsupported';
export type RuntimeServerStatus = 'checking' | 'online' | 'limited' | 'unavailable';

export interface RuntimeInfo {
  available: boolean;
  version: string | null;
  state?: RuntimeState;
  message?: string;
}

export interface RuntimeServerInfo {
  status: 'online' | 'limited' | 'unavailable';
  environment: string;
  platform: 'vercel' | 'self-hosted';
  persistence: 'ephemeral' | 'persistent';
}

export interface SystemRuntimes {
  node: RuntimeInfo;
  typescript?: RuntimeInfo;
  python: RuntimeInfo;
  java?: RuntimeInfo;
  c?: RuntimeInfo;
  cpp?: RuntimeInfo;
  sql?: RuntimeInfo;
  html: {
    available: boolean;
    type: string;
  };
  server?: RuntimeServerInfo;
}

export interface EditorSettings {
  fontSize: number;
  theme: 'vs-dark' | 'light' | 'neo-dark' | 'neo-light';
  tabSize: number;
  wordWrap: 'on' | 'off';
  minimap: boolean;
  lineNumbers: 'on' | 'off';
}

// ==========================================
// LOCAL AI TYPES
// ==========================================

export type AIProviderType = 'webgpu' | 'wasm' | 'unavailable';

export interface AIProviderStatus {
  type: AIProviderType;
  name: string;
  isAvailable: boolean;
  statusText: string;
  deviceFeatures: string[];
}

export interface AIContextOptions {
  currentFile: boolean;
  selectedCode: boolean;
  openFiles: boolean;
  entireProject: boolean;
  errorOutput: boolean;
  dependencies: boolean;
}

export interface AIContext {
  activeFileName?: string;
  activeFileContent?: string;
  selectedCode?: string;
  dependenciesSummary?: string;
  consoleError?: string;
  projectStructure?: string;
  totalChars: number;
}

export type AIQuickAction =
  | 'explain'
  | 'fixError'
  | 'refactor'
  | 'optimize'
  | 'generate'
  | 'addComments'
  | 'findBug';

export interface AIChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: number;
  quickAction?: AIQuickAction;
  suggestedPatch?: {
    fileId: string;
    fileName: string;
    originalContent: string;
    patchedContent: string;
    explanation: string;
    confidence: number;
  };
}

// ==========================================
// CODE ANALYZER & AUTO-FIX TYPES
// ==========================================

export type BugSeverity = 'critical' | 'warning' | 'info';

export interface BugReportItem {
  id: string;
  fileId: string;
  fileName: string;
  line: number;
  column?: number;
  type: string;
  severity: BugSeverity;
  message: string;
  cause: string;
  suggestedFix: string;
  originalSnippet: string;
  patchCode?: string;
  patchedFileContent?: string;
  confidence: number; // 0 to 100
  isAutoFixable: boolean;
  missingPackage?: string;
  packageManager?: 'npm' | 'pip';
}

export interface AnalysisReport {
  timestamp: number;
  scannedFilesCount: number;
  issues: BugReportItem[];
  criticalCount: number;
  warningCount: number;
  infoCount: number;
  healthy: boolean;
  summary: string;
}

export interface FixVerificationResult {
  success: boolean;
  originalErrorResolved: boolean;
  newErrorsIntroduced: boolean;
  buildStatus: 'Passed' | 'Failed' | 'Skipped';
  message: string;
  restoredSnapshot?: boolean;
}

// ==========================================
// PRE-DEPLOYMENT SCANNER TYPES
// ==========================================

export type DeploymentTarget = 'vercel' | 'netlify' | 'infinity';

export interface DeploymentCheckItem {
  name: string;
  status: 'passed' | 'warning' | 'failed';
  details: string;
  isRequired: boolean;
}

export interface DeploymentScanReport {
  target: DeploymentTarget;
  projectName: string;
  frameworkDetected: string;
  buildCommand: string;
  outputDirectory: string;
  timestamp: number;
  checks: DeploymentCheckItem[];
  canDeploy: boolean;
  warningsCount: number;
  blockersCount: number;
  compatibilityAdvice: string;
}

// ==========================================
// BUG REPORT & DIAGNOSTICS TYPES
// ==========================================

export interface UserBugReport {
  diagnosticId: string;
  title: string;
  description: string;
  stepsToReproduce: string;
  expectedResult: string;
  actualResult: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  attachDiagnostics: boolean;
  includeConsoleLogs: boolean;
  includeProjectMetadata: boolean;
}
