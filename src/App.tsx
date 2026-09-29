import React, { useRef, useState, useEffect } from 'react';
import { WwdcTextEffect } from './components/WwdcTextEffect';
import { CanvasFluidLightEngine, CanvasFluidLightEngineHandle } from './components/CanvasFluidLightEngine';

export const App: React.FC = () => {
  const engineRef = useRef<CanvasFluidLightEngineHandle>(null);
  const textWrapperRef = useRef<HTMLDivElement>(null);
  const [engineState, setEngineState] = useState<1 | 2 | 3>(1);
  const [lightPos, setLightPos] = useState<number>(100);

  // Synchronize initial state & handle global click to replay
  useEffect(() => {
    if (textWrapperRef.current) {
      textWrapperRef.current.style.setProperty('--uncover-pct', '100%');
      textWrapperRef.current.style.setProperty('--light-pos', '100%');
    }

    const handleGlobalClick = () => {
      if (engineRef.current?.getState() === 3) {
        engineRef.current.replay();
      }
    };

    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  const handleStateChange = (state: 1 | 2 | 3) => {
    setEngineState(state);
    if (state === 3) {
      setLightPos(18); // Left resting position
    }
  };

  return (
    <main
      className={`relative w-screen h-screen bg-[#040406] overflow-hidden flex items-center justify-center select-none text-[#e2e2e8] ${
        engineState === 3 ? 'cursor-pointer' : 'cursor-default'
      }`}
    >
      {/* Background Subtle Radial Vignette */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background: 'radial-gradient(circle at 50% 50%, #08080e 0%, #040406 95%)',
        }}
      />

      {/* SVG Fine Film Grain Filter (Maelie Lusson aesthetic) */}
      <svg className="hidden" aria-hidden="true">
        <filter id="film-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="matrix" values="0 0 0 0 1   0 0 0 0 1   0 0 0 0 1  0 0 0 0.04 0" />
        </filter>
      </svg>
      <div
        className="absolute inset-0 pointer-events-none z-30 opacity-30 mix-blend-overlay"
        style={{ filter: 'url(#film-grain)' }}
      />

      {/* ========================================================================= */}
      {/* 1. HERO TYPOGRAPHY CONTAINER (BEHIND THE GLOW AT z-10)                   */}
      {/* Uses CSS mask-image with soft feathering driven directly by CSS variable  */}
      {/* ========================================================================= */}
      <div
        ref={textWrapperRef}
        className="relative z-10 w-full flex items-center justify-center px-4"
        style={
          {
            '--uncover-pct': '100%',
            '--light-pos': '100%',
            maskImage:
              engineState === 1
                ? 'none'
                : 'linear-gradient(to right, transparent 0%, transparent calc(var(--uncover-pct) - 4%), black calc(var(--uncover-pct) + 3%), black 100%)',
            WebkitMaskImage:
              engineState === 1
                ? 'none'
                : 'linear-gradient(to right, transparent 0%, transparent calc(var(--uncover-pct) - 4%), black calc(var(--uncover-pct) + 3%), black 100%)',
            opacity: engineState === 1 ? 0 : 1,
            willChange: 'mask-image, opacity',
          } as React.CSSProperties
        }
      >
        <WwdcTextEffect
          text="'Verse"
          direction="left-to-right"
          lightPosition={engineState === 3 ? 18 : lightPos}
          bloomStrength={1.0}
          chromaticIntensity={1.0}
          oppositeGlowStrength={1.0}
        />
      </div>

      {/* ========================================================================= */}
      {/* 2. FULLSCREEN CANVAS FLUID LIGHT ENGINE (IN FRONT OF TEXT AT z-20)        */}
      {/* Mix-blend-mode: screen ensures the blazing white light passes OVER text   */}
      {/* ========================================================================= */}
      <CanvasFluidLightEngine
        ref={engineRef}
        autoPlay={true}
        targetElementRef={textWrapperRef}
        onStateChange={handleStateChange}
      />

    </main>
  );
};
