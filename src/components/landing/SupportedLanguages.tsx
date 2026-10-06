import React from 'react';
import { Check, Cpu, Edit3 } from 'lucide-react';

export const SupportedLanguages: React.FC = () => {
  const editorLanguages = [
    { name: 'JavaScript', ext: '.js, .mjs', desc: 'Syntax highlighting, auto-indent & completion' },
    { name: 'TypeScript', ext: '.ts, .tsx', desc: 'Type definitions & strict syntax highlight' },
    { name: 'Python', ext: '.py', desc: 'PEP-8 indentation & Python keywords support' },
    { name: 'Java', ext: '.java', desc: 'Java 21 syntax, class structures & OOP keywords' },
    { name: 'C', ext: '.c, .h', desc: 'Pointers, preprocessors & memory management keywords' },
    { name: 'C++', ext: '.cpp, .cc', desc: 'STL vectors, templates, lambdas & class highlights' },
    { name: 'SQL Online', ext: '.sql', desc: 'DDL, DML, relational queries & SQLite syntax' },
    { name: 'HTML', ext: '.html', desc: 'Tags autocomplete & structural markup' },
    { name: 'CSS', ext: '.css', desc: 'Properties, values & selector highlighting' },
    { name: 'JSON', ext: '.json', desc: 'Data structure validation & formatting' },
  ];

  const runtimeLanguages = [
    {
      name: 'Node.js & JavaScript',
      engine: 'Node.js V8 Engine',
      status: 'Server-Side Runner',
      badge: 'Aktif',
      desc: 'Eksekusi script JavaScript/Node langsung dengan isolasi process & output logging.',
    },
    {
      name: 'TypeScript',
      engine: 'TSX / TypeScript V8',
      status: 'Server-Side Runner',
      badge: 'Aktif',
      desc: 'Eksekusi TypeScript native tanpa delay build terpisah dengan type safety.',
    },
    {
      name: 'Python 3',
      engine: 'CPython 3 / PyPI Packages',
      status: 'Server-Side Runner',
      badge: 'Aktif',
      desc: 'Eksekusi Python 3 lengkap dengan package manager per-project.',
    },
    {
      name: 'Java 21',
      engine: 'OpenJDK & Javac Compiler',
      status: 'Compile & Run Pipeline',
      badge: 'Aktif',
      desc: 'Kompilasi javac otomatis dan eksekusi JVM terisolasi dengan classloader sandbox.',
    },
    {
      name: 'C Language',
      engine: 'Clang / GCC Compiler',
      status: 'Sandboxed Binary',
      badge: 'Aktif',
      desc: 'Kompilasi Clang/GCC ke temporary binary dengan resource timeout limit.',
    },
    {
      name: 'C++ Modern',
      engine: 'Clang++ / G++ STL',
      status: 'Sandboxed Binary',
      badge: 'Aktif',
      desc: 'Mendukung Standard Template Library (STL), lambda expressions, dan kompilasi cepat.',
    },
    {
      name: 'SQL Online',
      engine: 'SQLite Native Engine',
      status: 'Relational Database',
      badge: 'Aktif',
      desc: 'Eksekusi query SQL dengan visualizer tabel, riwayat query, dan inspeksi schema.',
    },
    {
      name: 'HTML Web Preview',
      engine: 'Sandboxed Client Iframe',
      status: 'Client-Side Sandbox',
      badge: 'Aktif',
      desc: 'Render langsung HTML, CSS, dan DOM interaktif dengan auto-reload.',
    },
  ];

  return (
    <section id="languages" className="py-20 bg-white border-b-3 border-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-block bg-[#DBEAFE] text-[#1D4ED8] text-xs font-black px-3 py-1 uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_#000000] mb-3">
            KOMPATIBILITAS
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-[#18181B] tracking-tight">
            Bahasa & Runtime yang Didukung
          </h2>
          <p className="mt-3 text-base font-bold text-gray-600">
            Pemisahan transparan antara kapabilitas penulisan di Editor dan eksekusi di Runtime.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Column 1: Editor Support */}
          <div className="bg-[#F3F4F6] border-3 border-black p-6 sm:p-8 shadow-[5px_5px_0px_#000000]">
            <div className="flex items-center space-x-3 mb-6 pb-4 border-b-2 border-black">
              <div className="w-10 h-10 bg-white border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000]">
                <Edit3 className="w-5 h-5 text-[#2563EB]" />
              </div>
              <div>
                <h3 className="text-xl font-black text-[#18181B]">Editor Support</h3>
                <p className="text-xs font-bold text-gray-500">
                  Monaco Engine dengan Highlighting & Autocomplete
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {editorLanguages.map((lang, idx) => (
                <div
                  key={idx}
                  className="bg-white border-2 border-black p-3.5 flex items-center justify-between shadow-[2px_2px_0px_#000]"
                >
                  <div className="flex items-center space-x-3">
                    <span className="font-mono text-xs font-black bg-black text-white px-2 py-0.5">
                      {lang.ext}
                    </span>
                    <div>
                      <span className="font-black text-sm text-[#18181B] block">
                        {lang.name}
                      </span>
                      <span className="text-xs font-semibold text-gray-500">
                        {lang.desc}
                      </span>
                    </div>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-emerald-100 border border-emerald-600 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-emerald-700" strokeWidth={3} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: Runtime Support */}
          <div className="bg-[#F3F4F6] border-3 border-black p-6 sm:p-8 shadow-[5px_5px_0px_#000000]">
            <div className="flex items-center space-x-3 mb-6 pb-4 border-b-2 border-black">
              <div className="w-10 h-10 bg-[#2563EB] text-white border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000]">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-black text-[#18181B]">Runtime Support</h3>
                <p className="text-xs font-bold text-gray-500">
                  Mesin Eksekusi Nyata & Sandbox Terisolasi
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {runtimeLanguages.map((rt, idx) => (
                <div
                  key={idx}
                  className="bg-white border-2 border-black p-4 shadow-[2px_2px_0px_#000]"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-black text-base text-[#18181B]">{rt.name}</h4>
                      <span className="text-[11px] font-mono font-bold text-gray-500">
                        ({rt.engine})
                      </span>
                    </div>
                    <span className="bg-[#DBEAFE] text-[#1D4ED8] text-[10px] font-black uppercase px-2 py-0.5 border border-black">
                      {rt.badge}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-gray-600 mb-3">{rt.desc}</p>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-[11px] font-bold text-gray-500">
                    <span>Model: {rt.status}</span>
                    <span className="text-emerald-700 font-extrabold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                      Aktif
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-[#DBEAFE] border-2 border-black shadow-[2px_2px_0px_#000]">
              <p className="text-xs font-bold text-[#1D4ED8] leading-relaxed">
                <strong>Catatan Kejujuran Teknis:</strong> Jika runtime tertentu (Java, C, C++, Python, dsb.) belum terpasang di host server, sistem tidak akan membuat hasil simulasi/palsu, melainkan memberikan notifikasi unavailable secara transparan dan aman tanpa merusak aplikasi.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
