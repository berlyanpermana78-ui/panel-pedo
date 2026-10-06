import React from 'react';
import { Cpu, ShieldAlert, Timer, Database, Activity, Terminal } from 'lucide-react';

export const RuntimeSystem: React.FC = () => {
  return (
    <section id="runtimes" className="py-20 bg-white border-b-3 border-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-block bg-[#DBEAFE] text-[#1D4ED8] text-xs font-black px-3 py-1 uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_#000000] mb-3">
            ARSITEKTUR BACKEND
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-[#18181B] tracking-tight">
            Sistem Runtime & Runner Aman
          </h2>
          <p className="mt-3 text-base font-bold text-gray-600">
            Dikonstruksi dengan prinsip zero-startup-delay, lazy invocation, dan proteksi memori ketat.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[#F3F4F6] border-3 border-black p-6 shadow-[4px_4px_0px_#000000]">
            <div className="w-10 h-10 bg-white border-2 border-black flex items-center justify-center mb-4 shadow-[2px_2px_0px_#000]">
              <Activity className="w-5 h-5 text-[#2563EB]" />
            </div>
            <h3 className="font-black text-lg text-[#18181B] mb-2">Lazy Detection</h3>
            <p className="text-xs font-semibold text-gray-600 leading-relaxed">
              Tidak ada proses Python atau child_process yang dijalankan ketika aplikasi startup. Semua runtime dicek secara lazy saat user memanggil API.
            </p>
          </div>

          <div className="bg-[#F3F4F6] border-3 border-black p-6 shadow-[4px_4px_0px_#000000]">
            <div className="w-10 h-10 bg-white border-2 border-black flex items-center justify-center mb-4 shadow-[2px_2px_0px_#000]">
              <Timer className="w-5 h-5 text-[#2563EB]" />
            </div>
            <h3 className="font-black text-lg text-[#18181B] mb-2">Timeout Enforcement</h3>
            <p className="text-xs font-semibold text-gray-600 leading-relaxed">
              Setiap eksekusi memiliki batas timeout ketat (default 5.000ms). Proses yang mengalami infinite loop akan diterminasi (SIGKILL) tanpa menyisakan proses zombie.
            </p>
          </div>

          <div className="bg-[#F3F4F6] border-3 border-black p-6 shadow-[4px_4px_0px_#000000]">
            <div className="w-10 h-10 bg-white border-2 border-black flex items-center justify-center mb-4 shadow-[2px_2px_0px_#000]">
              <ShieldAlert className="w-5 h-5 text-[#2563EB]" />
            </div>
            <h3 className="font-black text-lg text-[#18181B] mb-2">Output Truncation</h3>
            <p className="text-xs font-semibold text-gray-600 leading-relaxed">
              Limit output sebesar 100.000 karakter menjaga browser dari freeze/hang jika kode menghasilkan infinite logging atau memory leak.
            </p>
          </div>

          <div className="bg-[#F3F4F6] border-3 border-black p-6 shadow-[4px_4px_0px_#000000]">
            <div className="w-10 h-10 bg-white border-2 border-black flex items-center justify-center mb-4 shadow-[2px_2px_0px_#000]">
              <Database className="w-5 h-5 text-[#2563EB]" />
            </div>
            <h3 className="font-black text-lg text-[#18181B] mb-2">Isolated Temp Sandbox</h3>
            <p className="text-xs font-semibold text-gray-600 leading-relaxed">
              Setiap eksekusi membuat subdirektori acak unik di temporary filesystem dan otomatis membersihkan file sementara setelah selesai berjalan.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
