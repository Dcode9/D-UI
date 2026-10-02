import React from 'react';
import {
  Shuffle,
  SkipBack,
  SkipForward,
  Repeat,
  Mic2,
  Sliders,
  ListMusic,
  Heart,
  Maximize2,
} from 'lucide-react';
import { Track, RepeatMode } from './types';
import {
  HeroPlayButton,
  OpticalButton,
  OpticalSeekbar,
  OpticalVolumeControl,
} from './OpticalControls';

export interface DTunesPlayerDockProps {
  track: Track;
  isPlaying: boolean;
  onTogglePlay: () => void;
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
  isQueueOpen: boolean;
  onToggleQueue: () => void;
  queueCount: number;
  isLyricsOpen: boolean;
  onToggleLyrics: () => void;
  isEqualizerOpen: boolean;
  onToggleEqualizer: () => void;
  onExpandCard: () => void;
  onToggleLike: (id: string) => void;
  className?: string;
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
  isQueueOpen,
  onToggleQueue,
  queueCount,
  isLyricsOpen,
  onToggleLyrics,
  isEqualizerOpen,
  onToggleEqualizer,
  onExpandCard,
  onToggleLike,
  className = '',
}) => {
  return (
    <div
      className={`w-full max-w-6xl mx-auto glass-dock rounded-3xl p-3 sm:p-4 flex items-center justify-between gap-4 sm:gap-6 shadow-[0_20px_50px_rgba(0,0,0,0.85)] border border-white/10 select-none ${className}`}
    >
      {/* 1. LEFT ZONE: Current Track Information & Artwork */}
      <div className="flex items-center gap-3 min-w-0 flex-shrink-0 sm:w-64">
        {/* Album Artwork thumbnail */}
        <div
          onClick={onExpandCard}
          className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border border-white/15 cursor-pointer shadow-md group"
          title="Click to view Full Card Visualizer"
        >
          <img
            src={track.coverUrl}
            alt={track.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <Maximize2 size={16} className="text-white" />
          </div>
        </div>

        {/* Track Titles */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h4
              onClick={onExpandCard}
              className="text-xs sm:text-sm font-bold text-white truncate cursor-pointer hover:text-cyan-200 transition-colors"
            >
              {track.title}
            </h4>
          </div>
          <p className="text-[11px] text-zinc-400 truncate mt-0.5">{track.artist}</p>
        </div>

        {/* Heart Like Button */}
        <button
          onClick={() => onToggleLike(track.id)}
          className={`p-2 rounded-xl transition-all cursor-pointer ${
            track.isLiked ? 'text-red-500 hover:text-red-400' : 'text-zinc-500 hover:text-zinc-200'
          }`}
          title="Favorite"
        >
          <Heart size={18} className={track.isLiked ? 'fill-red-500' : 'fill-none'} />
        </button>
      </div>

      {/* 2. CENTER ZONE: Master Playback Transport & Waveform Seekbar */}
      <div className="flex-1 flex flex-col items-center max-w-xl">
        {/* Buttons Row */}
        <div className="flex items-center gap-2 sm:gap-4 mb-1.5">
          <OpticalButton
            size="sm"
            variant="ghost"
            active={shuffle}
            onClick={onToggleShuffle}
            title={`Shuffle: ${shuffle ? 'Active' : 'Off'}`}
          >
            <Shuffle size={16} className={shuffle ? 'text-cyan-400' : 'text-zinc-400'} />
          </OpticalButton>

          <OpticalButton size="sm" variant="ghost" onClick={onPrev} title="Previous (Left Arrow)">
            <SkipBack size={18} />
          </OpticalButton>

          {/* Hero Center Play/Pause */}
          <HeroPlayButton isPlaying={isPlaying} onToggle={onTogglePlay} size="md" />

          <OpticalButton size="sm" variant="ghost" onClick={onNext} title="Next (Right Arrow)">
            <SkipForward size={18} />
          </OpticalButton>

          <OpticalButton
            size="sm"
            variant="ghost"
            active={repeatMode !== 'off'}
            onClick={onToggleRepeat}
            title={`Repeat: ${repeatMode}`}
          >
            <Repeat size={16} className={repeatMode !== 'off' ? 'text-cyan-400' : 'text-zinc-400'} />
          </OpticalButton>
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

      {/* 3. RIGHT ZONE: Audio Utilities, Lyrics, EQ, Queue, Volume */}
      <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
        {/* Lyrics Button with Live Activity Pip */}
        <OpticalButton
          size="sm"
          variant="glass"
          active={isLyricsOpen}
          onClick={onToggleLyrics}
          title="Synchronized Lyrics (L)"
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
          title="Studio Graphic Equalizer (E)"
        >
          <Sliders size={16} />
        </OpticalButton>

        {/* Queue Drawer Button with Count Badge */}
        <OpticalButton
          size="sm"
          variant="glass"
          active={isQueueOpen}
          onClick={onToggleQueue}
          title="Play Queue (Q)"
          className="relative"
        >
          <ListMusic size={16} />
          {queueCount > 0 && (
            <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-white text-zinc-950">
              {queueCount}
            </span>
          )}
        </OpticalButton>

        <div className="w-[1px] h-6 bg-white/10 mx-1" />

        {/* Volume Slider */}
        <OpticalVolumeControl volume={volume} onChange={onVolumeChange} />
      </div>
    </div>
  );
};
