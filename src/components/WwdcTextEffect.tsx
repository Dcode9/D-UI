import React from 'react';

export type FlowDirection = 'left-to-right' | 'right-to-left';

export interface WwdcTextEffectProps {
  text?: string;
  direction?: FlowDirection;
  lightPosition?: number;
  chromaticIntensity?: number;
  bloomStrength?: number;
  oppositeGlowStrength?: number;
}

export const WwdcTextEffect: React.FC<WwdcTextEffectProps> = ({
  text = "'Verse",
  direction = 'left-to-right',
  lightPosition,
  chromaticIntensity = 1.0,
  bloomStrength = 1.0,
  oppositeGlowStrength = 1.0,
}) => {
  const isL2R = direction === 'left-to-right';
  const p = lightPosition !== undefined ? lightPosition : isL2R ? 18 : 82;

  // Gradient stops mathematically linked to light position
  const darkStop = isL2R ? Math.min(100, p + 55) : Math.max(0, p - 55);
  const midStop = isL2R ? Math.min(100, p + 26) : Math.max(0, p - 26);
  const brightStop = isL2R ? Math.max(0, p + 10) : Math.min(100, p - 10);
  const peakStop = p;

  // Chromatic fringe offsets
  const amberShiftX = isL2R ? -3.0 : 3.0;
  const cyanShiftX = isL2R ? 2.0 : -2.0;

  return (
    <div className="relative flex items-center justify-center select-none py-12 px-6">
      
      {/* Primary Typography Container */}
      <div className="relative inline-block font-['Plus_Jakarta_Sans',sans-serif] font-black tracking-[-0.04em] text-[18vw] sm:text-[19vw] md:text-[20vw] lg:text-[21vw] leading-none z-10">
        
        {/* ======================================================================= */}
        {/* 1. LAYER A: BASE DARK BODY — Near-black with subtle warm undertone      */}
        {/* ======================================================================= */}
        <span
          className="relative block font-extrabold bg-clip-text"
          style={{
            backgroundImage: 'linear-gradient(178deg, #2a2a30 0%, #18181c 30%, #0c0c0f 65%, #050506 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 18px 35px rgba(0, 0, 0, 0.95))',
          }}
        >
          {text}
        </span>

        {/* ======================================================================= */}
        {/* 2. LAYER B: EDGE SPECULAR STROKE — Silvery 1px contour on ALL letters   */}
        {/* ======================================================================= */}
        <span
          aria-hidden="true"
          className="absolute inset-0 block font-extrabold pointer-events-none"
          style={{
            WebkitTextStroke: '1px rgba(160, 165, 185, 0.45)',
            color: 'transparent',
            mixBlendMode: 'screen',
            opacity: 0.9,
          }}
        >
          {text}
        </span>

        {/* ======================================================================= */}
        {/* 3. LAYER C: SUBTLE TOP-EDGE SPECULAR CATCH — Directional light catch    */}
        {/* ======================================================================= */}
        <span
          aria-hidden="true"
          className="absolute inset-0 block font-extrabold pointer-events-none bg-clip-text"
          style={{
            backgroundImage: 'linear-gradient(180deg, rgba(180, 185, 200, 0.18) 0%, rgba(120, 125, 140, 0.06) 30%, transparent 55%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mixBlendMode: 'screen',
            opacity: 0.85,
          }}
        >
          {text}
        </span>

        {/* ======================================================================= */}
        {/* 4. LAYER D: DIRECTIONAL ILLUMINATION — Platinum white to satin gray      */}
        {/* ======================================================================= */}
        <span
          aria-hidden="true"
          className="absolute inset-0 block font-extrabold pointer-events-none bg-clip-text"
          style={{
            backgroundImage: isL2R
              ? `linear-gradient(to right, #ffffff 0%, #ffffff ${peakStop}%, #d4d7e2 ${brightStop}%, #484b56 ${midStop}%, #121316 ${darkStop}%, transparent 100%)`
              : `linear-gradient(to right, transparent 0%, #121316 ${darkStop}%, #484b56 ${midStop}%, #d4d7e2 ${brightStop}%, #ffffff ${peakStop}%, #ffffff 100%)`,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mixBlendMode: 'screen',
            opacity: 0.95,
          }}
        >
          {text}
        </span>

        {/* ======================================================================= */}
        {/* 5. LAYER E: OPPOSITE-SIDE DIFFUSED SILHOUETTE RIM HIGHLIGHT             */}
        {/* ======================================================================= */}
        <span
          aria-hidden="true"
          className="absolute inset-0 block font-extrabold pointer-events-none bg-clip-text"
          style={{
            backgroundImage: isL2R
              ? `linear-gradient(to left, rgba(200, 210, 230, ${0.25 * oppositeGlowStrength}) 0%, rgba(160, 170, 195, ${0.12 * oppositeGlowStrength}) 20%, transparent 50%)`
              : `linear-gradient(to right, rgba(200, 210, 230, ${0.25 * oppositeGlowStrength}) 0%, rgba(160, 170, 195, ${0.12 * oppositeGlowStrength}) 20%, transparent 50%)`,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mixBlendMode: 'screen',
            filter: `drop-shadow(0 0 ${6 * oppositeGlowStrength}px rgba(160, 180, 220, ${0.2 * oppositeGlowStrength}))`,
            opacity: 0.8,
          }}
        >
          {text}
        </span>

        {/* ======================================================================= */}
        {/* 6. LAYER F: AMBER CHROMATIC FRINGE (Outer warm dispersive edge)         */}
        {/* ======================================================================= */}
        <span
          aria-hidden="true"
          className="absolute inset-0 block font-extrabold pointer-events-none bg-clip-text"
          style={{
            transform: `translateX(${amberShiftX * chromaticIntensity}px) translateY(0.5px)`,
            backgroundImage: isL2R
              ? `linear-gradient(to right, rgba(255, 160, 50, 0.95) 0%, rgba(255, 190, 80, 0.9) ${peakStop}%, rgba(255, 180, 70, 0.25) ${brightStop}%, transparent ${midStop}%, transparent 100%)`
              : `linear-gradient(to right, transparent 0%, transparent ${midStop}%, rgba(255, 180, 70, 0.25) ${brightStop}%, rgba(255, 190, 80, 0.9) ${peakStop}%, rgba(255, 160, 50, 0.95) 100%)`,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mixBlendMode: 'screen',
            filter: `blur(${2.0 * chromaticIntensity}px) drop-shadow(${amberShiftX * 1.5 * chromaticIntensity}px 0 ${9 * chromaticIntensity}px rgba(255, 165, 55, 0.9))`,
            opacity: 0.92,
          }}
        >
          {text}
        </span>

        {/* ======================================================================= */}
        {/* 7. LAYER G: CYAN CHROMATIC FRINGE (Inner cool dispersive edge)          */}
        {/* ======================================================================= */}
        <span
          aria-hidden="true"
          className="absolute inset-0 block font-extrabold pointer-events-none bg-clip-text"
          style={{
            transform: `translateX(${cyanShiftX * chromaticIntensity}px) translateY(-0.5px)`,
            backgroundImage: isL2R
              ? `linear-gradient(to right, transparent 0%, rgba(190, 235, 255, 0.3) ${peakStop}%, rgba(140, 220, 255, 0.75) ${brightStop}%, transparent ${midStop}%, transparent 100%)`
              : `linear-gradient(to right, transparent 0%, transparent ${midStop}%, rgba(140, 220, 255, 0.75) ${brightStop}%, rgba(190, 235, 255, 0.3) ${peakStop}%, transparent 100%)`,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mixBlendMode: 'screen',
            filter: `blur(${1.6 * chromaticIntensity}px) drop-shadow(${cyanShiftX * 1.5 * chromaticIntensity}px 0 ${7 * chromaticIntensity}px rgba(100, 190, 255, 0.8))`,
            opacity: 0.82,
          }}
        >
          {text}
        </span>

        {/* ======================================================================= */}
        {/* 8. LAYER H: BLINDING INCANDESCENT CORE & MULTI-STAGE BLOOM              */}
        {/* ======================================================================= */}
        <span
          aria-hidden="true"
          className="absolute inset-0 block font-extrabold pointer-events-none bg-clip-text"
          style={{
            backgroundImage: isL2R
              ? `linear-gradient(to right, #ffffff 0%, #ffffff ${peakStop}%, rgba(255, 255, 255, 0.45) ${brightStop}%, transparent ${midStop}%, transparent 100%)`
              : `linear-gradient(to right, transparent 0%, transparent ${midStop}%, rgba(255, 255, 255, 0.45) ${brightStop}%, #ffffff ${peakStop}%, #ffffff 100%)`,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mixBlendMode: 'screen',
            filter: `drop-shadow(0 0 ${4 * bloomStrength}px #ffffff) drop-shadow(0 0 ${16 * bloomStrength}px rgba(255, 255, 255, 0.95)) drop-shadow(0 0 ${36 * bloomStrength}px rgba(240, 245, 255, 0.6))`,
            opacity: 1.0,
          }}
        >
          {text}
        </span>

        {/* ======================================================================= */}
        {/* 9. LAYER I: RAZOR-SHARP WHITE APEX FILAMENT                             */}
        {/* ======================================================================= */}
        <span
          aria-hidden="true"
          className="absolute inset-0 block font-extrabold pointer-events-none bg-clip-text"
          style={{
            WebkitTextStroke: '0.8px transparent',
            backgroundImage: isL2R
              ? `linear-gradient(to right, #ffffff 0%, #ffffff ${peakStop}%, rgba(255,255,255,0.7) ${peakStop + 2}%, transparent ${brightStop}%, transparent 100%)`
              : `linear-gradient(to right, transparent 0%, transparent ${brightStop}%, rgba(255,255,255,0.7) ${peakStop - 2}%, #ffffff ${peakStop}%, #ffffff 100%)`,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
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
