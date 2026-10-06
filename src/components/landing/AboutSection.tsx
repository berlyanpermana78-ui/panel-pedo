import React from 'react';
import { Terminal, Award, Sparkles, Code2 } from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <section className="py-20 bg-white border-b-3 border-black">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#F3F4F6] border-3 border-black p-8 sm:p-12 shadow-[6px_6px_0px_#000000]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b-2 border-black">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-[#2563EB] text-white border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000]">
                <Terminal className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-[#18181B]">Tentang BILZX CODEX</h3>
                <span className="text-xs font-black uppercase text-[#1D4ED8] tracking-wider">
                  Developer Workspace Manifesto
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-[#DBEAFE] text-[#1D4ED8] text-xs font-black px-2.5 py-1 border border-black">
                v1.0.0
              </span>
              <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-2.5 py-1 border border-black">
                BETA / ACTIVE
              </span>
            </div>
          </div>

          <p className="text-base sm:text-lg font-bold text-gray-800 leading-relaxed mb-6">
            BILZX CODEX dibuat sebagai developer workspace yang menggabungkan code editor, runtime, preview, project management, dan Python package management dalam satu interface.
          </p>

          <p className="text-sm font-semibold text-gray-600 leading-relaxed mb-8">
            Filosofi kami berpusat pada transparansi eksekusi: tidak ada mockup palsu, tidak ada loading palsu, dan setiap tombol aksi terhubung ke proses komputasi yang sebenarnya. Jika runtime tidak tersedia, sistem melaporkan kondisi apa adanya secara jujur dan elegan.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t-2 border-black/10">
            <div className="bg-white p-4 border-2 border-black">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                Brand & Creator
              </span>
              <span className="text-base font-black text-[#18181B] mt-1 block">
                BilzxDev
              </span>
            </div>

            <div className="bg-white p-4 border-2 border-black">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                Identitas Produk
              </span>
              <span className="text-base font-black text-[#2563EB] mt-1 block">
                BILZX CODEX — CODE. RUN. BUILD.
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
