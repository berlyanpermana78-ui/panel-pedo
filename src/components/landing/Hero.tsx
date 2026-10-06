import React from 'react';
import { ArrowRight, Play, Terminal, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

interface HeroProps {
  onOpenDashboard: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenDashboard }) => {
  return (
    <section className="relative bg-[#F3F4F6] border-b-3 border-black py-16 sm:py-24 overflow-hidden">
      {/* Neo-brutalist grid background accent */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-3xl mx-auto">
          {/* Status pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#DBEAFE] border-2 border-black shadow-[2px_2px_0px_#000000] mb-6">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB] animate-pulse" />
            <span className="text-xs font-black text-[#1D4ED8] uppercase tracking-wider">
              Developer Workspace v1.0.0
            </span>
          </div>

          {/* Product Name */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-[#18181B] tracking-tight leading-none mb-4">
            BILZX CODEX
          </h1>

          {/* Tagline */}
          <div className="inline-block bg-[#2563EB] text-white font-black text-xl sm:text-2xl md:text-3xl px-4 py-1.5 border-2 border-black shadow-[4px_4px_0px_#000000] mb-6 transform -rotate-1">
            CODE. RUN. BUILD.
          </div>

          {/* Brief Description */}
          <p className="text-base sm:text-xl font-bold text-gray-700 leading-relaxed max-w-2xl mx-auto mb-8">
            Workspace coding modern untuk menulis, menjalankan, menguji, dan mengembangkan project dalam satu tempat.
          </p>

          {/* Call to actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <button
              onClick={onOpenDashboard}
              className="w-full sm:w-auto flex items-center justify-center space-x-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-base font-black px-8 py-4 border-3 border-black shadow-[5px_5px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer"
            >
              <Terminal className="w-5 h-5" />
              <span>Buka Dashboard</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <a
              href="#features"
              className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-white hover:bg-gray-100 text-[#18181B] text-base font-black px-8 py-4 border-3 border-black shadow-[5px_5px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
            >
              <span>Lihat Fitur</span>
            </a>
          </div>

          {/* Fast Value badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-black text-[#18181B]">
            <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 border-2 border-black shadow-[2px_2px_0px_#000]">
              <CheckCircle2 className="w-4 h-4 text-[#2563EB]" />
              <span>Multi-Runtime Nyata</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 border-2 border-black shadow-[2px_2px_0px_#000]">
              <Zap className="w-4 h-4 text-[#2563EB]" />
              <span>HTML Live Preview</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 border-2 border-black shadow-[2px_2px_0px_#000]">
              <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
              <span>Isolasi & Timeout Safe</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
