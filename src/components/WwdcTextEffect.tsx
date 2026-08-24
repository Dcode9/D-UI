import React, { useState, useEffect, useRef } from 'react';

export type FlowDirection = 'left-to-right' | 'right-to-left';

export interface WwdcTextEffectProps {
  text?: string;
  direction?: FlowDirection;
  lightPosition?: number; // 0 to 100% across the text
  interactive?: boolean;
  chromaticIntensity?: number; // 0 to 2
  bloomStrength?: number; // 0 to 2
  oppositeGlowStrength?: number; // 0 to 2
}

export const WwdcTextEffect: React.FC<WwdcTextEffectProps> = ({
  text = "'Verse",
  direction = 'left-to-right',
  lightPosition,
  interactive = false,
  chromaticIntensity = 1.0,
  bloomStrength = 1.0,
  oppositeGlowStrength = 1.0,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // The MAIN light position is FIXED based on direction/lightPosition prop.
  // Interactive hover does NOT move this — it adds a separate glow layer.
  const fixedLightPos = lightPosition !== undefined ? lightPosition : direction === 'left-to-right' ? 18 : 82;
  const [mainLightPos, setMainLightPos] = useState<number>(fixedLightPos);

  // Separate hover cursor position (only used for the hover brighten layer)
  const [hoverPos, setHoverPos] = useState<number | null>(null);

  useEffect(() => {
    setMainLightPos(lightPosition !== undefined ? lightPosition : direction === 'left-to-right' ? 18 : 82);
  }, [lightPosition, direction]);

  useEffect(() => {
    if (!interactive) {
      setHoverPos(null);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const relativeX = (e.clientX - rect.left) / rect.width;
      setHoverPos(Math.max(0, Math.min(100, relativeX * 100)));
    };

    const handleMouseLeave = () => setHoverPos(null);

    window.addEventListener('mousemove', handleMouseMove);
    containerRef.current?.addEventListener('mouseleave', handleMouseLeave);
    const containerEl = containerRef.current;
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      containerEl?.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [interactive]);

  const p = mainLightPos; // 0 to 100% — ANCHORED, never moves with cursor
  const isL2R = direction === 'left-to-right';

  // Smooth gradient stops for the main directional illumination
  const darkStop = isL2R ? Math.min(100, p + 58) : Math.max(0, p - 58);
  const midStop = isL2R ? Math.min(100, p + 28) : Math.max(0, p - 28);
  const brightStop = isL2R ? Math.max(0, p + 10) : Math.min(100, p - 10);
  const peakStop = p;

  // Opposite side coordinate (for diffused back glow)
  const oppositePos = isL2R ? 88 : 12;

  // Chromatic fringe shifts (constrained strictly to outer glowing rim)
  const amberShiftX = isL2R ? -3.0 : 3.0;
  const cyanShiftX = isL2R ? 2.0 : -2.0;

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-center select-none py-12 px-6"
    >
      {/* ========================================================================= */}
      {/* 1. PRIMARY LIGHT BLOOM (Atmospheric Lens Flare on the Bright Edge) */}
      {/* ========================================================================= */}
      <div
        className="absolute pointer-events-none transition-all duration-75 ease-out rounded-full"
        style={{
          left: `${mainLightPos}%`,
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'clamp(280px, 36vw, 650px)',
          height: 'clamp(200px, 26vw, 480px)',
          background: `radial-gradient(ellipse at center, rgba(255, 255, 255, ${0.5 * bloomStrength}) 0%, rgba(255, 240, 215, ${0.4 * bloomStrength}) 18%, rgba(255, 175, 60, ${0.22 * bloomStrength}) 40%, rgba(255, 255, 255, 0.05) 60%, transparent 80%)`,
          filter: `blur(${30 * bloomStrength}px)`,
          opacity: 0.95,
          zIndex: 0,
        }}
      />

      {/* ========================================================================= */}
      {/* 2. OPPOSITE SIDE DIFFUSED AMBIENT SILHOUETTE GLOW */}
      {/* ========================================================================= */}
      <div
        className="absolute pointer-events-none rounded-full"
        style={{
          left: `${oppositePos}%`,
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'clamp(240px, 30vw, 500px)',
          height: 'clamp(160px, 20vw, 360px)',
          background: `radial-gradient(ellipse at center, rgba(210, 220, 245, ${0.14 * oppositeGlowStrength}) 0%, rgba(160, 175, 205, ${0.08 * oppositeGlowStrength}) 40%, transparent 75%)`,
          filter: `blur(${40 * oppositeGlowStrength}px)`,
          opacity: 0.85,
          zIndex: 0,
        }}
      />

      {/* Primary Typography Container */}
      <div className="relative inline-block font-['Plus_Jakarta_Sans',sans-serif] font-black tracking-[-0.04em] text-[18vw] sm:text-[19vw] md:text-[20vw] lg:text-[21vw] leading-none z-10">
        
        {/* ======================================================================= */}
        {/* 3. LAYER A: BASE CHISELED METALLIC TITANIUM TEXT */}
        {/* ======================================================================= */}
        <span
          className="relative block font-extrabold"
          style={{
            background: 'linear-gradient(175deg, #32323a 0%, #1e1e24 35%, #101014 70%, #060608 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 20px 40px rgba(0, 0, 0, 0.95))',
          }}
        >
          {text}
        </span>

        {/* ======================================================================= */}
        {/* 4. LAYER B: OPPOSITE-SIDE DIFFUSED SILHOUETTE RIM HIGHLIGHT */}
        {/* ======================================================================= */}
        <span
          aria-hidden="true"
          className="absolute inset-0 block font-extrabold pointer-events-none"
          style={{
            WebkitTextStroke: '1px transparent',
            background: isL2R
              ? `linear-gradient(to left, rgba(220, 230, 255, ${0.35 * oppositeGlowStrength}) 0%, rgba(180, 195, 225, ${0.18 * oppositeGlowStrength}) 25%, transparent 60%)`
              : `linear-gradient(to right, rgba(220, 230, 255, ${0.35 * oppositeGlowStrength}) 0%, rgba(180, 195, 225, ${0.18 * oppositeGlowStrength}) 25%, transparent 60%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mixBlendMode: 'screen',
            filter: `drop-shadow(0 0 ${8 * oppositeGlowStrength}px rgba(180, 200, 240, ${0.3 * oppositeGlowStrength}))`,
            opacity: 0.85,
          }}
        >
          {text}
        </span>

        {/* ======================================================================= */}
        {/* 5. LAYER C: SUBTLE TOP-EDGE SPECULAR CATCH (Gives Depth to Dark Letters) */}
        {/* ======================================================================= */}
        <span
          aria-hidden="true"
          className="absolute inset-0 block font-extrabold pointer-events-none"
          style={{
            background: `linear-gradient(180deg, rgba(200, 205, 220, 0.22) 0%, rgba(150, 155, 170, 0.08) 35%, transparent 65%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mixBlendMode: 'screen',
            opacity: 0.85,
          }}
        >
          {text}
        </span>

        {/* ======================================================================= */}
        {/* 6. LAYER D: SMOOTH BRIGHT-TO-GRAY DIRECTIONAL ILLUMINATION (NO BLUE) */}
        {/* ======================================================================= */}
        <span
          aria-hidden="true"
          className="absolute inset-0 block font-extrabold pointer-events-none"
          style={{
            background: isL2R
              ? `linear-gradient(to right, #ffffff 0%, #ffffff ${peakStop}%, #d8dbe6 ${brightStop}%, #5a5d68 ${midStop}%, #1e1f24 ${darkStop}%, transparent 100%)`
              : `linear-gradient(to right, transparent 0%, #1e1f24 ${darkStop}%, #5a5d68 ${midStop}%, #d8dbe6 ${brightStop}%, #ffffff ${peakStop}%, #ffffff 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mixBlendMode: 'screen',
            opacity: 0.95,
          }}
        >
          {text}
        </span>

        {/* ======================================================================= */}
        {/* 7. LAYER E: TIGHT PRISMATIC AMBER CHROMATIC FRINGE (Outer Glowing Rim) */}
        {/* ======================================================================= */}
        <span
          aria-hidden="true"
          className="absolute inset-0 block font-extrabold pointer-events-none"
          style={{
            transform: `translateX(${amberShiftX * chromaticIntensity}px) translateY(0.5px)`,
            background: isL2R
              ? `linear-gradient(to right, rgba(255, 160, 50, 0.95) 0%, rgba(255, 190, 80, 0.9) ${peakStop}%, rgba(255, 180, 70, 0.25) ${brightStop}%, transparent ${midStop}%, transparent 100%)`
              : `linear-gradient(to right, transparent 0%, transparent ${midStop}%, rgba(255, 180, 70, 0.25) ${brightStop}%, rgba(255, 190, 80, 0.9) ${peakStop}%, rgba(255, 160, 50, 0.95) 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mixBlendMode: 'screen',
            filter: `blur(${2.0 * chromaticIntensity}px) drop-shadow(${amberShiftX * 1.5 * chromaticIntensity}px 0 ${9 * chromaticIntensity}px rgba(255, 165, 55, 0.9))`,
            opacity: 0.92,
          }}
        >
          {text}
        </span>

        {/* ======================================================================= */}
        {/* 8. LAYER F: TIGHT PRISMATIC CYAN/BLUE FRINGE (Inner Edge Dispersion) */}
        {/* ======================================================================= */}
        <span
          aria-hidden="true"
          className="absolute inset-0 block font-extrabold pointer-events-none"
          style={{
            transform: `translateX(${cyanShiftX * chromaticIntensity}px) translateY(-0.5px)`,
            background: isL2R
              ? `linear-gradient(to right, transparent 0%, rgba(190, 235, 255, 0.3) ${peakStop}%, rgba(140, 220, 255, 0.75) ${brightStop}%, transparent ${midStop}%, transparent 100%)`
              : `linear-gradient(to right, transparent 0%, transparent ${midStop}%, rgba(140, 220, 255, 0.75) ${brightStop}%, rgba(190, 235, 255, 0.3) ${peakStop}%, transparent 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mixBlendMode: 'screen',
            filter: `blur(${1.6 * chromaticIntensity}px) drop-shadow(${cyanShiftX * 1.5 * chromaticIntensity}px 0 ${7 * chromaticIntensity}px rgba(100, 190, 255, 0.8))`,
            opacity: 0.82,
          }}
        >
          {text}
        </span>

        {/* ======================================================================= */}
        {/* 9. LAYER G: BLINDING WHITE-HOT INCANDESCENT CORE & MULTI-STAGE BLOOM */}
        {/* ======================================================================= */}
        <span
          aria-hidden="true"
          className="absolute inset-0 block font-extrabold pointer-events-none"
          style={{
            background: isL2R
              ? `linear-gradient(to right, #ffffff 0%, #ffffff ${peakStop}%, rgba(255, 255, 255, 0.45) ${brightStop}%, transparent ${midStop}%, transparent 100%)`
              : `linear-gradient(to right, transparent 0%, transparent ${midStop}%, rgba(255, 255, 255, 0.45) ${brightStop}%, #ffffff ${peakStop}%, #ffffff 100%)`,
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
        {/* 10. LAYER H: RAZOR-SHARP WHITE APEX HIGHLIGHT FILAMENT */}
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

        {/* ======================================================================= */}
        {/* 11. LAYER I: INTERACTIVE HOVER BRIGHTEN (Cursor-Following Surface Sheen) */}
        {/* ======================================================================= */}
        {hoverPos !== null && (
          <span
            aria-hidden="true"
            className="absolute inset-0 block font-extrabold pointer-events-none transition-opacity duration-100"
            style={{
              background: `radial-gradient(ellipse 22% 90% at ${hoverPos}% 50%, rgba(255, 255, 255, 0.55) 0%, rgba(220, 225, 240, 0.2) 40%, transparent 80%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mixBlendMode: 'screen',
              filter: `drop-shadow(0 0 6px rgba(255, 255, 255, 0.4))`,
              opacity: 0.9,
            }}
          >
            {text}
          </span>
        )}
      </div>
    </div>
  );
};
