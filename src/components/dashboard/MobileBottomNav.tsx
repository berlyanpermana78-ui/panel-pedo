import React from 'react';
import { Code2, FolderTree, Eye, Terminal, Sparkles, MoreHorizontal } from 'lucide-react';

export type MobileTab = 'editor' | 'files' | 'ai' | 'preview' | 'console' | 'more';

interface MobileBottomNavProps {
  activeTab: MobileTab;
  onChangeTab: (tab: MobileTab) => void;
  hasConsoleOutput?: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onChangeTab,
  hasConsoleOutput,
}) => {
  return (
    <nav className="sm:hidden bg-white border-t-3 border-black grid grid-cols-6 text-center shrink-0 z-40 select-none">
      <button
        onClick={() => onChangeTab('editor')}
        className={`py-2 flex flex-col items-center justify-center cursor-pointer transition-colors ${
          activeTab === 'editor' ? 'bg-[#2563EB] text-white font-black' : 'text-[#18181B] font-bold hover:bg-gray-100'
        }`}
      >
        <Code2 className="w-4 h-4 mb-0.5" />
        <span className="text-[9px]">Editor</span>
      </button>

      <button
        onClick={() => onChangeTab('files')}
        className={`py-2 flex flex-col items-center justify-center cursor-pointer transition-colors ${
          activeTab === 'files' ? 'bg-[#2563EB] text-white font-black' : 'text-[#18181B] font-bold hover:bg-gray-100'
        }`}
      >
        <FolderTree className="w-4 h-4 mb-0.5" />
        <span className="text-[9px]">Files</span>
      </button>

      <button
        onClick={() => onChangeTab('ai')}
        className={`py-2 flex flex-col items-center justify-center cursor-pointer transition-colors ${
          activeTab === 'ai' ? 'bg-[#18181B] text-amber-400 font-black' : 'text-[#18181B] font-bold hover:bg-gray-100'
        }`}
      >
        <Sparkles className="w-4 h-4 mb-0.5 text-amber-500" />
        <span className="text-[9px]">AI</span>
      </button>

      <button
        onClick={() => onChangeTab('preview')}
        className={`py-2 flex flex-col items-center justify-center cursor-pointer transition-colors ${
          activeTab === 'preview' ? 'bg-[#2563EB] text-white font-black' : 'text-[#18181B] font-bold hover:bg-gray-100'
        }`}
      >
        <Eye className="w-4 h-4 mb-0.5" />
        <span className="text-[9px]">Preview</span>
      </button>

      <button
        onClick={() => onChangeTab('console')}
        className={`py-2 flex flex-col items-center justify-center relative cursor-pointer transition-colors ${
          activeTab === 'console' ? 'bg-[#2563EB] text-white font-black' : 'text-[#18181B] font-bold hover:bg-gray-100'
        }`}
      >
        <div className="relative">
          <Terminal className="w-4 h-4 mb-0.5" />
          {hasConsoleOutput && (
            <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-emerald-400 border border-black" />
          )}
        </div>
        <span className="text-[9px]">Console</span>
      </button>

      <button
        onClick={() => onChangeTab('more')}
        className={`py-2 flex flex-col items-center justify-center cursor-pointer transition-colors ${
          activeTab === 'more' ? 'bg-[#2563EB] text-white font-black' : 'text-[#18181B] font-bold hover:bg-gray-100'
        }`}
      >
        <MoreHorizontal className="w-4 h-4 mb-0.5" />
        <span className="text-[9px]">More</span>
      </button>
    </nav>
  );
};
