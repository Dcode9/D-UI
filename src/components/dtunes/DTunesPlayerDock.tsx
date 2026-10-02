import React, { useRef, useEffect, useState } from 'react';
import {
  Shuffle,
  SkipBack,
  SkipForward,
  Repeat,
  Mic2,
  Sliders,
  ListMusic,
  Heart,
  ChevronUp,
  Volume2,
  VolumeX,
  Volume1,
} from 'lucide-react';
import { Track, RepeatMode } from './types';
import { PlayPauseTrigger } from './PlayPauseTrigger';
import { GrainBlurFilter, GRAIN_BLUR_DEFAULTS } from './GrainBlurSurface';

export interface DTunesPlayerDockProps {
  track: Track;
  isPlaying: boolean;
  onTogglePlay: (playing?: boolean) => void;
  onPrev: () => void;
  onNext: () => void;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  volume: number;
  onVolumeChange: (v: number) => void;
  shuffle: boolean;
  onToggleShuffle: () => void;
  repeatMode: RepeatMode;
  onToggleRepeat: () => void;
  isQueueOpen?: boolean;
  onToggleQueue?: () => void;
  queueCount?: number;
  isLyricsOpen?: boolean;
  onToggleLyrics?: () => void;
  isEqualizerOpen?: boolean;
  onToggleEqualizer?: () => void;
  onToggleLike: (id: string) => void;
  className?: string;
}

