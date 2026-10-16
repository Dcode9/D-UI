import React, { useRef, useState, useCallback } from 'react';
import {
  GrainBlurLens,
  GrainBlurSurface,
  GRAIN_BLUR_DEFAULTS,
} from '../components/dtunes/GrainBlurSurface';

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


type Tune = { scatter: number; grainDensity: number; opticalDiffusion: number };

const VARIANTS = ['pill', 'circle', 'card', 'panel'] as const;

const Slider: React.FC<{
  label: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void; unit?: string;
}> = ({ label, value, min, max, step, onChange, unit = '' }) => (
  <label className="block">
    <div className="flex justify-between font-mono text-[11px] text-zinc-400 mb-2">
      <span className="uppercase tracking-widest">{label}</span>
      <span className="text-white tabular-nums">{value}{unit}</span>
    </div>
    <input
      type="range" min={min} max={max} step={step} value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-8 accent-white cursor-pointer"
    />
  </label>
);

const SectionHead: React.FC<{ n: string; title: string; note: string }> = ({ n, title, note }) => (
  <div className="mb-6 sm:mb-8">
    <p className="font-mono text-xs text-zinc-500 uppercase tracking-widest">{n}</p>
    <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mt-1">{title}</h2>
    <p className="text-sm text-zinc-400 mt-2 max-w-xl">{note}</p>
  </div>
);

