import React, { useState, useEffect, useRef } from 'react';

export type FlowDirection = 'left-to-right' | 'right-to-left';

export interface WwdcTextEffectProps {
  text?: string;
  direction?: FlowDirection;
  lightPosition?: number; // 0 to 100% across the text
  interactive?: boolean;
  chromaticIntensity?: number; // 0 to 2
  bloomStrength?: number; // 0 to 2
}

export const WwdcTextEffect: React.FC<WwdcTextEffectProps> = ({
  text = "'Verse",
  direction = 'left-to-right',
  lightPosition,
  interactive = false,
  chromaticIntensity = 1.0,
  bloomStrength = 1.0,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Default light position based on flow direction
  // Left-to-right -> light is on the left (e.g. 18%)
  // Right-to-left -> light is on the right (e.g. 82%)
  const defaultPos = lightPosition !== undefined ? lightPosition : direction === 'left-to-right' ? 18 : 82;
  const [currentLightPos, setCurrentLightPos] = useState<number>(defaultPos);

  useEffect(() => {
    if (!interactive) {
      setCurrentLightPos(lightPosition !== undefined ? lightPosition : direction === 'left-to-right' ? 18 : 82);
    }
  }, [lightPosition, direction, interactive]);

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

  const p = currentLightPos; // 0 to 100%
  const isL2R = direction === 'left-to-right';

  // Calculate refined gradient stops for crisp chromatic separation and metallic falloff
  const darkStop = isL2R ? Math.min(100, p + 55) : Math.max(0, p - 55);
  const midStop = isL2R ? Math.min(100, p + 25) : Math.max(0, p - 25);
  const brightStop = isL2R ? Math.max(0, p + 8) : Math.min(100, p - 8);
  const peakStop = p;

  const amberShiftX = isL2R ? -3.5 : 3.5;
  const cyanShiftX = isL2R ? 2.5 : -2.5;

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
          width: 'clamp(280px, 36vw, 650px)',
          height: 'clamp(200px, 26vw, 480px)',
          background: `radial-gradient(ellipse at center, rgba(255, 255, 255, ${0.48 * bloomStrength}) 0%, rgba(255, 238, 205, ${0.38 * bloomStrength}) 18%, rgba(255, 175, 60, ${0.22 * bloomStrength}) 42%, rgba(100, 180, 255, ${0.09 * chromaticIntensity}) 65%, transparent 80%)`,
          filter: `blur(${32 * bloomStrength}px)`,
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
            background: isL2R
              ? 'linear-gradient(175deg, #32323a 0%, #1c1c22 40%, #0d0d10 80%, #050507 100%)'
              : 'linear-gradient(175deg, #303038 0%, #1a1a20 40%, #0d0d10 80%, #050507 100%)',
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
            background: isL2R
              ? `linear-gradient(to right, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) ${peakStop}%, rgba(255,255,255,0.2) ${midStop}%, rgba(255,255,255,0.08) 100%)`
              : `linear-gradient(to right, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.2) ${midStop}%, rgba(255,255,255,0.85) ${peakStop}%, rgba(255,255,255,0.95) 100%)`,
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
            background: isL2R
              ? `linear-gradient(to right, #ffffff 0%, #ffffff ${peakStop}%, rgba(220, 225, 240, 0.9) ${brightStop}%, rgba(130, 135, 150, 0.3) ${midStop}%, transparent ${darkStop}%, transparent 100%)`
              : `linear-gradient(to right, transparent 0%, transparent ${darkStop}%, rgba(130, 135, 150, 0.3) ${midStop}%, rgba(220, 225, 240, 0.9) ${brightStop}%, #ffffff ${peakStop}%, #ffffff 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mixBlendMode: 'screen',
            opacity: 0.95,
          }}
        >
          {text}
        </span>

        {/* ======================================================================= */}
        {/* 5. LAYER D: OPTIMIZED PRISMATIC WARM AMBER CHROMATIC FRINGE */}
        {/* ======================================================================= */}
        <span
          aria-hidden="true"
          className="absolute inset-0 block font-extrabold pointer-events-none"
          style={{
            transform: `translateX(${amberShiftX * chromaticIntensity}px) translateY(0.5px)`,
            background: isL2R
              ? `linear-gradient(to right, rgba(255, 150, 40, 0.9) 0%, rgba(255, 185, 75, 0.95) ${peakStop}%, rgba(255, 175, 60, 0.4) ${brightStop}%, transparent ${midStop}%, transparent 100%)`
              : `linear-gradient(to right, transparent 0%, transparent ${midStop}%, rgba(255, 175, 60, 0.4) ${brightStop}%, rgba(255, 185, 75, 0.95) ${peakStop}%, rgba(255, 150, 40, 0.9) 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mixBlendMode: 'screen',
            filter: `blur(${2.2 * chromaticIntensity}px) drop-shadow(${amberShiftX * 1.5 * chromaticIntensity}px 0 ${10 * chromaticIntensity}px rgba(255, 160, 50, 0.9))`,
            opacity: 0.95,
          }}
        >
          {text}
        </span>

        {/* ======================================================================= */}
        {/* 6. LAYER E: OPTIMIZED PRISMATIC COOL CYAN/BLUE CHROMATIC FRINGE */}
        {/* ======================================================================= */}
        <span
          aria-hidden="true"
          className="absolute inset-0 block font-extrabold pointer-events-none"
          style={{
            transform: `translateX(${cyanShiftX * chromaticIntensity}px) translateY(-0.5px)`,
            background: isL2R
              ? `linear-gradient(to right, transparent 0%, rgba(190, 235, 255, 0.4) ${peakStop}%, rgba(140, 220, 255, 0.85) ${brightStop}%, rgba(100, 190, 255, 0.3) ${midStop}%, transparent ${darkStop}%, transparent 100%)`
              : `linear-gradient(to right, transparent 0%, transparent ${darkStop}%, rgba(100, 190, 255, 0.3) ${midStop}%, rgba(140, 220, 255, 0.85) ${brightStop}%, rgba(190, 235, 255, 0.4) ${peakStop}%, transparent 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mixBlendMode: 'screen',
            filter: `blur(${1.8 * chromaticIntensity}px) drop-shadow(${cyanShiftX * 1.5 * chromaticIntensity}px 0 ${8 * chromaticIntensity}px rgba(90, 180, 255, 0.85))`,
            opacity: 0.88,
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
            background: isL2R
              ? `linear-gradient(to right, #ffffff 0%, #ffffff ${peakStop}%, rgba(255, 255, 255, 0.5) ${brightStop}%, transparent ${midStop}%, transparent 100%)`
              : `linear-gradient(to right, transparent 0%, transparent ${midStop}%, rgba(255, 255, 255, 0.5) ${brightStop}%, #ffffff ${peakStop}%, #ffffff 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mixBlendMode: 'screen',
            filter: `drop-shadow(0 0 ${4 * bloomStrength}px #ffffff) drop-shadow(0 0 ${16 * bloomStrength}px rgba(255, 255, 255, 0.95)) drop-shadow(0 0 ${36 * bloomStrength}px rgba(240, 245, 255, 0.6))`,
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
            background: isL2R
              ? `linear-gradient(to right, #ffffff 0%, #ffffff ${peakStop}%, rgba(255,255,255,0.7) ${peakStop + 2}%, transparent ${brightStop}%, transparent 100%)`
              : `linear-gradient(to right, transparent 0%, transparent ${brightStop}%, rgba(255,255,255,0.7) ${peakStop - 2}%, #ffffff ${peakStop}%, #ffffff 100%)`,
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
