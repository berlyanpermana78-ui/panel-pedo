import React, { useState } from 'react';
import {
  Rocket,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  X,
  Download,
  ShieldCheck,
  Server,
  Cloud,
  FileCheck,
  ExternalLink,
} from 'lucide-react';
import { Project, DeploymentTarget, DeploymentScanReport } from '../../types';
import { runPreDeploymentScan, generateTargetDeploymentZip } from '../../lib/deployment/scanner';
import { downloadBlob } from '../../lib/zip';

interface DeploymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onOpenAnalyzer: () => void;
}

export const DeploymentModal: React.FC<DeploymentModalProps> = ({
  isOpen,
  onClose,
  project,
  onOpenAnalyzer,
}) => {
  const [selectedTarget, setSelectedTarget] = useState<DeploymentTarget>('vercel');
  const [scanReport, setScanReport] = useState<DeploymentScanReport | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isPackaging, setIsPackaging] = useState(false);

  if (!isOpen) return null;

  const handleRunScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      const res = runPreDeploymentScan(project, selectedTarget);
      setScanReport(res);
      setIsScanning(false);
    }, 250);
  };

  const handleGeneratePackage = async () => {
    if (!scanReport || !scanReport.canDeploy) return;
    setIsPackaging(true);
    try {
      const blob = await generateTargetDeploymentZip(project, selectedTarget);
      const safeName = project.name.toLowerCase().replace(/[^a-z0-9_-]/g, '-') || 'project';
      downloadBlob(blob, `deploy-${selectedTarget}-${safeName}.zip`);
    } catch (err: any) {
      alert('Gagal membuat paket deployment: ' + (err?.message || 'Error'));
    } finally {
      setIsPackaging(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-2xl bg-white border-3 border-black shadow-[8px_8px_0px_#000000] flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-[#18181B] text-white p-4 border-b-2 border-black flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 bg-[#2563EB] border-2 border-white flex items-center justify-center shadow-[2px_2px_0px_#000]">
              <Rocket className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-black text-base leading-none">Pre-Deployment Scanner & Packager</h3>
              <p className="text-[11px] font-mono text-zinc-400 mt-0.5">
                Verifikasi Kompatibilitas • Security Check • Paket Siap Deploy
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

        {/* Target Selector */}
        <div className="bg-[#F3F4F6] border-b-2 border-black p-3.5 space-y-2">
          <span className="text-xs font-black uppercase text-gray-700 block">
            Pilih Target Deployment:
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => {
                setSelectedTarget('vercel');
                setScanReport(null);
              }}
              className={`p-2.5 border-2 border-black text-center cursor-pointer transition-all ${
                selectedTarget === 'vercel'
                  ? 'bg-[#2563EB] text-white font-black shadow-[2px_2px_0px_#000]'
                  : 'bg-white hover:bg-gray-100 text-[#18181B] font-bold'
              }`}
            >
              <Cloud className="w-4 h-4 mx-auto mb-1" />
              <span className="text-xs block">Vercel</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedTarget('netlify');
                setScanReport(null);
              }}
              className={`p-2.5 border-2 border-black text-center cursor-pointer transition-all ${
                selectedTarget === 'netlify'
                  ? 'bg-[#2563EB] text-white font-black shadow-[2px_2px_0px_#000]'
                  : 'bg-white hover:bg-gray-100 text-[#18181B] font-bold'
              }`}
            >
              <Server className="w-4 h-4 mx-auto mb-1" />
              <span className="text-xs block">Netlify</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedTarget('infinity');
                setScanReport(null);
              }}
              className={`p-2.5 border-2 border-black text-center cursor-pointer transition-all ${
                selectedTarget === 'infinity'
                  ? 'bg-[#2563EB] text-white font-black shadow-[2px_2px_0px_#000]'
                  : 'bg-white hover:bg-gray-100 text-[#18181B] font-bold'
              }`}
            >
              <Rocket className="w-4 h-4 mx-auto mb-1" />
              <span className="text-xs block">Infinity Hosting</span>
            </button>
          </div>
        </div>

        {/* Scan Trigger Bar */}
        <div className="bg-[#DBEAFE] border-b-2 border-black px-4 py-2.5 flex items-center justify-between">
          <div className="text-xs font-bold text-[#1D4ED8]">
            Target Aktif: <strong className="uppercase">{selectedTarget}</strong>
          </div>
          <button
            onClick={handleRunScan}
            disabled={isScanning}
            className="flex items-center space-x-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-black text-xs px-4 py-1.5 border-2 border-black shadow-[2px_2px_0px_#000] cursor-pointer"
          >
            {isScanning ? (
              <>
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
                <span>Scanning...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>RUN PRE-DEPLOY SCAN</span>
              </>
            )}
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {!scanReport && !isScanning && (
            <div className="text-center py-10 bg-white border-2 border-dashed border-gray-300 p-6">
              <FileCheck className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="font-black text-sm text-[#18181B]">Wajib Menjalankan Pre-Deployment Scan</p>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                Sistem akan memverifikasi integritas sintaks, dependensi, secret protection, dan kompatibilitas target sebelum paket deployment dapat dihasilkan.
              </p>
            </div>
          )}

          {scanReport && (
            <div className="space-y-4">
              {/* Status Banner */}
              <div
                className={`p-3.5 border-2 border-black shadow-[3px_3px_0px_#000] flex items-center justify-between ${
                  scanReport.canDeploy
                    ? 'bg-emerald-100 text-emerald-950'
                    : 'bg-rose-100 text-rose-950'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  {scanReport.canDeploy ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-700" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-rose-700" />
                  )}
                  <div>
                    <h4 className="font-black text-sm">
                      {scanReport.canDeploy ? 'DEPLOYMENT CHECK: READY' : 'DEPLOYMENT BLOCKED'}
                    </h4>
                    <p className="text-xs font-semibold">
                      {scanReport.canDeploy
                        ? 'Project siap di-deploy. Tidak ada critical blocker.'
                        : `Ditemukan ${scanReport.blockersCount} masalah kritis yang harus diperbaiki.`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Checklist */}
              <div className="space-y-2">
                <span className="text-xs font-black uppercase text-gray-500 block">
                  Hasil Pemeriksaan Detail:
                </span>
                {scanReport.checks.map((chk, i) => (
                  <div
                    key={i}
                    className="p-3 bg-white border-2 border-black shadow-[2px_2px_0px_#000] flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-black text-xs text-[#18181B]">{chk.name}</span>
                        {chk.status === 'passed' && (
                          <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase px-1.5 py-0.2 border border-emerald-500">
                            PASSED
                          </span>
                        )}
                        {chk.status === 'warning' && (
                          <span className="bg-amber-100 text-amber-800 text-[9px] font-black uppercase px-1.5 py-0.2 border border-amber-500">
                            WARNING
                          </span>
                        )}
                        {chk.status === 'failed' && (
                          <span className="bg-rose-100 text-rose-800 text-[9px] font-black uppercase px-1.5 py-0.2 border border-rose-500">
                            BLOCKER
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{chk.details}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Target Advice Box */}
              <div className="p-3 bg-[#DBEAFE] border-2 border-black text-xs font-bold text-[#1D4ED8]">
                💡 <strong>Saran Target:</strong> {scanReport.compatibilityAdvice}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#F3F4F6] border-t-2 border-black p-3 flex items-center justify-between">
          {!scanReport?.canDeploy && scanReport?.blockersCount ? (
            <button
              onClick={() => {
                onClose();
                onOpenAnalyzer();
              }}
              className="bg-rose-600 hover:bg-rose-700 text-white font-black text-xs px-3.5 py-1.5 border-2 border-black shadow-[2px_2px_0px_#000] cursor-pointer"
            >
              Perbaiki dengan Code Analyzer
            </button>
          ) : (
            <span className="text-[11px] font-mono text-gray-500">
              {scanReport?.canDeploy ? 'Paket siap diunduh' : 'Jalankan scan terlebih dahulu'}
            </span>
          )}

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="bg-white hover:bg-gray-100 font-bold text-xs px-3 py-1.5 border-2 border-black shadow-[1px_1px_0px_#000] cursor-pointer"
            >
              Batal
            </button>

            <button
              onClick={handleGeneratePackage}
              disabled={!scanReport?.canDeploy || isPackaging}
              className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white font-black text-xs px-4 py-1.5 border-2 border-black shadow-[2px_2px_0px_#000] disabled:shadow-none cursor-pointer"
            >
              {isPackaging ? (
                <>
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Membuat Paket...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Generate Deployment Package</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
