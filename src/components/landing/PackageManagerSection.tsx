import React from 'react';
import { Package, Search, Download, Trash2, FileText, CheckCircle } from 'lucide-react';

export const PackageManagerSection: React.FC = () => {
  return (
    <section id="packages" className="py-20 bg-[#F3F4F6] border-b-3 border-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text Explanation */}
          <div className="lg:col-span-6">
            <div className="inline-block bg-[#2563EB] text-white text-xs font-black px-3 py-1 uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_#000000] mb-3">
              DEPENDENCY MANAGEMENT
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#18181B] tracking-tight leading-tight">
              Python Package Manager Per-Project
            </h2>
            <p className="mt-4 text-base font-semibold text-gray-700 leading-relaxed">
              Kelola pustaka Python secara terisolasi untuk tiap project. Pasang package tanpa mencemari sistem global, cari direktori PyPI secara instan, dan pertahankan daftar dependency dalam requirements.txt.
            </p>

            <div className="mt-6 space-y-3">
              <div className="flex items-start space-x-3 bg-white p-3.5 border-2 border-black shadow-[2px_2px_0px_#000]">
                <Search className="w-5 h-5 text-[#2563EB] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-black text-sm text-[#18181B]">Pencarian PyPI Real-Time</h4>
                  <p className="text-xs text-gray-600 font-semibold">
                    Cari ribuan pustaka resmi PyPI langsung dari dalam modal workspace.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 bg-white p-3.5 border-2 border-black shadow-[2px_2px_0px_#000]">
                <Download className="w-5 h-5 text-[#2563EB] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-black text-sm text-[#18181B]">Instalasi Tanpa Shell Injection</h4>
                  <p className="text-xs text-gray-600 font-semibold">
                    Argumen divalidasi ketat dan dijalankan dengan format array aman: python -m pip install.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 bg-white p-3.5 border-2 border-black shadow-[2px_2px_0px_#000]">
                <FileText className="w-5 h-5 text-[#2563EB] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-black text-sm text-[#18181B]">Otomatisasi requirements.txt</h4>
                  <p className="text-xs text-gray-600 font-semibold">
                    File requirements.txt project terupdate secara konsisten saat install/uninstall.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Visual Card */}
          <div className="lg:col-span-6 bg-white border-3 border-black p-6 shadow-[6px_6px_0px_#000000]">
            <div className="flex items-center justify-between pb-3 border-b-2 border-black mb-4">
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-[#2563EB]" />
                <span className="font-black text-sm text-[#18181B]">PyPI Package Inspector</span>
              </div>
              <span className="bg-[#DBEAFE] text-[#1D4ED8] text-[10px] font-black uppercase px-2 py-0.5 border border-black">
                PROJECT VENV
              </span>
            </div>

            {/* Mock Package List */}
            <div className="space-y-2 mb-4">
              <div className="bg-[#F3F4F6] border-2 border-black p-3 flex items-center justify-between">
                <div>
                  <span className="font-mono font-black text-sm text-[#18181B]">requests</span>
                  <span className="text-xs font-bold text-gray-500 ml-2">v2.32.3</span>
                  <p className="text-[11px] font-medium text-gray-600 mt-0.5">
                    Python HTTP for Humans.
                  </p>
                </div>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-2 py-1 border border-emerald-500">
                  INSTALLED
                </span>
              </div>

              <div className="bg-[#F3F4F6] border-2 border-black p-3 flex items-center justify-between">
                <div>
                  <span className="font-mono font-black text-sm text-[#18181B]">numpy</span>
                  <span className="text-xs font-bold text-gray-500 ml-2">v2.1.2</span>
                  <p className="text-[11px] font-medium text-gray-600 mt-0.5">
                    Fundamental package for array computing.
                  </p>
                </div>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-2 py-1 border border-emerald-500">
                  INSTALLED
                </span>
              </div>

              <div className="bg-white border-2 border-dashed border-gray-300 p-3 flex items-center justify-between">
                <div>
                  <span className="font-mono font-black text-sm text-gray-700">pandas</span>
                  <span className="text-xs font-bold text-gray-400 ml-2">v2.2.3</span>
                  <p className="text-[11px] font-medium text-gray-500 mt-0.5">
                    Powerful data structures for data analysis.
                  </p>
                </div>
                <span className="bg-blue-50 text-blue-700 text-[10px] font-black uppercase px-2 py-1 border border-blue-300">
                  READY TO INSTALL
                </span>
              </div>
            </div>

            <div className="p-3 bg-amber-50 border-2 border-amber-300 text-xs font-bold text-amber-900">
              ⚡ Status Jujur: Jika Python tidak terpasang di host server, tombol aksi memberikan instruksi eksplisit dan tidak menipu user.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
