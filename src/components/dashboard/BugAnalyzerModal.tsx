import React, { useState } from 'react';
import {
  ShieldAlert,
  Search,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  X,
  History,
  Download,
  Terminal,
  Zap,
  Check,
} from 'lucide-react';
import { Project, BugReportItem, AnalysisReport } from '../../types';
import { analyzeProjectCode } from '../../lib/ai/analyzer';
import { applyBugFixWithVerification, autoRepairMissingDependency, rollbackToSnapshot } from '../../lib/ai/fixer';
import { DiffViewer } from '../ui/DiffViewer';

interface BugAnalyzerModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onUpdateProject: (updated: Project) => void;
}

export const BugAnalyzerModal: React.FC<BugAnalyzerModalProps> = ({
  isOpen,
  onClose,
  project,
  onUpdateProject,
}) => {
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [activePreviewBug, setActivePreviewBug] = useState<BugReportItem | null>(null);
  const [verificationFeedback, setVerificationFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleScanProject = () => {
    setIsScanning(true);
    setVerificationFeedback(null);
    setActivePreviewBug(null);

    setTimeout(() => {
      const results = analyzeProjectCode(project);
      setReport(results);
      setIsScanning(false);
    }, 200);
  };

  const handleApplyFix = (bug: BugReportItem) => {
    const targetFile = project.files.find((f) => f.id === bug.fileId);
    if (!targetFile) return;

    // Generate patched content based on bug
    let patchedContent: string = bug.patchCode ?? '';
    if (!patchedContent) {
      if (bug.type === 'Missing Import' && bug.suggestedFix.includes('import')) {
        patchedContent = `${bug.suggestedFix}\n` + targetFile.content;
      } else {
        patchedContent = targetFile.content; // fallback
      }
    }

    const { updatedProject, verification } = applyBugFixWithVerification({
      project,
      bug,
      patchedFileContent: patchedContent,
    });

    onUpdateProject(updatedProject);
    setVerificationFeedback(verification.message);
    setActivePreviewBug(null);

    // Re-scan updated project
    const newReport = analyzeProjectCode(updatedProject);
    setReport(newReport);
  };

  const handleInstallMissingDependency = (bug: BugReportItem) => {
    const { updatedProject, message } = autoRepairMissingDependency(project, bug);
    onUpdateProject(updatedProject);
    setVerificationFeedback(message);

    // Re-scan
    const newReport = analyzeProjectCode(updatedProject);
    setReport(newReport);
  };

  const handleRollbackLatestSnapshot = () => {
    if (!project.snapshots || project.snapshots.length === 0) {
      alert('Tidak ada snapshot tersimpan untuk dipulihkan.');
      return;
    }
    const latest = project.snapshots[0];
    const restored = rollbackToSnapshot(project, latest.id);
    if (restored) {
      onUpdateProject(restored);
      setVerificationFeedback(`Rollback berhasil dipulihkan ke snapshot: ${latest.description}`);
      setReport(analyzeProjectCode(restored));
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-3xl bg-white border-3 border-black shadow-[8px_8px_0px_#000000] flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-[#18181B] text-white p-4 border-b-2 border-black flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 bg-rose-600 border-2 border-white flex items-center justify-center shadow-[2px_2px_0px_#000]">
              <ShieldAlert className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-black text-base leading-none">BILZX Code Analyzer</h3>
              <p className="text-[11px] font-mono text-zinc-400 mt-0.5">
                Static Analysis • Bug Detection • Auto-Fix Engine
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {project.snapshots && project.snapshots.length > 0 && (
              <button
                onClick={handleRollbackLatestSnapshot}
                className="flex items-center space-x-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold px-2.5 py-1.5 border border-zinc-600 cursor-pointer"
                title="Kembalikan ke snapshot sebelum perbaikan terakhir"
              >
                <History className="w-3.5 h-3.5 text-amber-400" />
                <span>Rollback</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 hover:bg-zinc-800 border border-transparent hover:border-zinc-700 text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scan Action Toolbar */}
        <div className="bg-[#DBEAFE] border-b-2 border-black p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="font-black text-xs text-[#1D4ED8] block">
              Pemeriksaan Integritas Proyek ({project.name})
            </span>
            <span className="text-[11px] font-bold text-gray-600">
              Analisis sintaks, dependensi impor, struktur config, dan potensi runtime error.
            </span>
          </div>

          <button
            onClick={handleScanProject}
            disabled={isScanning}
            className="flex items-center justify-center space-x-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-black px-4 py-2 border-2 border-black shadow-[2px_2px_0px_#000] cursor-pointer active:translate-x-[1px] active:translate-y-[1px]"
          >
            {isScanning ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin" />
                <span>Scanning...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>SCAN PROJECT</span>
              </>
            )}
          </button>
        </div>

        {/* Verification feedback alert */}
        {verificationFeedback && (
          <div className="bg-emerald-50 border-b-2 border-black px-4 py-2 text-xs font-bold text-emerald-900 flex items-center justify-between">
            <span>{verificationFeedback}</span>
            <button onClick={() => setVerificationFeedback(null)} className="font-mono text-xs">
              ✕
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {!report && !isScanning && (
            <div className="text-center py-12 bg-white border-2 border-dashed border-gray-300 p-6">
              <ShieldAlert className="w-10 h-10 text-gray-400 mx-auto mb-2" />
              <p className="font-black text-sm text-[#18181B]">Belum ada hasil scan terbaru</p>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                Tekan tombol **SCAN PROJECT** di atas untuk memeriksa seluruh file dalam ruang kerja Anda.
              </p>
            </div>
          )}

          {report && (
            <div className="space-y-4">
              {/* Summary Banner */}
              <div
                className={`p-3.5 border-2 border-black shadow-[3px_3px_0px_#000] flex items-center justify-between ${
                  report.healthy
                    ? 'bg-emerald-100 text-emerald-950'
                    : 'bg-rose-100 text-rose-950'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  {report.healthy ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-700" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-rose-700" />
                  )}
                  <div>
                    <h4 className="font-black text-sm">{report.summary}</h4>
                    <span className="text-[11px] font-mono">
                      {report.scannedFilesCount} file dipindai • {report.criticalCount} kritis • {report.warningCount} peringatan
                    </span>
                  </div>
                </div>

                {report.healthy && (
                  <span className="bg-emerald-700 text-white text-[10px] font-black uppercase px-2 py-0.5 border border-black">
                    PROJECT HEALTHY
                  </span>
                )}
              </div>

              {/* Diff Preview if selected */}
              {activePreviewBug && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black uppercase text-gray-600">
                      Preview Perbaikan Bug: {activePreviewBug.type} ({activePreviewBug.fileName})
                    </span>
                    <button
                      onClick={() => setActivePreviewBug(null)}
                      className="text-xs text-rose-600 font-bold"
                    >
                      Tutup Preview
                    </button>
                  </div>
                  <DiffViewer
                    fileName={activePreviewBug.fileName}
                    originalContent={activePreviewBug.originalSnippet}
                    patchedContent={activePreviewBug.patchCode || activePreviewBug.suggestedFix}
                    confidence={activePreviewBug.confidence}
                    onApply={() => handleApplyFix(activePreviewBug)}
                    onReject={() => setActivePreviewBug(null)}
                  />
                </div>
              )}

              {/* Bug List */}
              <div className="space-y-3">
                {report.issues.map((bug) => {
                  const targetFile = project.files.find((f) => f.id === bug.fileId);

                  return (
                    <div
                      key={bug.id}
                      className="bg-white border-2 border-black p-4 shadow-[3px_3px_0px_#000] space-y-2.5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-gray-200">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`text-[10px] font-black uppercase px-2 py-0.5 border border-black ${
                              bug.severity === 'critical'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {bug.severity}
                          </span>
                          <span className="font-black text-sm text-[#18181B]">{bug.type}</span>
                          <span className="font-mono text-xs text-gray-500">
                            {bug.fileName}:{bug.line}
                          </span>
                        </div>

                        {/* Confidence score */}
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[10px] font-bold text-gray-500">Confidence:</span>
                          <span
                            className={`text-[10px] font-black px-1.5 py-0.5 border border-black ${
                              bug.confidence >= 90
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {bug.confidence}%
                          </span>
                        </div>
                      </div>

                      <p className="text-xs font-bold text-gray-800">{bug.message}</p>
                      <p className="text-[11px] font-medium text-gray-600">Penyebab: {bug.cause}</p>

                      <div className="p-2.5 bg-gray-50 border border-gray-300 font-mono text-[11px] text-gray-800 whitespace-pre-wrap">
                        {bug.suggestedFix}
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                        {bug.missingPackage && (
                          <button
                            onClick={() => handleInstallMissingDependency(bug)}
                            className="flex items-center space-x-1 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs px-3 py-1.5 border border-black shadow-[1px_1px_0px_#000] cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Install {bug.missingPackage}</span>
                          </button>
                        )}

                        <button
                          onClick={() => setActivePreviewBug(bug)}
                          className="bg-gray-100 hover:bg-gray-200 text-[#18181B] font-bold text-xs px-3 py-1.5 border border-black shadow-[1px_1px_0px_#000] cursor-pointer"
                        >
                          Preview Fix
                        </button>

                        <button
                          onClick={() => handleApplyFix(bug)}
                          className="flex items-center space-x-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-3 py-1.5 border border-black shadow-[2px_2px_0px_#000] cursor-pointer"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span>Apply Fix</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#F3F4F6] border-t-2 border-black p-3 flex justify-between items-center">
          <span className="text-[11px] font-bold text-gray-500">
            Perubahan otomatis selalu menyertakan snapshot rollback.
          </span>
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
