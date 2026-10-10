import React, { useState } from 'react';
import { GrainBlurLens } from '../components/dtunes/GrainBlurSurface';

const ARTWORKS = [
  {
    title: 'Tidal Resonance',
    artist: 'Dcode9 Sound Lab',
    url: 'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20800%20800%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22g%22%20x2%3D%221%22%20y2%3D%221%22%3E%3Cstop%20stop-color%3D%22%23167c89%22%2F%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%2314262a%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%22800%22%20height%3D%22800%22%20fill%3D%22url%28%23g%29%22%2F%3E%3Ccircle%20cx%3D%22470%22%20cy%3D%22300%22%20r%3D%22230%22%20fill%3D%22%23d58a57%22%2F%3E%3Cpath%20d%3D%22M-80%20650Q240%20200%20880%20590V880H-80Z%22%20fill%3D%22%23167c89%22%2F%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%23e7ece3%22%20stroke-width%3D%223%22%20opacity%3D%22.6%22%3E%3Ccircle%20cx%3D%22260%22%20cy%3D%22540%22%20r%3D%2260%22%2F%3E%3Ccircle%20cx%3D%22260%22%20cy%3D%22540%22%20r%3D%2284%22%2F%3E%3Ccircle%20cx%3D%22260%22%20cy%3D%22540%22%20r%3D%22108%22%2F%3E%3Ccircle%20cx%3D%22260%22%20cy%3D%22540%22%20r%3D%22132%22%2F%3E%3Ccircle%20cx%3D%22260%22%20cy%3D%22540%22%20r%3D%22156%22%2F%3E%3Ccircle%20cx%3D%22260%22%20cy%3D%22540%22%20r%3D%22180%22%2F%3E%3Ccircle%20cx%3D%22260%22%20cy%3D%22540%22%20r%3D%22204%22%2F%3E%3Ccircle%20cx%3D%22260%22%20cy%3D%22540%22%20r%3D%22228%22%2F%3E%3Ccircle%20cx%3D%22260%22%20cy%3D%22540%22%20r%3D%22252%22%2F%3E%3Ccircle%20cx%3D%22260%22%20cy%3D%22540%22%20r%3D%22276%22%2F%3E%3Ccircle%20cx%3D%22260%22%20cy%3D%22540%22%20r%3D%22300%22%2F%3E%3Ccircle%20cx%3D%22260%22%20cy%3D%22540%22%20r%3D%22324%22%2F%3E%3Ccircle%20cx%3D%22260%22%20cy%3D%22540%22%20r%3D%22348%22%2F%3E%3C%2Fg%3E%3Cpath%20d%3D%22M90%20100H320M90%20110H230%22%20stroke%3D%22%23e7ece3%22%20stroke-width%3D%224%22%2F%3E%3C%2Fsvg%3E',
  },
  {
    title: 'Sunset Pulse',
    artist: 'Dcode9 Optical Lab',
    url: 'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20800%20800%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22g%22%20x2%3D%221%22%20y2%3D%221%22%3E%3Cstop%20stop-color%3D%22%23be723e%22%2F%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%2314262a%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%22800%22%20height%3D%22800%22%20fill%3D%22url%28%23g%29%22%2F%3E%3Ccircle%20cx%3D%22470%22%20cy%3D%22300%22%20r%3D%22230%22%20fill%3D%22%23f0d3a7%22%2F%3E%3Cpath%20d%3D%22M-80%20650Q240%20200%20880%20590V880H-80Z%22%20fill%3D%22%23be723e%22%2F%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%23e7ece3%22%20stroke-width%3D%223%22%20opacity%3D%22.6%22%3E%3Ccircle%20cx%3D%22260%22%20cy%3D%22540%22%20r%3D%2260%22%2F%3E%3Ccircle%20cx%3D%22260%22%20cy%3D%22540%22%20r%3D%2284%22%2F%3E%3Ccircle%20cx%3D%22260%22%20cy%3D%22540%22%20r%3D%22108%22%2F%3E%3Ccircle%20cx%3D%22260%22%20cy%3D%22540%22%20r%3D%22132%22%2F%3E%3Ccircle%20cx%3D%22260%22%20cy%3D%22540%22%20r%3D%22156%22%2F%3E%3Ccircle%20cx%3D%22260%22%20cy%3D%22540%22%20r%3D%22180%22%2F%3E%3Ccircle%20cx%3D%22260%22%20cy%3D%22540%22%20r%3D%22204%22%2F%3E%3Ccircle%20cx%3D%22260%22%20cy%3D%22540%22%20r%3D%22228%22%2F%3E%3Ccircle%20cx%3D%22260%22%20cy%3D%22540%22%20r%3D%22252%22%2F%3E%3Ccircle%20cx%3D%22260%22%20cy%3D%22540%22%20r%3D%22276%22%2F%3E%3Ccircle%20cx%3D%22260%22%20cy%3D%22540%22%20r%3D%22300%22%2F%3E%3Ccircle%20cx%3D%22260%22%20cy%3D%22540%22%20r%3D%22324%22%2F%3E%3Ccircle%20cx%3D%22260%22%20cy%3D%22540%22%20r%3D%22348%22%2F%3E%3C%2Fg%3E%3Cpath%20d%3D%22M90%20100H320M90%20110H230%22%20stroke%3D%22%23e7ece3%22%20stroke-width%3D%224%22%2F%3E%3C%2Fsvg%3E',
  },
  {
    title: 'Contour Study',
    artist: 'Dcode9 Material Lab',
    url: 'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20800%20800%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22g%22%20x2%3D%221%22%20y2%3D%221%22%3E%3Cstop%20stop-color%3D%22%23526a72%22%2F%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%2314262a%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%22800%22%20height%3D%22800%22%20fill%3D%22url%28%23g%29%22%2F%3E%3Ccircle%20cx%3D%22470%22%20cy%3D%22300%22%20r%3D%22230%22%20fill%3D%22%23c8d2c1%22%2F%3E%3Cpath%20d%3D%22M-80%20650Q240%20200%20880%20590V880H-80Z%22%20fill%3D%22%23526a72%22%2F%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%23e7ece3%22%20stroke-width%3D%223%22%20opacity%3D%22.6%22%3E%3Ccircle%20cx%3D%22260%22%20cy%3D%22540%22%20r%3D%2260%22%2F%3E%3Ccircle%20cx%3D%22260%22%20cy%3D%22540%22%20r%3D%2284%22%2F%3E%3Ccircle%20cx%3D%22260%22%20cy%3D%22540%22%20r%3D%22108%22%2F%3E%3Ccircle%20cx%3D%22260%22%20cy%3D%22540%22%20r%3D%22132%22%2F%3E%3Ccircle%20cx%3D%22260%22%20cy%3D%22540%22%20r%3D%22156%22%2F%3E%3Ccircle%20cx%3D%22260%22%20cy%3D%22540%22%20r%3D%22180%22%2F%3E%3Ccircle%20cx%3D%22260%22%20cy%3D%22540%22%20r%3D%22204%22%2F%3E%3Ccircle%20cx%3D%22260%22%20cy%3D%22540%22%20r%3D%22228%22%2F%3E%3Ccircle%20cx%3D%22260%22%20cy%3D%22540%22%20r%3D%22252%22%2F%3E%3Ccircle%20cx%3D%22260%22%20cy%3D%22540%22%20r%3D%22276%22%2F%3E%3Ccircle%20cx%3D%22260%22%20cy%3D%22540%22%20r%3D%22300%22%2F%3E%3Ccircle%20cx%3D%22260%22%20cy%3D%22540%22%20r%3D%22324%22%2F%3E%3Ccircle%20cx%3D%22260%22%20cy%3D%22540%22%20r%3D%22348%22%2F%3E%3C%2Fg%3E%3Cpath%20d%3D%22M90%20100H320M90%20110H230%22%20stroke%3D%22%23e7ece3%22%20stroke-width%3D%224%22%2F%3E%3C%2Fsvg%3E',
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
            01 / Material
          </p>
          <h1 className="text-2xl sm:text-3xl font-medium tracking-tight">
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
