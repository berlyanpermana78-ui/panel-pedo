import React from 'react';
import {
  Terminal,
  Play,
  RotateCw,
  Eye,
  Package,
  Settings,
  FolderArchive,
  Download,
  Upload,
  Home,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronDown,
  Sparkles,
  ShieldAlert,
  Rocket,
  Layers,
  Bug,
  Database,
} from 'lucide-react';
import { Project, ProjectFile, ExecutionState, RuntimeServerStatus } from '../../types';

const RUNTIME_SERVER_LABEL: Record<RuntimeServerStatus, string> = {
  checking: 'Checking',
  online: 'Online',
  limited: 'Limited',
  unavailable: 'Unavailable',
};

const RUNTIME_SERVER_DOT: Record<RuntimeServerStatus, string> = {
  checking: 'bg-gray-300 animate-pulse',
  online: 'bg-emerald-400',
  limited: 'bg-amber-400',
  unavailable: 'bg-rose-500',
};

interface DashboardNavbarProps {
  currentProject: Project;
  activeFile: ProjectFile | null;
  executionState: ExecutionState;
  runtimeServerStatus?: RuntimeServerStatus;
  onRefreshRuntimeServer?: () => void;
  showPreview: boolean;
  onTogglePreview: () => void;
  onRunCode: () => void;
  onOpenPackageManager: () => void;
  onOpenSettings: () => void;
  onOpenProjectModal: () => void;
  onExportZip: () => void;
  onImportZip: () => void;
  onBackToLanding: () => void;
  onOpenAIAssistant: () => void;
  onOpenAnalyzer: () => void;
  onOpenDeployment: () => void;
  onOpenTemplates: () => void;
  onOpenBugReport: () => void;
  onOpenSqlPlayground?: () => void;
}

