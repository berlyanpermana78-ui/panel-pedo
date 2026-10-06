import React from 'react';
import { FolderPlus, Code, Play, CheckCircle2 } from 'lucide-react';

const STEPS = [
  {
    step: '01',
    title: 'Buat Project',
    icon: FolderPlus,
    description: 'Pilih template siap pakai (Node.js, Python, atau HTML5 Canvas) atau buat project kosong baru dalam hitungan detik.',
  },
  {
    step: '02',
    title: 'Tulis Kode',
    icon: Code,
    description: 'Manfaatkan editor Monaco lengkap dengan syntax highlighting, minimap, formatting, dan navigasi multi-file terstruktur.',
  },
  {
    step: '03',
    title: 'Run / Preview',
    icon: Play,
    description: 'Tekan tombol RUN atau gunakan shortcut Ctrl+Enter / Cmd+Enter untuk eksekusi server nyata atau preview web langsung.',
  },
  {
    step: '04',
    title: 'Lihat Output',
    icon: CheckCircle2,
    description: 'Periksa stdout, stderr, exit code, durasi eksekusi milidetik, atau lihat visual interaktif pada tab preview HTML.',
  },
];

export const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="py-20 bg-white border-b-3 border-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-block bg-[#18181B] text-white text-xs font-black px-3 py-1 uppercase tracking-wider mb-3">
            ALUR KERJA
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-[#18181B] tracking-tight">
            Cara Kerja BILZX CODEX
          </h2>
          <p className="mt-3 text-base font-bold text-gray-600">
            Empat langkah sederhana dari inisialisasi ide hingga inspeksi output hasil komputasi.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="bg-[#F3F4F6] border-3 border-black p-6 shadow-[4px_4px_0px_#000000] relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-2xl font-black text-[#2563EB]">
                      {s.step}
                    </span>
                    <div className="w-10 h-10 bg-white border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000]">
                      <Icon className="w-5 h-5 text-[#18181B]" />
                    </div>
                  </div>
                  <h3 className="font-black text-xl text-[#18181B] mb-2">{s.title}</h3>
                  <p className="text-xs font-semibold text-gray-600 leading-relaxed">
                    {s.description}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t-2 border-black/10 flex items-center text-[11px] font-black text-gray-400">
                  <span>STEP // {s.step}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
