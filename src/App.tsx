import React, { useState, useRef, useCallback } from 'react';
import { WwdcTextEffect } from './components/WwdcTextEffect';
import { CanvasFluidLightEngine, CanvasFluidLightEngineHandle } from './components/CanvasFluidLightEngine';
import { RotateCcw } from 'lucide-react';

export const App: React.FC = () => {
  // Real-time Text Illumination & Uncover Tracking
  const [lightPosition, setLightPosition] = useState<number>(100);
  const [uncoverLeft, setUncoverLeft] = useState<number>(100);
  const [, setEngineState] = useState<1 | 2 | 3>(1);
  const engineRef = useRef<CanvasFluidLightEngineHandle>(null);

  // Parallel Light Tracking: As the light beam sweeps across horizontally,
  // the text effect's lightPosition follows in exact parallel lockstep!
  const handleBeamPositionUpdate = useCallback((xPercent: number, _yPercent: number, state: 1 | 2 | 3) => {
    if (state === 2) {
      setLightPosition(xPercent);
    } else if (state === 3) {
      setLightPosition(18); // Left resting illumination for 'Verse
    }
  }, []);

  return (
    <main className="relative w-screen h-screen bg-[#040406] overflow-hidden flex flex-col items-center justify-between select-none text-[#e2e2e8]">
      
      {/* Background Subtle Radial Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 50%, #08080e 0%, #040406 95%)',
        }}
      />

      {/* ========================================================================= */}
      {/* 1. TOP NAVIGATION HEADER                                                  */}
      {/* ========================================================================= */}
      <header className="relative z-30 pt-6 px-8 flex items-center justify-between w-full max-w-7xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center font-black text-sm text-white shadow-lg">
            D
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-wide text-white flex items-center gap-1.5 font-['Space_Grotesk']">
              <span>D&apos;VERSE</span>
            </span>
          </div>
        </div>

        {/* Minimal Replay Trigger Button */}
        <button
          onClick={() => engineRef.current?.replay()}
          className="px-3.5 py-1.5 rounded-full text-xs font-mono text-neutral-400 hover:text-white bg-neutral-900/60 border border-neutral-800 hover:border-neutral-700 backdrop-blur-md transition-all flex items-center gap-1.5 cursor-pointer shadow-lg hover:bg-neutral-800/80"
          title="Replay Loading & Parallel Sweep Animation"
        >
          <RotateCcw className="w-3 h-3 text-amber-400" />
          <span>Replay Intro</span>
        </button>
      </header>

      {/* ========================================================================= */}
      {/* 2. FULLSCREEN CANVAS FLUID LIGHT ENGINE (PERIMETER ORBIT + CENTER SWEEP)  */}
      {/* ========================================================================= */}
      <CanvasFluidLightEngine
        ref={engineRef}
        autoPlay={true}
        onUncoverProgress={setUncoverLeft}
        onBeamPositionUpdate={handleBeamPositionUpdate}
        onStateChange={setEngineState}
      />

      {/* ========================================================================= */}
      {/* 3. HERO TYPOGRAPHY (REVEALED IN REAL-TIME LOCKSTEP WITH THE SWEEP GLOW)   */}
      {/* ========================================================================= */}
      <div className="relative z-10 w-full flex-1 flex items-center justify-center px-4">
        <div
          className="relative w-full flex items-center justify-center"
          style={{
            clipPath: `inset(0 0 0 ${uncoverLeft}%)`,
            willChange: 'clip-path',
          }}
        >
          {/* LOCKED TEXT EFFECT (COMMIT df455d3) SYNCHRONIZED PARALLEL WITH THE SWEEP BEAM */}
          <WwdcTextEffect
            text="'Verse"
            direction="left-to-right"
            lightPosition={lightPosition}
            bloomStrength={1.0}
            chromaticIntensity={1.0}
            oppositeGlowStrength={1.0}
          />
        </div>
      </div>

      {/* Subtle bottom spacer */}
      <div className="relative z-20 pb-8 text-[11px] font-mono text-neutral-600 tracking-widest uppercase">
        Next-Gen Optical Interface
      </div>

    </main>
  );
};
