import React, { useState, useEffect } from 'react';
import { WwdcTextEffect } from './components/WwdcTextEffect';

type Mode = 'fixed' | 'interactive' | 'sweep';

export const App: React.FC = () => {
  const [selectedText, setSelectedText] = useState<string>('WWDC26');
  const [mode, setMode] = useState<Mode>('fixed');
  const [lightPosition, setLightPosition] = useState<number>(82); // 82% matches WWDC26 reference image
  const [bloomStrength, setBloomStrength] = useState<number>(1.0);
  const [chromaticIntensity, setChromaticIntensity] = useState<number>(1.0);
  const [showControls, setShowControls] = useState<boolean>(true);

  // Automated gentle ambient sweep if mode === 'sweep'
  useEffect(() => {
    if (mode !== 'sweep') return;

    let animId: number;
    let startTime = performance.now();

    const sweepLoop = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      // Oscillate between 15% and 88% smoothly
      const pos = 51.5 + 36.5 * Math.sin(elapsed * 1.2);
      setLightPosition(pos);
      animId = requestAnimationFrame(sweepLoop);
    };

    animId = requestAnimationFrame(sweepLoop);
    return () => cancelAnimationFrame(animId);
  }, [mode]);

  return (
    <main className="relative w-screen h-screen bg-black overflow-hidden flex flex-col items-center justify-center select-none">
      
      {/* Background Subtle Vignette */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 50%, #08080c 0%, #000000 90%)'
        }}
      />

      {/* Main Optical Typography Effect */}
      <div className="relative z-10 w-full flex items-center justify-center">
        <WwdcTextEffect
          text={selectedText}
          lightPosition={lightPosition}
          interactive={mode === 'interactive'}
          chromaticIntensity={chromaticIntensity}
          bloomStrength={bloomStrength}
        />
      </div>

      {/* Floating Minimalist Control Dock */}
      <div className="fixed bottom-8 z-30 flex flex-col items-center gap-3 transition-all duration-300">
        
        {/* Toggle Panel Button */}
        <button
          onClick={() => setShowControls(!showControls)}
          className="text-xs font-mono tracking-widest text-zinc-500 hover:text-zinc-300 bg-zinc-900/60 border border-zinc-800/80 px-4 py-1.5 rounded-full backdrop-blur-md transition-all cursor-pointer"
        >
          {showControls ? 'HIDE CONTROLS' : 'OPTICAL CONTROLS'}
        </button>

        {showControls && (
          <div className="glass-dock p-4 sm:p-5 rounded-3xl flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-xs text-zinc-300 animate-in fade-in slide-in-from-bottom-2 duration-300">
            
            {/* Text Presets */}
            <div className="flex items-center gap-2">
              <span className="font-mono text-zinc-500 font-semibold uppercase text-[10px]">TEXT:</span>
              <div className="flex items-center gap-1 bg-black/40 p-1 rounded-2xl border border-white/5">
                {["'Verse", "D'Verse", "WWDC26"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedText(t)}
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

            {/* Lighting Modes */}
            <div className="flex items-center gap-2">
              <span className="font-mono text-zinc-500 font-semibold uppercase text-[10px]">MODE:</span>
              <div className="flex items-center gap-1 bg-black/40 p-1 rounded-2xl border border-white/5">
                {[
                  { id: 'fixed', label: 'WWDC Reference' },
                  { id: 'interactive', label: 'Cursor Tracking' },
                  { id: 'sweep', label: 'Ambient Sweep' },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setMode(m.id as Mode);
                      if (m.id === 'fixed') setLightPosition(82);
                    }}
                    className={`px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer ${
                      mode === m.id
                        ? 'bg-white/20 text-white border border-white/30 font-semibold'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Position Slider (when in Fixed mode) */}
            {mode === 'fixed' && (
              <>
                <div className="hidden sm:block w-[1px] h-6 bg-white/10" />
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-zinc-500 text-[10px]">LIGHT POS:</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={lightPosition}
                    onChange={(e) => setLightPosition(parseFloat(e.target.value))}
                    className="w-24 accent-white h-1 bg-zinc-800 rounded-lg cursor-pointer"
                  />
                  <span className="font-mono text-zinc-400 text-[10px] w-6">{Math.round(lightPosition)}%</span>
                </div>
              </>
            )}

            <div className="hidden sm:block w-[1px] h-6 bg-white/10" />

            {/* Bloom & Chromatic Sliders */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="font-mono text-zinc-500 text-[10px]">BLOOM:</span>
                <input
                  type="range"
                  min="0.4"
                  max="1.8"
                  step="0.1"
                  value={bloomStrength}
                  onChange={(e) => setBloomStrength(parseFloat(e.target.value))}
                  className="w-16 accent-white h-1 bg-zinc-800 rounded-lg cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="font-mono text-zinc-500 text-[10px]">PRISM:</span>
                <input
                  type="range"
                  min="0.2"
                  max="2.0"
                  step="0.1"
                  value={chromaticIntensity}
                  onChange={(e) => setChromaticIntensity(parseFloat(e.target.value))}
                  className="w-16 accent-white h-1 bg-zinc-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>

          </div>
        )}
      </div>

    </main>
  );
};
