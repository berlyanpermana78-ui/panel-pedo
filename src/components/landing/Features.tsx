import React from 'react';
import {
  Code2,
  Cpu,
  Eye,
  Package,
  FolderTree,
  Terminal,
} from 'lucide-react';

const FEATURES_DATA = [
  {
    icon: Code2,
    tag: 'EDITOR',
    title: 'Code Editor',
    description: 'Editor modern berbasis Monaco dengan syntax highlighting, minimap, formatting, dan shortcut keyboard.',
    accent: 'bg-[#DBEAFE] text-[#1D4ED8]',
  },
  {
    icon: Cpu,
    tag: 'EXECUTION',
    title: 'Multi Runtime',
    description: 'Jalankan Node.js dan Python jika runtime tersedia, dengan eksekusi aman dan timeout terisolasi.',
    accent: 'bg-emerald-100 text-emerald-800',
  },
  {
    icon: Eye,
    tag: 'RENDER',
    title: 'HTML Preview',
    description: 'Lihat hasil halaman web secara langsung dalam iframe terisolasi yang mendukung HTML, CSS, dan JavaScript.',
    accent: 'bg-amber-100 text-amber-800',
  },
  {
    icon: Package,
    tag: 'DEPENDENCIES',
    title: 'Python Package Manager',
    description: 'Kelola dependency Python per-project, cari pustaka langsung dari PyPI, dan sinkronkan requirements.txt.',
    accent: 'bg-purple-100 text-purple-800',
  },
  {
    icon: FolderTree,
    tag: 'STORAGE',
    title: 'Project Workspace',
    description: 'Kelola file dan folder project dengan cepat, dukung template starter, serta ekspor/impor arsip ZIP.',
    accent: 'bg-blue-100 text-blue-800',
  },
  {
    icon: Terminal,
    tag: 'DIAGNOSTICS',
    title: 'Console',
    description: 'Lihat stdout, stderr, status eksekusi, exit code, serta metrik durasi komputasi milidetik secara realtime.',
    accent: 'bg-rose-100 text-rose-800',
  },
];

export const Features: React.FC = () => {
  return (
    <section id="features" className="py-20 bg-[#F3F4F6] border-b-3 border-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-block bg-black text-white text-xs font-black px-3 py-1 uppercase tracking-wider mb-3">
            KAPABILITAS UTAMA
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-[#18181B] tracking-tight">
            Fitur Inti Developer Workspace
          </h2>
          <p className="mt-3 text-base font-bold text-gray-600">
            Semua yang dibutuhkan untuk menulis, menjalankan, menguji, dan mengembangkan kode dalam satu kesatuan interface.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES_DATA.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="bg-white border-3 border-black p-6 shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#000000] hover:-translate-x-[2px] hover:-translate-y-[2px] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-white border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000000]">
                      <Icon className="w-6 h-6 text-[#2563EB]" strokeWidth={2.2} />
                    </div>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 border border-black ${feat.accent}`}>
                      {feat.tag}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-[#18181B] mb-2 tracking-tight">
                    {feat.title}
                  </h3>
                  <p className="text-sm font-semibold text-gray-600 leading-relaxed">
                    {feat.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t-2 border-gray-100 flex items-center text-xs font-bold text-gray-400">
                  <span>BILZX // CAPABILITY 0{idx + 1}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
