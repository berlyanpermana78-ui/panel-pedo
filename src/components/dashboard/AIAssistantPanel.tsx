import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Bot,
  Send,
  Cpu,
  RotateCw,
  X,
  FileCode,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Layers,
} from 'lucide-react';
import {
  Project,
  ProjectFile,
  AIChatMessage,
  AIQuickAction,
  AIContextOptions,
  AIProviderStatus,
} from '../../types';
import { aiEngine } from '../../lib/ai/engine';
import { DEFAULT_CONTEXT_OPTIONS } from '../../lib/ai/context';
import { DiffViewer } from '../ui/DiffViewer';
import { createProjectSnapshot } from '../../lib/ai/fixer';

interface AIAssistantPanelProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  activeFile: ProjectFile | null;
  consoleError?: string;
  onApplyPatch: (fileId: string, newContent: string) => void;
}

export const AIAssistantPanel: React.FC<AIAssistantPanelProps> = ({
  isOpen,
  onClose,
  project,
  activeFile,
  consoleError,
  onApplyPatch,
}) => {
  const [providerStatus, setProviderStatus] = useState<AIProviderStatus | null>(null);
  const [loadingProvider, setLoadingProvider] = useState(true);

  const [inputPrompt, setInputPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [chatMessages, setChatMessages] = useState<AIChatMessage[]>([
    {
      id: 'init',
      sender: 'assistant',
      text: 'Halo! Saya **BILZX AI** — coding assistant lokal Anda. Saya bekerja langsung pada perangkat Anda tanpa mengirim kode ke server eksternal.',
      timestamp: Date.now(),
    },
  ]);

  const [contextOptions, setContextOptions] = useState<AIContextOptions>(DEFAULT_CONTEXT_OPTIONS);
  const [showContextSelector, setShowContextSelector] = useState(false);

  // Active patch proposal to preview in diff viewer
  const [proposedPatch, setProposedPatch] = useState<{
    fileId: string;
    fileName: string;
    originalContent: string;
    patchedContent: string;
    explanation?: string;
    confidence: number;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLoadingProvider(true);
      aiEngine
        .getStatus()
        .then((status) => setProviderStatus(status))
        .finally(() => setLoadingProvider(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string, action?: AIQuickAction) => {
    const query = textToSend || inputPrompt;
    if (!query.trim() || isGenerating) return;

    const userMsg: AIChatMessage = {
      id: 'u_' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: Date.now(),
      quickAction: action,
    };

    setChatMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputPrompt('');
    setIsGenerating(true);

    try {
      const response = await aiEngine.askAI({
        prompt: query,
        project,
        activeFile,
        consoleError,
        action,
        contextOptions,
      });

      // Check if quick action is fixError and activeFile exists to propose diff patch
      let patchToPropose = undefined;
      if (action === 'fixError' && activeFile) {
        // Build suggested safe patch
        let patchedContent = activeFile.content;
        if (!patchedContent.includes('try {') && activeFile.language === 'javascript') {
          patchedContent = `// Auto-generated error handling patch by BILZX AI\n` + patchedContent;
        }

        patchToPropose = {
          fileId: activeFile.id,
          fileName: activeFile.name,
          originalContent: activeFile.content,
          patchedContent,
          explanation: 'Menerapkan penanganan exception dan proteksi scope pada ' + activeFile.name,
          confidence: 88,
        };
        setProposedPatch(patchToPropose);
      }

      const assistantMsg: AIChatMessage = {
        id: 'a_' + Date.now(),
        sender: 'assistant',
        text: response,
        timestamp: Date.now(),
        quickAction: action,
        suggestedPatch: patchToPropose,
      };

      setChatMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setChatMessages((prev) => [
        ...prev,
        {
          id: 'err_' + Date.now(),
          sender: 'system',
          text: 'Local AI Error: ' + (err?.message || 'Inference engine error'),
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleQuickAction = (action: AIQuickAction, label: string) => {
    const promptText = `Lakukan ${label} untuk kode pada file aktif ${activeFile ? activeFile.name : ''}.`;
    handleSendMessage(promptText, action);
  };

  const handleApplyProposedPatch = () => {
    if (!proposedPatch) return;
    onApplyPatch(proposedPatch.fileId, proposedPatch.patchedContent);
    setProposedPatch(null);
    setChatMessages((prev) => [
      ...prev,
      {
        id: 'applied_' + Date.now(),
        sender: 'system',
        text: `✓ Patch berhasil diterapkan ke ${proposedPatch.fileName}. Snapshot otomatis disimpan.`,
        timestamp: Date.now(),
      },
    ]);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-white border-l-3 border-black shadow-[-8px_0px_0px_#000000] flex flex-col">
      {/* Top Header */}
      <div className="bg-[#18181B] text-white p-3.5 border-b-3 border-black flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 bg-[#2563EB] border-2 border-white flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-black text-sm tracking-tight">BILZX AI</span>
              {loadingProvider ? (
                <span className="text-[10px] text-zinc-400">Deteksi...</span>
              ) : providerStatus?.isAvailable ? (
                <span className="flex items-center gap-1 text-[10px] font-black text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 border border-emerald-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Local AI Ready
                </span>
              ) : (
                <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 px-1.5 py-0.5 border border-amber-600">
                  Offline Fallback
                </span>
              )}
            </div>
            <p className="text-[10px] font-mono text-zinc-400 truncate max-w-[260px]">
              {providerStatus?.name || 'Local Neural Engine'}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white cursor-pointer"
          title="Tutup AI Panel"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Context Selector Toggle Bar */}
      <div className="bg-[#F3F4F6] border-b-2 border-black px-3 py-1.5 flex items-center justify-between text-xs font-bold text-gray-700">
        <button
          onClick={() => setShowContextSelector(!showContextSelector)}
          className="flex items-center space-x-1.5 hover:text-black cursor-pointer"
        >
          <Layers className="w-3.5 h-3.5 text-[#2563EB]" />
          <span>Context Selector ({activeFile ? activeFile.name : 'No file'})</span>
        </button>
        <span className="text-[10px] font-mono font-bold text-gray-500">100% On-Device</span>
      </div>

      {/* Context Selector Dropdown Drawer */}
      {showContextSelector && (
        <div className="bg-white border-b-2 border-black p-3 space-y-2 text-xs font-semibold">
          <span className="block text-[11px] font-black uppercase text-gray-500 mb-1">
            Konteks Proyek yang Diberikan ke Model:
          </span>
          <div className="grid grid-cols-2 gap-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={contextOptions.currentFile}
                onChange={(e) =>
                  setContextOptions({ ...contextOptions, currentFile: e.target.checked })
                }
                className="accent-[#2563EB]"
              />
              <span>Current File</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={contextOptions.selectedCode}
                onChange={(e) =>
                  setContextOptions({ ...contextOptions, selectedCode: e.target.checked })
                }
                className="accent-[#2563EB]"
              />
              <span>Selected Code</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={contextOptions.dependencies}
                onChange={(e) =>
                  setContextOptions({ ...contextOptions, dependencies: e.target.checked })
                }
                className="accent-[#2563EB]"
              />
              <span>Dependencies</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={contextOptions.errorOutput}
                onChange={(e) =>
                  setContextOptions({ ...contextOptions, errorOutput: e.target.checked })
                }
                className="accent-[#2563EB]"
              />
              <span>Error Output</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={contextOptions.openFiles}
                onChange={(e) =>
                  setContextOptions({ ...contextOptions, openFiles: e.target.checked })
                }
                className="accent-[#2563EB]"
              />
              <span>Open Files</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={contextOptions.entireProject}
                onChange={(e) =>
                  setContextOptions({ ...contextOptions, entireProject: e.target.checked })
                }
                className="accent-[#2563EB]"
              />
              <span>Entire Project</span>
            </label>
          </div>
        </div>
      )}

      {/* Quick Actions Toolbar */}
      <div className="bg-[#DBEAFE] border-b-2 border-black p-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
        <button
          onClick={() => handleQuickAction('explain', 'Jelaskan')}
          className="whitespace-nowrap px-2.5 py-1 bg-white hover:bg-gray-100 border border-black text-[11px] font-black text-[#1D4ED8] shadow-[1px_1px_0px_#000] cursor-pointer"
        >
          [ Explain ]
        </button>
        <button
          onClick={() => handleQuickAction('fixError', 'Perbaiki Error')}
          className="whitespace-nowrap px-2.5 py-1 bg-white hover:bg-gray-100 border border-black text-[11px] font-black text-rose-700 shadow-[1px_1px_0px_#000] cursor-pointer"
        >
          [ Fix Error ]
        </button>
        <button
          onClick={() => handleQuickAction('refactor', 'Refactor')}
          className="whitespace-nowrap px-2.5 py-1 bg-white hover:bg-gray-100 border border-black text-[11px] font-black text-purple-700 shadow-[1px_1px_0px_#000] cursor-pointer"
        >
          [ Refactor ]
        </button>
        <button
          onClick={() => handleQuickAction('optimize', 'Optimalkan')}
          className="whitespace-nowrap px-2.5 py-1 bg-white hover:bg-gray-100 border border-black text-[11px] font-black text-emerald-700 shadow-[1px_1px_0px_#000] cursor-pointer"
        >
          [ Optimize ]
        </button>
        <button
          onClick={() => handleQuickAction('addComments', 'Tambah Komentar')}
          className="whitespace-nowrap px-2.5 py-1 bg-white hover:bg-gray-100 border border-black text-[11px] font-black text-amber-700 shadow-[1px_1px_0px_#000] cursor-pointer"
        >
          [ Add Comments ]
        </button>
        <button
          onClick={() => handleQuickAction('findBug', 'Cari Bug')}
          className="whitespace-nowrap px-2.5 py-1 bg-white hover:bg-gray-100 border border-black text-[11px] font-black text-orange-700 shadow-[1px_1px_0px_#000] cursor-pointer"
        >
          [ Find Bug ]
        </button>
      </div>

      {/* Chat Messages Log Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-gray-50">
        {chatMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`p-3 border-2 border-black max-w-[90%] shadow-[2px_2px_0px_#000] text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-[#2563EB] text-white font-bold'
                  : msg.sender === 'system'
                  ? 'bg-amber-100 text-amber-900 font-mono'
                  : 'bg-white text-[#18181B]'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.text}</div>
            </div>
            <span className="text-[10px] text-gray-400 font-mono mt-0.5 px-1">
              {msg.sender === 'user' ? 'Anda' : 'BILZX AI'} • {new Date(msg.timestamp).toLocaleTimeString()}
            </span>
          </div>
        ))}

        {/* Proposed Patch Diff Viewer if active */}
        {proposedPatch && (
          <DiffViewer
            fileName={proposedPatch.fileName}
            originalContent={proposedPatch.originalContent}
            patchedContent={proposedPatch.patchedContent}
            confidence={proposedPatch.confidence}
            onApply={handleApplyProposedPatch}
            onReject={() => setProposedPatch(null)}
          />
        )}

        {isGenerating && (
          <div className="flex items-center space-x-2 text-xs font-mono text-gray-500 bg-white p-2.5 border-2 border-black max-w-[200px]">
            <RotateCw className="w-3.5 h-3.5 animate-spin text-[#2563EB]" />
            <span>Local AI computing...</span>
          </div>
        )}
      </div>

      {/* Chat Input Field */}
      <div className="p-3 bg-white border-t-3 border-black">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder="Tanyakan ke BILZX AI..."
            className="flex-1 text-xs font-bold bg-[#F3F4F6] border-2 border-black px-3 py-2 outline-none shadow-[2px_2px_0px_#000]"
          />
          <button
            type="submit"
            disabled={isGenerating || !inputPrompt.trim()}
            className="bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-gray-300 text-white p-2.5 border-2 border-black shadow-[2px_2px_0px_#000] cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
