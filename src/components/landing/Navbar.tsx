import React, { useState } from 'react';
import { Terminal, ArrowRight, Menu, X, Cpu } from 'lucide-react';

interface NavbarProps {
  onOpenDashboard: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenDashboard }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#FFFFFF] border-b-3 border-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-[#2563EB] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000000]">
            <Terminal className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-black text-xl tracking-tight text-[#18181B]">
                BILZX CODEX
              </span>
              <span className="bg-[#DBEAFE] text-[#1D4ED8] text-[10px] font-black uppercase px-1.5 py-0.5 border border-black">
                BETA v1.0.0
              </span>
            </div>
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              BilzxDev
            </p>
          </div>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-bold text-[#18181B]">
          <a href="#features" className="hover:text-[#2563EB] transition-colors">
            Fitur
          </a>
          <a href="#languages" className="hover:text-[#2563EB] transition-colors">
            Bahasa
          </a>
          <a href="#runtimes" className="hover:text-[#2563EB] transition-colors">
            Runtime
          </a>
          <a href="#packages" className="hover:text-[#2563EB] transition-colors">
            Package Manager
          </a>
          <a href="#how-it-works" className="hover:text-[#2563EB] transition-colors">
            Cara Kerja
          </a>
          <a href="#security" className="hover:text-[#2563EB] transition-colors">
            Keamanan
          </a>
        </nav>

        {/* CTA Button */}
        <div className="hidden sm:flex items-center space-x-4">
          <button
            onClick={onOpenDashboard}
            className="flex items-center space-x-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-extrabold text-sm px-5 py-2.5 border-2 border-black shadow-[3px_3px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer"
          >
            <span>Buka Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile menu trigger */}
        <div className="sm:hidden flex items-center space-x-2">
          <button
            onClick={onOpenDashboard}
            className="bg-[#2563EB] text-white font-black text-xs px-3 py-2 border-2 border-black shadow-[2px_2px_0px_#000000] cursor-pointer"
          >
            Dashboard
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 border-2 border-black bg-gray-100 hover:bg-gray-200 cursor-pointer"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t-2 border-black bg-white px-4 py-4 space-y-3 font-bold text-sm text-[#18181B]">
          <a
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1 hover:text-[#2563EB]"
          >
            Fitur
          </a>
          <a
            href="#languages"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1 hover:text-[#2563EB]"
          >
            Bahasa
          </a>
          <a
            href="#runtimes"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1 hover:text-[#2563EB]"
          >
            Runtime
          </a>
          <a
            href="#packages"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1 hover:text-[#2563EB]"
          >
            Package Manager
          </a>
          <a
            href="#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1 hover:text-[#2563EB]"
          >
            Cara Kerja
          </a>
          <a
            href="#security"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1 hover:text-[#2563EB]"
          >
            Keamanan
          </a>
          <div className="pt-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenDashboard();
              }}
              className="w-full text-center bg-[#2563EB] text-white font-extrabold py-2.5 border-2 border-black shadow-[3px_3px_0px_#000000] cursor-pointer"
            >
              Buka Dashboard Sekarang
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
