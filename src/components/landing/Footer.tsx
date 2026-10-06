import React from 'react';
import { Terminal, ArrowUp } from 'lucide-react';

interface FooterProps {
  onOpenDashboard: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenDashboard }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#18181B] text-white border-t-3 border-black py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-zinc-800">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-[#2563EB] border-2 border-white flex items-center justify-center">
              <Terminal className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-black text-lg tracking-tight">BILZX CODEX</span>
              <p className="text-xs font-bold text-zinc-400">CODE. RUN. BUILD.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-zinc-300">
            <button
              onClick={onOpenDashboard}
              className="bg-[#2563EB] text-white px-4 py-2 border-2 border-white font-extrabold hover:bg-[#1D4ED8] transition-colors cursor-pointer"
            >
              Buka Workspace
            </button>
            <button
              onClick={scrollToTop}
              className="flex items-center space-x-1 hover:text-white transition-colors cursor-pointer"
            >
              <span>Kembali ke Atas</span>
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-zinc-500">
          <div>
            &copy; {new Date().getFullYear()} BILZX CODEX. Created by <span className="text-white font-bold">BilzxDev</span>.
          </div>
          <div className="flex items-center space-x-4">
            <span>v1.0.0 (Beta)</span>
            <span>&bull;</span>
            <span>Next.js + TypeScript + Node.js Architecture</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
