import React, { useState } from 'react';
import { X, Mic2, Sliders, Heart, SkipBack, SkipForward, Shuffle, Repeat, Sun, Moon } from 'lucide-react';
import { Track, RepeatMode } from './types';
import { StippleStarburstVisualizer } from './StippleStarburstVisualizer';
import { HeroPlayButton, OpticalButton, OpticalSeekbar, OpticalBadge } from './OpticalControls';

export interface ExpandedCardPlayerProps {
  track: Track;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onPrev: () => void;
  onNext: () => void;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  shuffle: boolean;
  onToggleShuffle: () => void;
  repeatMode: RepeatMode;
  onToggleRepeat: () => void;
  onOpenLyrics?: () => void;
  onOpenEqualizer?: () => void;
  onClose: () => void;
  className?: string;
}

export const ExpandedCardPlayer: React.FC<ExpandedCardPlayerProps> = ({
  track,
  isPlaying,
  onTogglePlay,
  onPrev,
  onNext,
  currentTime,
  duration,
  onSeek,
  shuffle,
  onToggleShuffle,
  repeatMode,
  onToggleRepeat,
  onOpenLyrics,
  onOpenEqualizer,
  onClose,
  className = '',
}) => {
  const [cardTheme, setCardTheme] = useState<'dark' | 'light'>('dark');
  const [isLiked, setIsLiked] = useState(track.isLiked || false);

  const isLight = cardTheme === 'light';

  return (
    <div
      className={`relative w-full max-w-sm sm:max-w-md mx-auto aspect-[1/1.45] rounded-[36px] overflow-hidden p-6 sm:p-7 flex flex-col justify-between select-none shadow-[0_35px_80px_rgba(0,0,0,0.85)] border transition-all duration-500 z-50 ${
        isLight
          ? 'bg-[#f6f5f0] text-zinc-900 border-zinc-300 shadow-2xl'
          : 'bg-[#08080c] text-zinc-100 border-white/15'
      } ${className}`}
    >
      {/* 1. TOP CARD HEADER: Optical 8♣ Typography, Theme Toggle & Controls */}
      <div className="relative z-20 flex items-start justify-between">
        {/* Top-Left Playing Card Index (Optical Typography) */}
        <div className="flex flex-col items-center leading-none">
          <span className="font-mono text-3xl sm:text-4xl font-black tracking-tighter">8</span>
          <span className="text-xl sm:text-2xl -mt-1 font-serif">♣</span>
        </div>

        {/* Top Action Pills */}
        <div className="flex items-center gap-1.5 bg-black/20 dark:bg-white/5 p-1 rounded-2xl backdrop-blur-md border border-white/10">
          {/* Card Theme Switcher (Dark Mode / Authentic Cream Paper Mode) */}
          <button
            onClick={() => setCardTheme(isLight ? 'dark' : 'light')}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
            title={isLight ? 'Switch to Dark Obsidian' : 'Switch to Stark Card Paper'}
          >
            {isLight ? <Moon size={16} /> : <Sun size={16} />}
          </button>

          {onOpenEqualizer && (
            <button
              onClick={onOpenEqualizer}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
              title="Open Studio EQ"
            >
              <Sliders size={16} />
            </button>
          )}

          {onOpenLyrics && (
            <button
              onClick={onOpenLyrics}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
              title="Open Synchronized Lyrics"
            >
              <Mic2 size={16} />
            </button>
          )}

          {/* Close / Collapse Card */}
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
            title="Minimize to Dock"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* 2. CENTER STAGE: Living Stippled Starburst Canvas (Uploaded Reference) */}
      <div className="relative w-full flex-1 my-3 flex items-center justify-center overflow-hidden">
        {/* Living Needle Starburst Audio Visualizer */}
        <StippleStarburstVisualizer
          isPlaying={isPlaying}
          audioFrequency={isPlaying ? 0.65 : 0.2}
          theme={cardTheme}
          showCardOverlay={false}
          needleCount={8}
          className="w-full h-full bg-transparent border-none shadow-none"
        />

        {/* Ambient Subtle Track Details Watermark */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
          <OpticalBadge
            label={track.bitrate || "Optical Hi-Fi"}
            variant={isLight ? 'outline' : 'accent'}
            className="mb-2 text-[9px]"
          />
          <h2
            className={`text-lg sm:text-xl font-bold tracking-tight line-clamp-1 ${
              isLight ? 'text-zinc-950' : 'text-white'
            }`}
          >
            {track.title}
          </h2>
          <p className="text-xs text-zinc-500 font-medium mt-0.5 line-clamp-1">
            {track.artist}
          </p>
        </div>
      </div>

      {/* 3. BOTTOM SECTION: Seekbar & Master Transport Controls */}
      <div className="relative z-20 flex flex-col gap-3">
        {/* Optical Seekbar with live Waveform */}
        <OpticalSeekbar
          currentTime={currentTime}
          duration={duration}
          isPlaying={isPlaying}
          onSeek={onSeek}
        />

        {/* Playback Control Deck */}
        <div className="flex items-center justify-between pt-1">
          {/* Bottom-Left Shuffle & Repeat */}
          <div className="flex items-center gap-1">
            <OpticalButton
              size="sm"
              variant="ghost"
              active={shuffle}
              onClick={onToggleShuffle}
              title={`Shuffle: ${shuffle ? 'On' : 'Off'}`}
            >
              <Shuffle size={16} className={shuffle ? 'text-cyan-400' : 'text-zinc-400'} />
            </OpticalButton>

            <OpticalButton
              size="sm"
              variant="ghost"
              active={repeatMode !== 'off'}
              onClick={onToggleRepeat}
              title={`Repeat: ${repeatMode}`}
            >
              <Repeat
                size={16}
                className={repeatMode !== 'off' ? 'text-cyan-400' : 'text-zinc-400'}
              />
            </OpticalButton>
          </div>

          {/* Center Transport: Prev, Hero Play/Pause, Next */}
          <div className="flex items-center gap-3">
            <button
              onClick={onPrev}
              className="p-2 text-zinc-400 hover:text-white transition-colors cursor-pointer active:scale-95"
              aria-label="Previous Track"
            >
              <SkipBack size={22} />
            </button>

            <HeroPlayButton
              isPlaying={isPlaying}
              onToggle={onTogglePlay}
              size="lg"
            />

            <button
              onClick={onNext}
              className="p-2 text-zinc-400 hover:text-white transition-colors cursor-pointer active:scale-95"
              aria-label="Next Track"
            >
              <SkipForward size={22} />
            </button>
          </div>

          {/* Bottom-Right Inverted Card Index (8♣) & Like Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsLiked(!isLiked)}
              className={`p-2 transition-transform active:scale-125 cursor-pointer ${
                isLiked ? 'text-red-500' : 'text-zinc-400 hover:text-zinc-200'
              }`}
              aria-label="Favorite"
            >
              <Heart size={20} className={isLiked ? 'fill-red-500' : 'fill-none'} />
            </button>

            {/* Inverted 8♣ Corner */}
            <div className="flex flex-col items-center leading-none rotate-180">
              <span className="font-mono text-xl sm:text-2xl font-black tracking-tighter">8</span>
              <span className="text-sm font-serif">♣</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
