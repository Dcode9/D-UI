import React, { useState } from 'react';
import { SkipBack, SkipForward, Volume2, Heart } from 'lucide-react';
import { PlayPauseTrigger } from './PlayPauseTrigger';
import { GrainBlurFilter, GRAIN_BLUR_DEFAULTS } from './GrainBlurSurface';

export interface BottomPlayerBarProps {
  isPlaying: boolean;
  onTogglePlay: (playing: boolean) => void;
  trackTitle?: string;
  artistName?: string;
  coverUrl?: string;
  currentTime?: string;
  totalTime?: string;
  theme?: 'dark' | 'light';
  className?: string;
  style?: React.CSSProperties;
}

export const BottomPlayerBar: React.FC<BottomPlayerBarProps> = ({
  isPlaying,
  onTogglePlay,
  trackTitle = "D'Verse (Optical Resonance)",
  artistName = "Dcode9 Sound Lab",
  coverUrl = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400&auto=format&fit=crop",
  currentTime = "1:42",
  totalTime = "3:38",
  theme = 'dark',
  className = '',
  style = {},
}) => {
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const filterId = 'bottom-bar-mezzotint-filter';
  const isLight = theme === 'light';

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-3xl px-4 pointer-events-auto select-none ${className}`}
      style={style}
    >
      {/* 1. MASTER MEZZOTINT BLUR SHADER (Settled: 55px / 0.70 / 8.5px) */}
      <GrainBlurFilter
        id={filterId}
        scatter={GRAIN_BLUR_DEFAULTS.scatter}
        grainDensity={GRAIN_BLUR_DEFAULTS.grainDensity}
        opticalDiffusion={GRAIN_BLUR_DEFAULTS.opticalDiffusion}
        octaves={1}
      />

      {/* 2. THE TACTILE BOTTOM BAR GLASS DOCK */}
      <div
        className={`relative w-full h-[76px] rounded-2xl sm:rounded-full px-4 sm:px-6 flex items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.85)] border transition-colors ${
          isLight
            ? 'border-zinc-300/80 bg-white/75 text-zinc-900 shadow-[0_15px_35px_rgba(0,0,0,0.12)]'
            : 'border-white/15 bg-[#09090e]/75 text-white'
        }`}
        style={{
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      >
        {/* Specular ridge top catch */}
        <div
          className={`absolute inset-0 rounded-[inherit] pointer-events-none ${
            isLight ? 'border-t border-white/90' : 'border-t border-white/25'
          }`}
        />

        {/* 3. LEFT: NOW PLAYING TRACK INFO */}
        <div className="flex items-center gap-3 min-w-0 max-w-[200px] sm:max-w-xs">
          <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-white/15 shadow-md">
            <img src={coverUrl} alt={trackTitle} className="w-full h-full object-cover select-none" />
          </div>
          <div className="min-w-0 flex flex-col">
            <span className="font-semibold text-xs sm:text-sm truncate leading-tight">
              {trackTitle}
            </span>
            <span className={`text-[11px] font-mono truncate ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
              {artistName}
            </span>
          </div>
          <button
            onClick={() => setIsLiked(!isLiked)}
            className={`hidden sm:flex p-1.5 rounded-full transition-colors cursor-pointer ${
              isLiked ? 'text-rose-500' : isLight ? 'text-zinc-400 hover:text-zinc-800' : 'text-zinc-500 hover:text-white'
            }`}
            aria-label="Favorite"
          >
            <Heart size={15} fill={isLiked ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* 4. CENTER: PLAYBACK CONTROLS (WITH APPROVED PLAY/PAUSE TRIGGER) */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <button
            className={`p-2 rounded-full transition-colors cursor-pointer ${
              isLight ? 'text-zinc-600 hover:text-black' : 'text-zinc-400 hover:text-white'
            }`}
            aria-label="Previous Track"
          >
            <SkipBack size={18} />
          </button>

          {/* Central Chiseled Trigger Button (Approved Size: 52px, Snappy Morph) */}
          <PlayPauseTrigger
            isPlaying={isPlaying}
            onToggle={onTogglePlay}
            size={52}
            theme={theme}
            enableSpacebar={true}
          />

          <button
            className={`p-2 rounded-full transition-colors cursor-pointer ${
              isLight ? 'text-zinc-600 hover:text-black' : 'text-zinc-400 hover:text-white'
            }`}
            aria-label="Next Track"
          >
            <SkipForward size={18} />
          </button>
        </div>

        {/* 5. RIGHT: TIME PROGRESS & STATUS */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden md:flex flex-col items-end font-mono text-[11px]">
            <span className="font-medium text-white">{currentTime} / {totalTime}</span>
            <span className="text-[10px] text-zinc-500 uppercase">24-Bit Lossless</span>
          </div>
          <button
            className={`p-2 rounded-full transition-colors cursor-pointer ${
              isLight ? 'text-zinc-600 hover:text-black' : 'text-zinc-400 hover:text-white'
            }`}
            aria-label="Volume"
          >
            <Volume2 size={17} />
          </button>
        </div>
      </div>
    </div>
  );
};
