import React, { useState, useEffect } from 'react';
import { DVersePage } from './pages/DVersePage';
import { DTunesLogoPage } from './pages/DTunesLogoPage';
import { ShowcasePage } from './pages/ShowcasePage';
import { StudioPage } from './pages/StudioPage';

export type RouteType = 'home' | 'd-tunes_logo' | 'components' | 'studio';

export const App: React.FC = () => {
  const getInitialRoute = (): RouteType => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path.includes('d-tunes_logo') || path.includes('d-tunes-logo')) {
        return 'd-tunes_logo';
      }
      if (path.includes('components')) {
        return 'components';
      }
      if (path.includes('studio')) {
        return 'studio';
      }
    }
    return 'home';
  };

  const [currentRoute, setCurrentRoute] = useState<RouteType>(getInitialRoute);
  const [homeEngineState, setHomeEngineState] = useState<1 | 2 | 3>(1);
  const [logoEngineState, setLogoEngineState] = useState<1 | 2 | 3>(1);

  const navigateTo = (route: RouteType) => {
    setCurrentRoute(route);
    const pathMap: Record<RouteType, string> = {
      home: '/',
      'd-tunes_logo': '/d-tunes_logo',
      components: '/components',
      studio: '/studio',
    };
    const newPath = pathMap[route];
    if (window.location.pathname !== newPath) {
      window.history.pushState({ route }, '', newPath);
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(getInitialRoute());
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Synchronize document titles and overflow body behavior
  useEffect(() => {
    if (currentRoute === 'home') {
      document.title = "D'Verse";
      document.body.style.overflow = 'hidden';
    } else if (currentRoute === 'd-tunes_logo') {
      document.title = "D'Tunes // Optical Logo";
      document.body.style.overflow = 'hidden';
    } else if (currentRoute === 'components') {
      document.title = "D'UI - Components";
      document.body.style.overflow = 'auto';
    } else if (currentRoute === 'studio') {
      document.title = "D'Tunes // Studio";
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [currentRoute]);

  const activeEngineState = currentRoute === 'home' ? homeEngineState : logoEngineState;
  const isIntroPage = currentRoute === 'home' || currentRoute === 'd-tunes_logo';
  const isNavVisible = !isIntroPage || activeEngineState === 3;

  return (
    <div className="min-h-screen w-full bg-[#040406] text-white">
      {/* FLOATING TOP NAV: Hidden during loading state on intro pages so only the fluid perimeter glow is visible */}
      <nav
        className={`fixed top-4 left-0 right-0 z-50 flex items-center justify-between px-6 max-w-4xl mx-auto pointer-events-none transition-opacity duration-700 ${
          isNavVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <span className="font-mono text-xs font-bold uppercase tracking-widest text-zinc-400">
          {currentRoute === 'd-tunes_logo'
            ? "D'TUNES"
            : currentRoute === 'home'
            ? "D'VERSE"
            : "D'UI"}
        </span>

        <div className="pointer-events-auto flex items-center gap-1 p-1 rounded-full bg-[#0a0a0f]/90 border border-white/10 shadow-[0_10px_25px_rgba(0,0,0,0.7)] font-mono text-xs backdrop-blur-md">
          <button
            onClick={() => navigateTo('home')}
            className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
              currentRoute === 'home'
                ? 'bg-white text-black font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            D'Verse
          </button>
          <button
            onClick={() => navigateTo('d-tunes_logo')}
            className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
              currentRoute === 'd-tunes_logo'
                ? 'bg-white text-black font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            D'Tunes Logo
          </button>
          <button
            onClick={() => navigateTo('components')}
            className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
              currentRoute === 'components'
                ? 'bg-white text-black font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Showcase
          </button>
          <button
            onClick={() => navigateTo('studio')}
            className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
              currentRoute === 'studio'
                ? 'bg-white text-black font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Studio
          </button>
          <a
            href="/d-tunes"
            className="px-3 py-1 rounded-full transition-all text-zinc-400 hover:text-white flex items-center gap-1.5 cursor-pointer"
          >
            <span>D'Tunes App</span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
          </a>
        </div>
      </nav>

      {/* ACTIVE PAGE */}
      {currentRoute === 'home' ? (
        <DVersePage onStateChange={setHomeEngineState} />
      ) : currentRoute === 'd-tunes_logo' ? (
        <DTunesLogoPage onStateChange={setLogoEngineState} />
      ) : currentRoute === 'components' ? (
        <ShowcasePage />
      ) : (
        <StudioPage />
      )}
    </div>
  );
};
