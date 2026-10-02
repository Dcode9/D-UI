import React, { useState } from 'react';
import {
  Sliders,
  RotateCcw,
  Sun,
  Moon,
  Layers,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';
import { PlayPauseTrigger } from '../components/dtunes/PlayPauseTrigger';
import { GrainBlurTestLab } from '../components/dtunes/GrainBlurTestLab';
import { GRAIN_BLUR_DEFAULTS } from '../components/dtunes/GrainBlurSurface';

const STUDIO_BACKGROUNDS = [
  {
    id: 'neon-art',
    name: 'Neon Album Art',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop',
    title: 'Neon Fluid Resonance',
    artist: 'Dcode9 Sound Lab',
  },
  {
    id: 'sunset-art',
    name: 'Sunset Cyber',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop',
    title: 'Sunset Cyber Pulse',
    artist: 'WWDC Optical Labs',
  },
  {
    id: 'typography',
    name: 'Editorial Typography',
    type: 'typography',
    text: "D'TUNES",
    subtext: 'OPTICAL SOUND ENGINE 2026',
  },
  {
    id: 'obsidian',
    name: 'Obsidian Void',
    type: 'solid',
    bgColor: '#07070b',
  },
  {
    id: 'paper',
    name: 'Stark 8♣ Paper',
    type: 'solid',
    bgColor: '#f4f3ed',
  },
];

export const StudioPage: React.FC<{ onNavigateToShowcase?: () => void }> = ({
  onNavigateToShowcase,
}) => {
  const [activeWorkbench, setActiveWorkbench] = useState<'play-pause' | 'raw-filter'>('play-pause');

  // Play/Pause Trigger Workbench State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [triggerSize, setTriggerSize] = useState<number>(88);
  const [auraRadius, setAuraRadius] = useState<number>(135);
  const [auraMode, setAuraMode] = useState<'always' | 'playing-only' | 'hover-or-playing'>('hover-or-playing');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [activeBgIndex, setActiveBgIndex] = useState<number>(0);
  const [toggleCount, setToggleCount] = useState<number>(0);

  // Material Parameter Fine-Tuners (Inherits settled defaults 55 / 0.70 / 8.5)
  const [scatter, setScatter] = useState<number>(GRAIN_BLUR_DEFAULTS.scatter);
  const [grainDensity, setGrainDensity] = useState<number>(GRAIN_BLUR_DEFAULTS.grainDensity);
  const [opticalDiffusion, setOpticalDiffusion] = useState<number>(GRAIN_BLUR_DEFAULTS.opticalDiffusion);

  const activeBg = STUDIO_BACKGROUNDS[activeBgIndex];
  const isLight = theme === 'light';

  const handleToggle = (playing: boolean) => {
    setIsPlaying(playing);
    setToggleCount((c) => c + 1);
  };

  const resetTriggerDefaults = () => {
    setTriggerSize(88);
    setAuraRadius(135);
    setAuraMode('hover-or-playing');
    setScatter(55);
    setGrainDensity(0.70);
    setOpticalDiffusion(8.5);
  };

  return (
    <div className="min-h-screen w-full bg-[#050508] text-zinc-100 font-sans selection:bg-cyan-500 selection:text-black">
      {/* TOP WORKBENCH HEADER */}
      <header className="w-full max-w-6xl mx-auto px-6 pt-16 pb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-bold mb-1">
            <button
              onClick={onNavigateToShowcase}
              className="flex items-center gap-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft size={13} />
              <span>Showcase</span>
            </button>
            <span className="text-zinc-600">•</span>
            <span className="text-cyan-400 uppercase">Studio Engineering Workbench</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white uppercase">
            Component 02: Play / Pause Trigger
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl">
            Prototyping, iterating, and perfecting the tactile central playback trigger with physical mezzotint noise blur aura.
          </p>
        </div>

        {/* Workbench Tab Switcher */}
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-white/5 border border-white/10 text-xs font-mono">
          <button
            onClick={() => setActiveWorkbench('play-pause')}
            className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all ${
              activeWorkbench === 'play-pause'
                ? 'bg-white text-black shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Play/Pause Workbench
          </button>
          <button
            onClick={() => setActiveWorkbench('raw-filter')}
            className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all ${
              activeWorkbench === 'raw-filter'
                ? 'bg-white text-black shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Raw Filter Lens Lab
          </button>
        </div>
      </header>

      {/* RENDER RAW FILTER LAB (IF SELECTED) */}
      {activeWorkbench === 'raw-filter' && (
        <div className="w-full py-6">
          <GrainBlurTestLab />
        </div>
      )}

      {/* RENDER PLAY/PAUSE WORKBENCH */}
      {activeWorkbench === 'play-pause' && (
        <main className="w-full max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: THE INTERACTIVE TEST STAGE */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* STAGE CONTAINER */}
            <div
              style={{
                height: '480px',
                backgroundColor: activeBg.type === 'solid' ? activeBg.bgColor : isLight ? '#f4f3ed' : '#07070b',
              }}
              className="relative w-full rounded-3xl overflow-hidden border border-white/15 shadow-2xl flex items-center justify-center select-none transition-colors duration-300"
            >
              {/* STAGE BACKGROUND: IMAGE */}
              {activeBg.type === 'image' && (
                <div className="absolute inset-0 z-0">
                  <img
                    src={activeBg.url}
                    alt={activeBg.title}
                    className="w-full h-full object-cover opacity-90"
                  />
                  {/* Subtle darkening vignette */}
                  <div className="absolute inset-0 bg-black/40" />

                  {/* Artwork Meta Card */}
                  <div className="absolute bottom-4 left-6 right-6 p-3 rounded-2xl bg-black/80 backdrop-blur-md border border-white/10 text-white font-mono text-xs flex items-center justify-between">
                    <div>
                      <p className="font-bold">{activeBg.title}</p>
                      <p className="text-[10px] text-zinc-400">{activeBg.artist}</p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-cyan-300 font-bold">
                      {isPlaying ? 'PLAYING NOW' : 'PAUSED'}
                    </span>
                  </div>
                </div>
              )}

              {/* STAGE BACKGROUND: TYPOGRAPHY */}
              {activeBg.type === 'typography' && (
                <div className="absolute inset-0 z-0 flex flex-col items-center justify-center text-center p-8">
                  <span className={`text-7xl sm:text-8xl font-black tracking-tighter uppercase ${isLight ? 'text-zinc-950' : 'text-white'}`}>
                    {activeBg.text}
                  </span>
                  <span className={`text-sm font-mono font-bold tracking-widest mt-2 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    {activeBg.subtext}
                  </span>
                </div>
              )}

              {/* THE PLAY / PAUSE TRIGGER (HERO COMPONENT) */}
              <div className="relative z-20 flex flex-col items-center gap-3">
                <PlayPauseTrigger
                  isPlaying={isPlaying}
                  onToggle={handleToggle}
                  size={triggerSize}
                  auraRadius={auraRadius}
                  auraMode={auraMode}
                  theme={theme}
                  enableSpacebar={true}
                  scatter={scatter}
                  grainDensity={grainDensity}
                  opticalDiffusion={opticalDiffusion}
                />

                {/* Sub-label showing state */}
                <div className="px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-white/15 text-[10px] font-mono text-zinc-300 shadow-xl flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'}`} />
                  <span className="font-bold">{isPlaying ? 'PLAYING' : 'PAUSED'}</span>
                  <span className="text-zinc-500">•</span>
                  <span>Toggles: {toggleCount}</span>
                </div>
              </div>

              {/* SPACEBAR GLOBAL BADGE */}
              <div className="absolute top-4 left-6 z-30 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-white/15 text-xs font-mono text-zinc-300 shadow-xl">
                <kbd className="px-1.5 py-0.5 rounded bg-white/20 text-white font-bold text-[10px]">
                  SPACE
                </kbd>
                <span className="text-[11px] text-zinc-400">Press Spacebar anywhere to toggle</span>
              </div>

              {/* THEME TOGGLE (Obsidian / Stark Paper) */}
              <button
                onClick={() => setTheme(isLight ? 'dark' : 'light')}
                className="absolute top-4 right-6 z-30 p-2 rounded-full bg-black/80 backdrop-blur-md border border-white/15 text-zinc-300 hover:text-white transition-all cursor-pointer shadow-xl"
                title={`Switch to ${isLight ? 'Dark Obsidian' : 'Stark Paper'} Theme`}
              >
                {isLight ? <Moon size={15} /> : <Sun size={15} />}
              </button>
            </div>

            {/* BACKGROUND SWITCHER ROW */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
              <span className="text-zinc-400 flex items-center gap-1.5 font-bold uppercase text-[10px]">
                <Layers size={13} className="text-cyan-400" />
                <span>Background Context:</span>
              </span>
              <div className="flex flex-wrap items-center gap-1">
                {STUDIO_BACKGROUNDS.map((bg, idx) => (
                  <button
                    key={bg.id}
                    onClick={() => setActiveBgIndex(idx)}
                    className={`px-3 py-1 rounded-xl cursor-pointer transition-all ${
                      activeBgIndex === idx
                        ? 'bg-white text-black font-bold shadow'
                        : 'text-zinc-400 hover:text-white bg-white/5'
                    }`}
                  >
                    {bg.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: REAL-TIME PARAMETER TUNER & VISUAL AUDITOR */}
          <aside className="lg:col-span-5 flex flex-col gap-6">
            {/* TUNER CONTROLS PANEL */}
            <div className="p-6 rounded-3xl bg-zinc-900/90 border border-white/15 flex flex-col gap-4 font-mono backdrop-blur-xl">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                  <Sliders size={14} />
                  <span>Trigger Parameters</span>
                </span>
                <button
                  onClick={resetTriggerDefaults}
                  className="text-[10px] text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <RotateCcw size={11} />
                  <span>Reset Defaults</span>
                </button>
              </div>

              {/* Slider 1: Central Button Size */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-300 font-medium">Button Diameter (Size)</span>
                  <span className="font-bold text-cyan-400">{triggerSize}px</span>
                </div>
                <input
                  type="range"
                  min="64"
                  max="112"
                  step="2"
                  value={triggerSize}
                  onChange={(e) => setTriggerSize(Number(e.target.value))}
                  className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
                <div className="flex justify-between text-[10px] text-zinc-500">
                  <span>Compact (64px)</span>
                  <span className="text-cyan-400">Default: 88px</span>
                  <span>Hero (112px)</span>
                </div>
              </div>

              {/* Slider 2: Noise Blur Aura Radius */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-300 font-medium">Noise Blur Aura Radius</span>
                  <span className="font-bold text-cyan-400">{auraRadius}px</span>
                </div>
                <input
                  type="range"
                  min="90"
                  max="180"
                  step="5"
                  value={auraRadius}
                  onChange={(e) => setAuraRadius(Number(e.target.value))}
                  className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
                <div className="flex justify-between text-[10px] text-zinc-500">
                  <span>Tight (90px)</span>
                  <span className="text-cyan-400">Default: 135px</span>
                  <span>Broad (180px)</span>
                </div>
              </div>

              {/* Aura Activation Mode */}
              <div className="flex flex-col gap-1.5 pt-1 border-t border-white/10">
                <span className="text-xs text-zinc-300 font-medium">Aura Activation Mode</span>
                <div className="grid grid-cols-3 gap-1 text-[11px]">
                  <button
                    onClick={() => setAuraMode('hover-or-playing')}
                    className={`py-1.5 px-2 rounded-xl text-center cursor-pointer transition-all ${
                      auraMode === 'hover-or-playing'
                        ? 'bg-cyan-500 text-black font-bold'
                        : 'bg-white/5 text-zinc-400 hover:text-white'
                    }`}
                  >
                    Hover/Play
                  </button>
                  <button
                    onClick={() => setAuraMode('playing-only')}
                    className={`py-1.5 px-2 rounded-xl text-center cursor-pointer transition-all ${
                      auraMode === 'playing-only'
                        ? 'bg-cyan-500 text-black font-bold'
                        : 'bg-white/5 text-zinc-400 hover:text-white'
                    }`}
                  >
                    Play Only
                  </button>
                  <button
                    onClick={() => setAuraMode('always')}
                    className={`py-1.5 px-2 rounded-xl text-center cursor-pointer transition-all ${
                      auraMode === 'always'
                        ? 'bg-cyan-500 text-black font-bold'
                        : 'bg-white/5 text-zinc-400 hover:text-white'
                    }`}
                  >
                    Always On
                  </button>
                </div>
              </div>

              {/* Material Shader Inherited Defaults Check */}
              <div className="p-3 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-xs space-y-1">
                <div className="flex items-center justify-between text-emerald-300 font-bold">
                  <span>Mezzotint Blur Shader Physics</span>
                  <span>Locked 1:1</span>
                </div>
                <p className="text-[10px] text-zinc-400 leading-normal">
                  Zero artificial glow. The aura uses our settled Scatter (55px), Density (0.70), and Diffusion (8.5px) pipeline with native contrast preservation.
                </p>
              </div>
            </div>

            {/* VISUAL FLAW AUDIT & REFINEMENT CHECKLIST */}
            <div className="p-5 rounded-3xl bg-white/5 border border-white/10 flex flex-col gap-3 font-mono text-xs">
              <span className="font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-400" />
                <span>Refinement & Flaw Checklist</span>
              </span>

              <div className="space-y-2 text-[11px]">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-start gap-2">
                  <CheckCircle2 size={13} className="text-emerald-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-bold text-zinc-200">Spacebar Toggle Anywhere</p>
                    <p className="text-zinc-400 text-[10px]">
                      Global keyboard event listener registered on window. Toggles reliably even if trigger is unfocused.
                    </p>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-start gap-2">
                  <CheckCircle2 size={13} className="text-emerald-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-bold text-zinc-200">Zero Neon Glow / Pure Optical Dither</p>
                    <p className="text-zinc-400 text-[10px]">
                      No generic CSS box-shadow glows. The tactile aura radiates purely from physical noise displacement.
                    </p>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-start gap-2">
                  <CheckCircle2 size={13} className="text-emerald-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-bold text-zinc-200">Surgical Icon Morph</p>
                    <p className="text-zinc-400 text-[10px]">
                      Spring-interpolated transition between optical play triangle and dual needle bars.
                    </p>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-start gap-2">
                  <CheckCircle2 size={13} className="text-emerald-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-bold text-zinc-200">Tactile Click Burst Recoil</p>
                    <p className="text-zinc-400 text-[10px]">
                      Spring scale compression on mousedown (0.92) with radial stipple wave expansion on release.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </main>
      )}
    </div>
  );
};
