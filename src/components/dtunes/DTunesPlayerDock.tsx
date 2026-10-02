import React from 'react';
import {
  Shuffle,
  SkipBack,
  SkipForward,
  Mic2,
  Sliders,
  ListMusic,
  Heart,
  Maximize2,
} from 'lucide-react';
import { Track, RepeatMode } from './types';
import {
  OpticalButton,
  OpticalSeekbar,
  OpticalVolumeControl,
  OpticalRepeatButton,
} from './OpticalControls';
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
  onExpandCard?: () => void;
  onToggleLike: (id: string) => void;
  className?: string;
  filterId?: string;
}

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
  queueCount = 0,
  isLyricsOpen = false,
  onToggleLyrics,
  isEqualizerOpen = false,
  onToggleEqualizer,
  onExpandCard,
  onToggleLike,
  className = '',
  filterId = 'dtunes-dock-grain-blur',
}) => {
  return (
    <div
      className={`relative w-full max-w-6xl mx-auto rounded-3xl py-3 px-4 sm:px-6 flex items-center justify-between gap-4 sm:gap-6 shadow-[0_30px_70px_rgba(0,0,0,0.95),0_0_1px_rgba(255,255,255,0.3)] border border-white/15 select-none ${className}`}
    >
      {/* 1. MASTER MEZZOTINT GRAIN BLUR SHADER PIPELINE (Settled: 55px / 0.70 / 8.5px) */}
      <GrainBlurFilter
        id={filterId}
        scatter={GRAIN_BLUR_DEFAULTS.scatter}
        grainDensity={GRAIN_BLUR_DEFAULTS.grainDensity}
        opticalDiffusion={GRAIN_BLUR_DEFAULTS.opticalDiffusion}
        octaves={1}
      />

      {/* 2. OPTICAL DIFFUSION BACKDROP (8.5px diffusion spread + dense obsidian tint so underlying sharp text cannot be seen) */}
      <div
        className="absolute inset-0 rounded-[inherit] pointer-events-none"
        style={{
          backdropFilter: `blur(${GRAIN_BLUR_DEFAULTS.opticalDiffusion}px)`,
          WebkitBackdropFilter: `blur(${GRAIN_BLUR_DEFAULTS.opticalDiffusion}px)`,
          backgroundColor: 'rgba(9, 9, 13, 0.88)',
        }}
      />

      {/* 3. PROCEDURAL MEZZOTINT INK GRAIN TEXTURE (GPU rendered via SVG turbulence - soft velvet photographic grain) */}
      <svg
        className="absolute inset-0 w-full h-full rounded-[inherit] pointer-events-none opacity-20 mix-blend-overlay"
        aria-hidden="true"
      >
        <filter id="dtunes-dock-surface-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.70"
            numOctaves="1"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#dtunes-dock-surface-grain)" />
      </svg>

      {/* 4. SPECULAR RIDGE TOP RIM & INNER GLOSS CATCH */}
      <div className="absolute inset-0 rounded-[inherit] pointer-events-none border-t border-white/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.22)]" />

      {/* ========================================================================= */}
      {/* ZONE 1: CURRENT TRACK INFORMATION & ARTWORK                              */}
      {/* ========================================================================= */}
      <div className="relative z-10 flex items-center gap-3.5 min-w-0 flex-shrink-0 sm:w-80">
        {/* Album Artwork thumbnail with hover zoom & expand icon */}
        <div
          onClick={onExpandCard}
          className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border border-white/20 cursor-pointer shadow-md group"
          title="Click to view Full Card Visualizer"
        >
          <img
            src={track.coverUrl}
            alt={track.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 select-none"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <Maximize2 size={16} className="text-white" />
          </div>
        </div>

        {/* Track Titles */}
        <div className="flex-1 min-w-0">
          <h4
            onClick={onExpandCard}
            className="text-xs sm:text-sm font-bold text-white truncate cursor-pointer hover:text-cyan-300 transition-colors leading-tight"
            title={track.title}
          >
            {track.title}
          </h4>
          <p className="text-[11px] font-mono text-zinc-400 truncate mt-0.5 leading-tight">
            {track.artist}
          </p>
        </div>

        {/* Heart Like Button */}
        <button
          onClick={() => onToggleLike(track.id)}
          className={`p-2 rounded-xl transition-all cursor-pointer ${
            track.isLiked ? 'text-red-500 hover:text-red-400' : 'text-zinc-500 hover:text-zinc-200'
          }`}
          title={track.isLiked ? 'Remove from Favorites' : 'Add to Favorites'}
          aria-label="Favorite"
        >
          <Heart size={18} className={track.isLiked ? 'fill-red-500' : 'fill-none'} />
        </button>
      </div>

      {/* ========================================================================= */}
      {/* ZONE 2: MASTER PLAYBACK TRANSPORT & WAVEFORM SEEKBAR                      */}
      {/* ========================================================================= */}
      <div className="relative z-10 flex-1 flex flex-col items-center max-w-xl">
        {/* Transport Buttons Row */}
        <div className="flex items-center gap-2.5 sm:gap-4 mb-2">
          <OpticalButton
            size="sm"
            variant="ghost"
            active={shuffle}
            onClick={onToggleShuffle}
            title={`Shuffle: ${shuffle ? 'Active' : 'Off'}`}
          >
            <Shuffle size={16} className={shuffle ? 'text-cyan-400' : 'text-zinc-400'} />
          </OpticalButton>

          <OpticalButton size="sm" variant="ghost" onClick={onPrev} title="Previous Track (Left Arrow)">
            <SkipBack size={18} />
          </OpticalButton>

          {/* Hero Center Play/Pause Trigger (Snappy 120ms Morph, Obsidian Geometry, Spacebar Support, No Aura) */}
          <PlayPauseTrigger
            isPlaying={isPlaying}
            onToggle={onTogglePlay}
            size={48}
            theme="dark"
            enableSpacebar={true}
          />

          <OpticalButton size="sm" variant="ghost" onClick={onNext} title="Next Track (Right Arrow)">
            <SkipForward size={18} />
          </OpticalButton>

          {/* Repeat Button with Mode Cycling */}
          <OpticalRepeatButton repeatMode={repeatMode} onToggle={onToggleRepeat} />
        </div>

        {/* Needle Waveform Seekbar */}
        <div className="w-full">
          <OpticalSeekbar
            currentTime={currentTime}
            duration={duration}
            isPlaying={isPlaying}
            onSeek={onSeek}
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ZONE 3: AUDIO UTILITIES, LYRICS, EQ, QUEUE, VOLUME                        */}
      {/* ========================================================================= */}
      <div className="relative z-10 hidden lg:flex items-center gap-2 flex-shrink-0">
        {/* Lyrics Button with Live Activity Pip */}
        <OpticalButton
          size="sm"
          variant="glass"
          active={isLyricsOpen}
          onClick={onToggleLyrics}
          title="Synchronized Lyrics"
        >
          <Mic2 size={16} />
          {isPlaying && (
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          )}
        </OpticalButton>

        {/* Studio Equalizer Button */}
        <OpticalButton
          size="sm"
          variant="glass"
          active={isEqualizerOpen}
          onClick={onToggleEqualizer}
          title="Studio Graphic Equalizer"
        >
          <Sliders size={16} />
        </OpticalButton>

        {/* Queue Drawer Button with Count Badge */}
        <OpticalButton
          size="sm"
          variant="glass"
          active={isQueueOpen}
          onClick={onToggleQueue}
          title="Play Queue"
          className="relative"
        >
          <ListMusic size={16} />
          {queueCount > 0 && (
            <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-cyan-400 text-zinc-950">
              {queueCount}
            </span>
          )}
        </OpticalButton>

        {/* Tactile Divider */}
        <div className="w-[1px] h-6 bg-white/15 mx-1" />

        {/* Volume Slider with Mute Toggle & Percentage */}
        <OpticalVolumeControl volume={volume} onChange={onVolumeChange} />
      </div>
    </div>
  );
};
