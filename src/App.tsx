import React, { useState, useEffect } from 'react';
import { ShowcasePage } from './pages/ShowcasePage';
import { StudioPage } from './pages/StudioPage';
import { Layers, Sliders } from 'lucide-react';

export const App: React.FC = () => {
  // Determine initial route based on browser path
  const getInitialRoute = (): 'components' | 'studio' => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path.includes('studio')) {
        return 'studio';
      }
    }
    return 'components';
  };

  const [currentRoute, setCurrentRoute] = useState<'components' | 'studio'>(getInitialRoute);

  // Sync route with browser history
  const navigateTo = (route: 'components' | 'studio') => {
    setCurrentRoute(route);
    const newPath = route === 'studio' ? '/studio' : '/components';
    if (window.location.pathname !== newPath) {
      window.history.pushState({ route }, '', newPath);
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path.includes('studio')) {
        setCurrentRoute('studio');
      } else {
        setCurrentRoute('components');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-[#050508] text-white">
      {/* FLOATING TOP NAVIGATION BAR */}
      <nav className="fixed top-3 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-8 max-w-6xl mx-auto pointer-events-none">
        {/* Brand / Logo */}
        <div
          onClick={() => navigateTo('components')}
          className="pointer-events-auto flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/80 backdrop-blur-xl border border-white/15 text-xs font-mono font-bold text-white shadow-2xl cursor-pointer hover:border-white/30 transition-all"
        >
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          <span className="tracking-widest uppercase">D'Tunes</span>
          <span className="text-zinc-600">•</span>
          <span className="text-zinc-400 text-[10px]">Optical UI</span>
        </div>

        {/* Center Nav Switcher: /components vs /studio */}
        <div className="pointer-events-auto flex items-center gap-1 p-1 rounded-full bg-black/85 backdrop-blur-2xl border border-white/20 shadow-2xl font-mono text-xs">
          <button
            onClick={() => navigateTo('components')}
            className={`px-4 py-1.5 rounded-full font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              currentRoute === 'components'
                ? 'bg-white text-zinc-950 shadow-lg'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Layers size={12} />
            <span>Showcase (/components)</span>
          </button>
          <button
            onClick={() => navigateTo('studio')}
            className={`px-4 py-1.5 rounded-full font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              currentRoute === 'studio'
                ? 'bg-white text-zinc-950 shadow-lg'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Sliders size={12} />
            <span>Studio Lab (/studio)</span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse ml-0.5" />
          </button>
        </div>

        {/* Right Active Status */}
        <div className="hidden sm:flex pointer-events-auto items-center gap-2 px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-xl border border-white/15 text-[11px] font-mono text-zinc-400 shadow-xl">
          <span className="text-emerald-400 font-bold">01: Material</span>
          <span>→</span>
          <span className="text-cyan-400 font-bold">02: Play/Pause</span>
        </div>
      </nav>

      {/* ACTIVE PAGE CONTENT */}
      {currentRoute === 'components' ? (
        <ShowcasePage onNavigateToStudio={() => navigateTo('studio')} />
      ) : (
        <StudioPage onNavigateToShowcase={() => navigateTo('components')} />
      )}
    </div>
  );
};
