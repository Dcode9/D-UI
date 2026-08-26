import React, { useState, useEffect } from 'react';

export type FlowDirection = 'left-to-right' | 'right-to-left';

export interface WwdcTextEffectProps {
  text?: string;
  direction?: FlowDirection;
  lightPosition?: number;
  chromaticIntensity?: number;
  bloomStrength?: number;
  oppositeGlowStrength?: number;
  /** When true, plays the loading sweep animation once on mount */
  animateIn?: boolean;
}

export const WwdcTextEffect: React.FC<WwdcTextEffectProps> = ({
  text = "'Verse",
  direction = 'left-to-right',
  lightPosition,
  chromaticIntensity = 1.0,
  bloomStrength = 1.0,
  oppositeGlowStrength = 1.0,
  animateIn = false,
}) => {
  const fixedLightPos = lightPosition !== undefined ? lightPosition : direction === 'left-to-right' ? 18 : 82;
  const [mainLightPos, setMainLightPos] = useState<number>(animateIn ? (direction === 'left-to-right' ? -15 : 115) : fixedLightPos);
  const [hasAnimated, setHasAnimated] = useState(false);

  // Sync prop changes
  useEffect(() => {
    if (!animateIn || hasAnimated) {
      setMainLightPos(lightPosition !== undefined ? lightPosition : direction === 'left-to-right' ? 18 : 82);
    }
  }, [lightPosition, direction, animateIn, hasAnimated]);

  // Loading sweep animation: light sweeps from left edge to its resting position
  useEffect(() => {
    if (!animateIn || hasAnimated) return;

    const isL2R = direction === 'left-to-right';
    const startPos = isL2R ? -15 : 115;
    const endPos = lightPosition !== undefined ? lightPosition : isL2R ? 18 : 82;
    const startTime = performance.now();
    const duration = 2200; // ms

    setMainLightPos(startPos);

    let animId: number;
    const sweep = (now: number) => {
      const elapsed = now - startTime;
      const rawProgress = Math.min(1, elapsed / duration);
      // Ease-out cubic for a natural deceleration
      const eased = 1 - Math.pow(1 - rawProgress, 3);
      const pos = startPos + (endPos - startPos) * eased;
      setMainLightPos(pos);

      if (rawProgress < 1) {
        animId = requestAnimationFrame(sweep);
      } else {
        setHasAnimated(true);
      }
    };

    animId = requestAnimationFrame(sweep);
    return () => cancelAnimationFrame(animId);
  }, [animateIn, hasAnimated, direction, lightPosition]);

  const p = mainLightPos;
  const isL2R = direction === 'left-to-right';

  // Gradient stops
  const darkStop = isL2R ? Math.min(100, p + 55) : Math.max(0, p - 55);
  const midStop = isL2R ? Math.min(100, p + 26) : Math.max(0, p - 26);
  const brightStop = isL2R ? Math.max(0, p + 10) : Math.min(100, p - 10);
  const peakStop = p;

  // Opposite side coordinate
  const oppositePos = isL2R ? 88 : 12;

  // Chromatic fringe shifts
  const amberShiftX = isL2R ? -3.0 : 3.0;
  const cyanShiftX = isL2R ? 2.0 : -2.0;

  return (
    <div className="relative flex items-center justify-center select-none py-12 px-6">

      {/* ========================================================================= */}
      {/* 1. CHROMATIC ABERRATION GLOW — Layered Amber/White/Cyan Bloom */}
      {/* ========================================================================= */}
      {/* Outer warm amber halo */}
      <div
        className="absolute pointer-events-none rounded-full"
        style={{
          left: `${mainLightPos + (isL2R ? 1.5 : -1.5)}%`,
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'clamp(320px, 40vw, 720px)',
          height: 'clamp(240px, 30vw, 540px)',
          background: `radial-gradient(ellipse at center, rgba(255, 180, 60, ${0.35 * bloomStrength}) 0%, rgba(255, 145, 30, ${0.2 * bloomStrength}) 35%, transparent 70%)`,
          filter: `blur(${38 * bloomStrength}px)`,
          opacity: 0.9,
          zIndex: 0,
        }}
      />
      {/* Core white bloom */}
      <div
        className="absolute pointer-events-none rounded-full"
        style={{
          left: `${mainLightPos}%`,
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'clamp(220px, 28vw, 520px)',
          height: 'clamp(160px, 22vw, 400px)',
          background: `radial-gradient(ellipse at center, rgba(255, 255, 255, ${0.6 * bloomStrength}) 0%, rgba(255, 250, 240, ${0.4 * bloomStrength}) 30%, transparent 70%)`,
          filter: `blur(${26 * bloomStrength}px)`,
          opacity: 0.95,
          zIndex: 0,
        }}
      />
      {/* Inner cool cyan halo */}
      <div
        className="absolute pointer-events-none rounded-full"
        style={{
          left: `${mainLightPos + (isL2R ? -1.5 : 1.5)}%`,
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'clamp(260px, 32vw, 580px)',
          height: 'clamp(180px, 24vw, 440px)',
          background: `radial-gradient(ellipse at center, rgba(100, 190, 255, ${0.2 * chromaticIntensity}) 0%, rgba(80, 160, 255, ${0.12 * chromaticIntensity}) 35%, transparent 65%)`,
          filter: `blur(${34 * chromaticIntensity}px)`,
          opacity: 0.85,
          zIndex: 0,
        }}
      />

      {/* ========================================================================= */}
      {/* 2. OPPOSITE SIDE DIFFUSED AMBIENT GLOW */}
      {/* ========================================================================= */}
      <div
        className="absolute pointer-events-none rounded-full"
        style={{
          left: `${oppositePos}%`,
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'clamp(240px, 30vw, 500px)',
          height: 'clamp(160px, 20vw, 360px)',
          background: `radial-gradient(ellipse at center, rgba(200, 210, 235, ${0.1 * oppositeGlowStrength}) 0%, rgba(150, 165, 195, ${0.06 * oppositeGlowStrength}) 40%, transparent 75%)`,
          filter: `blur(${40 * oppositeGlowStrength}px)`,
          opacity: 0.8,
          zIndex: 0,
        }}
      />

      {/* Primary Typography Container */}
      <div className="relative inline-block font-['Plus_Jakarta_Sans',sans-serif] font-black tracking-[-0.04em] text-[18vw] sm:text-[19vw] md:text-[20vw] lg:text-[21vw] leading-none z-10">
        
        {/* ======================================================================= */}
        {/* 3. LAYER A: BASE DARK BODY — Near-black with subtle warm undertone */}
        {/* ======================================================================= */}
        <span
          className="relative block font-extrabold"
          style={{
            background: 'linear-gradient(178deg, #2a2a30 0%, #18181c 30%, #0c0c0f 65%, #050506 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 18px 35px rgba(0, 0, 0, 0.95))',
          }}
        >
          {text}
        </span>

        {/* ======================================================================= */}
        {/* 4. LAYER B: EDGE SPECULAR STROKE — Silvery 1px contour on ALL letters */}
        {/* This is the key layer that defines the dark letter silhouettes with a */}
        {/* machined silver edge catch, like brushed titanium letterforms. */}
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
        {/* 5. LAYER C: SUBTLE TOP-EDGE SPECULAR CATCH — Vertical light catch */}
        {/* ======================================================================= */}
        <span
          aria-hidden="true"
          className="absolute inset-0 block font-extrabold pointer-events-none"
          style={{
            background: 'linear-gradient(180deg, rgba(180, 185, 200, 0.18) 0%, rgba(120, 125, 140, 0.06) 30%, transparent 55%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mixBlendMode: 'screen',
            opacity: 0.85,
          }}
        >
          {text}
        </span>

        {/* ======================================================================= */}
        {/* 6. LAYER D: DIRECTIONAL ILLUMINATION — Smooth bright to dark gray */}
        {/* The gray values match the reference: near-invisible dark smoked glass */}
        {/* on the far side, transitioning through warm neutral satin aluminum, */}
        {/* to clean platinum white, to blinding incandescent. */}
        {/* ======================================================================= */}
        <span
          aria-hidden="true"
          className="absolute inset-0 block font-extrabold pointer-events-none"
          style={{
            background: isL2R
              ? `linear-gradient(to right, #ffffff 0%, #ffffff ${peakStop}%, #d4d7e2 ${brightStop}%, #484b56 ${midStop}%, #121316 ${darkStop}%, transparent 100%)`
              : `linear-gradient(to right, transparent 0%, #121316 ${darkStop}%, #484b56 ${midStop}%, #d4d7e2 ${brightStop}%, #ffffff ${peakStop}%, #ffffff 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mixBlendMode: 'screen',
            opacity: 0.95,
          }}
        >
          {text}
        </span>

        {/* ======================================================================= */}
        {/* 7. LAYER E: OPPOSITE-SIDE DIFFUSED SILHOUETTE RIM HIGHLIGHT */}
        {/* ======================================================================= */}
        <span
          aria-hidden="true"
          className="absolute inset-0 block font-extrabold pointer-events-none"
          style={{
            background: isL2R
              ? `linear-gradient(to left, rgba(200, 210, 230, ${0.25 * oppositeGlowStrength}) 0%, rgba(160, 170, 195, ${0.12 * oppositeGlowStrength}) 20%, transparent 50%)`
              : `linear-gradient(to right, rgba(200, 210, 230, ${0.25 * oppositeGlowStrength}) 0%, rgba(160, 170, 195, ${0.12 * oppositeGlowStrength}) 20%, transparent 50%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mixBlendMode: 'screen',
            filter: `drop-shadow(0 0 ${6 * oppositeGlowStrength}px rgba(160, 180, 220, ${0.2 * oppositeGlowStrength}))`,
            opacity: 0.8,
          }}
        >
          {text}
        </span>

        {/* ======================================================================= */}
        {/* 8. LAYER F: AMBER CHROMATIC FRINGE (Outer warm dispersive edge) */}
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
        {/* 9. LAYER G: CYAN CHROMATIC FRINGE (Inner cool dispersive edge) */}
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
        {/* 10. LAYER H: BLINDING INCANDESCENT CORE & MULTI-STAGE BLOOM */}
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
        {/* 11. LAYER I: RAZOR-SHARP WHITE APEX FILAMENT */}
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
