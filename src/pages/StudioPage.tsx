import React, { useState } from 'react';
import { Volume2, SkipBack, SkipForward } from 'lucide-react';
import { PlayPauseTrigger } from '../components/dtunes/PlayPauseTrigger';
import { GrainBlurFilter, GRAIN_BLUR_DEFAULTS } from '../components/dtunes/GrainBlurSurface';

const DEMO_TRACKS = [
  {
    id: 1,
    title: "D'Verse (Optical Resonance)",
    artist: "Dcode9 Sound Lab",
    album: "Optical Vol. 1",
    duration: "3:38",
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop",
    tag: "Magenta & Cyan",
  },
  {
    id: 2,
    title: "Sunset Cyber Pulse",
    artist: "WWDC Optical",
    album: "Solar Acoustics",
    duration: "4:12",
    url: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=600&auto=format&fit=crop",
    tag: "Warm Amber",
  },
  {
    id: 3,
    title: "Chromatic Spectrum",
    artist: "Prism Lab",
    album: "RGB Dynamics",
    duration: "2:54",
    url: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=600&auto=format&fit=crop",
    tag: "Full Prism",
  },
  {
    id: 4,
    title: "Editorial Monochrome",
    artist: "Mono Craft",
    album: "8♣ Edition",
    duration: "3:45",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop",
    tag: "High Contrast",
  },
  {
    id: 5,
    title: "Sub-harmonic Needle",
    artist: "Acoustic Matrix",
    album: "Vector Resonances",
    duration: "5:06",
    url: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=600&auto=format&fit=crop",
    tag: "Deep Violet",
  },
];

