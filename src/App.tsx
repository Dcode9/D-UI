import React, { useRef, useState, useEffect } from 'react';
import { WwdcTextEffect } from './components/WwdcTextEffect';
import { CanvasFluidLightEngine, CanvasFluidLightEngineHandle } from './components/CanvasFluidLightEngine';

export const App: React.FC = () => {
  const engineRef = useRef<CanvasFluidLightEngineHandle>(null);
  const textWrapperRef = useRef<HTMLDivElement>(null);
  const [engineState, setEngineState] = useState<1 | 2 | 3>(1);

  // Initialize uncover CSS variable and global click replay listener
  useEffect(() => {
    if (textWrapperRef.current) {
      textWrapperRef.current.style.setProperty('--uncover-left', '100%');
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
      {/* Revealed smoothly via --uncover-left as the canvas beam sweeps across    */}
      {/* ========================================================================= */}
      <div
        ref={textWrapperRef}
        className="relative z-10 w-full flex items-center justify-center"
        style={
          {
            '--uncover-left': '100%',
            clipPath:
              engineState === 1
                ? 'inset(0 0 0 100%)'
                : engineState === 2
                ? 'inset(0 0 0 var(--uncover-left, 100%))'
                : 'none',
            WebkitClipPath:
              engineState === 1
                ? 'inset(0 0 0 100%)'
                : engineState === 2
                ? 'inset(0 0 0 var(--uncover-left, 100%))'
                : 'none',
            opacity: engineState === 1 ? 0 : 1,
            willChange: 'clip-path, opacity',
          } as React.CSSProperties
        }
      >
        <WwdcTextEffect
          text="'Verse"
          direction="left-to-right"
          lightPosition={18}
          bloomStrength={1.0}
          chromaticIntensity={1.0}
          oppositeGlowStrength={1.0}
          animateIn={false}
        />
      </div>

      {/* ========================================================================= */}
      {/* 2. FULLSCREEN CANVAS FLUID LIGHT ENGINE (IN FRONT OF TEXT AT z-20)        */}
      {/* Mix-blend-mode: screen ensures the beam passes OVER the text             */}
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
