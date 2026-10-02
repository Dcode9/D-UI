import React, { useState } from 'react';
import { GrainBlurLens } from '../components/dtunes/GrainBlurSurface';

const ARTWORKS = [
  {
    title: 'Neon Resonance',
    artist: 'Dcode9 Sound Lab',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop',
  },
  {
    title: 'Sunset Pulse',
    artist: 'WWDC Optical',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop',
  },
  {
    title: 'Editorial Portrait',
    artist: 'Mono Craft',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop',
  },
];

export const ShowcasePage: React.FC = () => {
  const [artIndex, setArtIndex] = useState<number>(0);

  return (
    <div className="w-full min-h-screen bg-[#050508] text-white flex flex-col items-center pt-24 pb-16 px-6">
      <main className="w-full max-w-3xl flex flex-col items-center gap-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <p className="font-mono text-xs text-zinc-500 uppercase tracking-widest">
            01 — Material
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Mezzotint Grain Blur
          </h1>
          <p className="font-mono text-xs text-zinc-400">
            Scatter 55px • Density 0.70 • Diffusion 8.5px • 100% Native Contrast
          </p>
        </div>

        {/* Artwork Switcher */}
        <div className="flex items-center gap-1 p-1 rounded-full bg-white/5 border border-white/10 font-mono text-xs">
          {ARTWORKS.map((art, idx) => (
            <button
              key={idx}
              onClick={() => setArtIndex(idx)}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                artIndex === idx
                  ? 'bg-white text-black font-semibold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {art.title}
            </button>
          ))}
        </div>

        {/* The Live Material Preview */}
        <div className="relative w-full max-w-[420px] aspect-square rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
          <GrainBlurLens
            radius={120}
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
              src={ARTWORKS[artIndex].url}
              alt={ARTWORKS[artIndex].title}
              className="w-full h-full object-cover select-none"
            />
          </GrainBlurLens>
        </div>

        {/* Caption */}
        <p className="font-mono text-[11px] text-zinc-500 text-center">
          Underlying sharp pixels are 100% erased inside the lens circle.
        </p>
      </main>
    </div>
  );
};
