import React, { useEffect, useRef } from 'react';
import { X, Mic2, Music2 } from 'lucide-react';
import { Track } from './types';
import { OpticalButton, OpticalBadge } from './OpticalControls';

export interface LyricsModalProps {
  isOpen: boolean;
  onClose: () => void;
  track: Track;
  currentTime: number;
  onSeekToLine: (time: number) => void;
  className?: string;
}

export const LyricsModal: React.FC<LyricsModalProps> = ({
  isOpen,
  onClose,
  track,
  currentTime,
  onSeekToLine,
  className = '',
}) => {
  const activeLineRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const lyrics = track.lyrics || [];

  // Determine current active lyric index based on currentTime
  let activeIndex = -1;
  for (let i = 0; i < lyrics.length; i++) {
    if (currentTime >= lyrics[i].time) {
      activeIndex = i;
    } else {
      break;
    }
  }

  // Auto-scroll active line to center
  useEffect(() => {
    if (activeLineRef.current && containerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeIndex]);

  if (!isOpen) return null;

  return (
    <div
      className={`glass-dock rounded-3xl p-5 sm:p-6 flex flex-col w-full max-w-lg shadow-[0_30px_70px_rgba(0,0,0,0.9)] border border-white/10 z-50 select-none ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
            <Mic2 size={16} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Synchronized Lyrics</span>
              <OpticalBadge label="Live" variant="accent" dot pulse className="text-[8px] py-0 px-1.5" />
            </h3>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              {track.title} • {track.artist}
            </p>
          </div>
        </div>

        <OpticalButton size="sm" variant="ghost" onClick={onClose} title="Close Lyrics">
          <X size={16} />
        </OpticalButton>
      </div>

      {/* Lyrics Scroll Container */}
      <div
        ref={containerRef}
        className="flex flex-col gap-4 py-8 px-2 max-h-96 overflow-y-auto custom-scrollbar text-center"
      >
        {lyrics.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-zinc-500 gap-2">
            <Music2 size={32} className="opacity-40" />
            <p className="text-sm">Instrumental or no lyrics available for this track</p>
          </div>
        ) : (
          lyrics.map((line, idx) => {
            const isActive = idx === activeIndex;
            const isPast = idx < activeIndex;

            return (
              <div
                key={idx}
                ref={isActive ? activeLineRef : null}
                onClick={() => onSeekToLine(line.time)}
                className={`py-2 px-3 rounded-2xl cursor-pointer transition-all duration-300 transform ${
                  isActive
                    ? 'text-white text-lg sm:text-xl font-extrabold scale-105 shadow-[0_0_30px_rgba(255,255,255,0.18)] bg-white/5 border border-white/15'
                    : isPast
                    ? 'text-zinc-500 text-sm sm:text-base hover:text-zinc-300 font-medium opacity-60'
                    : 'text-zinc-600 text-sm sm:text-base hover:text-zinc-300 font-medium opacity-40'
                }`}
              >
                {line.text}
              </div>
            );
          })
        )}
      </div>

      {/* Footer Tap-to-seek hint */}
      <div className="pt-3 border-t border-white/5 flex items-center justify-center text-center">
        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
          Tap any lyric line to jump playback
        </span>
      </div>
    </div>
  );
};
