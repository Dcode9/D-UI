import React, { useState, useRef, useCallback } from 'react';
import { WwdcTextEffect } from './components/WwdcTextEffect';
import { CanvasFluidLightEngine, CanvasFluidLightEngineHandle } from './components/CanvasFluidLightEngine';

export const App: React.FC = () => {
  // Real-time Text Illumination & Uncover Tracking
  const [lightPosition, setLightPosition] = useState<number>(100);
  const [uncoverLeft, setUncoverLeft] = useState<number>(100);
  const [engineState, setEngineState] = useState<1 | 2 | 3>(1);
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
    <main
      className="relative w-screen h-screen bg-[#040406] overflow-hidden flex items-center justify-center select-none text-[#e2e2e8]"
      onClick={() => engineState === 3 && engineRef.current?.replay()}
    >
      {/* Background Subtle Radial Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 50%, #08080e 0%, #040406 95%)',
        }}
      />

      {/* SVG Film Grain Filter (Maelie Lusson reference aesthetic) */}
      <svg className="hidden" aria-hidden="true">
        <filter id="film-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="matrix" values="0 0 0 0 1   0 0 0 0 1   0 0 0 0 1  0 0 0 0.05 0" />
        </filter>
      </svg>
      <div
        className="absolute inset-0 pointer-events-none z-30 opacity-30 mix-blend-overlay"
        style={{ filter: 'url(#film-grain)' }}
      />

      {/* ========================================================================= */}
      {/* 1. FULLSCREEN CANVAS FLUID LIGHT ENGINE                                   */}
      {/* In State 1 (loading), this glowing animation is the ONLY thing visible!   */}
      {/* ========================================================================= */}
      <CanvasFluidLightEngine
        ref={engineRef}
        autoPlay={true}
        onUncoverProgress={setUncoverLeft}
        onBeamPositionUpdate={handleBeamPositionUpdate}
        onStateChange={setEngineState}
      />

      {/* ========================================================================= */}
      {/* 2. HERO TYPOGRAPHY (UNCOVERED ONLY ONCE SWEEP BEGINS)                     */}
      {/* Completely hidden during loading state (engineState === 1 / uncoverLeft === 100) */}
      {/* ========================================================================= */}
      {engineState !== 1 && (
        <div className="relative z-10 w-full flex items-center justify-center px-4">
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
      )}

    </main>
  );
};
