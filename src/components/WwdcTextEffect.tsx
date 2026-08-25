import React from 'react';

export type FlowDirection = 'left-to-right' | 'right-to-left';

export interface WwdcTextEffectProps {
  text?: string;
  direction?: FlowDirection;
  lightPosition?: number; // 0 to 100% across the text (default 18 for L2R, 82 for R2L)
  bloomStrength?: number; // 0 to 2
  chromaticIntensity?: number; // 0 to 2
  specularEdgeIntensity?: number; // 0 to 2 (border highlight strength)
}

export const WwdcTextEffect: React.FC<WwdcTextEffectProps> = ({
  text = "'Verse",
  direction = 'left-to-right',
  lightPosition,
  bloomStrength = 1.0,
  chromaticIntensity = 1.0,
  specularEdgeIntensity = 1.0,
}) => {
  const isL2R = direction === 'left-to-right';
  
  // Default light position based on flow direction
  const p = lightPosition !== undefined ? lightPosition : isL2R ? 18 : 82;

  // Linear gradient transition points matching the reference image's smoked glass -> satin -> incandescent gradient
  const darkStop = isL2R ? Math.min(100, p + 56) : Math.max(0, p - 56);
  const midStop = isL2R ? Math.min(100, p + 26) : Math.max(0, p - 26);
  const brightStop = isL2R ? Math.max(0, p + 9) : Math.min(100, p - 9);
  const peakStop = p;

  // Chromatic dispersion offsets on the glowing rim
  const amberShiftX = isL2R ? -3.5 : 3.5;
  const cyanShiftX = isL2R ? 2.5 : -2.5;

  return (
    <div className="relative flex items-center justify-center select-none py-14 px-8">
      {/* ========================================================================= */}
      {/* 1. ATMOSPHERIC VOLUMETRIC BLOOM (Centered around the Blinding Light Core) */}
      {/* ========================================================================= */}
      <div
        className="absolute pointer-events-none rounded-full transition-all duration-150 ease-out"
        style={{
          left: `${p}%`,
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'clamp(280px, 36vw, 650px)',
          height: 'clamp(200px, 26vw, 480px)',
          background: `radial-gradient(ellipse at center, rgba(255, 255, 255, ${0.52 * bloomStrength}) 0%, rgba(255, 240, 215, ${0.4 * bloomStrength}) 20%, rgba(255, 175, 60, ${0.22 * bloomStrength}) 42%, rgba(100, 185, 255, ${0.09 * chromaticIntensity}) 65%, transparent 80%)`,
          filter: `blur(${32 * bloomStrength}px)`,
          opacity: 0.96,
          zIndex: 0,
        }}
      />

      {/* Primary Typography Container */}
      <div className="relative inline-block font-['Plus_Jakarta_Sans',sans-serif] font-extrabold tracking-[-0.04em] text-[18vw] sm:text-[19vw] md:text-[20vw] lg:text-[21vw] leading-none z-10">
        
        {/* ======================================================================= */}
        {/* 2. LAYER A: BASE DARK SMOKED GRAPHITE / OBSIDIAN BODY (The Shadow Core) */}
        {/* Matches the dark smoky body of WW and D from the reference image */}
        {/* ======================================================================= */}
        <span
          className="relative block font-extrabold"
          style={{
            background: 'linear-gradient(180deg, #1c1d22 0%, #121216 45%, #08080a 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 20px 40px rgba(0, 0, 0, 0.98))',
          }}
        >
          {text}
        </span>

        {/* ======================================================================= */}
        {/* 3. LAYER B: CRISP 1PX SPECULAR BORDER & EDGE HIGHLIGHT ON GREY LETTERS  */}
        {/* This creates the machined bevel chamfer outline on W, W, D borders!    */}
        {/* ======================================================================= */}
        <span
          aria-hidden="true"
          className="absolute inset-0 block font-extrabold pointer-events-none"
          style={{
            WebkitTextStroke: `${1.2 * specularEdgeIntensity}px transparent`,
            background: isL2R
              ? `linear-gradient(135deg, rgba(255, 255, 255, ${0.95 * specularEdgeIntensity}) 0%, rgba(230, 235, 250, ${0.8 * specularEdgeIntensity}) ${peakStop}%, rgba(160, 170, 190, ${0.45 * specularEdgeIntensity}) ${midStop}%, rgba(110, 115, 130, ${0.35 * specularEdgeIntensity}) ${darkStop}%, rgba(80, 85, 95, ${0.28 * specularEdgeIntensity}) 100%)`
              : `linear-gradient(225deg, rgba(80, 85, 95, ${0.28 * specularEdgeIntensity}) 0%, rgba(110, 115, 130, ${0.35 * specularEdgeIntensity}) ${darkStop}%, rgba(160, 170, 190, ${0.45 * specularEdgeIntensity}) ${midStop}%, rgba(230, 235, 250, ${0.8 * specularEdgeIntensity}) ${peakStop}%, rgba(255, 255, 255, ${0.95 * specularEdgeIntensity}) 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mixBlendMode: 'screen',
            opacity: 0.95,
          }}
        >
          {text}
        </span>

        {/* ======================================================================= */}
        {/* 4. LAYER C: TOP-APEX SPECULAR CATCHLIGHT (Overhead Machined Bevel Glint)*/}
        {/* ======================================================================= */}
        <span
          aria-hidden="true"
          className="absolute inset-0 block font-extrabold pointer-events-none"
          style={{
            WebkitTextStroke: '0.8px transparent',
            background: `linear-gradient(180deg, rgba(255, 255, 255, ${0.45 * specularEdgeIntensity}) 0%, rgba(190, 200, 220, ${0.2 * specularEdgeIntensity}) 20%, transparent 55%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mixBlendMode: 'screen',
            opacity: 0.9,
          }}
        >
          {text}
        </span>

        {/* ======================================================================= */}
        {/* 5. LAYER D: SATIN ALUMINUM TO BRIGHT PLATINUM SURFACE ILLUMINATION     */}
        {/* Smooth, neutral transition from smoked titanium -> satin chrome -> white */}
        {/* ======================================================================= */}
        <span
          aria-hidden="true"
          className="absolute inset-0 block font-extrabold pointer-events-none"
          style={{
            background: isL2R
              ? `linear-gradient(to right, #ffffff 0%, #ffffff ${peakStop}%, #e2e6f0 ${brightStop}%, #6c707e ${midStop}%, #1e1f26 ${darkStop}%, transparent 100%)`
              : `linear-gradient(to right, transparent 0%, #1e1f26 ${darkStop}%, #6c707e ${midStop}%, #e2e6f0 ${brightStop}%, #ffffff ${peakStop}%, #ffffff 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mixBlendMode: 'screen',
            opacity: 0.96,
          }}
        >
          {text}
        </span>

        {/* ======================================================================= */}
        {/* 6. LAYER E: PRISMATIC WARM AMBER CHROMATIC ABERRATION FRINGE            */}
        {/* Intense golden-amber optical fringe on the outer glowing bezel         */}
        {/* ======================================================================= */}
        <span
          aria-hidden="true"
          className="absolute inset-0 block font-extrabold pointer-events-none"
          style={{
            transform: `translateX(${amberShiftX * chromaticIntensity}px) translateY(0.5px)`,
            background: isL2R
              ? `linear-gradient(to right, rgba(255, 155, 45, 0.95) 0%, rgba(255, 192, 75, 0.9) ${peakStop}%, rgba(255, 180, 65, 0.3) ${brightStop}%, transparent ${midStop}%, transparent 100%)`
              : `linear-gradient(to right, transparent 0%, transparent ${midStop}%, rgba(255, 180, 65, 0.3) ${brightStop}%, rgba(255, 192, 75, 0.9) ${peakStop}%, rgba(255, 155, 45, 0.95) 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mixBlendMode: 'screen',
            filter: `blur(${2.0 * chromaticIntensity}px) drop-shadow(${amberShiftX * 1.5 * chromaticIntensity}px 0 ${9 * chromaticIntensity}px rgba(255, 160, 50, 0.9))`,
            opacity: 0.94,
          }}
        >
          {text}
        </span>

        {/* ======================================================================= */}
        {/* 7. LAYER F: PRISMATIC COOL SKY CYAN CHROMATIC ABERRATION FRINGE         */}
        {/* Electric sky-cyan optical fringe on the inner glowing edge             */}
        {/* ======================================================================= */}
        <span
          aria-hidden="true"
          className="absolute inset-0 block font-extrabold pointer-events-none"
          style={{
            transform: `translateX(${cyanShiftX * chromaticIntensity}px) translateY(-0.5px)`,
            background: isL2R
              ? `linear-gradient(to right, transparent 0%, rgba(185, 230, 255, 0.35) ${peakStop}%, rgba(130, 215, 255, 0.8) ${brightStop}%, transparent ${midStop}%, transparent 100%)`
              : `linear-gradient(to right, transparent 0%, transparent ${midStop}%, rgba(130, 215, 255, 0.8) ${brightStop}%, rgba(185, 230, 255, 0.35) ${peakStop}%, transparent 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mixBlendMode: 'screen',
            filter: `blur(${1.6 * chromaticIntensity}px) drop-shadow(${cyanShiftX * 1.5 * chromaticIntensity}px 0 ${7 * chromaticIntensity}px rgba(90, 185, 255, 0.85))`,
            opacity: 0.85,
          }}
        >
          {text}
        </span>

        {/* ======================================================================= */}
        {/* 8. LAYER G: BLINDING WHITE-HOT INCANDESCENT CORE & MULTI-STAGE BLOOM    */}
        {/* Pure brilliant incandescent white core                                 */}
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
            filter: `drop-shadow(0 0 ${4 * bloomStrength}px #ffffff) drop-shadow(0 0 ${16 * bloomStrength}px rgba(255, 255, 255, 0.95)) drop-shadow(0 0 ${38 * bloomStrength}px rgba(235, 245, 255, 0.65))`,
            opacity: 1.0,
          }}
        >
          {text}
        </span>

        {/* ======================================================================= */}
        {/* 9. LAYER H: RAZOR-SHARP WHITE APEX HIGHLIGHT FILAMENT                   */}
        {/* ======================================================================= */}
        <span
          aria-hidden="true"
          className="absolute inset-0 block font-extrabold pointer-events-none"
          style={{
            WebkitTextStroke: '0.8px transparent',
            background: isL2R
              ? `linear-gradient(to right, #ffffff 0%, #ffffff ${peakStop}%, rgba(255,255,255,0.75) ${peakStop + 2}%, transparent ${brightStop}%, transparent 100%)`
              : `linear-gradient(to right, transparent 0%, transparent ${brightStop}%, rgba(255,255,255,0.75) ${peakStop - 2}%, #ffffff ${peakStop}%, #ffffff 100%)`,
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
