import React, { useState } from 'react';
import {
  Copy,
  Check,
  Palette,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { GrainBlurLens } from '../components/dtunes/GrainBlurSurface';

const SHOWCASE_ARTWORKS = [
  {
    title: 'Neon Fluid Resonance',
    artist: 'Dcode9 Sound Lab',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop',
    tag: 'Vibrant Magenta & Cyan',
  },
  {
    title: 'Sunset Cyber Pulse',
    artist: 'WWDC Optical Labs',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop',
    tag: 'Warm Amber & Gold',
  },
  {
    title: 'Chromatic Spectrum Waves',
    artist: 'Prism Acoustics',
    url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=800&auto=format&fit=crop',
    tag: 'Full Spectrum Prism',
  },
];

export const ShowcasePage: React.FC<{ onNavigateToStudio?: () => void }> = ({
  onNavigateToStudio,
}) => {
  const [activeArt, setActiveArt] = useState<number>(0);
  const [lensRadius, setLensRadius] = useState<number>(105);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [activeCodeTab, setActiveCodeTab] = useState<'surface' | 'lens' | 'filter'>('surface');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const codeSnippets = {
    surface: `import { GrainBlurSurface } from './components/dtunes/GrainBlurSurface';

export const AlbumGlassCard = () => {
  return (
    <GrainBlurSurface
      variant="card"
      scatter={55}
      grainDensity={0.70}
      opticalDiffusion={8.5}
      theme="dark"
      bordered={true}
    >
      <div className="p-6 text-white font-mono">
        <h3 className="text-xl font-bold">D'Tunes Optical Player</h3>
        <p className="text-xs text-zinc-400">Lossless 24-bit audio</p>
      </div>
    </GrainBlurSurface>
  );
};`,
    lens: `import { GrainBlurLens } from './components/dtunes/GrainBlurSurface';

export const OpticalArtworkLens = () => {
  return (
    <GrainBlurLens
      radius={110}
      x={50}
      y={50}
      scatter={55}
      grainDensity={0.70}
      opticalDiffusion={8.5}
      showRim={true}
    >
      <img src="/album-cover.jpg" alt="Now Playing" className="w-full h-full object-cover" />
    </GrainBlurLens>
  );
};`,
    filter: `import { GrainBlurFilter } from './components/dtunes/GrainBlurSurface';

// Mount the GPU shader once in your tree:
<GrainBlurFilter id="dtunes-blur" scatter={55} grainDensity={0.70} opticalDiffusion={8.5} />

// Apply via standard CSS anywhere:
<div style={{ filter: 'url(#dtunes-blur)' }}>
  Content transformed into tactile mezzotint stipple
</div>`,
  };

  return (
    <div className="min-h-screen w-full bg-[#050508] text-zinc-100 font-sans selection:bg-cyan-500 selection:text-black">
      {/* HERO SECTION */}
      <section className="w-full max-w-6xl mx-auto px-6 pt-16 pb-12 flex flex-col items-start gap-4 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider">
            D'Tunes Design System
          </span>
          <span className="text-zinc-600 font-mono text-xs">•</span>
          <span className="text-zinc-400 font-mono text-xs">Component Showcase</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white uppercase">
          Curated Components & Optical Materials
        </h1>

        <p className="text-sm sm:text-base text-zinc-400 max-w-3xl leading-relaxed">
          The definitive component library for D'Tunes. Every component is extracted, rigorously
          prototyped in the studio lab, audited for visual flaws, and optimized for 60fps GPU performance.
        </p>

        {/* Action Link to Studio */}
        <div className="pt-2 flex items-center gap-4">
          <button
            onClick={onNavigateToStudio}
            className="px-5 py-2.5 rounded-xl bg-white text-black font-mono font-bold text-xs hover:bg-zinc-200 transition-all flex items-center gap-2 shadow-lg cursor-pointer"
          >
            <span>Open Studio Lab (Component 02 Workbench)</span>
            <ArrowRight size={14} />
          </button>
          <span className="text-xs font-mono text-zinc-500">
            Currently prototyping: The Play/Pause Trigger
          </span>
        </div>
      </section>

      {/* COMPONENT 01: THE FINALIZED MATERIAL SHOWCASE */}
      <section className="w-full max-w-6xl mx-auto px-6 py-14 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold mb-1">
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/30 uppercase">
                Component 01 • Finalized
              </span>
              <span>Framework Material</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Color Mezzotint Grain Blur Material
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl">
              Physical risograph stipple physics with 100% native image contrast preservation and zero underlying bleed-through.
            </p>
          </div>

          {/* Metric Pill Badges */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <div className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-zinc-300">
              Scatter: <span className="text-cyan-400 font-bold">55px</span>
            </div>
            <div className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-zinc-300">
              Density: <span className="text-cyan-400 font-bold">0.70</span>
            </div>
            <div className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-zinc-300">
              Diffusion: <span className="text-cyan-400 font-bold">8.5px</span>
            </div>
            <div className="px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold">
              Native Contrast: 100%
            </div>
          </div>
        </div>

        {/* INTERACTIVE SHOWCASE STAGE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: THE INTERACTIVE OPTICAL LENS STAGE */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="relative w-full h-[460px] rounded-3xl overflow-hidden border border-white/15 bg-black/60 shadow-2xl flex items-center justify-center p-6 select-none">
              {/* Artwork Swapper Pills */}
              <div className="absolute top-4 left-6 right-6 z-30 flex items-center justify-between pointer-events-auto">
                <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-1.5 uppercase font-bold px-2 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10">
                  <Palette size={11} className="text-cyan-400" />
                  <span>Interactive Artwork</span>
                </span>
                <div className="flex items-center gap-1 p-1 rounded-full bg-black/80 backdrop-blur-md border border-white/10 text-[11px] font-mono">
                  {SHOWCASE_ARTWORKS.map((art, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveArt(idx)}
                      className={`px-3 py-0.5 rounded-full cursor-pointer transition-all ${
                        activeArt === idx
                          ? 'bg-white text-black font-bold shadow'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {art.title.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* The Optical Lens on Live Art */}
              <div className="w-full h-full max-w-[340px] max-h-[340px] relative rounded-2xl overflow-hidden shadow-2xl border border-white/20 mt-4">
                <GrainBlurLens
                  radius={lensRadius}
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
                    src={SHOWCASE_ARTWORKS[activeArt].url}
                    alt={SHOWCASE_ARTWORKS[activeArt].title}
                    className="w-full h-full object-cover"
                  />
                  {/* Overlay Meta Card */}
                  <div className="absolute bottom-2 left-2 right-2 p-2.5 rounded-xl bg-black/85 backdrop-blur-md text-white text-xs font-mono flex justify-between items-center border border-white/10">
                    <div className="min-w-0 pr-2">
                      <p className="font-bold truncate">{SHOWCASE_ARTWORKS[activeArt].title}</p>
                      <p className="text-[10px] text-zinc-400 truncate">{SHOWCASE_ARTWORKS[activeArt].artist}</p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-cyan-300 font-bold whitespace-nowrap">
                      {SHOWCASE_ARTWORKS[activeArt].tag}
                    </span>
                  </div>
                </GrainBlurLens>
              </div>

              {/* Footnote instruction */}
              <div className="absolute bottom-3 left-6 right-6 text-center text-[11px] font-mono text-zinc-500">
                Inside the circular lens: 0% underlying sharp pixels • Full native chromatic mezzotint stipple
              </div>
            </div>

            {/* Lens Controls */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
              <div className="flex items-center gap-3">
                <span className="text-zinc-400">Lens Diameter:</span>
                <input
                  type="range"
                  min="60"
                  max="140"
                  value={lensRadius}
                  onChange={(e) => setLensRadius(Number(e.target.value))}
                  className="w-32 h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
                <span className="font-bold text-white">{lensRadius * 2}px</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>60fps GPU Pipeline Active</span>
              </div>
            </div>
          </div>

          {/* RIGHT: SPECIFICATIONS & CODE IMPLEMENTATION */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Specs Table */}
            <div className="p-5 rounded-3xl bg-white/5 border border-white/10 space-y-3 font-mono">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <ShieldCheck size={14} />
                  <span>Material Physics Specifications</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-zinc-300">
                  Locked 2026
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-zinc-400">Scatter Displacement:</span>
                  <span className="font-bold text-white">55px (Vector Reach)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-zinc-400">Grain Turbulence Density:</span>
                  <span className="font-bold text-white">0.70 (Procedural Blue-Noise)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-zinc-400">Optical Gaussian Spread:</span>
                  <span className="font-bold text-white">8.5px (Diffusion Radius)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-zinc-400">Chromatic Gamut / Contrast:</span>
                  <span className="font-bold text-emerald-400">100% Native Unclipped</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-zinc-400">Underlying Sharp Bleed:</span>
                  <span className="font-bold text-emerald-400">0% (Inverted Alpha Mask)</span>
                </div>
              </div>
            </div>

            {/* Code Snippets Card */}
            <div className="p-5 rounded-3xl bg-zinc-950 border border-white/15 flex flex-col gap-3 font-mono">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setActiveCodeTab('surface')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                      activeCodeTab === 'surface'
                        ? 'bg-white text-black'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Surface
                  </button>
                  <button
                    onClick={() => setActiveCodeTab('lens')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                      activeCodeTab === 'lens'
                        ? 'bg-white text-black'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Lens
                  </button>
                  <button
                    onClick={() => setActiveCodeTab('filter')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                      activeCodeTab === 'filter'
                        ? 'bg-white text-black'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Raw Filter
                  </button>
                </div>

                <button
                  onClick={() => copyToClipboard(codeSnippets[activeCodeTab])}
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-zinc-200 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {copiedCode ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <pre className="text-[11px] text-zinc-300 bg-black/60 p-3.5 rounded-2xl overflow-x-auto leading-relaxed border border-white/5">
                <code>{codeSnippets[activeCodeTab]}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* ROADMAP & UPCOMING COMPONENTS */}
      <section className="w-full max-w-6xl mx-auto px-6 py-14 border-t border-white/10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
              Component Library Pipeline
            </span>
            <h3 className="text-2xl font-bold tracking-tight text-white mt-1">
              Active Design & Extraction Roadmap
            </h3>
          </div>
          <span className="text-xs font-mono text-zinc-500">
            Designing 1-by-1 with deep iteration
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
          {/* Card 02: Play/Pause Trigger */}
          <div
            onClick={onNavigateToStudio}
            className="p-5 rounded-3xl bg-cyan-950/20 border border-cyan-500/40 hover:border-cyan-400 transition-all cursor-pointer flex flex-col justify-between gap-4 group"
          >
            <div>
              <div className="flex items-center justify-between text-[11px] text-cyan-300 font-bold mb-2">
                <span>02 • IN STUDIO LAB</span>
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              </div>
              <h4 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                Hero Play/Pause Trigger
              </h4>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Spacebar toggle anywhere, tactile mezzotint noise blur halo burst, and surgical icon morph.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-bold">
              <span>Open in Studio</span>
              <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 03: Track Scrubber */}
          <div className="p-5 rounded-3xl bg-white/5 border border-white/10 flex flex-col justify-between gap-4 opacity-70">
            <div>
              <div className="text-[11px] text-zinc-500 font-bold mb-2">03 • QUEUED</div>
              <h4 className="text-base font-bold text-zinc-200">Track Scrubber & Needle Reticle</h4>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Micro-tick timeline, surgical needle reticle, and optical timecode typography.
              </p>
            </div>
            <span className="text-[11px] text-zinc-500">Pending Component 02</span>
          </div>

          {/* Card 04: Now Playing Island */}
          <div className="p-5 rounded-3xl bg-white/5 border border-white/10 flex flex-col justify-between gap-4 opacity-70">
            <div>
              <div className="text-[11px] text-zinc-500 font-bold mb-2">04 • QUEUED</div>
              <h4 className="text-base font-bold text-zinc-200">Now-Playing Compact Island</h4>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Floating glassmorphic pill housing micro-art, title glyphs, and audio meters.
              </p>
            </div>
            <span className="text-[11px] text-zinc-500">Pending Component 03</span>
          </div>

          {/* Card 05: Kinetic Visualizer */}
          <div className="p-5 rounded-3xl bg-white/5 border border-white/10 flex flex-col justify-between gap-4 opacity-70">
            <div>
              <div className="text-[11px] text-zinc-500 font-bold mb-2">05 • QUEUED</div>
              <h4 className="text-base font-bold text-zinc-200">Kinetic Equalizer Visualizer</h4>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Procedural frequency bars and starburst stipple reacting dynamically to audio.
              </p>
            </div>
            <span className="text-[11px] text-zinc-500">Pending Component 04</span>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full max-w-6xl mx-auto px-6 py-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-zinc-500">
        <div>D'Tunes Optical UI Design System • Lossless Sound Lab 2026</div>
        <div className="flex items-center gap-4">
          <button onClick={onNavigateToStudio} className="hover:text-cyan-400 transition-colors cursor-pointer">
            Workbench (/studio)
          </button>
          <span>•</span>
          <span className="text-zinc-400">Showcase (/components)</span>
        </div>
      </footer>
    </div>
  );
};
