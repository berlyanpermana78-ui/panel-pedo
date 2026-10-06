import React, { useState, useEffect } from 'react';
import { apiRequest, ApiError } from '../../lib/api-client';
import {
  Package,
  Search,
  Download,
  Trash2,
  RotateCw,
  X,
  CheckCircle2,
  AlertCircle,
  FileText,
  Terminal,
  ExternalLink,
} from 'lucide-react';
import { Project } from '../../types';

interface PackageManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
}

interface PackageItem {
  name: string;
  version: string;
  summary?: string;
}

export const PackageManagerModal: React.FC<PackageManagerModalProps> = ({
  isOpen,
  onClose,
  project,
}) => {
  const [activeTab, setActiveTab] = useState<'installed' | 'search' | 'requirements'>('installed');
  const [installedPackages, setInstalledPackages] = useState<PackageItem[]>([]);
  const [searchResults, setSearchResults] = useState<PackageItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [requirementsContent, setRequirementsContent] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isInstalling, setIsInstalling] = useState<string | null>(null);
  const [isUninstalling, setIsUninstalling] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [terminalLog, setTerminalLog] = useState('');

  // Fetch installed packages
  const fetchInstalledPackages = async () => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const data = await apiRequest<{ available: boolean; packages: PackageItem[]; message?: string }>(
        '/api/python/packages',
        { query: { projectId: project.id }, timeoutMs: 30000 }
      );
      if (data.available === false && data.message) {
        setStatusMessage({ type: 'info', text: data.message });
      }
      setInstalledPackages(data.packages || []);
    } catch (e: any) {
      setStatusMessage({ type: 'error', text: `Gagal menghubungi server untuk daftar package. ${e?.message || ''}`.trim() });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch requirements.txt
  const fetchRequirements = async () => {
    try {
      const data = await apiRequest<{ content: string }>('/api/python/requirements', {
        query: { projectId: project.id },
      });
      setRequirementsContent(data.content || '');
    } catch {
      // ignore
    }
  };

  // Search PyPI
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setStatusMessage(null);
    try {
      const data = await apiRequest<{ packages: PackageItem[] }>('/api/python/search', {
        query: { q: searchQuery.trim() },
        timeoutMs: 20000,
      });
      setSearchResults(data.packages || []);
      if (!data.packages || data.packages.length === 0) {
        setStatusMessage({ type: 'info', text: `Tidak ada hasil untuk "${searchQuery}". Coba nama library umum.` });
      }
    } catch (e: any) {
      setStatusMessage({ type: 'error', text: `Pencarian PyPI gagal. ${e?.message || ''}`.trim() });
    } finally {
      setIsLoading(false);
    }
  };

  // Install Package
  const handleInstall = async (pkgName: string) => {
    setIsInstalling(pkgName);
    setStatusMessage(null);
    setTerminalLog(`Running: python -m pip install ${pkgName}...\n`);

    try {
      const data = await apiRequest<{ output?: string }>('/api/python/install', {
        method: 'POST',
        body: { projectId: project.id, package: pkgName },
        timeoutMs: 180000,
      });
      setStatusMessage({ type: 'success', text: `Berhasil menginstal ${pkgName}!` });
      setTerminalLog((prev) => prev + (data.output || 'Installation completed successfully.\n'));
      fetchInstalledPackages();
      fetchRequirements();
    } catch (err: any) {
      const detail = err instanceof ApiError && typeof err.details === 'string' ? err.details : '';
      setStatusMessage({ type: 'error', text: err?.message || 'Gagal menginstal package.' });
      setTerminalLog((prev) => prev + `[ERROR]: ${err?.message || 'Failed'}\n${detail ? detail + '\n' : ''}`);
    } finally {
      setIsInstalling(null);
    }
  };

  // Uninstall Package
  const handleUninstall = async (pkgName: string) => {
    if (!confirm(`Hapus package "${pkgName}" dari environment project ini?`)) return;

    setIsUninstalling(pkgName);
    setStatusMessage(null);
    setTerminalLog(`Running: python -m pip uninstall -y ${pkgName}...\n`);

    try {
      const data = await apiRequest<{ output?: string }>('/api/python/uninstall', {
        method: 'POST',
        body: { projectId: project.id, package: pkgName },
        timeoutMs: 60000,
      });
      setStatusMessage({ type: 'success', text: `Berhasil mencopot ${pkgName}.` });
      setTerminalLog((prev) => prev + (data.output || 'Uninstalled successfully.\n'));
      fetchInstalledPackages();
      fetchRequirements();
    } catch (e: any) {
      setStatusMessage({ type: 'error', text: e?.message || 'Gagal uninstall package.' });
    } finally {
      setIsUninstalling(null);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchInstalledPackages();
      fetchRequirements();
    }
  }, [isOpen, project.id]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-2xl bg-white border-3 border-black shadow-[8px_8px_0px_#000000] flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="bg-[#DBEAFE] border-b-2 border-black p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 bg-[#2563EB] text-white border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000]">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-base text-[#18181B] leading-none">
                Python Package Manager
              </h3>
              <p className="text-[11px] font-bold text-gray-600 mt-0.5">
                Project Environment: <span className="font-mono text-[#1D4ED8]">{project.name}</span>
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

        {/* Modal Navigation Tabs */}
        <div className="flex border-b-2 border-black bg-gray-100 text-xs font-black">
          <button
            onClick={() => setActiveTab('installed')}
            className={`flex-1 py-2.5 px-3 border-r-2 border-black cursor-pointer text-center ${
              activeTab === 'installed' ? 'bg-white text-[#2563EB] shadow-xs' : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            Terpasang ({installedPackages.length})
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`flex-1 py-2.5 px-3 border-r-2 border-black cursor-pointer text-center ${
              activeTab === 'search' ? 'bg-white text-[#2563EB] shadow-xs' : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            Cari PyPI
          </button>
          <button
            onClick={() => setActiveTab('requirements')}
            className={`flex-1 py-2.5 px-3 cursor-pointer text-center ${
              activeTab === 'requirements' ? 'bg-white text-[#2563EB] shadow-xs' : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            requirements.txt
          </button>
        </div>

        {/* Status Alert Banner */}
        {statusMessage && (
          <div
            className={`px-4 py-2 border-b-2 border-black text-xs font-bold flex items-center justify-between ${
              statusMessage.type === 'error'
                ? 'bg-rose-100 text-rose-900'
                : statusMessage.type === 'success'
                ? 'bg-emerald-100 text-emerald-900'
                : 'bg-blue-100 text-blue-900'
            }`}
          >
            <span>{statusMessage.text}</span>
            <button onClick={() => setStatusMessage(null)} className="font-mono text-xs">
              ✕
            </button>
          </div>
        )}

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* TAB 1: INSTALLED PACKAGES */}
          {activeTab === 'installed' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase">
                  Daftar Pustaka di Environment Project
                </span>
                <button
                  onClick={fetchInstalledPackages}
                  disabled={isLoading}
                  className="flex items-center space-x-1 text-xs font-black bg-white hover:bg-gray-100 px-2.5 py-1 border-2 border-black shadow-[1px_1px_0px_#000] cursor-pointer"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>

              {isLoading && installedPackages.length === 0 ? (
                <div className="text-center py-10 text-gray-500 text-xs font-bold">
                  <RotateCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#2563EB]" />
                  <span>Memeriksa paket Python di server...</span>
                </div>
              ) : installedPackages.length === 0 ? (
                <div className="p-8 text-center bg-gray-50 border-2 border-dashed border-gray-300">
                  <Package className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="font-black text-sm text-[#18181B]">Belum ada package khusus terpasang</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Gunakan tab "Cari PyPI" untuk mencari dan menginstal package (misal: requests, numpy, beautifulsoup4).
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {installedPackages.map((pkg) => (
                    <div
                      key={pkg.name}
                      className="bg-white border-2 border-black p-3 flex items-center justify-between shadow-[2px_2px_0px_#000]"
                    >
                      <div>
                        <span className="font-mono font-black text-sm text-[#18181B]">{pkg.name}</span>
                        <span className="ml-2 text-xs font-mono font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 border border-black">
                          v{pkg.version}
                        </span>
                      </div>
                      <button
                        onClick={() => handleUninstall(pkg.name)}
                        disabled={isUninstalling === pkg.name}
                        className="flex items-center space-x-1 text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 px-2.5 py-1 border border-rose-300 cursor-pointer"
                      >
                        {isUninstalling === pkg.name ? (
                          <RotateCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                        <span>Uninstall</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SEARCH PYPI */}
          {activeTab === 'search' && (
            <div className="space-y-4">
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari package di PyPI (misal: requests, pandas, rich)..."
                    className="w-full bg-[#F3F4F6] border-2 border-black pl-9 pr-3 py-2 text-xs font-bold outline-none shadow-[2px_2px_0px_#000]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-black text-xs px-4 py-2 border-2 border-black shadow-[2px_2px_0px_#000] cursor-pointer"
                >
                  {isLoading ? 'Mencari...' : 'Cari'}
                </button>
              </form>

              {/* Search Results */}
              <div className="space-y-2">
                {searchResults.map((pkg) => {
                  const isAlreadyInstalled = installedPackages.some(
                    (ip) => ip.name.toLowerCase() === pkg.name.toLowerCase()
                  );

                  return (
                    <div
                      key={pkg.name}
                      className="bg-white border-2 border-black p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[2px_2px_0px_#000]"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-black text-sm text-[#18181B]">{pkg.name}</span>
                          <span className="text-xs font-bold text-gray-500">v{pkg.version}</span>
                        </div>
                        <p className="text-xs text-gray-600 font-semibold mt-1">
                          {pkg.summary || 'PyPI Python package library'}
                        </p>
                      </div>

                      <div className="shrink-0">
                        {isAlreadyInstalled ? (
                          <span className="inline-flex items-center space-x-1 text-xs font-black text-emerald-800 bg-emerald-100 px-3 py-1.5 border border-emerald-500">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Terpasang</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => handleInstall(pkg.name)}
                            disabled={isInstalling === pkg.name}
                            className="w-full sm:w-auto flex items-center justify-center space-x-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-black text-xs px-3.5 py-1.5 border-2 border-black shadow-[2px_2px_0px_#000] cursor-pointer active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                          >
                            {isInstalling === pkg.name ? (
                              <>
                                <RotateCw className="w-3.5 h-3.5 animate-spin" />
                                <span>Menginstal...</span>
                              </>
                            ) : (
                              <>
                                <Download className="w-3.5 h-3.5" />
                                <span>Install</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: REQUIREMENTS.TXT */}
          {activeTab === 'requirements' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase">
                  Konten requirements.txt Project
                </span>
                <span className="text-[11px] font-mono text-gray-400">Otomatis tersinkronisasi</span>
              </div>
              <pre className="bg-[#18181B] text-emerald-400 p-3 font-mono text-xs border-2 border-black shadow-[2px_2px_0px_#000] min-h-[140px] whitespace-pre-wrap">
                {requirementsContent || '# requirements.txt kosong'}
              </pre>
            </div>
          )}

          {/* Terminal Pip Logs */}
          {terminalLog && (
            <div className="mt-4 pt-4 border-t-2 border-black">
              <div className="flex items-center space-x-1.5 mb-1.5 text-xs font-mono font-bold text-gray-700">
                <Terminal className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>Pip Action Log</span>
              </div>
              <pre className="bg-[#18181B] text-gray-300 p-2.5 font-mono text-[11px] border border-black max-h-32 overflow-y-auto whitespace-pre-wrap">
                {terminalLog}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-[#F3F4F6] border-t-2 border-black p-3 flex items-center justify-between">
          <span className="text-[11px] font-semibold text-gray-500">
            Eksekusi aman: <code className="font-mono font-bold">python -m pip</code> per-project
          </span>
          <button
            onClick={onClose}
            className="bg-white hover:bg-gray-100 font-extrabold text-xs px-4 py-1.5 border-2 border-black shadow-[2px_2px_0px_#000] cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
