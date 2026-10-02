import React from 'react';
import { DTunesPlayerDock, DTunesPlayerDockProps } from './DTunesPlayerDock';
import { Track } from './types';

export interface BottomPlayerBarProps extends Omit<Partial<DTunesPlayerDockProps>, 'currentTime' | 'duration'> {
  isPlaying: boolean;
  onTogglePlay: (playing?: boolean) => void;
  trackTitle?: string;
  artistName?: string;
  coverUrl?: string;
  currentTime?: string | number;
  duration?: number;
  totalTime?: string | number;
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
  currentTime = 102,
  duration,
  totalTime = 218,
  className = '',
  ...rest
}) => {
  const numericDuration = duration ?? (typeof totalTime === 'number' ? totalTime : 218);
  const numericCurrentTime = typeof currentTime === 'number' ? currentTime : 102;

  const mockTrack: Track = {
    id: 'active-track',
    title: trackTitle,
    artist: artistName,
    album: 'Optical Vol. 1',
    duration: numericDuration,
    coverUrl: coverUrl,
    isLiked: false,
  };

  return (
    <DTunesPlayerDock
      track={rest.track || mockTrack}
      isPlaying={isPlaying}
      onTogglePlay={onTogglePlay}
      onPrev={rest.onPrev || (() => {})}
      onNext={rest.onNext || (() => {})}
      currentTime={numericCurrentTime}
      duration={numericDuration}
      onSeek={rest.onSeek || (() => {})}
      volume={rest.volume ?? 0.75}
      onVolumeChange={rest.onVolumeChange || (() => {})}
      shuffle={rest.shuffle ?? false}
      onToggleShuffle={rest.onToggleShuffle || (() => {})}
      repeatMode={rest.repeatMode ?? 'off'}
      onToggleRepeat={rest.onToggleRepeat || (() => {})}
      onToggleLike={rest.onToggleLike || (() => {})}
      className={className}
      {...rest}
    />
  );
};

export { DTunesPlayerDock };
