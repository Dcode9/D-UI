import React, { useState, useEffect } from 'react';
import { SAMPLE_TRACKS, Track, RepeatMode } from '../components/dtunes/types';
import { DTunesPlayerDock } from '../components/dtunes/DTunesPlayerDock';
import { GrainBlurLens } from '../components/dtunes/GrainBlurSurface';

export const StudioPage: React.FC = () => {
  // Track list state
  const [tracks, setTracks] = useState<Track[]>(SAMPLE_TRACKS);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(42);
  const [volume, setVolume] = useState<number>(0.78);
  const [shuffle, setShuffle] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');

  // Utility panels state
  const [isQueueOpen, setIsQueueOpen] = useState<boolean>(false);
  const [isLyricsOpen, setIsLyricsOpen] = useState<boolean>(false);
  const [isEqualizerOpen, setIsEqualizerOpen] = useState<boolean>(false);

  const currentTrack = tracks[currentTrackIndex] || tracks[0];

  // Simulated playback timer
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setCurrentTime((prev) => {
        if (prev >= currentTrack.duration) {
          if (repeatMode === 'one') {
            return 0;
          } else if (repeatMode === 'all') {
            setCurrentTrackIndex((i) => (i + 1) % tracks.length);
            return 0;
          } else {
            setIsPlaying(false);
            return 0;
          }
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, currentTrack.duration, repeatMode, tracks.length]);

  // Handlers
  const handleTogglePlay = (playing?: boolean) => {
    setIsPlaying(playing !== undefined ? playing : !isPlaying);
  };

  const handlePrev = () => {
    setCurrentTrackIndex((i) => (i > 0 ? i - 1 : tracks.length - 1));
    setCurrentTime(0);
  };

  const handleNext = () => {
    if (shuffle) {
      const nextIndex = Math.floor(Math.random() * tracks.length);
      setCurrentTrackIndex(nextIndex);
    } else {
      setCurrentTrackIndex((i) => (i + 1) % tracks.length);
    }
    setCurrentTime(0);
  };

  const handleSeek = (time: number) => {
    setCurrentTime(Math.min(currentTrack.duration, Math.max(0, time)));
  };

  const handleToggleLike = (id: string) => {
    setTracks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isLiked: !t.isLiked } : t))
    );
  };

  const handleToggleRepeat = () => {
    const cycle: Record<RepeatMode, RepeatMode> = {
      off: 'all',
      all: 'one',
      one: 'off',
    };
    setRepeatMode(cycle[repeatMode]);
  };

  return (
    <div className="w-full min-h-[220vh] bg-[#050508] text-white selection:bg-cyan-400 selection:text-black">
      {/* ========================================================================= */}
      {/* 1. SCROLLABLE DEMO MOCK UI UNDERNEATH (Glides under the bottom dock)       */}
      {/* ========================================================================= */}
      <main className="w-full max-w-5xl mx-auto px-6 pt-24 pb-56 space-y-12">
        {/* Editorial Album Header */}
        <section className="relative w-full h-[340px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl flex items-end p-8 sm:p-10 select-none">
          <img
            src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop"
            alt="Hero Banner"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-[#050508]/40 to-transparent" />

          <div className="relative z-10 space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-bold text-cyan-400 uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-cyan-950/70 border border-cyan-500/30">
                D'Tunes Studio Showcase
              </span>
              <span className="font-mono text-[10px] text-zinc-400">
                Custom Mezzotint Blur Surface
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight">
              Optical Resonance
            </h1>
            <p className="font-mono text-xs text-zinc-300">
              Scroll down to evaluate the redesigned bottom player dock gliding over artwork, high-contrast typography, and tracklists.
            </p>
          </div>
        </section>

        {/* Section divider with keyboard shortcut reminder */}
        <div className="flex items-center justify-between font-mono text-xs text-zinc-500 border-b border-white/10 pb-3">
          <span className="uppercase tracking-wider">Original D'Tunes Collection</span>
          <span className="text-zinc-400">Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-sans text-[11px]">Spacebar</kbd> anywhere to Play/Pause</span>
        </div>

        {/* Track List (Passes directly beneath the bottom bar as you scroll) */}
        <div className="space-y-3">
          {tracks.map((track, idx) => {
            const isCurrent = currentTrackIndex === idx;
            return (
              <div
                key={track.id}
                onClick={() => {
                  setCurrentTrackIndex(idx);
                  setCurrentTime(0);
                  setIsPlaying(true);
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                  isCurrent
                    ? 'bg-white/10 border-cyan-400/40 shadow-[0_8px_30px_rgba(0,0,0,0.6)]'
                    : 'bg-white/5 border-white/5 hover:bg-white/8 hover:border-white/15'
                }`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white/15 shadow">
                    <img
                      src={track.coverUrl}
                      alt={track.title}
                      className="w-full h-full object-cover select-none"
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className={`text-sm font-semibold truncate ${isCurrent ? 'text-cyan-300' : 'text-white'}`}>
                      {track.title}
                    </h3>
                    <p className="text-xs font-mono text-zinc-400 truncate">
                      {track.artist} • {track.album}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 font-mono text-xs text-zinc-400">
                  {track.bitrate && (
                    <span className="hidden sm:inline px-2 py-0.5 rounded bg-white/5 text-[10px] text-zinc-300 border border-white/10">
                      {track.bitrate}
                    </span>
                  )}
                  <span>{Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, '0')}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* High-Contrast Graphic Test Section (Ideal for testing stipple blur without ghosting) */}
        <section className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-cyan-950/20 via-zinc-900 to-black border border-white/10 space-y-4">
          <p className="font-mono text-xs uppercase tracking-widest text-cyan-400">
            Acoustic Litho Dispersion
          </p>
          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tighter leading-tight text-white">
            Discrete Ink Stipple
          </h2>
          <p className="font-mono text-xs text-zinc-400 max-w-xl leading-relaxed">
            The Mezzotint grain blur material replaces standard Gaussian / CSS blurs with a physical stochastic dispersion field.
            As this panel scrolls underneath the D'Tunes dock, notice how the text dissolves organically into tactile particles with 100% native contrast.
          </p>
        </section>

        {/* High-Chrominance Album Cards Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="relative h-64 rounded-3xl overflow-hidden border border-white/10 p-6 flex flex-col justify-end group">
            <img
              src="https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=800&auto=format&fit=crop"
              alt="Prism Dynamics"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
            <div className="relative z-10 space-y-1">
              <span className="font-mono text-[10px] font-bold text-cyan-300 uppercase tracking-widest">
                Prism Dynamics
              </span>
              <h3 className="text-xl font-bold text-white">Full Spectrum Waveforms</h3>
              <p className="font-mono text-xs text-zinc-400">High-saturation chromatic evaluation</p>
            </div>
          </div>

          <div className="relative h-64 rounded-3xl overflow-hidden border border-white/10 p-6 flex flex-col justify-end group">
            <img
              src="https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop"
              alt="Cyber Dusk"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
            <div className="relative z-10 space-y-1">
              <span className="font-mono text-[10px] font-bold text-amber-300 uppercase tracking-widest">
                Cyber Dusk
              </span>
              <h3 className="text-xl font-bold text-white">Solar Acoustic Synthesis</h3>
              <p className="font-mono text-xs text-zinc-400">Warm gamut particle scattering</p>
            </div>
          </div>
        </section>

        {/* Minimal lens callout for side-by-side inspection */}
        <section className="p-6 rounded-3xl border border-white/10 bg-white/[0.02] flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <h4 className="text-base font-semibold text-white">Settled Material Formula</h4>
            <p className="font-mono text-xs text-zinc-400">
              Scatter: 55px • Grain Density: 0.70 • Optical Diffusion: 8.5px • Octaves: 1
            </p>
          </div>
          <div className="relative w-36 h-20 rounded-2xl overflow-hidden border border-white/20 shrink-0">
            <GrainBlurLens
              radius={38}
              x={50}
              y={50}
              scatter={55}
              grainDensity={0.70}
              opticalDiffusion={8.5}
              octaves={1}
              showRim={true}
              className="w-full h-full"
            >
              <img
                src={currentTrack.coverUrl}
                alt="Mini Lens"
                className="w-full h-full object-cover"
              />
            </GrainBlurLens>
          </div>
        </section>
      </main>

      {/* ========================================================================= */}
      {/* 2. THE AUTHENTIC D'TUNES PLAYER DOCK (WITH CUSTOM MEZZOTINT BLUR)          */}
      {/* ========================================================================= */}
      <aside className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-6xl px-4 pointer-events-auto">
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
          onToggleLike={handleToggleLike}
        />
      </aside>
    </div>
  );
};
