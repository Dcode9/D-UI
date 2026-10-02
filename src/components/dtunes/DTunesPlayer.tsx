import React, { useState, useEffect } from 'react';
import { Track, SAMPLE_TRACKS, RepeatMode } from './types';
import { DTunesPlayerDock } from './DTunesPlayerDock';
import { ExpandedCardPlayer } from './ExpandedCardPlayer';
import { QueueDrawer } from './QueueDrawer';
import { LyricsModal } from './LyricsModal';
import { EqualizerModal } from './EqualizerModal';

export interface DTunesPlayerProps {
  initialTracks?: Track[];
  defaultExpanded?: boolean;
  className?: string;
}

export const DTunesPlayer: React.FC<DTunesPlayerProps> = ({
  initialTracks = SAMPLE_TRACKS,
  defaultExpanded = false,
  className = '',
}) => {
  const [tracks, setTracks] = useState<Track[]>(initialTracks);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.85);
  const [shuffle, setShuffle] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  const [history, setHistory] = useState<Track[]>([]);
  const [autoplayEnabled, setAutoplayEnabled] = useState<boolean>(true);

  // UI Drawers & Overlays
  const [isQueueOpen, setIsQueueOpen] = useState<boolean>(false);
  const [isLyricsOpen, setIsLyricsOpen] = useState<boolean>(false);
  const [isEqualizerOpen, setIsEqualizerOpen] = useState<boolean>(false);
  const [isCardExpanded, setIsCardExpanded] = useState<boolean>(defaultExpanded);

  const currentTrack = tracks[currentTrackIndex] || tracks[0];

  // Playback timer ticker simulation
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= currentTrack.duration) {
            handleNext();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, currentTrack]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (activeEl?.tagName === 'INPUT' || activeEl?.tagName === 'TEXTAREA') return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      } else if (e.key === 'l' || e.key === 'L') {
        setIsLyricsOpen((p) => !p);
      } else if (e.key === 'q' || e.key === 'Q') {
        setIsQueueOpen((p) => !p);
      } else if (e.key === 'e' || e.key === 'E') {
        setIsEqualizerOpen((p) => !p);
      } else if (e.key === 'Escape') {
        setIsLyricsOpen(false);
        setIsQueueOpen(false);
        setIsEqualizerOpen(false);
        setIsCardExpanded(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleTogglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const handlePrev = () => {
    if (currentTime > 4) {
      setCurrentTime(0);
      return;
    }
    setCurrentTime(0);
    if (currentTrackIndex > 0) {
      setCurrentTrackIndex(currentTrackIndex - 1);
    } else {
      setCurrentTrackIndex(tracks.length - 1);
    }
  };

  const handleNext = () => {
    // Add current track to history
    setHistory((prev) => [currentTrack, ...prev.filter((t) => t.id !== currentTrack.id)]);
    setCurrentTime(0);

    if (repeatMode === 'one') {
      return;
    }

    if (shuffle) {
      const randIdx = Math.floor(Math.random() * tracks.length);
      setCurrentTrackIndex(randIdx);
      return;
    }

    if (currentTrackIndex < tracks.length - 1) {
      setCurrentTrackIndex(currentTrackIndex + 1);
    } else if (repeatMode === 'all') {
      setCurrentTrackIndex(0);
    } else {
      setIsPlaying(false);
    }
  };

  const handleSeek = (time: number) => {
    setCurrentTime(time);
  };

  const handleToggleRepeat = () => {
    setRepeatMode((prev) => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  };

  const handleToggleLike = (id: string) => {
    setTracks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isLiked: !t.isLiked } : t))
    );
  };

  const handleSelectTrackFromQueue = (track: Track) => {
    const idx = tracks.findIndex((t) => t.id === track.id);
    if (idx !== -1) {
      setCurrentTrackIndex(idx);
      setCurrentTime(0);
      setIsPlaying(true);
    }
  };

  return (
    <div className={`relative z-40 select-none ${className}`}>
      {/* 1. EXPANDED FULL CARD MODAL OVERLAY (8♣ Playing Card Living Starburst) */}
      {isCardExpanded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
          <ExpandedCardPlayer
            track={currentTrack}
            isPlaying={isPlaying}
            onTogglePlay={handleTogglePlay}
            onPrev={handlePrev}
            onNext={handleNext}
            currentTime={currentTime}
            duration={currentTrack.duration}
            onSeek={handleSeek}
            shuffle={shuffle}
            onToggleShuffle={() => setShuffle(!shuffle)}
            repeatMode={repeatMode}
            onToggleRepeat={handleToggleRepeat}
            onOpenLyrics={() => setIsLyricsOpen(true)}
            onOpenEqualizer={() => setIsEqualizerOpen(true)}
            onClose={() => setIsCardExpanded(false)}
          />
        </div>
      )}

      {/* 2. OVERLAYS / DRAWERS */}
      {/* Synchronized Lyrics Overlay */}
      {isLyricsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-lg">
          <LyricsModal
            isOpen={isLyricsOpen}
            onClose={() => setIsLyricsOpen(false)}
            track={currentTrack}
            currentTime={currentTime}
            onSeekToLine={handleSeek}
          />
        </div>
      )}

      {/* Studio Graphic Equalizer Overlay */}
      {isEqualizerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-lg">
          <EqualizerModal
            isOpen={isEqualizerOpen}
            onClose={() => setIsEqualizerOpen(false)}
          />
        </div>
      )}

      {/* Up Next & History Queue Popover */}
      {isQueueOpen && (
        <div className="fixed bottom-24 right-4 sm:right-8 z-40">
          <QueueDrawer
            isOpen={isQueueOpen}
            onClose={() => setIsQueueOpen(false)}
            queue={tracks}
            history={history}
            currentTrackId={currentTrack.id}
            isPlaying={isPlaying}
            onSelectTrack={handleSelectTrackFromQueue}
            onClearQueue={() => setTracks([currentTrack])}
            onClearHistory={() => setHistory([])}
            autoplayEnabled={autoplayEnabled}
            onToggleAutoplay={() => setAutoplayEnabled(!autoplayEnabled)}
          />
        </div>
      )}

      {/* 3. MASTER BOTTOM DOCK */}
      <div className="w-full px-4 sm:px-6 pb-4">
        <DTunesPlayerDock
          track={currentTrack}
          isPlaying={isPlaying}
          onTogglePlay={handleTogglePlay}
          onPrev={handlePrev}
          onNext={handleNext}
          currentTime={currentTime}
          duration={currentTrack.duration}
          onSeek={handleSeek}
          volume={volume}
          onVolumeChange={setVolume}
          shuffle={shuffle}
          onToggleShuffle={() => setShuffle(!shuffle)}
          repeatMode={repeatMode}
          onToggleRepeat={handleToggleRepeat}
          isQueueOpen={isQueueOpen}
          onToggleQueue={() => setIsQueueOpen(!isQueueOpen)}
          queueCount={tracks.length}
          isLyricsOpen={isLyricsOpen}
          onToggleLyrics={() => setIsLyricsOpen(!isLyricsOpen)}
          isEqualizerOpen={isEqualizerOpen}
          onToggleEqualizer={() => setIsEqualizerOpen(!isEqualizerOpen)}
          onExpandCard={() => setIsCardExpanded(true)}
          onToggleLike={handleToggleLike}
        />
      </div>
    </div>
  );
};
