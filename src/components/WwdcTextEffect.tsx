import React from 'react';

export type FlowDirection = 'left-to-right' | 'right-to-left';

export interface WwdcTextEffectProps {
  text?: string;
  direction?: FlowDirection;
  lightPosition?: number;
  bloomStrength?: number;
  chromaticIntensity?: number;
  oppositeGlowStrength?: number;
}

export const WwdcTextEffect: React.FC<WwdcTextEffectProps> = ({
  text = "'Verse",
  direction = 'left-to-right',
  lightPosition,
  bloomStrength = 1.0,
  chromaticIntensity = 1.0,
  oppositeGlowStrength = 1.0,
}) => {
  const isL2R = direction === 'left-to-right';
  
  // Default light position: 18% for L2R, 82% for R2L
  const p = lightPosition !== undefined ? lightPosition : isL2R ? 18 : 82;

  // Directional gradient stops matching WWDC26 reference:
  // Smooth transition from blinding white -> satin platinum -> brushed steel -> dark smoked glass
  const darkStop = isL2R ? Math.min(100, p + 55) : Math.max(0, p - 55);
  const midStop = isL2R ? Math.min(100, p + 26) : Math.max(0, p - 26);
  const brightStop = isL2R ? Math.max(0, p + 10) : Math.min(100, p - 10);
  const peakStop = p;

  // Opposite side coordinate (for subtle ambient backlight)
  const oppositePos = isL2R ? 88 : 12;

  // Chromatic dispersion offsets on the glowing rim
  const amberShiftX = isL2R ? -3.0 : 3.0;
  const cyanShiftX = isL2R ? 2.0 : -2.0;

  return (
    <div className="relative flex items-center justify-center select-none py-14 px-8">
      
      {/* ========================================================================= */}
      {/* 1. ATMOSPHERIC VOLUMETRIC BLOOM (Centered at the Incandescent Light Core) */}
      {/* ========================================================================= */}
      {/* Layer A: Golden Amber Outer Halo */}
      <div
        className="absolute pointer-events-none rounded-full"
        style={{
          left: `${p + (isL2R ? 1.5 : -1.5)}%`,
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'clamp(320px, 40vw, 720px)',
          height: 'clamp(240px, 30vw, 540px)',
          background: `radial-gradient(ellipse at center, rgba(255, 175, 55, ${0.32 * bloomStrength}) 0%, rgba(255, 140, 25, ${0.18 * bloomStrength}) 35%, transparent 70%)`,
          filter: `blur(${38 * bloomStrength}px)`,
          opacity: 0.92,
          zIndex: 0,
        }}
      />
      {/* Layer B: Blinding White Core Glow */}
      <div
        className="absolute pointer-events-none rounded-full"
        style={{
          left: `${p}%`,
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'clamp(220px, 28vw, 520px)',
          height: 'clamp(160px, 22vw, 400px)',
          background: `radial-gradient(ellipse at center, rgba(255, 255, 255, ${0.58 * bloomStrength}) 0%, rgba(255, 248, 235, ${0.38 * bloomStrength}) 30%, transparent 70%)`,
          filter: `blur(${26 * bloomStrength}px)`,
          opacity: 0.96,
          zIndex: 0,
        }}
      />
      {/* Layer C: Electric Sky-Cyan Inner Halo */}
      <div
        className="absolute pointer-events-none rounded-full"
        style={{
          left: `${p + (isL2R ? -1.5 : 1.5)}%`,
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'clamp(260px, 32vw, 580px)',
          height: 'clamp(180px, 24vw, 440px)',
          background: `radial-gradient(ellipse at center, rgba(100, 190, 255, ${0.2 * chromaticIntensity}) 0%, rgba(70, 160, 255, ${0.12 * chromaticIntensity}) 35%, transparent 65%)`,
          filter: `blur(${34 * chromaticIntensity}px)`,
          opacity: 0.85,
          zIndex: 0,
        }}
      />

      {/* ========================================================================= */}
      {/* 2. OPPOSITE-SIDE DIFFUSED AMBIENT SILHOUETTE GLOW                         */}
      {/* ========================================================================= */}
      <div
        className="absolute pointer-events-none rounded-full"
        style={{
          left: `${oppositePos}%`,
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'clamp(240px, 30vw, 500px)',
          height: 'clamp(160px, 20vw, 360px)',
          background: `radial-gradient(ellipse at center, rgba(200, 210, 235, ${0.09 * oppositeGlowStrength}) 0%, rgba(150, 165, 195, ${0.05 * oppositeGlowStrength}) 40%, transparent 75%)`,
          filter: `blur(${40 * oppositeGlowStrength}px)`,
          opacity: 0.8,
          zIndex: 0,
        }}
      />

      {/* Primary Typography Container */}
      <div className="relative inline-block font-['Plus_Jakarta_Sans',sans-serif] font-black tracking-[-0.04em] text-[18vw] sm:text-[19vw] md:text-[20vw] lg:text-[21vw] leading-none z-10">
        
        {/* ======================================================================= */}
        {/* 3. LAYER A: SOLID DARK SMOKED TITANIUM / LIQUID GLASS BODY (3D DEPTH)   */}
        {/* Rich, solid face gradient with realistic vertical lighting and depth   */}
        {/* ======================================================================= */}
        <span
          className="relative block font-extrabold"
          style={{
            background: 'linear-gradient(180deg, #30323a 0%, #1e1f26 35%, #101115 70%, #060608 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 15px 35px rgba(0, 0, 0, 0.98)) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.8))',
          }}
        >
          {text}
        </span>

        {/* ======================================================================= */}
        {/* 4. LAYER B: 3D TOP-BEVEL SPECULAR CATCHLIGHT (Gives 3D Liquid-Glass Rim)*/}
        {/* Subtle, smooth top-edge highlight that illuminates the upper chamfer   */}
        {/* without ANY hollow wireframes or overlapping crossbar lines!           */}
        {/* ======================================================================= */}
        <span
          aria-hidden="true"
          className="absolute inset-0 block font-extrabold pointer-events-none"
          style={{
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.35) 0%, rgba(190, 200, 220, 0.15) 18%, rgba(120, 130, 150, 0.04) 40%, transparent 65%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mixBlendMode: 'screen',
            opacity: 0.9,
          }}
        >
          {text}
        </span>

        {/* ======================================================================= */}
        {/* 5. LAYER C: DIRECTIONAL ILLUMINATION (Smooth Bright-to-Gray Surface)   */}
        {/* Satin platinum silver -> brushed gunmetal -> smoked glass transition   */}
        {/* ======================================================================= */}
        <span
          aria-hidden="true"
          className="absolute inset-0 block font-extrabold pointer-events-none"
          style={{
            background: isL2R
              ? `linear-gradient(to right, #ffffff 0%, #ffffff ${peakStop}%, #dce0eb ${brightStop}%, #525562 ${midStop}%, #16171c ${darkStop}%, transparent 100%)`
              : `linear-gradient(to right, transparent 0%, #16171c ${darkStop}%, #525562 ${midStop}%, #dce0eb ${brightStop}%, #ffffff ${peakStop}%, #ffffff 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mixBlendMode: 'screen',
            opacity: 0.96,
          }}
        >
          {text}
        </span>

        {/* ======================================================================= */}
        {/* 6. LAYER D: WARM AMBER CHROMATIC FRINGE (Outer Glowing Dispersive Rim) */}
        {/* ======================================================================= */}
        <span
          aria-hidden="true"
          className="absolute inset-0 block font-extrabold pointer-events-none"
          style={{
            transform: `translateX(${amberShiftX * chromaticIntensity}px) translateY(0.5px)`,
            background: isL2R
              ? `linear-gradient(to right, rgba(255, 155, 45, 0.95) 0%, rgba(255, 192, 75, 0.9) ${peakStop}%, rgba(255, 180, 65, 0.25) ${brightStop}%, transparent ${midStop}%, transparent 100%)`
              : `linear-gradient(to right, transparent 0%, transparent ${midStop}%, rgba(255, 180, 65, 0.25) ${brightStop}%, rgba(255, 192, 75, 0.9) ${peakStop}%, rgba(255, 155, 45, 0.95) 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mixBlendMode: 'screen',
            filter: `blur(${2.0 * chromaticIntensity}px) drop-shadow(${amberShiftX * 1.5 * chromaticIntensity}px 0 ${9 * chromaticIntensity}px rgba(255, 160, 50, 0.9))`,
            opacity: 0.92,
          }}
        >
          {text}
        </span>

        {/* ======================================================================= */}
        {/* 7. LAYER E: COOL SKY-CYAN CHROMATIC FRINGE (Inner Dispersive Edge)     */}
        {/* ======================================================================= */}
        <span
          aria-hidden="true"
          className="absolute inset-0 block font-extrabold pointer-events-none"
          style={{
            transform: `translateX(${cyanShiftX * chromaticIntensity}px) translateY(-0.5px)`,
            background: isL2R
              ? `linear-gradient(to right, transparent 0%, rgba(190, 235, 255, 0.3) ${peakStop}%, rgba(135, 215, 255, 0.75) ${brightStop}%, transparent ${midStop}%, transparent 100%)`
              : `linear-gradient(to right, transparent 0%, transparent ${midStop}%, rgba(135, 215, 255, 0.75) ${brightStop}%, rgba(190, 235, 255, 0.3) ${peakStop}%, transparent 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mixBlendMode: 'screen',
            filter: `blur(${1.6 * chromaticIntensity}px) drop-shadow(${cyanShiftX * 1.5 * chromaticIntensity}px 0 ${7 * chromaticIntensity}px rgba(90, 185, 255, 0.82))`,
            opacity: 0.84,
          }}
        >
          {text}
        </span>

        {/* ======================================================================= */}
        {/* 8. LAYER F: BLINDING INCANDESCENT CORE & MULTI-STAGE BLOOM             */}
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
        {/* 9. LAYER G: RAZOR APEX FILAMENT (Machined Specular White Glint)        */}
        {/* ======================================================================= */}
        <span
          aria-hidden="true"
          className="absolute inset-0 block font-extrabold pointer-events-none"
          style={{
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