export const ShowcasePage: React.FC = () => {
  const [artIndex, setArtIndex] = useState(0);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [tune, setTune] = useState<Tune>({
    scatter: GRAIN_BLUR_DEFAULTS.scatter,
    grainDensity: GRAIN_BLUR_DEFAULTS.grainDensity,
    opticalDiffusion: GRAIN_BLUR_DEFAULTS.opticalDiffusion,
  });
  const [copied, setCopied] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const art = ARTWORKS[artIndex];

  const move = useCallback((cx: number, cy: number) => {
    const r = stage.current?.getBoundingClientRect();
    if (!r) return;
    setPos({
      x: Math.min(100, Math.max(0, ((cx - r.left) / r.width) * 100)),
      y: Math.min(100, Math.max(0, ((cy - r.top) / r.height) * 100)),
    });
  }, []);

  const snippet = `<GrainBlurSurface variant="card" scatter={${tune.scatter}} grainDensity={${tune.grainDensity}} opticalDiffusion={${tune.opticalDiffusion}} />`;
  const copy = async () => {
    try { await navigator.clipboard.writeText(snippet); } catch { /* ignore */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  return (
    <div className="w-full min-h-screen bg-[#050508] text-white">
      <main className="w-full max-w-6xl mx-auto px-5 sm:px-8 pt-24 pb-24 flex flex-col gap-20 sm:gap-28">
        {/* HERO: the lens follows the finger or cursor */}
        <section className="grid lg:grid-cols-[1.05fr_1fr] gap-8 lg:gap-14 items-center">
          <div className="space-y-5 order-2 lg:order-1">
            <p className="font-mono text-xs text-zinc-500 uppercase tracking-widest">D'UI / components</p>
            <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight leading-[1.02]">
              Blur that is made of grain.
            </h1>
            <p className="text-zinc-400 text-base sm:text-lg max-w-md">
              The Mezzotint material behind D'Tunes. Sharp pixels are erased inside the lens and
              rebuilt as stipple. Drag across the artwork.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <a href="#lab" className="px-5 h-12 inline-flex items-center rounded-full bg-white text-black text-sm font-semibold active:scale-95 transition-transform">
                Open the lab
              </a>
              <a href="/studio" className="px-5 h-12 inline-flex items-center rounded-full border border-white/15 text-sm text-zinc-200 hover:bg-white/5 active:scale-95 transition">
                Studio
              </a>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <div
              ref={stage}
              className="relative w-full aspect-square rounded-[32px] overflow-hidden border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.8)] touch-none cursor-crosshair"
              onPointerMove={(e) => move(e.clientX, e.clientY)}
              onPointerDown={(e) => move(e.clientX, e.clientY)}
            >
              <GrainBlurLens radius={110} x={pos.x} y={pos.y} {...tune} octaves={1} className="w-full h-full">
                <img src={art.url} alt={art.title} draggable={false} className="w-full h-full object-cover select-none" />
              </GrainBlurLens>
            </div>
            <div className="mt-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-1 p-1 rounded-full bg-white/5 border border-white/10 font-mono text-xs overflow-x-auto">
                {ARTWORKS.map((a, idx) => (
                  <button key={a.title} onClick={() => setArtIndex(idx)}
                    className={`px-3 h-9 rounded-full whitespace-nowrap transition-all ${artIndex === idx ? 'bg-white text-black font-semibold' : 'text-zinc-400 hover:text-white'}`}>
                    {a.title}
                  </button>
                ))}
              </div>
              <span className="hidden sm:block font-mono text-[11px] text-zinc-500">{art.artist}</span>
            </div>
          </div>
        </section>

        {/* LAB */}
        <section id="lab" className="scroll-mt-24">
          <SectionHead n="01 / Lab" title="Tune the material" note="Three numbers define the look. Move them, then copy the exact component." />
          <div className="grid md:grid-cols-[1fr_1.1fr] gap-6 items-stretch">
            <GrainBlurSurface variant="card" className="!p-6 sm:!p-8">
              <div className="space-y-6">
                <Slider label="Scatter" value={tune.scatter} min={0} max={120} step={1} unit="px" onChange={(v) => setTune({ ...tune, scatter: v })} />
                <Slider label="Grain density" value={tune.grainDensity} min={0.1} max={1.5} step={0.05} onChange={(v) => setTune({ ...tune, grainDensity: v })} />
                <Slider label="Diffusion" value={tune.opticalDiffusion} min={0} max={24} step={0.5} unit="px" onChange={(v) => setTune({ ...tune, opticalDiffusion: v })} />
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setTune({ scatter: GRAIN_BLUR_DEFAULTS.scatter, grainDensity: GRAIN_BLUR_DEFAULTS.grainDensity, opticalDiffusion: GRAIN_BLUR_DEFAULTS.opticalDiffusion })}
                    className="px-5 h-11 whitespace-nowrap rounded-full border border-white/15 text-sm text-zinc-300 hover:bg-white/5 active:scale-95 transition">
                    Reset
                  </button>
                  <button onClick={copy} className="px-5 h-11 whitespace-nowrap rounded-full bg-white text-black text-sm font-semibold active:scale-95 transition-transform">
                    {copied ? 'Copied' : 'Copy component'}
                  </button>
                </div>
              </div>
            </GrainBlurSurface>
            <div className="relative rounded-[32px] overflow-hidden border border-white/10 min-h-[260px]">
              <img src={art.url} alt="" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center p-6">
                <GrainBlurSurface variant="card" {...tune} className="w-full max-w-xs">
                  <p className="font-mono text-[11px] text-zinc-300 uppercase tracking-widest">Live surface</p>
                  <p className="text-xl font-medium mt-2">Now playing</p>
                  <p className="text-sm text-zinc-400">{art.title} / {art.artist}</p>
                </GrainBlurSurface>
              </div>
            </div>
          </div>
          <pre className="mt-4 p-4 rounded-2xl bg-white/[0.03] border border-white/10 font-mono text-[11px] sm:text-xs text-zinc-400 overflow-x-auto">{snippet}</pre>
        </section>

        {/* SURFACES */}
        <section>
          <SectionHead n="02 / Surfaces" title="One material, four shapes" note="Pill, circle, card and panel share the same filter, border and specular edge." />
          <div className="relative rounded-[32px] overflow-hidden border border-white/10 p-6 sm:p-10">
            <img src={ARTWORKS[(artIndex + 1) % ARTWORKS.length].url} alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="relative grid grid-cols-2 md:grid-cols-4 gap-4 items-center justify-items-center">
              {VARIANTS.map((v) => (
                <GrainBlurSurface key={v} variant={v} className={v === 'circle' ? 'w-28 sm:w-32 flex items-center justify-center' : v === 'card' ? 'w-full' : ''}>
                  <span className="font-mono text-xs uppercase tracking-widest">{v}</span>
                </GrainBlurSurface>
              ))}
            </div>
          </div>
        </section>

        {/* PRINCIPLES */}
        <section>
          <SectionHead n="03 / Rules" title="How D'UI is used" note="The same rules apply across every D'Verse app." />
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              ['Grain lives on shapes', 'Texture sits on the surface itself. Never as a layer over the whole screen.'],
              ['Room for the work', 'Controls never cover the main content. Space is part of the design.'],
              ['Built for the thumb', 'Large targets, instant feedback, usable at 390px.'],
            ].map(([t, d]) => (
              <div key={t} className="rounded-3xl border border-white/10 bg-white/[0.02] p-6">
                <h3 className="text-lg font-medium">{t}</h3>
                <p className="text-sm text-zinc-400 mt-2">{d}</p>
              </div>
            ))}
          </div>
        </section>

        <footer className="font-mono text-[11px] text-zinc-600 flex justify-between">
          <span>D'UI</span><span>part of D'Verse</span>
        </footer>
      </main>
    </div>
  );
};
