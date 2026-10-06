import React from 'react';
import { ShieldCheck, Lock, AlertTriangle, FileCheck, RefreshCw, Cpu } from 'lucide-react';

export const SecuritySection: React.FC = () => {
  return (
    <section id="security" className="py-20 bg-[#F3F4F6] border-b-3 border-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-block bg-[#DBEAFE] text-[#1D4ED8] text-xs font-black px-3 py-1 uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_#000000] mb-3">
            PROTEKSI & INTEGRITAS
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-[#18181B] tracking-tight">
            Desain Keamanan & Isolasi Proses
          </h2>
          <p className="mt-3 text-base font-bold text-gray-600">
            Eksekusi kode dirancang dengan pembatasan sumber daya realistis, sanitasi input, dan pembersihan proses otomatis.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white border-3 border-black p-6 shadow-[4px_4px_0px_#000000]">
            <div className="w-10 h-10 bg-blue-50 border-2 border-black flex items-center justify-center mb-4 shadow-[2px_2px_0px_#000]">
              <Lock className="w-5 h-5 text-[#2563EB]" />
            </div>
            <h3 className="font-black text-lg text-[#18181B] mb-2">Sanitized Arguments</h3>
            <p className="text-xs font-semibold text-gray-600 leading-relaxed">
              Semua perintah sistem dijalankan dengan array argumen (bukan string shell interpolation) untuk mencegah celah injeksi shell arbitrer.
            </p>
          </div>

          <div className="bg-white border-3 border-black p-6 shadow-[4px_4px_0px_#000000]">
            <div className="w-10 h-10 bg-blue-50 border-2 border-black flex items-center justify-center mb-4 shadow-[2px_2px_0px_#000]">
              <AlertTriangle className="w-5 h-5 text-[#2563EB]" />
            </div>
            <h3 className="font-black text-lg text-[#18181B] mb-2">Batas Ukuran & Memori</h3>
            <p className="text-xs font-semibold text-gray-600 leading-relaxed">
              Maksimal ukuran kode 100KB dan limit output 100KB membatasi risiko membanjiri buffer memori server atau browser pengguna.
            </p>
          </div>

          <div className="bg-white border-3 border-black p-6 shadow-[4px_4px_0px_#000000]">
            <div className="w-10 h-10 bg-blue-50 border-2 border-black flex items-center justify-center mb-4 shadow-[2px_2px_0px_#000]">
              <RefreshCw className="w-5 h-5 text-[#2563EB]" />
            </div>
            <h3 className="font-black text-lg text-[#18181B] mb-2">Automated Cleanup</h3>
            <p className="text-xs font-semibold text-gray-600 leading-relaxed">
              Direktori temporary yang dibuat untuk eksekusi kode langsung dibersihkan dan dihapus secara tuntas setelah proses selesai atau time-out.
            </p>
          </div>

          <div className="bg-white border-3 border-black p-6 shadow-[4px_4px_0px_#000000]">
            <div className="w-10 h-10 bg-blue-50 border-2 border-black flex items-center justify-center mb-4 shadow-[2px_2px_0px_#000]">
              <FileCheck className="w-5 h-5 text-[#2563EB]" />
            </div>
            <h3 className="font-black text-lg text-[#18181B] mb-2">Validasi Nama Package</h3>
            <p className="text-xs font-semibold text-gray-600 leading-relaxed">
              Pustaka pip difilter menggunakan ekspresi reguler ketat terhadap karakter bahaya sebelum diteruskan ke perintah pip install.
            </p>
          </div>

          <div className="bg-white border-3 border-black p-6 shadow-[4px_4px_0px_#000000]">
            <div className="w-10 h-10 bg-blue-50 border-2 border-black flex items-center justify-center mb-4 shadow-[2px_2px_0px_#000]">
              <Cpu className="w-5 h-5 text-[#2563EB]" />
            </div>
            <h3 className="font-black text-lg text-[#18181B] mb-2">Perlindungan Kredensial</h3>
            <p className="text-xs font-semibold text-gray-600 leading-relaxed">
              Environment variable sensitif, API secret, dan kredensial server tidak pernah diekspos ke client ataupun proses sandbox pengguna.
            </p>
          </div>

          <div className="bg-white border-3 border-black p-6 shadow-[4px_4px_0px_#000000]">
            <div className="w-10 h-10 bg-blue-50 border-2 border-black flex items-center justify-center mb-4 shadow-[2px_2px_0px_#000]">
              <ShieldCheck className="w-5 h-5 text-[#2563EB]" />
            </div>
            <h3 className="font-black text-lg text-[#18181B] mb-2">Isolasi Iframe Preview</h3>
            <p className="text-xs font-semibold text-gray-600 leading-relaxed">
              HTML preview menggunakan sandbox iframe dengan atribut pembatas untuk mencegah manipulasi session atau parent window context.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
