import React, { useState, useEffect } from 'react';
import { ColorTheme, ColorThemeId, OpticsSettings } from './types';
import { PerimeterLoader } from './components/portal/PerimeterLoader';
import { PortalBackground } from './components/portal/PortalBackground';
import { MergedTitle } from './components/portal/MergedTitle';
import { PortalControls } from './components/portal/PortalControls';
import { LogIn } from 'lucide-react';

const THEMES: ColorTheme[] = [
  {
    id: 'cyan',
    name: 'Cyan Nova',
    primary: '#00f0ff',
    secondary: '#38bdf8',
    glow: 'rgba(0, 240, 255, 0.45)',
    accent: '#6366f1',
    gradientText: 'from-white via-cyan-200 to-cyan-500',
    badgeBg: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300',
    borderGlow: 'rgba(0, 240, 255, 0.3)',
  },
  {
    id: 'violet',
    name: 'Violet Singularity',
    primary: '#c084fc',
    secondary: '#e879f9',
    glow: 'rgba(192, 132, 252, 0.45)',
    accent: '#f43f5e',
    gradientText: 'from-white via-purple-200 to-pink-500',
    badgeBg: 'bg-purple-500/10 border-purple-500/30 text-purple-300',
    borderGlow: 'rgba(192, 132, 252, 0.3)',
  },
  {
    id: 'solar',
    name: 'Solar Flare',
    primary: '#fbbf24',
    secondary: '#fb923c',
    glow: 'rgba(251, 191, 36, 0.45)',
    accent: '#ef4444',
    gradientText: 'from-white via-amber-200 to-orange-500',
    badgeBg: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
    borderGlow: 'rgba(251, 191, 36, 0.3)',
  },
  {
    id: 'emerald',
    name: 'Emerald Matrix',
    primary: '#34d399',
    secondary: '#2dd4bf',
    glow: 'rgba(52, 211, 153, 0.45)',
    accent: '#06b6d4',
    gradientText: 'from-white via-emerald-200 to-teal-500',
    badgeBg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
    borderGlow: 'rgba(52, 211, 153, 0.3)',
  },
  {
    id: 'tricolor',
    name: 'Tricolor Tribute',
    primary: '#ff9933',
    secondary: '#10b981',
    glow: 'rgba(255, 153, 51, 0.45)',
    accent: '#38bdf8',
    gradientText: 'from-[#ff9933] via-white to-[#10b981]',
    badgeBg: 'bg-orange-500/10 border-orange-500/30 text-orange-300',
    borderGlow: 'rgba(255, 153, 51, 0.3)',
  },
];

export const App: React.FC = () => {
  const [themeId, setThemeId] = useState<ColorThemeId>('cyan');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({
    x: typeof window !== 'undefined' ? window.innerWidth / 2 : 500,
    y: typeof window !== 'undefined' ? window.innerHeight / 2 : 500,
  });

  const [optics, setOptics] = useState<OpticsSettings>({
    glowIntensity: 1.0,
    ambientLight: 0.6,
    interactiveLighting: true,
    particleDensity: 65,
    pulseSpeed: 1.0,
  });

  const currentTheme = THEMES.find((t) => t.id === themeId) || THEMES[0];

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleUpdateOptics = (newOptics: Partial<OpticsSettings>) => {
    setOptics((prev) => ({ ...prev, ...newOptics }));
  };

  const handleReplayLoader = () => {
    setIsLoading(true);
  };

  return (
    <div className="relative min-h-screen w-full bg-black text-white overflow-hidden selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* 1. PERIMETER LIGHT-TRACE LOADER OVERLAY */}
      {isLoading && (
        <PerimeterLoader
          theme={currentTheme}
          onComplete={() => setIsLoading(false)}
          onSkip={() => setIsLoading(false)}
        />
      )}

      {/* 2. PROCEDURAL CELESTIAL BACKGROUND */}
      <PortalBackground
        theme={currentTheme}
        optics={optics}
        mousePos={mousePos}
      />

      {/* 3. TOP NAVIGATION HEADER */}
      <header className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-6 sm:px-12 py-6 pointer-events-none">
        {/* Left Brand Badge */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm glass-panel shadow-lg"
            style={{
              borderColor: `${currentTheme.primary}40`,
              color: currentTheme.primary,
              boxShadow: `0 0 15px ${currentTheme.borderGlow}`,
            }}
          >
            D
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-wide text-white flex items-center gap-1.5">
              <span>D&apos;VERSE</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-zinc-300">
                ECOSYSTEM
              </span>
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">
              BY DHAIRYA SHAH
            </span>
          </div>
        </div>

        {/* Right Action Group */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <a
            href="https://github.com/Dcode9/D-UI"
            target="_blank"
            rel="noopener noreferrer"
            className="glass-pill-btn hidden sm:flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-zinc-300 hover:text-white"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            <span>GITHUB</span>
          </a>

          <button
            onClick={() => alert('D-Verse Authentication Modal - Phase 2 Module')}
            className="glass-pill-btn flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold tracking-wider text-white uppercase shadow-lg cursor-pointer"
            style={{
              borderColor: `${currentTheme.primary}50`,
              boxShadow: `0 0 15px ${currentTheme.borderGlow}`,
            }}
          >
            <LogIn className="w-3.5 h-3.5" style={{ color: currentTheme.primary }} />
            <span>SIGN IN</span>
          </button>
        </div>
      </header>

      {/* 4. MAIN HERO: MERGED 'D' GLOW + ILLUMINATED 'VERSE */}
      <main className="relative z-10 w-full min-h-screen">
        <MergedTitle
          theme={currentTheme}
          optics={optics}
          mousePos={mousePos}
          onExploreClick={() => {
            alert('Exploring D-Verse Ecosystem Modules (D-Ai, D-Tunes, D-Quest, D-Games). Next component phase loading soon!');
          }}
        />
      </main>

      {/* 5. PORTAL CONTROLS & THEME TUNER */}
      <PortalControls
        currentTheme={currentTheme}
        themes={THEMES}
        onSelectTheme={(id) => setThemeId(id)}
        optics={optics}
        onChangeOptics={handleUpdateOptics}
        onReplayLoader={handleReplayLoader}
      />
    </div>
  );
};