export const StudioPage: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);

  const filterId = 'dtunes-bottom-bar-mezzotint';
  const currentTrack = DEMO_TRACKS[currentTrackIndex];

  return (
    <div className="w-full min-h-[180vh] bg-[#050508] text-white selection:bg-cyan-500 selection:text-black">
      {/* 1. MASTER MEZZOTINT BLUR SHADER (Settled: 55px / 0.70 / 8.5px) */}
      <GrainBlurFilter
        id={filterId}
        scatter={GRAIN_BLUR_DEFAULTS.scatter}
        grainDensity={GRAIN_BLUR_DEFAULTS.grainDensity}
        opticalDiffusion={GRAIN_BLUR_DEFAULTS.opticalDiffusion}
        octaves={1}
      />

      {/* 2. DEMO MOCK UI CONTENT (Passes underneath the bottom bar as you scroll) */}
      <div className="w-full max-w-4xl mx-auto px-6 pt-24 pb-48 space-y-12">
        {/* Top Hero Release Banner */}
        <section className="relative w-full h-[320px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl flex items-end p-8 select-none">
          <img
            src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop"
            alt="Hero Banner"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-transparent to-transparent" />

          <div className="relative z-10 space-y-2">
            <span className="font-mono text-[11px] font-bold text-cyan-400 uppercase tracking-widest px-2.5 py-1 rounded-full bg-black/60 border border-white/10">
              Featured Release
            </span>
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight">
              Optical Resonance Vol. 1
            </h1>
            <p className="font-mono text-xs text-zinc-300">
              Scroll down to evaluate the bottom bar blur over tracks, artwork & typography.
            </p>
          </div>
        </section>

        {/* Scroll Instruction */}
        <div className="flex items-center justify-between font-mono text-xs text-zinc-500 border-b border-white/10 pb-3">
          <span>Track Collection</span>
          <span>Spacebar toggles Play/Pause anywhere</span>
        </div>

        {/* Track List (Passes directly under the bottom bar during scroll) */}
        <div className="space-y-3">
          {DEMO_TRACKS.map((track, idx) => (
            <div
              key={track.id}
              onClick={() => {
                setCurrentTrackIndex(idx);
                setIsPlaying(true);
              }}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                currentTrackIndex === idx
                  ? 'bg-white/10 border-white/20 shadow-lg'
                  : 'bg-white/5 border-white/5 hover:bg-white/8 hover:border-white/15'
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white/15 shadow">
                  <img src={track.url} alt={track.title} className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold truncate text-white">{track.title}</h3>
                  <p className="text-xs font-mono text-zinc-400 truncate">{track.artist} • {track.album}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0 font-mono text-xs text-zinc-400">
                <span className="hidden sm:inline px-2 py-0.5 rounded bg-white/5 text-[10px] text-zinc-300">
                  {track.tag}
                </span>
                <span>{track.duration}</span>
              </div>
            </div>
          ))}
        </div>

        {/* High-Contrast Graphic & Typography Section (Ideal for testing stipple blur) */}
        <section className="p-8 rounded-3xl bg-gradient-to-br from-purple-950/40 via-zinc-900 to-black border border-white/10 space-y-4">
          <p className="font-mono text-xs uppercase tracking-widest text-cyan-400">
            Acoustic Litho Printmaking
          </p>
          <h2 className="text-4xl sm:text-5xl font-black uppercase tracking-tighter leading-none text-white">
            Discrete Ink Stipple
          </h2>
          <p className="font-mono text-xs text-zinc-400 max-w-lg leading-relaxed">
            The Mezzotint shader converts continuous color fields into surgical blue-noise ink vectors.
            Notice how the bottom bar dissolves this text into tactile dither when scrolled over.
          </p>
        </section>

        {/* Colorful Album Cards Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative h-64 rounded-3xl overflow-hidden border border-white/10 p-6 flex flex-col justify-end">
            <img
              src="https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=800&auto=format&fit=crop"
              alt="Card 1"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40" />
            <div className="relative z-10">
              <span className="font-mono text-xs text-cyan-300 font-bold uppercase">Prism Dynamics</span>
              <h3 className="text-2xl font-bold text-white">Full Spectrum Acoustics</h3>
            </div>
          </div>

          <div className="relative h-64 rounded-3xl overflow-hidden border border-white/10 p-6 flex flex-col justify-end">
            <img
              src="https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop"
              alt="Card 2"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40" />
            <div className="relative z-10">
              <span className="font-mono text-xs text-amber-300 font-bold uppercase">Cyber Dusk</span>
              <h3 className="text-2xl font-bold text-white">Solar Synthetics</h3>
            </div>
          </div>
        </section>
      </div>

      {/* ========================================================================= */}
      {/* 3. THE FLOATING BOTTOM PLAYER BAR (WITH GRAIN BLUR EFFECT)                */}
      {/* ========================================================================= */}
      <aside className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4 pointer-events-auto select-none">
        <div
          className="relative w-full h-[76px] rounded-full overflow-hidden border border-white/20 shadow-[0_25px_60px_rgba(0,0,0,0.95)] flex items-center justify-between px-5 sm:px-6"
          style={{
            backgroundColor: 'rgba(8, 8, 12, 0.45)',
          }}
        >
          {/* THE MEZZOTINT GRAIN BLUR BACKDROP LAYER */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              filter: `url(#${filterId})`,
              WebkitBackdropFilter: 'blur(8.5px)',
              backdropFilter: 'blur(8.5px)',
              transform: 'translateZ(0)',
              willChange: 'filter',
            }}
          />

          {/* Dither Texture Mask Layer for Physical Risograph Tactility */}
          <div
            className="absolute inset-0 pointer-events-none opacity-45 mix-blend-overlay"
            style={{
              backgroundImage: `radial-gradient(circle 1px at 1px 1px, rgba(255,255,255,0.7) 1px, transparent 0)`,
              backgroundSize: '3px 3px',
            }}
          />

          {/* Specular Ridge Top Highlight */}
          <div className="absolute inset-0 rounded-full pointer-events-none border-t border-white/35" />

          {/* Content Layer A: Track Information */}
          <div className="relative z-20 flex items-center gap-3 min-w-0 max-w-[180px] sm:max-w-xs">
            <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-white/20 shadow-md">
              <img
                src={currentTrack.url}
                alt={currentTrack.title}
                className="w-full h-full object-cover select-none"
              />
            </div>
            <div className="min-w-0 flex flex-col">
              <span className="font-semibold text-xs sm:text-sm truncate text-white leading-tight">
                {currentTrack.title}
              </span>
              <span className="text-[11px] font-mono truncate text-zinc-400">
                {currentTrack.artist}
              </span>
            </div>
          </div>

          {/* Content Layer B: Center Playback Controls (WITH PERFECTED FAST BUTTON) */}
          <div className="relative z-20 flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={() => setCurrentTrackIndex((i) => (i > 0 ? i - 1 : DEMO_TRACKS.length - 1))}
              className="p-2 rounded-full text-zinc-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Previous Track"
            >
              <SkipBack size={18} />
            </button>

            {/* Approved Play/Pause Button with Snappy Fast Morph & Spacebar Anywhere */}
            <PlayPauseTrigger
              isPlaying={isPlaying}
              onToggle={(p) => setIsPlaying(p)}
              size={50}
              theme="dark"
              enableSpacebar={true}
            />

            <button
              onClick={() => setCurrentTrackIndex((i) => (i < DEMO_TRACKS.length - 1 ? i + 1 : 0))}
              className="p-2 rounded-full text-zinc-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Next Track"
            >
              <SkipForward size={18} />
            </button>
          </div>

          {/* Content Layer C: Right Status & Meta */}
          <div className="relative z-20 flex items-center gap-3 shrink-0">
            <div className="hidden sm:flex flex-col items-end font-mono text-[11px]">
              <span className="font-medium text-white">{currentTrack.duration}</span>
              <span className="text-[9px] text-cyan-400 uppercase font-bold tracking-wider">
                {isPlaying ? 'PLAYING' : 'PAUSED'}
              </span>
            </div>
            <button
              className="p-2 rounded-full text-zinc-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Volume"
            >
              <Volume2 size={16} />
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
};
