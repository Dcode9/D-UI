import React, { useState, useEffect } from 'react';
import { ShowcasePage } from './pages/ShowcasePage';
import { StudioPage } from './pages/StudioPage';

export const App: React.FC = () => {
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
    <div className="min-h-screen w-full bg-[#050508] text-white">
      {/* MINIMAL FLOATING NAV */}
      <nav className="fixed top-4 left-0 right-0 z-50 flex items-center justify-between px-6 max-w-3xl mx-auto pointer-events-none">
        <span className="font-mono text-xs font-bold uppercase tracking-widest text-zinc-400">
          D'Tunes
        </span>

        <div className="pointer-events-auto flex items-center gap-1 p-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl font-mono text-xs">
          <button
            onClick={() => navigateTo('components')}
            className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
              currentRoute === 'components'
                ? 'bg-white text-black font-semibold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Showcase
          </button>
          <button
            onClick={() => navigateTo('studio')}
            className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
              currentRoute === 'studio'
                ? 'bg-white text-black font-semibold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Studio
          </button>
        </div>
      </nav>

      {/* ACTIVE PAGE */}
      {currentRoute === 'components' ? <ShowcasePage /> : <StudioPage />}
    </div>
  );
};
