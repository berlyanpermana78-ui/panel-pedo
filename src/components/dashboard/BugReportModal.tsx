import React, { useState } from 'react';
import {
  Bug,
  Send,
  MessageSquare,
  Mail,
  X,
  ShieldCheck,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react';
import { Project, ExecutionState, UserBugReport } from '../../types';
import {
  generateDiagnosticId,
  compileDiagnosticReport,
  SUPPORT_CONTACTS,
  createWhatsAppReportUrl,
  createEmailReportUrl,
} from '../../lib/diagnostics/reporter';

interface BugReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project?: Project;
  executionState?: ExecutionState;
}

export const BugReportModal: React.FC<BugReportModalProps> = ({
  isOpen,
  onClose,
  project,
  executionState,
}) => {
  const [diagnosticId] = useState<string>(() => generateDiagnosticId());
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [stepsToReproduce, setStepsToReproduce] = useState('');
  const [expectedResult, setExpectedResult] = useState('');
  const [actualResult, setActualResult] = useState('');
  const [severity, setSeverity] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium');

  const [attachDiagnostics, setAttachDiagnostics] = useState(true);
  const [includeConsoleLogs, setIncludeConsoleLogs] = useState(true);
  const [includeProjectMetadata, setIncludeProjectMetadata] = useState(true);

  const [copiedReport, setCopiedReport] = useState(false);

  if (!isOpen) return null;

  const currentReport: UserBugReport = {
    diagnosticId,
    title,
    description,
    stepsToReproduce,
    expectedResult,
    actualResult,
    severity,
    attachDiagnostics,
    includeConsoleLogs,
    includeProjectMetadata,
  };

  const compiledText = compileDiagnosticReport({
    report: currentReport,
    project: includeProjectMetadata ? project : undefined,
    executionState: includeConsoleLogs ? executionState : undefined,
  });

  const handleCopyReport = () => {
    navigator.clipboard.writeText(compiledText);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  const handleOpenWhatsApp = (num: string) => {
    const url = createWhatsAppReportUrl(num, compiledText);
    window.open(url, '_blank');
  };

  const handleOpenEmail = () => {
    const url = createEmailReportUrl(title, compiledText);
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-2xl bg-white border-3 border-black shadow-[8px_8px_0px_#000000] flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-[#18181B] text-white p-4 border-b-2 border-black flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 bg-rose-600 border-2 border-white flex items-center justify-center shadow-[2px_2px_0px_#000]">
              <Bug className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-black text-base leading-none">Laporkan Bug / Kendala</h3>
                <span className="font-mono text-[10px] bg-zinc-800 text-yellow-400 px-1.5 py-0.5 border border-zinc-700">
                  {diagnosticId}
                </span>
              </div>
              <p className="text-[11px] font-mono text-zinc-400 mt-0.5">
                Bantuan Cepat Developer Support BilzxDev
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-zinc-800 border border-transparent hover:border-zinc-700 text-zinc-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security / Sanitization Notice */}
        <div className="bg-[#DBEAFE] border-b-2 border-black px-4 py-2 flex items-center justify-between text-xs font-bold text-[#1D4ED8]">
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>Sanitasi Otomatis: API Key, token, dan secrets disamarkan secara otomatis.</span>
          </div>
          <button
            onClick={handleCopyReport}
            className="flex items-center space-x-1 bg-white hover:bg-gray-100 text-[#18181B] px-2 py-0.5 border border-black shadow-[1px_1px_0px_#000] cursor-pointer"
          >
            {copiedReport ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
            <span>{copiedReport ? 'Tersalin' : 'Salin Laporan'}</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-gray-50">
          <div>
            <label className="block text-xs font-black text-[#18181B] mb-1">
              Judul Masalah:
            </label>
            <input
              type="text"
              placeholder="Contoh: Eksekusi Python timeout pada loop array"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white border-2 border-black px-2.5 py-1.5 text-xs font-bold outline-none shadow-[1px_1px_0px_#000]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black text-[#18181B] mb-1">
                Tingkat Keparahan (Severity):
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as any)}
                className="w-full bg-white border-2 border-black px-2.5 py-1.5 text-xs font-bold outline-none shadow-[1px_1px_0px_#000]"
              >
                <option value="Low">Low (Minor / UI Glitch)</option>
                <option value="Medium">Medium (Fungsi Terganggu)</option>
                <option value="High">High (Runtime Error)</option>
                <option value="Critical">Critical (Sistem Macet)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-[#18181B] mb-1">
                Diagnostic ID:
              </label>
              <input
                type="text"
                readOnly
                value={diagnosticId}
                className="w-full bg-gray-200 border-2 border-black px-2.5 py-1.5 text-xs font-mono font-bold text-gray-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-[#18181B] mb-1">
              Deskripsi Kendala:
            </label>
            <textarea
              rows={2}
              placeholder="Jelaskan apa yang terjadi saat bug muncul..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white border-2 border-black p-2 text-xs font-medium outline-none shadow-[1px_1px_0px_#000]"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-[#18181B] mb-1">
              Langkah untuk Mereproduksi (Steps to Reproduce):
            </label>
            <textarea
              rows={2}
              placeholder="1. Buat file baru&#10;2. Jalankan perintah..."
              value={stepsToReproduce}
              onChange={(e) => setStepsToReproduce(e.target.value)}
              className="w-full bg-white border-2 border-black p-2 text-xs font-medium outline-none shadow-[1px_1px_0px_#000]"
            />
          </div>

          {/* Privacy & Attachment Options */}
          <div className="p-3 bg-white border-2 border-black space-y-2 text-xs font-bold text-gray-700">
            <span className="block text-[11px] font-black uppercase text-gray-500">
              Opsi Data Diagnostik (Aman & Tervalidasi):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={attachDiagnostics}
                  onChange={(e) => setAttachDiagnostics(e.target.checked)}
                  className="accent-[#2563EB]"
                />
                <span>Attach Diagnostics</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeConsoleLogs}
                  onChange={(e) => setIncludeConsoleLogs(e.target.checked)}
                  className="accent-[#2563EB]"
                />
                <span>Include Console Logs</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeProjectMetadata}
                  onChange={(e) => setIncludeProjectMetadata(e.target.checked)}
                  className="accent-[#2563EB]"
                />
                <span>Include Project Metadata</span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer Actions: WhatsApp & Email Direct Buttons */}
        <div className="bg-[#F3F4F6] border-t-2 border-black p-3.5 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2">
            {/* WhatsApp Support Button 1 */}
            <button
              onClick={() => handleOpenWhatsApp(SUPPORT_CONTACTS.whatsapp1.number)}
              className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-3.5 py-2 border-2 border-black shadow-[2px_2px_0px_#000] cursor-pointer active:translate-x-[1px] active:translate-y-[1px]"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp (CS 1)</span>
            </button>

            {/* WhatsApp Support Button 2 */}
            <button
              onClick={() => handleOpenWhatsApp(SUPPORT_CONTACTS.whatsapp2.number)}
              className="flex items-center space-x-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs px-3.5 py-2 border-2 border-black shadow-[2px_2px_0px_#000] cursor-pointer active:translate-x-[1px] active:translate-y-[1px]"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp (CS 2)</span>
            </button>

            {/* Email Support Button */}
            <button
              onClick={handleOpenEmail}
              className="flex items-center space-x-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-black text-xs px-3.5 py-2 border-2 border-black shadow-[2px_2px_0px_#000] cursor-pointer active:translate-x-[1px] active:translate-y-[1px]"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email Support</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="bg-white hover:bg-gray-100 font-bold text-xs px-4 py-2 border-2 border-black shadow-[1px_1px_0px_#000] cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
