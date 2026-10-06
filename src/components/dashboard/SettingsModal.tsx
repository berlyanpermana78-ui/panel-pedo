import React, { useState, useEffect } from 'react';
import {
  Settings,
  X,
  Cpu,
  Monitor,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
} from 'lucide-react';
import { EditorSettings, SystemRuntimes, RuntimeInfo, ApiErrorInfo } from '../../types';
import { apiRequest, describeApiError } from '../../lib/api-client';
import { DEFAULT_SETTINGS } from '../../lib/storage';

const RUNTIME_ROWS: Array<{ key: 'node' | 'typescript' | 'python' | 'java' | 'c' | 'cpp' | 'sql'; label: string }> = [
  { key: 'node', label: 'Node.js Runtime' },
  { key: 'typescript', label: 'TypeScript Runtime' },
  { key: 'python', label: 'Python Runtime' },
  { key: 'java', label: 'Java Runtime' },
  { key: 'c', label: 'C Compiler' },
  { key: 'cpp', label: 'C++ Compiler' },
  { key: 'sql', label: 'SQL (SQLite)' },
];

const STATE_LABEL = {
  available: 'Available',
  unavailable: 'Unavailable',
  unsupported: 'Unsupported in this deployment',
} as const;

const STATE_STYLE = {
  available: 'bg-emerald-100 text-emerald-800 border-emerald-600',
  unavailable: 'bg-amber-100 text-amber-800 border-amber-600',
  unsupported: 'bg-rose-100 text-rose-800 border-rose-600',
} as const;

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: EditorSettings;
  onUpdateSettings: (newSettings: EditorSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  const [runtimes, setRuntimes] = useState<SystemRuntimes | null>(null);
  const [loadingRuntimes, setLoadingRuntimes] = useState(false);
  const [runtimeError, setRuntimeError] = useState<ApiErrorInfo | null>(null);

  const fetchRuntimes = async () => {
    setLoadingRuntimes(true);
    setRuntimeError(null);
    try {
      const data = await apiRequest<SystemRuntimes>('/api/runtimes', { timeoutMs: 20000 });
      setRuntimes(data);
    } catch (err) {
      setRuntimes(null);
      setRuntimeError(describeApiError(err));
    } finally {
      setLoadingRuntimes(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchRuntimes();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-lg bg-white border-3 border-black shadow-[8px_8px_0px_#000000] flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="bg-[#DBEAFE] border-b-2 border-black p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 bg-[#2563EB] text-white border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000]">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-base text-[#18181B] leading-none">
                Pengaturan Workspace & Runtime
              </h3>
              <p className="text-[11px] font-bold text-gray-600 mt-0.5">
                Konfigurasi editor dan status lingkungan eksekusi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white border-2 border-transparent hover:border-black rounded-xs cursor-pointer text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Section 1: Editor Preferences */}
          <div>
            <div className="flex items-center justify-between mb-3 pb-1 border-b-2 border-black">
              <span className="text-xs font-black text-[#18181B] uppercase tracking-wider">
                Preferensi Editor Monaco
              </span>
              <button
                onClick={() => onUpdateSettings(DEFAULT_SETTINGS)}
                className="text-[10px] font-bold text-gray-500 hover:text-black flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Default</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-bold">
              {/* Theme */}
              <div>
                <label className="block text-gray-700 mb-1">Tema Editor</label>
                <select
                  value={settings.theme}
                  onChange={(e) =>
                    onUpdateSettings({ ...settings, theme: e.target.value as any })
                  }
                  className="w-full bg-[#F3F4F6] border-2 border-black p-1.5 outline-none shadow-[2px_2px_0px_#000]"
                >
                  <option value="neo-dark">Neo Dark (Default)</option>
                  <option value="neo-light">Neo Light</option>
                  <option value="vs-dark">VS Code Dark</option>
                  <option value="light">VS Code Light</option>
                </select>
              </div>

              {/* Font Size */}
              <div>
                <label className="block text-gray-700 mb-1">Ukuran Font ({settings.fontSize}px)</label>
                <input
                  type="range"
                  min="11"
                  max="20"
                  value={settings.fontSize}
                  onChange={(e) =>
                    onUpdateSettings({ ...settings, fontSize: Number(e.target.value) })
                  }
                  className="w-full mt-2 cursor-pointer accent-[#2563EB]"
                />
              </div>

              {/* Tab Size */}
              <div>
                <label className="block text-gray-700 mb-1">Ukuran Tab Spasi</label>
                <select
                  value={settings.tabSize}
                  onChange={(e) =>
                    onUpdateSettings({ ...settings, tabSize: Number(e.target.value) })
                  }
                  className="w-full bg-[#F3F4F6] border-2 border-black p-1.5 outline-none shadow-[2px_2px_0px_#000]"
                >
                  <option value={2}>2 Spasi</option>
                  <option value={4}>4 Spasi</option>
                </select>
              </div>

              {/* Word Wrap */}
              <div>
                <label className="block text-gray-700 mb-1">Word Wrap</label>
                <select
                  value={settings.wordWrap}
                  onChange={(e) =>
                    onUpdateSettings({ ...settings, wordWrap: e.target.value as any })
                  }
                  className="w-full bg-[#F3F4F6] border-2 border-black p-1.5 outline-none shadow-[2px_2px_0px_#000]"
                >
                  <option value="on">Aktif</option>
                  <option value="off">Nonaktif</option>
                </select>
              </div>

              {/* Minimap */}
              <div>
                <label className="block text-gray-700 mb-1">Minimap Code</label>
                <select
                  value={settings.minimap ? 'yes' : 'no'}
                  onChange={(e) =>
                    onUpdateSettings({ ...settings, minimap: e.target.value === 'yes' })
                  }
                  className="w-full bg-[#F3F4F6] border-2 border-black p-1.5 outline-none shadow-[2px_2px_0px_#000]"
                >
                  <option value="no">Nonaktif (Ringan)</option>
                  <option value="yes">Aktif</option>
                </select>
              </div>

              {/* Line Numbers */}
              <div>
                <label className="block text-gray-700 mb-1">Nomor Baris</label>
                <select
                  value={settings.lineNumbers}
                  onChange={(e) =>
                    onUpdateSettings({ ...settings, lineNumbers: e.target.value as any })
                  }
                  className="w-full bg-[#F3F4F6] border-2 border-black p-1.5 outline-none shadow-[2px_2px_0px_#000]"
                >
                  <option value="on">Tampilkan</option>
                  <option value="off">Sembunyikan</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Runtime Diagnostic */}
          <div>
            <div className="flex items-center justify-between mb-3 pb-1 border-b-2 border-black">
              <span className="text-xs font-black text-[#18181B] uppercase tracking-wider">
                Status Runtime Server
              </span>
              <button
                onClick={fetchRuntimes}
                disabled={loadingRuntimes}
                className="text-[10px] font-bold text-[#2563EB] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCw className={`w-3 h-3 ${loadingRuntimes ? 'animate-spin' : ''}`} />
                <span>Cek Ulang</span>
              </button>
            </div>

            {loadingRuntimes && !runtimes ? (
              <div className="text-xs font-mono text-gray-500 py-3 text-center">
                Memeriksa runtime server...
              </div>
            ) : runtimeError ? (
              <div className="p-3 bg-rose-50 border-2 border-rose-600 text-xs text-rose-800 space-y-1">
                <p className="font-black uppercase">Runtime Server Error</p>
                <p className="break-words">{runtimeError.message}</p>
                <p className="font-mono text-[11px] text-rose-700">
                  {runtimeError.endpoint ? `Endpoint: ${runtimeError.endpoint}` : ''}
                  {runtimeError.status !== null ? ` · HTTP ${runtimeError.status}` : ''}
                  {runtimeError.requestId ? ` · ID: ${runtimeError.requestId}` : ''}
                </p>
              </div>
            ) : runtimes ? (
              <div className="space-y-2 text-xs">
                {runtimes.server && (
                  <div className="p-3 bg-[#DBEAFE] border-2 border-black flex items-center justify-between">
                    <div>
                      <span className="font-black text-[#18181B] block">Runtime Server</span>
                      <span className="font-mono text-gray-600 text-[11px]">
                        {runtimes.server.platform === 'vercel' ? 'Vercel Serverless' : 'Self-hosted'} · penyimpanan{' '}
                        {runtimes.server.persistence === 'ephemeral' ? 'sementara (ephemeral)' : 'persisten'}
                      </span>
                    </div>
                    <span className="bg-white text-[#18181B] text-[10px] font-black uppercase px-2 py-0.5 border border-black">
                      {runtimes.server.status}
                    </span>
                  </div>
                )}

                {RUNTIME_ROWS.map(({ key, label }) => {
                  const info = runtimes[key] as RuntimeInfo | undefined;
                  if (!info) return null;
                  const state = info.state ?? (info.available ? 'available' : 'unavailable');
                  return (
                    <div key={key} className="p-3 bg-[#F3F4F6] border-2 border-black flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <span className="font-black text-[#18181B] block">{label}</span>
                        <span className="font-mono text-gray-500 text-[11px] break-words">
                          {info.available ? `Versi: ${info.version ?? '-'}` : info.message || 'Tidak terdeteksi di server ini'}
                        </span>
                      </div>
                      <span className={`shrink-0 text-[10px] font-black uppercase px-2 py-0.5 border ${STATE_STYLE[state]}`}>
                        {STATE_LABEL[state]}
                      </span>
                    </div>
                  );
                })}

                {/* HTML Sandbox */}
                <div className="p-3 bg-[#F3F4F6] border-2 border-black flex items-center justify-between">
                  <div>
                    <span className="font-black text-[#18181B] block">HTML Sandbox Preview</span>
                    <span className="font-mono text-gray-500 text-[11px]">
                      Client-side sandboxed iframe
                    </span>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-2 py-0.5 border border-emerald-600">
                    Available
                  </span>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#F3F4F6] border-t-2 border-black p-3 flex justify-end">
          <button
            onClick={onClose}
            className="bg-white hover:bg-gray-100 font-black text-xs px-4 py-1.5 border-2 border-black shadow-[2px_2px_0px_#000] cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
