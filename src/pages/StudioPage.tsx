import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GrainBlurFilter, GRAIN_BLUR_DEFAULTS } from '../components/dtunes/GrainBlurSurface';

const BACKGROUNDS = [
  {
    name: 'Neon Fluid',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop',
    title: 'Neon Fluid Resonance',
    artist: 'Dcode9 Sound Lab',
  },
  {
    name: 'Sunset Pulse',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop',
    title: 'Sunset Cyber Pulse',
    artist: 'WWDC Optical Labs',
  },
  {
    name: 'Obsidian Void',
    url: '',
    title: 'Pure Obsidian',
    artist: 'Dark Studio',
  },
];

export const StudioPage: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPressed, setIsPressed] = useState<boolean>(false);
  const [bgIndex, setBgIndex] = useState<number>(0);

  const activeBg = BACKGROUNDS[bgIndex];
  const filterId = 'studio-trigger-grain-blur';

  // Trigger size and aura dimensions
  const buttonSize = 88; // px
  const auraRadius = 135; // px

  // Spacebar toggle anywhere globally
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        const target = e.target as HTMLElement | null;
        if (
          target &&
          (target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.isContentEditable)
        ) {
          return;
        }
        e.preventDefault();
        setIsPressed(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        const target = e.target as HTMLElement | null;
        if (
          target &&
          (target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.isContentEditable)
        ) {
          return;
        }
        e.preventDefault();
        setIsPressed(false);
        setIsPlaying((p) => !p);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleButtonClick = () => {
    setIsPlaying((p) => !p);
  };

  return (
    <div className="w-full min-h-screen bg-[#050508] text-white flex flex-col items-center pt-24 pb-16 px-6">
      {/* 1. MASTER MEZZOTINT BLUR SHADER (Settled: 55px / 0.70 / 8.5px) */}
      <GrainBlurFilter
        id={filterId}
        scatter={GRAIN_BLUR_DEFAULTS.scatter}
        grainDensity={GRAIN_BLUR_DEFAULTS.grainDensity}
        opticalDiffusion={GRAIN_BLUR_DEFAULTS.opticalDiffusion}
        octaves={1}
      />

      <main className="w-full max-w-xl flex flex-col items-center gap-6">
        {/* Minimal Header */}
        <div className="text-center space-y-1">
          <p className="font-mono text-xs text-zinc-500 uppercase tracking-widest">
            02 — Workshop
          </p>
          <h1 className="text-2xl font-bold tracking-tight">Play / Pause Trigger</h1>
        </div>

        {/* Minimal Background Context Switcher */}
        <div className="flex items-center gap-1 p-1 rounded-full bg-white/5 border border-white/10 font-mono text-xs">
          {BACKGROUNDS.map((bg, idx) => (
            <button
              key={idx}
              onClick={() => setBgIndex(idx)}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                bgIndex === idx
                  ? 'bg-white text-black font-semibold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {bg.name}
            </button>
          ))}
        </div>

        {/* THE MAIN TEST STAGE */}
        <div className="relative w-full aspect-square max-w-[440px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl flex items-center justify-center select-none bg-[#09090e]">
          {/* LAYER A: SHARP BACKGROUND (Erased under the aura when playing so 0% bleeds through) */}
          <div
            className="absolute inset-0 transition-opacity duration-300"
            style={{
              maskImage: isPlaying
                ? `radial-gradient(circle ${auraRadius}px at 50% 50%, transparent 95%, black 100%)`
                : 'none',
              WebkitMaskImage: isPlaying
                ? `radial-gradient(circle ${auraRadius}px at 50% 50%, transparent 95%, black 100%)`
                : 'none',
            }}
          >
            {activeBg.url ? (
              <img
                src={activeBg.url}
                alt={activeBg.title}
                className="w-full h-full object-cover select-none"
              />
            ) : (
              <div className="w-full h-full bg-[#09090e] flex items-center justify-center">
                <span className="font-mono text-xs text-zinc-700 uppercase tracking-widest">
                  Obsidian Void
                </span>
              </div>
            )}
          </div>

          {/* LAYER B: FILTERED GRAIN BLUR LAYER (Active inside the circular aura when playing) */}
          {isPlaying && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                filter: `url(#${filterId})`,
                clipPath: `circle(${auraRadius}px at 50% 50%)`,
                WebkitClipPath: `circle(${auraRadius}px at 50% 50%)`,
                transform: 'translateZ(0)',
                willChange: 'filter',
              }}
            >
              {activeBg.url ? (
                <img
                  src={activeBg.url}
                  alt={activeBg.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-zinc-800" />
              )}
            </div>
          )}

          {/* LAYER C: AURA PERIMETER RETICLE (Hairline circle when active) */}
          {isPlaying && (
            <div
              className="absolute rounded-full pointer-events-none border border-white/20"
              style={{
                width: `${auraRadius * 2}px`,
                height: `${auraRadius * 2}px`,
                boxShadow: '0 0 40px rgba(0,0,0,0.5)',
              }}
            >
              {/* Cardinal micro-ticks */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-[1px] bg-white/60" />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-[1px] bg-white/60" />
              <div className="absolute left-0 top-1/2 -translate-y-1/2 h-2 w-[1px] bg-white/60" />
              <div className="absolute right-0 top-1/2 -translate-y-1/2 h-2 w-[1px] bg-white/60" />
            </div>
          )}

          {/* LAYER D: THE HERO TRIGGER BUTTON */}
          <motion.button
            type="button"
            onClick={handleButtonClick}
            onMouseDown={() => setIsPressed(true)}
            onMouseUp={() => setIsPressed(false)}
            onMouseLeave={() => setIsPressed(false)}
            animate={{
              scale: isPressed ? 0.92 : 1.0,
            }}
            transition={{ type: 'spring', stiffness: 500, damping: 28 }}
            style={{
              width: `${buttonSize}px`,
              height: `${buttonSize}px`,
            }}
            className="relative z-30 rounded-full flex items-center justify-center cursor-pointer outline-none bg-[#0a0a0f] text-white border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.3)] transition-shadow"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {/* Specular ridge catch */}
            <div className="absolute inset-0 rounded-full pointer-events-none border-t border-white/40" />

            {/* Surgical Icon Morph */}
            <div className="relative w-7 h-7 flex items-center justify-center pointer-events-none">
              <AnimatePresence mode="wait" initial={false}>
                {isPlaying ? (
                  <motion.svg
                    key="pause"
                    viewBox="0 0 24 24"
                    width={26}
                    height={26}
                    fill="currentColor"
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.6 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  >
                    <rect x="5.5" y="4" width="3.5" height="16" rx="1.5" />
                    <rect x="15" y="4" width="3.5" height="16" rx="1.5" />
                  </motion.svg>
                ) : (
                  <motion.svg
                    key="play"
                    viewBox="0 0 24 24"
                    width={26}
                    height={26}
                    fill="currentColor"
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.6 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="translate-x-[1.5px]"
                  >
                    <path d="M6.5 4.8c0-.7.7-1.1 1.3-.7l12.4 6.8c.6.4.6 1.3 0 1.7L7.8 19.4c-.6.4-1.3 0-1.3-.7V4.8z" />
                  </motion.svg>
                )}
              </AnimatePresence>
            </div>
          </motion.button>
        </div>

        {/* Global Key Instruction */}
        <div className="flex items-center gap-2 font-mono text-xs text-zinc-400">
          <kbd className="px-2 py-0.5 rounded bg-white/10 text-white font-bold text-[10px]">
            SPACE
          </kbd>
          <span>Press Spacebar anywhere to toggle</span>
        </div>
      </main>
    </div>
  );
};
