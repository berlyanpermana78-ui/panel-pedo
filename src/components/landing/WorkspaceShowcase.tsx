import React from 'react';
import { Smartphone, Monitor, Layout, Terminal, Play, Eye } from 'lucide-react';

export const WorkspaceShowcase: React.FC = () => {
  return (
    <section className="py-20 bg-[#F3F4F6] border-b-3 border-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-block bg-[#18181B] text-white text-xs font-black px-3 py-1 uppercase tracking-wider mb-3">
            RESPONSIF & ERGONOMIS
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-[#18181B] tracking-tight">
            Developer Workspace Lintas Perangkat
          </h2>
          <p className="mt-3 text-base font-bold text-gray-600">
            Didesain mobile-first agar nyaman digunakan dari smartphone dan tablet, sekaligus bertenaga penuh pada monitor desktop laptop dan PC.
          </p>
        </div>

        {/* Visual Mock Showcase (Neo-Brutalist Layout Diagram) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Desktop Preview Card (7 cols) */}
          <div className="lg:col-span-7 bg-white border-3 border-black p-5 shadow-[6px_6px_0px_#000000]">
            <div className="flex items-center justify-between pb-3 border-b-2 border-black mb-4">
              <div className="flex items-center space-x-2">
                <Monitor className="w-5 h-5 text-[#2563EB]" />
                <span className="font-black text-sm text-[#18181B]">Desktop & Laptop Experience</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-3 h-3 rounded-full bg-red-400 border border-black inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-400 border border-black inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-400 border border-black inline-block" />
              </div>
            </div>

            {/* Simulated Desktop IDE Windows */}
            <div className="bg-[#18181B] p-3 text-white border-2 border-black font-mono text-xs">
              <div className="flex items-center justify-between bg-zinc-800 px-3 py-1.5 border border-zinc-700 mb-2">
                <span className="text-blue-400 font-bold">BILZX CODEX // main.js</span>
                <span className="bg-emerald-600 text-[10px] px-2 py-0.5 text-white font-sans font-bold">READY</span>
              </div>
              <div className="grid grid-cols-12 gap-2 h-48 text-[11px]">
                <div className="col-span-3 bg-zinc-900 border border-zinc-800 p-2 hidden sm:block text-zinc-400">
                  <div className="text-zinc-200 font-bold mb-1">PROJECT</div>
                  <div className="text-white">📄 main.js</div>
                  <div>📄 package.json</div>
                  <div>📄 README.md</div>
                </div>
                <div className="col-span-12 sm:col-span-9 bg-zinc-900 border border-zinc-800 p-2 overflow-hidden">
                  <div className="text-purple-400">// Node.js Execution Test</div>
                  <div className="text-blue-300">const server = require("http");</div>
                  <div className="text-yellow-300">console.log("Ready to compute...");</div>
                  <div className="mt-4 text-emerald-400 font-bold">
                    &gt; stdout: Execution finished (42ms)
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs font-bold text-gray-700">
              <div className="bg-gray-100 p-2 border border-black">Multi-File Explorer</div>
              <div className="bg-gray-100 p-2 border border-black">Monaco Full Editor</div>
              <div className="bg-gray-100 p-2 border border-black">Integrated Console</div>
            </div>
          </div>

          {/* Mobile Preview Card (5 cols) */}
          <div className="lg:col-span-5 bg-white border-3 border-black p-5 shadow-[6px_6px_0px_#000000]">
            <div className="flex items-center justify-between pb-3 border-b-2 border-black mb-4">
              <div className="flex items-center space-x-2">
                <Smartphone className="w-5 h-5 text-[#2563EB]" />
                <span className="font-black text-sm text-[#18181B]">Mobile-First Optimization</span>
              </div>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-[#DBEAFE] border border-black">
                SMARTPHONE UI
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-3 border-2 border-black bg-[#F3F4F6]">
                <h4 className="font-black text-sm text-[#18181B] mb-1">1. Bottom Navigation Ergonomis</h4>
                <p className="text-xs font-semibold text-gray-600">
                  Akses cepat ke Editor, Files, Preview, Console, dan Packages hanya dengan satu sentuhan ibu jari.
                </p>
              </div>

              <div className="p-3 border-2 border-black bg-[#F3F4F6]">
                <h4 className="font-black text-sm text-[#18181B] mb-1">2. Tombol RUN Touch-Friendly</h4>
                <p className="text-xs font-semibold text-gray-600">
                  Tombol aksi dengan tactile feedback yang tegas, anti-meleset, dan respons status instan.
                </p>
              </div>

              <div className="p-3 border-2 border-black bg-[#F3F4F6]">
                <h4 className="font-black text-sm text-[#18181B] mb-1">3. Zero Horizontal Overflow</h4>
                <p className="text-xs font-semibold text-gray-600">
                  Semua panel, log console, dan editor beradaptasi proporsional tanpa layout melompat atau terpotong.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