// Formatter for mm:ss
const formatTime = (seconds: number): string => {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

/**
 * EXACT DUPLICATION OF REAL D'TUNES BOTTOM BAR (#player-footer)
 * - Stack: #info-island (top right) + #player-card (bottom pill)
 * - Material: Custom Mezzotint Grain Blur replaces generic CSS backdrop-blur
 */
export const DTunesPlayerDock: React.FC<DTunesPlayerDockProps> = ({
  track,
  isPlaying,
  onTogglePlay,
  onPrev,
  onNext,
  currentTime,
  duration,
  onSeek,
  volume,
  onVolumeChange,
  shuffle,
  onToggleShuffle,
  repeatMode,
  onToggleRepeat,
  isQueueOpen = false,
  onToggleQueue,
  queueCount = 3,
  isLyricsOpen = false,
  onToggleLyrics,
  isEqualizerOpen = false,
  onToggleEqualizer,
  onToggleLike,
  className = '',
}) => {
  // Seekbar canvas ref & state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoverProgress, setHoverProgress] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [prevVolume, setPrevVolume] = useState(volume > 0 ? volume : 0.75);

  const safeDuration = duration > 0 ? duration : 1;
  const currentProgress = Math.min(1, Math.max(0, currentTime / safeDuration));

  // Audio Visualizer Waveform Canvas animation loop (Identical to D'Tunes visualizer.js)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const render = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      const centerY = height / 2;
      t += 0.04;

      // Draw background track line
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Number of wave points
      const points = 72;
      const progressX = width * currentProgress;

      // Unplayed Waveform (dim white/zinc)
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      for (let i = 0; i <= points; i++) {
        const x = (i / points) * width;
        const normX = i / points;
        const env = Math.sin(normX * Math.PI); // taper ends
        const wave = isPlaying
          ? Math.sin(normX * 12 + t) * 6 * env + Math.sin(normX * 24 - t * 1.5) * 3 * env
          : Math.sin(normX * 8) * 3 * env;

        ctx.lineTo(x, centerY + wave);
      }
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Played Waveform (glow white/cyan with progress clipping)
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, progressX, height);
      ctx.clip();

      ctx.beginPath();
      ctx.moveTo(0, centerY);
      for (let i = 0; i <= points; i++) {
        const x = (i / points) * width;
        const normX = i / points;
        const env = Math.sin(normX * Math.PI);
        const wave = isPlaying
          ? Math.sin(normX * 12 + t) * 6 * env + Math.sin(normX * 24 - t * 1.5) * 3 * env
          : Math.sin(normX * 8) * 3 * env;

        ctx.lineTo(x, centerY + wave);
      }
      ctx.strokeStyle = '#22d3ee';
      ctx.shadowColor = 'rgba(34, 211, 238, 0.8)';
      ctx.shadowBlur = isPlaying ? 8 : 2;
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.restore();

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, currentProgress]);

  // Handle seeking
  const handleSeekPointer = (clientX: number, target: HTMLDivElement) => {
    const rect = target.getBoundingClientRect();
    const frac = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    setHoverProgress(frac);
    onSeek(frac * safeDuration);
  };

  const toggleMute = () => {
    if (volume > 0) {
      setPrevVolume(volume);
      onVolumeChange(0);
    } else {
      onVolumeChange(prevVolume || 0.75);
    }
  };

  const VolumeIcon = volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <div
      id="player-footer"
      className={`fixed bottom-6 left-6 right-6 z-50 flex flex-col items-end pointer-events-none gap-2 select-none ${className}`}
    >
      {/* ========================================================================= */}
      {/* 1. MASTER MEZZOTINT GRAIN BLUR SHADER PIPELINE (Settled: 55px / 0.70 / 8.5px) */}
      {/* ========================================================================= */}
      <GrainBlurFilter
        id="dtunes-mezzotint-filter"
        scatter={GRAIN_BLUR_DEFAULTS.scatter}
        grainDensity={GRAIN_BLUR_DEFAULTS.grainDensity}
        opticalDiffusion={GRAIN_BLUR_DEFAULTS.opticalDiffusion}
        octaves={1}
      />

      {/* ========================================================================= */}
      {/* 2. TOP ITEM: #info-island (Floating Now Playing Card over bottom bar right) */}
      {/* ========================================================================= */}
      <div
        id="info-island"
        className="pointer-events-auto relative w-full md:w-80 rounded-2xl p-2 pr-4 flex items-center shadow-2xl border border-white/15 overflow-hidden transition-all duration-300 group"
      >
        {/* CUSTOM MEZZOTINT GRAIN BLUR BACKDROP (Replaces generic blur(24px)) */}
        <div
          className="absolute inset-0 rounded-[inherit] pointer-events-none"
          style={{
            backdropFilter: `blur(${GRAIN_BLUR_DEFAULTS.opticalDiffusion}px)`,
            WebkitBackdropFilter: `blur(${GRAIN_BLUR_DEFAULTS.opticalDiffusion}px)`,
            backgroundColor: 'rgba(14, 14, 20, 0.78)',
          }}
        />
        {/* Procedural SVG Turbulence Ink Grain */}
        <svg
          className="absolute inset-0 w-full h-full rounded-[inherit] pointer-events-none opacity-30 mix-blend-overlay"
          aria-hidden="true"
        >
          <filter id="info-island-surface-grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.70" numOctaves="1" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#info-island-surface-grain)" />
        </svg>
        {/* Specular ridge top catch */}
        <div className="absolute inset-0 rounded-[inherit] pointer-events-none border-t border-white/35 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]" />

        {/* Expand queue chevron (reveals on hover like in real D'Tunes) */}
        <button
          onClick={onToggleQueue}
          id="btn-expand-queue"
          className="relative z-10 w-0 opacity-0 overflow-hidden text-gray-400 hover:text-white transition-all duration-300 group-hover:w-7 group-hover:opacity-100 flex items-center justify-center flex-shrink-0 cursor-pointer hidden md:flex"
          aria-label="Expand Queue"
          title="Open Queue"
        >
          <ChevronUp size={18} className="transition-transform duration-300 group-hover:-translate-y-0.5" />
        </button>

        {/* Album Artwork thumbnail with spinning glow ring */}
        <div
          id="album-art-wrapper"
          className="relative z-10 w-12 h-12 flex-shrink-0 cursor-pointer rounded-xl shadow-md ml-1 my-1 overflow-hidden border border-white/20 group/art"
        >
          {/* Animated Glow Border */}
          <div
            className="absolute -inset-1 rounded-xl opacity-60 blur-[6px] bg-gradient-to-r from-cyan-400 via-purple-500 to-amber-400 animate-spin pointer-events-none"
            style={{ animationDuration: '9s' }}
          />
          <img
            id="curr-art-img"
            src={track.coverUrl}
            alt={track.title}
            className="relative z-10 w-full h-full object-cover transition-transform duration-300 group-hover/art:scale-105 select-none"
          />
        </div>

        {/* Track Title & Artist Meta */}
        <div id="player-track-meta" className="relative z-10 flex items-center justify-between flex-1 min-w-0 ml-3">
          <div className="flex-1 min-w-0 flex flex-col justify-center cursor-pointer">
            <h3
              id="p-title"
              className="font-bold text-white text-sm truncate hover:text-cyan-300 transition-colors leading-tight"
              title={track.title}
            >
              {track.title}
            </h3>
            <p id="p-artist" className="text-xs text-gray-400 truncate mt-0.5 leading-tight">
              {track.artist}
            </p>
          </div>

          {/* Heart Like Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleLike(track.id);
            }}
            id="p-like-btn"
            className={`p-1.5 transition cursor-pointer flex-shrink-0 ml-2 rounded-lg ${
              track.isLiked ? 'text-red-500 hover:text-red-400' : 'text-gray-400 hover:text-white'
            }`}
            aria-label="Favorite"
            title={track.isLiked ? 'Remove Like' : 'Like'}
          >
            <Heart size={18} className={track.isLiked ? 'fill-red-500' : 'fill-none'} />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MAIN PLAYER PILL (#player-card: Exactly matching D'Tunes layout)       */}
      {/* ========================================================================= */}
      <div
        id="player-card"
        className="pointer-events-auto relative w-full rounded-2xl shadow-2xl p-2 px-4 flex items-center gap-4 h-[72px] border border-white/15 overflow-hidden"
      >
        {/* CUSTOM MEZZOTINT GRAIN BLUR BACKDROP (Replaces generic blur(24px)) */}
        <div
          className="absolute inset-0 rounded-[inherit] pointer-events-none"
          style={{
            backdropFilter: `blur(${GRAIN_BLUR_DEFAULTS.opticalDiffusion}px)`,
            WebkitBackdropFilter: `blur(${GRAIN_BLUR_DEFAULTS.opticalDiffusion}px)`,
            backgroundColor: 'rgba(14, 14, 20, 0.80)',
          }}
        />
        {/* Procedural SVG Turbulence Ink Grain */}
        <svg
          className="absolute inset-0 w-full h-full rounded-[inherit] pointer-events-none opacity-30 mix-blend-overlay"
          aria-hidden="true"
        >
          <filter id="player-card-surface-grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.70" numOctaves="1" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#player-card-surface-grain)" />
        </svg>
        {/* Specular ridge top catch */}
        <div className="absolute inset-0 rounded-[inherit] pointer-events-none border-t border-white/35 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]" />

        {/* ----------------------------------------------------------------------- */}
        {/* ZONE A: TRANSPORT CONTROLS (Left side of player-card)                  */}
        {/* ----------------------------------------------------------------------- */}
        <div className="relative z-10 flex items-center gap-3 flex-shrink-0">
          {/* Shuffle button */}
          <button
            onClick={onToggleShuffle}
            id="btn-shuffle"
            className={`transition cursor-pointer p-1.5 rounded-lg ${
              shuffle ? 'text-cyan-400' : 'text-gray-400 hover:text-white'
            }`}
            title={`Shuffle: ${shuffle ? 'On' : 'Off'}`}
            aria-label="Shuffle"
          >
            <Shuffle size={18} />
          </button>

          {/* Previous button */}
          <button
            onClick={onPrev}
            id="btn-prev"
            className="text-gray-300 hover:text-white transition cursor-pointer p-1.5 rounded-lg flex-shrink-0"
            title="Previous (Left Arrow)"
            aria-label="Previous"
          >
            <SkipBack size={20} />
          </button>

          {/* Master Play/Pause Hero Button (Snappy 120ms morph, obsidian finish, no aura) */}
          <PlayPauseTrigger
            isPlaying={isPlaying}
            onToggle={onTogglePlay}
            size={48}
            theme="dark"
            enableSpacebar={true}
          />

          {/* Next button */}
          <button
            onClick={onNext}
            id="btn-next"
            className="text-gray-300 hover:text-white transition cursor-pointer p-1.5 rounded-lg flex-shrink-0"
            title="Next (Right Arrow)"
            aria-label="Next"
          >
            <SkipForward size={20} />
          </button>

          {/* Repeat button with mode cycling */}
          <button
            onClick={onToggleRepeat}
            id="btn-repeat"
            className={`relative transition cursor-pointer p-1.5 rounded-lg ${
              repeatMode !== 'off' ? 'text-cyan-400' : 'text-gray-400 hover:text-white'
            }`}
            title={`Repeat: ${repeatMode}`}
            aria-label="Repeat"
          >
            <Repeat size={18} />
            {repeatMode === 'one' && (
              <span className="absolute -top-1 -right-1 text-[8px] font-mono font-bold bg-cyan-400 text-black rounded-full px-1">
                1
              </span>
            )}
          </button>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* ZONE B: WAVEFORM VISUALIZER SEEK BAR (Center of player-card)            */}
        {/* ----------------------------------------------------------------------- */}
        <div className="relative z-10 flex-1 h-full relative flex flex-col justify-center group px-4 border-l border-white/10 ml-2">
          <div
            id="seek-bar-container"
            onPointerDown={(e) => {
              setIsDragging(true);
              handleSeekPointer(e.clientX, e.currentTarget);
            }}
            onPointerMove={(e) => {
              if (isDragging || e.buttons === 1) {
                handleSeekPointer(e.clientX, e.currentTarget);
              } else {
                const rect = e.currentTarget.getBoundingClientRect();
                setHoverProgress(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)));
              }
            }}
            onPointerUp={() => setIsDragging(false)}
            onPointerLeave={() => {
              if (!isDragging) setHoverProgress(null);
            }}
            className="w-full h-[46px] relative flex items-center cursor-pointer select-none"
          >
            {/* Hover Tooltip showing Timestamp */}
            {hoverProgress !== null && (
              <div
                id="seek-tooltip"
                className="absolute -top-8 -translate-x-1/2 px-2 py-0.5 rounded bg-black/90 border border-white/20 text-[10px] font-mono text-white shadow-xl pointer-events-none z-30"
                style={{ left: `${hoverProgress * 100}%` }}
              >
                {formatTime(hoverProgress * safeDuration)}
              </div>
            )}

            {/* Canvas Visualizer Waveform */}
            <canvas
              ref={canvasRef}
              id="visualizer-canvas"
              className="absolute inset-0 w-full h-full pointer-events-none"
            />

            {/* Circular Scrubber Thumb (matching D'Tunes input[type=range] thumb) */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.9)] pointer-events-none transition-transform duration-75"
              style={{ left: `calc(${currentProgress * 100}% - 6px)` }}
            />
          </div>

          {/* Timestamps Row */}
          <div id="seek-time-row" className="flex justify-between w-full text-[11px] text-gray-400 font-mono -mt-1 px-1">
            <span id="seek-current-time">{formatTime(currentTime)}</span>
            <span id="seek-duration-time">{formatTime(safeDuration)}</span>
          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* ZONE C: UTILITIES & VOLUME (Right side of player-card)                  */}
        {/* ----------------------------------------------------------------------- */}
        <div className="relative z-10 flex items-center gap-2 border-l border-white/10 pl-3 flex-shrink-0">
          {/* Lyrics button with cyan indicator dot */}
          <button
            onClick={onToggleLyrics}
            id="btn-lyrics"
            className={`relative p-2 transition rounded-full hover:bg-white/10 cursor-pointer ${
              isLyricsOpen ? 'text-cyan-400' : 'text-gray-400 hover:text-white'
            }`}
            title="Lyrics (L)"
            aria-label="Lyrics"
          >
            <Mic2 size={18} />
            {isPlaying && (
              <span
                id="lyrics-indicator-dot"
                className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-sm shadow-cyan-500/50"
              />
            )}
          </button>

          {/* Studio Equalizer button */}
          <button
            onClick={onToggleEqualizer}
            id="btn-equalizer"
            className={`p-2 transition rounded-full hover:bg-white/10 cursor-pointer ${
              isEqualizerOpen ? 'text-cyan-400' : 'text-gray-400 hover:text-white'
            }`}
            title="Studio Equalizer & Bass Control (E)"
            aria-label="Equalizer"
          >
            <Sliders size={18} />
          </button>

          {/* Queue button with badge count */}
          <button
            onClick={onToggleQueue}
            id="btn-queue-desktop"
            className={`p-2 transition rounded-full hover:bg-white/10 hidden md:flex items-center justify-center relative cursor-pointer ${
              isQueueOpen ? 'text-cyan-400' : 'text-gray-400 hover:text-white'
            }`}
            title="Queue (Q)"
            aria-label="Queue"
          >
            <ListMusic size={18} />
            {queueCount > 0 && (
              <span
                id="queue-badge-count"
                className="absolute -top-1 -right-1 text-[9px] font-black bg-cyan-400 text-black rounded-full px-1.5 min-w-[16px] h-4 flex items-center justify-center"
              >
                {queueCount}
              </span>
            )}
          </button>

          {/* Volume slider */}
          <div className="w-24 hidden md:flex items-center gap-1.5" id="volume-control-wrapper">
            <button
              onClick={toggleMute}
              className="text-gray-400 hover:text-white transition cursor-pointer p-1"
              title={volume === 0 ? 'Unmute' : 'Mute'}
              aria-label="Mute toggle"
            >
              <VolumeIcon size={16} />
            </button>
            <input
              type="range"
              id="volume-slider"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-cyan-400 hover:bg-gray-500 transition-colors"
              aria-label="Volume"
            />
          </div>

          {/* Hi-Fi Lossless badge */}
          <div
            id="ios-quality-badge"
            className="hidden lg:flex text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-white/10 text-gray-300 border border-white/15"
          >
            Hi-Fi
          </div>
        </div>
      </div>
    </div>
  );
};
