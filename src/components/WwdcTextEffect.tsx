import React, { useState, useEffect, useRef } from 'react';

export interface WwdcTextEffectProps {
  text?: string;
  lightPosition?: number; // 0 to 100% across the text (default is ~82% matching WWDC26 image)
  interactive?: boolean;
  chromaticIntensity?: number; // 0 to 2
  bloomStrength?: number; // 0 to 2
}

export const WwdcTextEffect: React.FC<WwdcTextEffectProps> = ({
  text = "'Verse",
  lightPosition = 82, // Matches WWDC26 right-edge focal point
  interactive = false,
  chromaticIntensity = 1.0,
  bloomStrength = 1.0,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentLightPos, setCurrentLightPos] = useState<number>(lightPosition);

  useEffect(() => {
    if (!interactive) {
      setCurrentLightPos(lightPosition);
    }
  }, [lightPosition, interactive]);

  useEffect(() => {
    if (!interactive) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const relativeX = (e.clientX - rect.left) / rect.width;

      const clampedX = Math.max(0, Math.min(100, relativeX * 100));
      setCurrentLightPos(clampedX);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [interactive]);

  // Position parameters for the lighting gradients
  const p = currentLightPos; // 0 to 100%

  // Gradient transition stops based on light position
  const darkStop = Math.max(0, p - 55);
  const midStop = Math.max(10, p - 25);
  const brightStop = Math.min(100, Math.max(20, p - 5));
  const peakStop = Math.min(100, p);

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-center select-none py-12 px-6"
    >
      {/* ========================================================================= */}
      {/* 1. ATMOSPHERIC OPTICAL LENS FLARE / BACKGROUND RADIAL DIFFUSION */}
      {/* ========================================================================= */}
      <div
        className="absolute pointer-events-none transition-all duration-75 ease-out rounded-full"
        style={{
          left: `${currentLightPos}%`,
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'clamp(280px, 35vw, 600px)',
          height: 'clamp(200px, 25vw, 450px)',
          background: `radial-gradient(ellipse at center, rgba(255, 255, 255, ${0.45 * bloomStrength}) 0%, rgba(255, 235, 195, ${0.35 * bloomStrength}) 20%, rgba(255, 175, 60, ${0.2 * bloomStrength}) 45%, rgba(120, 180, 255, ${0.08 * chromaticIntensity}) 65%, transparent 80%)`,
          filter: `blur(${35 * bloomStrength}px)`,
          opacity: 0.95,
          zIndex: 0,
        }}
      />

      {/* Primary Typography Container */}
      <div className="relative inline-block font-['Plus_Jakarta_Sans',sans-serif] font-black tracking-[-0.04em] text-[18vw] sm:text-[19vw] md:text-[20vw] lg:text-[21vw] leading-none z-10">
        
        {/* ======================================================================= */}
        {/* 2. LAYER A: BASE DARK METALLIC TITANIUM TEXT (The Shadow Foundation) */}
        {/* ======================================================================= */}
        <span
          className="relative block font-extrabold"
          style={{
            background: 'linear-gradient(175deg, #303038 0%, #1a1a20 40%, #0d0d10 80%, #050507 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 20px 40px rgba(0, 0, 0, 0.95))',
          }}
        >
          {text}
        </span>

        {/* ======================================================================= */}
        {/* 3. LAYER B: SILHOUETTE SPECULAR BEVEL (Crisp Razor Contour) */}
        {/* ======================================================================= */}
        <span
          aria-hidden="true"
          className="absolute inset-0 block font-extrabold pointer-events-none"
          style={{
            WebkitTextStroke: '1px transparent',
            background: `linear-gradient(to right, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.2) ${midStop}%, rgba(255,255,255,0.85) ${peakStop}%, rgba(255,255,255,0.95) 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mixBlendMode: 'screen',
            opacity: 0.9,
          }}
        >
          {text}
        </span>

        {/* ======================================================================= */}
        {/* 4. LAYER C: DIRECTIONAL ILLUMINATION (Satin Silver to White Gradient) */}
        {/* ======================================================================= */}
        <span
          aria-hidden="true"
          className="absolute inset-0 block font-extrabold pointer-events-none"
          style={{
            background: `linear-gradient(to right, transparent 0%, transparent ${darkStop}%, rgba(130, 135, 150, 0.3) ${midStop}%, rgba(220, 225, 240, 0.9) ${brightStop}%, #ffffff ${peakStop}%, #ffffff 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mixBlendMode: 'screen',
            opacity: 0.95,
          }}
        >
          {text}
        </span>

        {/* ======================================================================= */}
        {/* 5. LAYER D: PRISMATIC WARM AMBER CHROMATIC FRINGE (Right Edge Halo) */}
        {/* ======================================================================= */}
        <span
          aria-hidden="true"
          className="absolute inset-0 block font-extrabold pointer-events-none"
          style={{
            transform: `translateX(${3.5 * chromaticIntensity}px) translateY(0.5px)`,
            background: `linear-gradient(to right, transparent 0%, transparent ${midStop}%, rgba(255, 175, 60, 0.4) ${brightStop}%, rgba(255, 185, 75, 0.95) ${peakStop}%, rgba(255, 150, 40, 0.85) 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mixBlendMode: 'screen',
            filter: `blur(${2.5 * chromaticIntensity}px) drop-shadow(${4 * chromaticIntensity}px 0 ${12 * chromaticIntensity}px rgba(255, 160, 50, 0.85))`,
            opacity: 0.92,
          }}
        >
          {text}
        </span>

        {/* ======================================================================= */}
        {/* 6. LAYER E: PRISMATIC COOL CYAN/BLUE CHROMATIC FRINGE (Left Inset Halo) */}
        {/* ======================================================================= */}
        <span
          aria-hidden="true"
          className="absolute inset-0 block font-extrabold pointer-events-none"
          style={{
            transform: `translateX(${-2.5 * chromaticIntensity}px) translateY(-0.5px)`,
            background: `linear-gradient(to right, transparent 0%, transparent ${darkStop}%, rgba(100, 190, 255, 0.3) ${midStop}%, rgba(140, 220, 255, 0.85) ${brightStop}%, rgba(190, 235, 255, 0.4) ${peakStop}%, transparent 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mixBlendMode: 'screen',
            filter: `blur(${2.0 * chromaticIntensity}px) drop-shadow(${-3 * chromaticIntensity}px 0 ${10 * chromaticIntensity}px rgba(90, 180, 255, 0.8))`,
            opacity: 0.85,
          }}
        >
          {text}
        </span>

        {/* ======================================================================= */}
        {/* 7. LAYER F: BLINDING WHITE-HOT INCANDESCENT CORE & MULTI-STAGE BLOOM */}
        {/* ======================================================================= */}
        <span
          aria-hidden="true"
          className="absolute inset-0 block font-extrabold pointer-events-none"
          style={{
            background: `linear-gradient(to right, transparent 0%, transparent ${midStop}%, rgba(255, 255, 255, 0.5) ${brightStop}%, #ffffff ${peakStop}%, #ffffff 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mixBlendMode: 'screen',
            filter: `drop-shadow(0 0 ${4 * bloomStrength}px #ffffff) drop-shadow(0 0 ${16 * bloomStrength}px rgba(255, 255, 255, 0.9)) drop-shadow(0 0 ${38 * bloomStrength}px rgba(240, 245, 255, 0.6))`,
            opacity: 1.0,
          }}
        >
          {text}
        </span>

        {/* ======================================================================= */}
        {/* 8. LAYER G: RAZOR-SHARP WHITE APEX HIGHLIGHT FILAMENT */}
        {/* ======================================================================= */}
        <span
          aria-hidden="true"
          className="absolute inset-0 block font-extrabold pointer-events-none"
          style={{
            WebkitTextStroke: '0.8px transparent',
            background: `linear-gradient(to right, transparent 0%, transparent ${brightStop}%, rgba(255,255,255,0.7) ${peakStop - 2}%, #ffffff ${peakStop}%, #ffffff 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mixBlendMode: 'screen',
            filter: 'drop-shadow(0 0 2px #ffffff)',
          }}
        >
          {text}
        </span>
      </div>
    </div>
  );
};
