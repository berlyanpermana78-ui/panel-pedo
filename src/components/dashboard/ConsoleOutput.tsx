import React, { useState } from 'react';
import {
  Terminal,
  Copy,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  RotateCw,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';
import { ExecutionState } from '../../types';

interface ConsoleOutputProps {
  executionState: ExecutionState;
  onClearConsole: () => void;
  onFixWithAI?: () => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export const ConsoleOutput: React.FC<ConsoleOutputProps> = ({
  executionState,
  onClearConsole,
  onFixWithAI,
  isExpanded = false,
  onToggleExpand,
}) => {
  const [copied, setCopied] = useState(false);
  const [filter, setFilter] = useState<'all' | 'stdout' | 'stderr'>('all');

  const handleCopy = () => {
    const textToCopy = `[STATUS]: ${executionState.status}\n[EXIT CODE]: ${executionState.exitCode}\n[DURATION]: ${executionState.duration}ms\n\n--- STDOUT ---\n${executionState.stdout}\n\n--- STDERR ---\n${executionState.stderr}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = () => {
    switch (executionState.status) {
      case 'Running':
        return (
          <span className="flex items-center space-x-1.5 bg-amber-400 text-black text-[10px] font-black uppercase px-2 py-0.5 border border-black shadow-[1px_1px_0px_#000]">
            <RotateCw className="w-3 h-3 animate-spin" />
            <span>RUNNING</span>
          </span>
        );
      case 'Success':
        return (
          <span className="flex items-center space-x-1.5 bg-emerald-400 text-black text-[10px] font-black uppercase px-2 py-0.5 border border-black shadow-[1px_1px_0px_#000]">
            <CheckCircle2 className="w-3 h-3" />
            <span>SUCCESS</span>
          </span>
        );
      case 'Error':
        return (
          <span className="flex items-center space-x-1.5 bg-rose-500 text-white text-[10px] font-black uppercase px-2 py-0.5 border border-black shadow-[1px_1px_0px_#000]">
            <AlertCircle className="w-3 h-3" />
            <span>ERROR</span>
          </span>
        );
      case 'Timeout':
        return (
          <span className="flex items-center space-x-1.5 bg-orange-500 text-white text-[10px] font-black uppercase px-2 py-0.5 border border-black shadow-[1px_1px_0px_#000]">
            <Clock className="w-3 h-3" />
            <span>TIMEOUT</span>
          </span>
        );
      case 'Runtime Unavailable':
        return (
          <span className="flex items-center space-x-1.5 bg-amber-500 text-white text-[10px] font-black uppercase px-2 py-0.5 border border-black shadow-[1px_1px_0px_#000]">
            <AlertTriangle className="w-3 h-3" />
            <span>RUNTIME UNAVAILABLE</span>
          </span>
        );
      default:
        return (
          <span className="bg-gray-200 text-gray-800 text-[10px] font-black uppercase px-2 py-0.5 border border-black shadow-[1px_1px_0px_#000]">
            READY
          </span>
        );
    }
  };

  const hasOutput = executionState.stdout || executionState.stderr || executionState.apiError || executionState.status !== 'Ready';

  return (
    <div className="w-full h-full bg-[#18181B] text-white flex flex-col font-mono select-text border-t-3 border-black">
      {/* Console Top Bar */}
      <div className="bg-[#27272A] border-b-2 border-black px-3 py-1.5 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-[#2563EB]" />
          <span className="text-xs font-black uppercase tracking-wider text-gray-200">
            Console / Output
          </span>
          {getStatusBadge()}

          {/* Quick Fix with BILZX AI when error exists */}
          {(executionState.status === 'Error' || executionState.stderr) && !executionState.apiError && onFixWithAI && (
            <button
              onClick={onFixWithAI}
              className="flex items-center space-x-1 bg-amber-400 hover:bg-amber-300 text-black text-[10px] font-black uppercase px-2 py-0.5 border border-black shadow-[1px_1px_0px_#000] cursor-pointer"
              title="Analisis dan perbaiki error ini menggunakan BILZX AI"
            >
              <Sparkles className="w-3 h-3 text-black" />
              <span>Fix with BILZX AI</span>
            </button>
          )}
        </div>

        {/* Execution Metrics (Exit code, Duration) */}
        <div className="flex items-center space-x-3 text-[11px] font-bold text-gray-400">
          {executionState.exitCode !== null && (
            <span className={executionState.exitCode === 0 ? 'text-emerald-400' : 'text-rose-400'}>
              Exit: {executionState.exitCode}
            </span>
          )}
          {executionState.duration > 0 && (
            <span className="text-blue-400">{executionState.duration}ms</span>
          )}

          {/* Filter options */}
          <div className="hidden sm:flex items-center bg-zinc-800 border border-zinc-600 rounded-xs text-[10px] overflow-hidden">
            <button
              onClick={() => setFilter('all')}
              className={`px-1.5 py-0.5 ${filter === 'all' ? 'bg-[#2563EB] text-white font-black' : 'text-gray-400 hover:text-white'}`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('stdout')}
              className={`px-1.5 py-0.5 ${filter === 'stdout' ? 'bg-[#2563EB] text-white font-black' : 'text-gray-400 hover:text-white'}`}
            >
              stdout
            </button>
            <button
              onClick={() => setFilter('stderr')}
              className={`px-1.5 py-0.5 ${filter === 'stderr' ? 'bg-[#2563EB] text-white font-black' : 'text-gray-400 hover:text-white'}`}
            >
              stderr
            </button>
          </div>

          {/* Actions: Copy & Clear */}
          <button
            onClick={handleCopy}
            className="p-1 hover:bg-zinc-700 rounded-xs text-gray-300 hover:text-white cursor-pointer"
            title="Salin Output"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClearConsole}
            className="p-1 hover:bg-zinc-700 rounded-xs text-gray-300 hover:text-rose-400 cursor-pointer"
            title="Bersihkan Console"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {onToggleExpand && (
            <button
              onClick={onToggleExpand}
              className="p-1 hover:bg-zinc-700 rounded-xs text-gray-300 hover:text-white cursor-pointer"
              title={isExpanded ? 'Perkecil Console' : 'Perbesar Console'}
            >
              {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      {/* Console Stream Area */}
      <div className="flex-1 overflow-auto p-3 text-xs leading-relaxed font-mono">
        {!hasOutput ? (
          <div className="h-full flex flex-col items-center justify-center text-zinc-500 py-6">
            <Terminal className="w-8 h-8 mb-2 opacity-40" />
            <p className="font-bold">Belum ada output</p>
            <p className="text-[11px] mt-1 text-zinc-600">
              Tekan RUN atau tekan <kbd className="bg-zinc-800 px-1 py-0.5 text-zinc-300 border border-zinc-700">Ctrl+Enter</kbd> untuk menjalankan kode.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* API / Runtime Server error (bukan error dari kode user) */}
            {executionState.apiError && (
              <div className="border-2 border-rose-500 bg-rose-950/40 p-3 text-rose-200 space-y-1">
                <p className="font-black uppercase text-rose-400 flex items-center space-x-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{executionState.apiError.title}</span>
                </p>
                <p className="break-words">{executionState.apiError.message}</p>
                <dl className="text-[11px] text-rose-300/80 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 pt-1">
                  {executionState.apiError.endpoint && (
                    <>
                      <dt className="font-bold">API endpoint</dt>
                      <dd className="break-all">{executionState.apiError.endpoint}</dd>
                    </>
                  )}
                  {executionState.apiError.status !== null && (
                    <>
                      <dt className="font-bold">HTTP status</dt>
                      <dd>{executionState.apiError.status}</dd>
                    </>
                  )}
                  {executionState.apiError.code && (
                    <>
                      <dt className="font-bold">Code</dt>
                      <dd>{executionState.apiError.code}</dd>
                    </>
                  )}
                  <dt className="font-bold">Diagnostic ID</dt>
                  <dd className="break-all">{executionState.apiError.requestId || '-'}</dd>
                </dl>
              </div>
            )}

            {/* STDOUT */}
            {(filter === 'all' || filter === 'stdout') && executionState.stdout && (
              <pre className="text-zinc-200 whitespace-pre-wrap font-mono break-all selection:bg-blue-600">
                {executionState.stdout}
              </pre>
            )}

            {/* STDERR */}
            {(filter === 'all' || filter === 'stderr') && executionState.stderr && (
              <pre className="text-rose-400 whitespace-pre-wrap font-mono break-all selection:bg-rose-900 border-l-2 border-rose-500 pl-2 my-1">
                {executionState.stderr}
              </pre>
            )}

            {/* Special info for Runtime Unavailable */}
            {executionState.status === 'Runtime Unavailable' && (
              <div className="p-3 bg-amber-950/40 border border-amber-600/50 text-amber-200 text-xs my-2 font-sans">
                <p className="font-black flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Runtime Tidak Tersedia
                </p>
                <p className="mt-1 text-[11px] text-amber-300/90 font-medium">
                  Server tidak menemukan executable runtime yang diminta di sistem host. Silakan periksa konfigurasi runtime atau gunakan Node.js / HTML Preview.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
