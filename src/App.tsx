import React, { useState, useEffect } from 'react';
import { WwdcTextEffect, FlowDirection } from './components/WwdcTextEffect';
import { Sparkles, Sliders } from 'lucide-react';

type TextMode = 'fixed' | 'interactive' | 'sweep';

export const App: React.FC = () => {
  // Text Effect State
  const [selectedText, setSelectedText] = useState<string>("'Verse");
  const [direction, setDirection] = useState<FlowDirection>('left-to-right');
  const [textMode, setTextMode] = useState<TextMode>('fixed');
  const [lightPosition, setLightPosition] = useState<number>(18); // Default 18% for L2R
  const [bloomStrength, setBloomStrength] = useState<number>(1.0);
  const [chromaticIntensity, setChromaticIntensity] = useState<number>(1.0);
  const [oppositeGlowStrength, setOppositeGlowStrength] = useState<number>(1.0);

  // UI Panel Visibility
  const [showControls, setShowControls] = useState<boolean>(true);

  // Synchronize text direction when changing presets
  const handleSelectText = (t: string) => {
    setSelectedText(t);
    if (t === "'Verse" || t === "D'Verse") {
      setDirection('left-to-right');
      setLightPosition(18);
    } else {
      setDirection('right-to-left');
      setLightPosition(82);
    }
  };

  // Automated ambient sweep for text
  useEffect(() => {
    if (textMode !== 'sweep') return;

    let animId: number;
    let startTime = performance.now();

    const sweepLoop = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      const pos = 50 + 35 * Math.sin(elapsed * 1.2);
      setLightPosition(pos);
      animId = requestAnimationFrame(sweepLoop);
    };

    animId = requestAnimationFrame(sweepLoop);
    return () => cancelAnimationFrame(animId);
  }, [textMode]);

  return (
    <main className="relative w-screen h-screen bg-black overflow-hidden flex flex-col items-center justify-between select-none">
      
      {/* Background Subtle Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 50%, #08080c 0%, #000000 90%)',
        }}
      />

      {/* ========================================================================= */}
      {/* TOP HEADER */}
      {/* ========================================================================= */}
      <header className="relative z-30 pt-8 px-6 flex items-center justify-between w-full max-w-5xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center font-black text-sm text-white shadow-lg">
            D
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-wide text-white flex items-center gap-1.5">
              <span>D&apos;VERSE</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-zinc-300">
                OPTICAL ENGINE
              </span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-zinc-300 font-mono">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>SPECULAR TYPOGRAPHY V2</span>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* MAIN VIEWPORT DISPLAY AREA */}
      {/* ========================================================================= */}
      <div className="relative z-10 w-full flex-1 flex items-center justify-center">
        <WwdcTextEffect
          text={selectedText}
          direction={direction}
          lightPosition={lightPosition}
          interactive={textMode === 'interactive'}
          chromaticIntensity={chromaticIntensity}
          bloomStrength={bloomStrength}
          oppositeGlowStrength={oppositeGlowStrength}
        />
      </div>

      {/* ========================================================================= */}
      {/* FLOATING MINIMALIST CONTROL DOCK */}
      {/* ========================================================================= */}
      <div className="relative z-30 pb-8 flex flex-col items-center gap-3 transition-all duration-300">
        
        {/* Toggle Panel Button */}
        <button
          onClick={() => setShowControls(!showControls)}
          className="text-xs font-mono tracking-widest text-zinc-500 hover:text-zinc-300 bg-zinc-900/60 border border-zinc-800/80 px-4 py-1.5 rounded-full backdrop-blur-md transition-all cursor-pointer flex items-center gap-1.5"
        >
          <Sliders className="w-3 h-3 text-zinc-400" />
          <span>{showControls ? 'HIDE CONTROLS' : 'FINE-TUNE SETTINGS'}</span>
        </button>

        {showControls && (
          <div className="glass-dock p-4 sm:p-5 rounded-3xl flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-zinc-300 animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-5xl">
            
            {/* Text Presets */}
            <div className="flex items-center gap-2">
              <span className="font-mono text-zinc-500 font-semibold uppercase text-[10px]">PRESET:</span>
              <div className="flex items-center gap-1 bg-black/40 p-1 rounded-2xl border border-white/5">
                {["'Verse", "D'Verse", "WWDC26"].map((t) => (
                  <button
                    key={t}
                    onClick={() => handleSelectText(t)}
                    className={`px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer ${
                      selectedText === t
                        ? 'bg-white text-black shadow-md font-bold'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="hidden sm:block w-[1px] h-6 bg-white/10" />

            {/* Direction Switcher (L2R vs R2L) */}
            <div className="flex items-center gap-2">
              <span className="font-mono text-zinc-500 font-semibold uppercase text-[10px]">FLOW:</span>
              <div className="flex items-center gap-1 bg-black/40 p-1 rounded-2xl border border-white/5">
                <button
                  onClick={() => {
                    setDirection('left-to-right');
                    setLightPosition(18);
                  }}
                  className={`px-2.5 py-1.5 rounded-xl font-medium transition-all cursor-pointer ${
                    direction === 'left-to-right'
                      ? 'bg-white/20 text-white border border-white/30 font-semibold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Left &rarr; Right
                </button>
                <button
                  onClick={() => {
                    setDirection('right-to-left');
                    setLightPosition(82);
                  }}
                  className={`px-2.5 py-1.5 rounded-xl font-medium transition-all cursor-pointer ${
                    direction === 'right-to-left'
                      ? 'bg-white/20 text-white border border-white/30 font-semibold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Right &rarr; Left
                </button>
              </div>
            </div>

            <div className="hidden sm:block w-[1px] h-6 bg-white/10" />

            {/* Modes */}
            <div className="flex items-center gap-2">
              <span className="font-mono text-zinc-500 font-semibold uppercase text-[10px]">MODE:</span>
              <div className="flex items-center gap-1 bg-black/40 p-1 rounded-2xl border border-white/5">
                {[
                  { id: 'fixed', label: 'Fixed Light' },
                  { id: 'interactive', label: 'Cursor Sweep' },
                  { id: 'sweep', label: 'Auto Sweep' },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setTextMode(m.id as TextMode);
                      if (m.id === 'fixed') setLightPosition(direction === 'left-to-right' ? 18 : 82);
                    }}
                    className={`px-2.5 py-1.5 rounded-xl font-medium transition-all cursor-pointer ${
                      textMode === m.id
                        ? 'bg-white/20 text-white border border-white/30 font-semibold'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Light Position Slider */}
            {textMode === 'fixed' && (
              <>
                <div className="hidden sm:block w-[1px] h-6 bg-white/10" />
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-zinc-500 text-[10px]">POS:</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={lightPosition}
                    onChange={(e) => setLightPosition(parseFloat(e.target.value))}
                    className="w-20 accent-white h-1 bg-zinc-800 rounded-lg cursor-pointer"
                  />
                </div>
              </>
            )}

            <div className="hidden sm:block w-[1px] h-6 bg-white/10" />

            {/* Fine Tuning Sliders */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-zinc-500 text-[10px]">BLOOM:</span>
                <input
                  type="range"
                  min="0.4"
                  max="1.8"
                  step="0.1"
                  value={bloomStrength}
                  onChange={(e) => setBloomStrength(parseFloat(e.target.value))}
                  className="w-14 accent-white h-1 bg-zinc-800 rounded-lg cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <span className="font-mono text-zinc-500 text-[10px]">PRISM:</span>
                <input
                  type="range"
                  min="0.2"
                  max="2.0"
                  step="0.1"
                  value={chromaticIntensity}
                  onChange={(e) => setChromaticIntensity(parseFloat(e.target.value))}
                  className="w-14 accent-white h-1 bg-zinc-800 rounded-lg cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <span className="font-mono text-sky-400 text-[10px]">BACK RIM:</span>
                <input
                  type="range"
                  min="0.0"
                  max="2.0"
                  step="0.1"
                  value={oppositeGlowStrength}
                  onChange={(e) => setOppositeGlowStrength(parseFloat(e.target.value))}
                  className="w-14 accent-sky-400 h-1 bg-zinc-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>

          </div>
        )}
      </div>

    </main>
  );
};