export const DashboardNavbar: React.FC<DashboardNavbarProps> = ({
  currentProject,
  activeFile,
  executionState,
  runtimeServerStatus = 'checking',
  onRefreshRuntimeServer,
  showPreview,
  onTogglePreview,
  onRunCode,
  onOpenPackageManager,
  onOpenSettings,
  onOpenProjectModal,
  onExportZip,
  onImportZip,
  onBackToLanding,
  onOpenAIAssistant,
  onOpenAnalyzer,
  onOpenDeployment,
  onOpenTemplates,
  onOpenBugReport,
  onOpenSqlPlayground,
}) => {
  const isHtml = activeFile?.language === 'html';

  return (
    <header className="bg-white border-b-3 border-black px-3 py-2 shrink-0">
      <div className="flex items-center justify-between gap-2">
        {/* Left: Brand & Project Switcher & Quick Navigation */}
        <div className="flex items-center space-x-2 sm:space-x-2.5 min-w-0">
          <button
            onClick={onBackToLanding}
            title="Kembali ke Beranda"
            className="w-8 h-8 sm:w-9 sm:h-9 bg-[#2563EB] hover:bg-[#1D4ED8] text-white border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer shrink-0"
          >
            <Home className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <div className="hidden lg:block">
            <span className="font-black text-sm text-[#18181B] tracking-tight block leading-none">
              BILZX CODEX
            </span>
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
              WORKSPACE
            </span>
          </div>

          <div className="h-6 w-[2px] bg-black/20 hidden lg:block" />

          {/* Project Selector Button */}
          <button
            onClick={onOpenProjectModal}
            className="flex items-center space-x-1.5 bg-[#F3F4F6] hover:bg-gray-200 border-2 border-black px-2 py-1 sm:px-2.5 sm:py-1.5 shadow-[2px_2px_0px_#000] text-xs font-black text-[#18181B] max-w-[130px] sm:max-w-[190px] truncate cursor-pointer active:translate-x-[1px] active:translate-y-[1px] active:shadow-none shrink-0"
            title="Kelola Project"
          >
            <span className="truncate">{currentProject.name}</span>
            <ChevronDown className="w-3.5 h-3.5 shrink-0 text-gray-500" />
          </button>

          {/* Templates Catalog Button */}
          <button
            onClick={onOpenTemplates}
            className="hidden md:flex items-center space-x-1 bg-white hover:bg-gray-100 border-2 border-black px-2 py-1 sm:py-1.5 shadow-[2px_2px_0px_#000] text-xs font-bold text-[#18181B] cursor-pointer"
            title="Katalog Template Project"
          >
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden xl:inline">Templates</span>
          </button>
        </div>

        {/* Center/Right: Feature Buttons (AI, Analyzer, Deploy) */}
        <div className="flex items-center space-x-1 sm:space-x-1.5 shrink-0">
          {/* Runtime Server indicator */}
          <button
            onClick={onRefreshRuntimeServer}
            title={`Runtime Server: ${RUNTIME_SERVER_LABEL[runtimeServerStatus]} (klik untuk cek ulang)`}
            className="flex items-center space-x-1.5 bg-white hover:bg-gray-100 border-2 border-black px-1.5 sm:px-2 py-1 sm:py-1.5 shadow-[2px_2px_0px_#000] text-[10px] font-black uppercase text-[#18181B] cursor-pointer"
          >
            <span className={`w-2.5 h-2.5 rounded-full border border-black ${RUNTIME_SERVER_DOT[runtimeServerStatus]}`} />
            <span className="hidden xl:inline text-gray-500">Runtime Server:</span>
            <span className="hidden md:inline">{RUNTIME_SERVER_LABEL[runtimeServerStatus]}</span>
          </button>

          {/* BILZX AI Local Assistant */}
          <button
            onClick={onOpenAIAssistant}
            className="flex items-center space-x-1 bg-[#18181B] hover:bg-zinc-800 text-white font-black text-xs px-2.5 py-1 sm:py-1.5 border-2 border-black shadow-[2px_2px_0px_#000] cursor-pointer active:translate-x-[1px] active:translate-y-[1px]"
            title="Local AI Coding Assistant"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">BILZX AI</span>
          </button>

          {/* Code Analyzer */}
          <button
            onClick={onOpenAnalyzer}
            className="flex items-center space-x-1 bg-white hover:bg-gray-100 border-2 border-black px-2 py-1 sm:py-1.5 shadow-[2px_2px_0px_#000] text-xs font-bold text-rose-700 cursor-pointer"
            title="Scan Project & Auto-Fix"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Scan</span>
          </button>

          {/* Pre-Deployment Scanner */}
          <button
            onClick={onOpenDeployment}
            className="flex items-center space-x-1 bg-white hover:bg-gray-100 border-2 border-black px-2 py-1 sm:py-1.5 shadow-[2px_2px_0px_#000] text-xs font-bold text-[#18181B] cursor-pointer"
            title="Pre-Deployment Scanner (Vercel, Netlify, Infinity)"
          >
            <Rocket className="w-3.5 h-3.5 text-purple-600" />
            <span className="hidden lg:inline">Deploy</span>
          </button>

          {/* HTML Preview Toggle */}
          <button
            onClick={onTogglePreview}
            className={`hidden sm:flex items-center space-x-1 font-bold text-xs px-2.5 py-1 sm:py-1.5 border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer ${
              showPreview ? 'bg-amber-200 text-amber-950 font-black' : 'bg-white hover:bg-gray-100 text-[#18181B]'
            }`}
            title="Toggle HTML Live Preview"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Preview</span>
          </button>

          {/* RUN Button */}
          <button
            onClick={onRunCode}
            disabled={executionState.isRunning}
            className={`flex items-center space-x-1 sm:space-x-1.5 font-black text-xs sm:text-sm px-2.5 sm:px-3.5 py-1 sm:py-1.5 border-2 sm:border-3 border-black shadow-[3px_3px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer ${
              executionState.isRunning
                ? 'bg-amber-400 text-black cursor-not-allowed'
                : isHtml
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                : 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white'
            }`}
            title="Jalankan Kode (Ctrl+Enter)"
          >
            {executionState.isRunning ? (
              <>
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
                <span>Running...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>RUN</span>
                <span className="hidden xl:inline-block text-[9px] bg-black/20 px-1 py-0.2 rounded-xs font-mono font-normal">
                  Ctrl+↵
                </span>
              </>
            )}
          </button>

          {/* Python Package Manager */}
          <button
            onClick={onOpenPackageManager}
            className="hidden sm:flex items-center space-x-1 bg-white hover:bg-gray-100 border-2 border-black px-2 py-1 sm:py-1.5 shadow-[2px_2px_0px_#000] text-xs font-bold text-[#18181B] cursor-pointer"
            title="Python Package Manager"
          >
            <Package className="w-3.5 h-3.5 text-purple-700" />
            <span className="hidden xl:inline">Packages</span>
          </button>

          {/* SQL Online Database Studio */}
          {onOpenSqlPlayground && (
            <button
              onClick={onOpenSqlPlayground}
              className="hidden sm:flex items-center space-x-1 bg-white hover:bg-emerald-50 border-2 border-black px-2 py-1 sm:py-1.5 shadow-[2px_2px_0px_#000] text-xs font-bold text-emerald-800 cursor-pointer"
              title="Online SQL Studio & Database Manager"
            >
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden xl:inline">SQL Studio</span>
            </button>
          )}

          {/* Export ZIP */}
          <button
            onClick={onExportZip}
            className="hidden lg:flex items-center space-x-1 bg-white hover:bg-gray-100 border-2 border-black px-2 py-1 sm:py-1.5 shadow-[2px_2px_0px_#000] text-xs font-bold text-[#18181B] cursor-pointer"
            title="Export ZIP"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {/* Import ZIP */}
          <button
            onClick={onImportZip}
            className="hidden lg:flex items-center space-x-1 bg-white hover:bg-gray-100 border-2 border-black px-2 py-1 sm:py-1.5 shadow-[2px_2px_0px_#000] text-xs font-bold text-[#18181B] cursor-pointer"
            title="Import ZIP"
          >
            <Upload className="w-3.5 h-3.5" />
          </button>

          {/* Bug Report Button */}
          <button
            onClick={onOpenBugReport}
            className="w-7 h-7 sm:w-8 sm:h-8 bg-white hover:bg-rose-50 text-rose-700 border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000] cursor-pointer shrink-0"
            title="Laporkan Bug (WhatsApp & Email)"
          >
            <Bug className="w-3.5 h-3.5" />
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="w-7 h-7 sm:w-8 sm:h-8 bg-white hover:bg-gray-100 border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000] text-[#18181B] cursor-pointer shrink-0"
            title="Pengaturan"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
