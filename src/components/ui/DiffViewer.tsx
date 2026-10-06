import React from 'react';
import { Check, X, ArrowRight } from 'lucide-react';

interface DiffViewerProps {
  fileName: string;
  originalContent: string;
  patchedContent: string;
  confidence?: number;
  onApply: () => void;
  onReject: () => void;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({
  fileName,
  originalContent,
  patchedContent,
  confidence,
  onApply,
  onReject,
}) => {
  const origLines = originalContent.split('\n');
  const patchLines = patchedContent.split('\n');

  return (
    <div className="bg-white border-3 border-black shadow-[4px_4px_0px_#000] flex flex-col overflow-hidden my-3">
      {/* Diff Header */}
      <div className="bg-[#DBEAFE] border-b-2 border-black px-3 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="font-mono text-xs font-black text-[#1D4ED8] bg-white px-2 py-0.5 border border-black">
            DIFF // {fileName}
          </span>
          {confidence !== undefined && (
            <span
              className={`text-[10px] font-black uppercase px-2 py-0.5 border border-black ${
                confidence >= 90
                  ? 'bg-emerald-100 text-emerald-800'
                  : confidence >= 70
                  ? 'bg-amber-100 text-amber-900'
                  : 'bg-rose-100 text-rose-900'
              }`}
            >
              {confidence}% Confidence
            </span>
          )}
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={onReject}
            className="flex items-center space-x-1 bg-white hover:bg-gray-100 text-rose-700 text-xs font-bold px-2 py-1 border border-black cursor-pointer shadow-[1px_1px_0px_#000]"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reject</span>
          </button>
          <button
            onClick={onApply}
            className="flex items-center space-x-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black px-3 py-1 border border-black cursor-pointer shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px]"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Apply Patch</span>
          </button>
        </div>
      </div>

      {/* Side-by-side or stacked diff view */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x-2 divide-black max-h-72 overflow-auto font-mono text-xs bg-[#18181B]">
        {/* Original */}
        <div className="p-3 overflow-x-auto text-zinc-300">
          <div className="text-[10px] font-bold text-rose-400 uppercase tracking-wider mb-1.5 pb-1 border-b border-zinc-800">
            --- BEFORE (Original)
          </div>
          <pre className="text-zinc-400 whitespace-pre leading-relaxed">
            {origLines.slice(0, 50).map((l, i) => (
              <div key={i} className="hover:bg-zinc-800 px-1">
                <span className="text-zinc-600 mr-3 select-none">{i + 1}</span>
                {l}
              </div>
            ))}
          </pre>
        </div>

        {/* Patched */}
        <div className="p-3 overflow-x-auto text-emerald-300 bg-zinc-950/60">
          <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1.5 pb-1 border-b border-zinc-800">
            +++ AFTER (Proposed Patch)
          </div>
          <pre className="text-emerald-200 whitespace-pre leading-relaxed">
            {patchLines.slice(0, 50).map((l, i) => (
              <div key={i} className="hover:bg-zinc-900 px-1">
                <span className="text-zinc-600 mr-3 select-none">{i + 1}</span>
                {l}
              </div>
            ))}
          </pre>
        </div>
      </div>
    </div>
  );
};
