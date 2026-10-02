import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { RealUIGrainBlurStudio } from './components/dtunes/RealUIGrainBlurStudio';
import { GrainBlurTestLab } from './components/dtunes/GrainBlurTestLab';
import { DTunesComponentStudio } from './components/dtunes/DTunesComponentStudio';
import './index.css';

const StudioRoot: React.FC = () => {
  const [activeLab, setActiveLab] = useState<'real-ui' | 'filter-lab' | 'hero'>('filter-lab');

  return (
    <div className="relative w-full min-h-screen">
      {/* Top Floating Lab Switcher */}
      <aside
        style={{ left: '50%', transform: 'translateX(-50%)' }}
        className="fixed top-4 z-50 flex items-center gap-1 p-1 bg-black/80 backdrop-blur-xl border border-white/20 rounded-full shadow-2xl"
      >
        <button
          onClick={() => setActiveLab('real-ui')}
          className={`px-4 py-1.5 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
            activeLab === 'real-ui'
              ? 'bg-white text-zinc-950 shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Real UI Grain Blur Studio
        </button>
        <button
          onClick={() => setActiveLab('hero')}
          className={`px-3 py-1.5 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
            activeLab === 'hero'
              ? 'bg-white text-zinc-950 shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Hero Play/Pause
        </button>
        <button
          onClick={() => setActiveLab('filter-lab')}
          className={`px-3 py-1.5 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
            activeLab === 'filter-lab'
              ? 'bg-white text-zinc-950 shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Raw Filter Lens
        </button>
      </aside>

      <div className="pt-16 min-h-screen">
        {activeLab === 'real-ui' && <RealUIGrainBlurStudio />}
        {activeLab === 'hero' && <DTunesComponentStudio />}
        {activeLab === 'filter-lab' && <GrainBlurTestLab />}
      </div>
    </div>
  );
};

const container = document.getElementById('root')!;
const win = window as unknown as { __studio_root__?: ReactDOM.Root };
if (!win.__studio_root__) {
  win.__studio_root__ = ReactDOM.createRoot(container);
}
win.__studio_root__.render(
  <React.StrictMode>
    <StudioRoot />
  </React.StrictMode>
);
