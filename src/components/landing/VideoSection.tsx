import React, { useState } from 'react';
import { Play, AlertCircle, Video as VideoIcon } from 'lucide-react';

const VIDEO_URL = 'https://files.catbox.moe/drm4d2.mp4';

export const VideoSection: React.FC = () => {
  const [hasError, setHasError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);

  return (
    <section className="py-12 bg-white border-b-3 border-black">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section title header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 bg-[#2563EB] border border-black inline-block" />
            <h2 className="text-lg sm:text-xl font-black text-[#18181B] tracking-tight uppercase">
              Tinjauan Visual Workspace
            </h2>
          </div>
          <span className="text-xs font-bold text-gray-500 hidden sm:inline-block">
            Preview Interaktif BILZX CODEX
          </span>
        </div>

        {/* Video Frame with Neo-Brutalism container */}
        <div className="relative bg-[#18181B] border-3 border-black shadow-[6px_6px_0px_#000000] rounded-sm overflow-hidden aspect-video flex items-center justify-center">
          {hasError ? (
            <div className="text-center p-6 text-white">
              <div className="w-12 h-12 bg-red-600/20 border-2 border-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <AlertCircle className="w-6 h-6 text-red-400" />
              </div>
              <p className="font-extrabold text-sm text-gray-200">Video tidak tersedia</p>
              <p className="text-xs text-gray-400 mt-1">
                Workspace interaktif tetap dapat langsung digunakan melalui tombol Buka Dashboard.
              </p>
            </div>
          ) : (
            <video
              src={VIDEO_URL}
              autoPlay
              muted
              loop
              playsInline
              onError={() => setHasError(true)}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              className="w-full h-full object-cover"
            />
          )}

          {/* Video bottom badge overlay */}
          <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-xs text-white text-[11px] font-mono font-bold px-2.5 py-1 border border-white/30 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>BILZX CODEX // WORKSPACE OVERVIEW</span>
          </div>
        </div>
      </div>
    </section>
  );
};
