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
  
  // Default light position: 18% for L2R, 82% for R2L
  const p = lightPosition !== undefined ? lightPosition : isL2R ? 18 : 82;

  // Normalized stops (0 to 1) for SVG linearGradient
  const peakPos = Math.max(0, Math.min(1, p / 100));
  const brightOffset = isL2R ? 0.12 : -0.12;
  const midOffset = isL2R ? 0.32 : -0.32;
  const darkOffset = isL2R ? 0.60 : -0.60;

  const brightPos = Math.max(0, Math.min(1, peakPos + brightOffset));
  const midPos = Math.max(0, Math.min(1, peakPos + midOffset));
  const darkPos = Math.max(0, Math.min(1, peakPos + darkOffset));

  // Dispersion shifts in SVG coordinate space
  const amberDx = isL2R ? -5 * chromaticIntensity : 5 * chromaticIntensity;
  const cyanDx = isL2R ? 3.5 * chromaticIntensity : -3.5 * chromaticIntensity;

  // SVG unique IDs to prevent DOM collision
  const uid = 'wwdc_opt';

  return (
    <div className="relative flex items-center justify-center select-none w-full max-w-6xl px-4 py-8">
      {/* ========================================================================= */}
      {/* 1. ATMOSPHERIC VOLUMETRIC DIFFUSION HALO (Radial Glow behind glyphs)     */}
      {/* ========================================================================= */}
      <div
        className="absolute pointer-events-none rounded-full transition-all duration-150 ease-out"
        style={{
          left: `${p}%`,
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'clamp(300px, 40vw, 680px)',
          height: 'clamp(200px, 26vw, 460px)',
          background: `radial-gradient(ellipse at center, rgba(255, 255, 255, ${0.45 * bloomStrength}) 0%, rgba(255, 235, 205, ${0.32 * bloomStrength}) 22%, rgba(255, 165, 45, ${0.16 * bloomStrength}) 45%, rgba(90, 180, 255, ${0.08 * chromaticIntensity}) 65%, transparent 80%)`,
          filter: `blur(${36 * bloomStrength}px)`,
          opacity: 0.95,
          zIndex: 0,
        }}
      />

      {/* ========================================================================= */}
      {/* 2. PURE VECTOR SVG OPTICAL TYPOGRAPHY (Zero Bounding Box Artifacts!)      */}
      {/* ========================================================================= */}
      <svg
        viewBox="0 0 1200 400"
        className="w-full h-auto overflow-visible relative z-10"
        style={{ filter: 'drop-shadow(0 25px 50px rgba(0, 0, 0, 0.95))' }}
      >
        <defs>
          {/* Main Directional Surface Illumination (Blinding White -> Satin Platinum -> Smoked Titanium) */}
          <linearGradient id={`${uid}_surfaceGrad`} x1={isL2R ? '0%' : '100%'} y1="0%" x2={isL2R ? '100%' : '0%'} y2="0%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset={`${Math.min(100, Math.max(0, peakPos * 100))}%`} stopColor="#ffffff" stopOpacity="1" />
            <stop offset={`${Math.min(100, Math.max(0, brightPos * 100))}%`} stopColor="#e2e6f2" stopOpacity="0.95" />
            <stop offset={`${Math.min(100, Math.max(0, midPos * 100))}%`} stopColor="#555866" stopOpacity="0.75" />
            <stop offset={`${Math.min(100, Math.max(0, darkPos * 100))}%`} stopColor="#1e1f26" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#101014" stopOpacity="0" />
          </linearGradient>

          {/* Base Dark Smoked Obsidian Body Gradient */}
          <linearGradient id={`${uid}_baseBodyGrad`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#24252c" stopOpacity="0.95" />
            <stop offset="45%" stopColor="#141418" stopOpacity="0.98" />
            <stop offset="100%" stopColor="#08080a" stopOpacity="1" />
          </linearGradient>

          {/* Machined Specular Bevel Border Stroke Gradient (Outlines W, W, D with silver/titanium edge) */}
          <linearGradient id={`${uid}_bevelStrokeGrad`} x1={isL2R ? '0%' : '100%'} y1="0%" x2={isL2R ? '100%' : '0%'} y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity={`${0.95 * specularEdgeIntensity}`} />
            <stop offset={`${Math.min(100, Math.max(0, peakPos * 100))}%`} stopColor="#ffffff" stopOpacity={`${0.85 * specularEdgeIntensity}`} />
            <stop offset={`${Math.min(100, Math.max(0, brightPos * 100))}%`} stopColor="#d0d5e8" stopOpacity={`${0.65 * specularEdgeIntensity}`} />
            <stop offset={`${Math.min(100, Math.max(0, midPos * 100))}%`} stopColor="#7a8094" stopOpacity={`${0.45 * specularEdgeIntensity}`} />
            <stop offset={`${Math.min(100, Math.max(0, darkPos * 100))}%`} stopColor="#484c5a" stopOpacity={`${0.32 * specularEdgeIntensity}`} />
            <stop offset="100%" stopColor="#323440" stopOpacity={`${0.25 * specularEdgeIntensity}`} />
          </linearGradient>

          {/* Top-Apex Specular Glint Stroke (Overhead Chamfer Reflection) */}
          <linearGradient id={`${uid}_topGlintGrad`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity={`${0.5 * specularEdgeIntensity}`} />
            <stop offset="30%" stopColor="#b0b8d0" stopOpacity={`${0.2 * specularEdgeIntensity}`} />
            <stop offset="65%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>

          {/* Prismatic Warm Amber Dispersion Gradient */}
          <linearGradient id={`${uid}_amberGrad`} x1={isL2R ? '0%' : '100%'} y1="0%" x2={isL2R ? '100%' : '0%'} y2="0%">
            <stop offset="0%" stopColor="#ff9a24" stopOpacity="0.95" />
            <stop offset={`${Math.min(100, Math.max(0, peakPos * 100))}%`} stopColor="#ffbf48" stopOpacity="0.9" />
            <stop offset={`${Math.min(100, Math.max(0, brightPos * 100))}%`} stopColor="#ff9020" stopOpacity="0.3" />
            <stop offset={`${Math.min(100, Math.max(0, midPos * 100))}%`} stopColor="#ff8010" stopOpacity="0" />
            <stop offset="100%" stopColor="#ff8010" stopOpacity="0" />
          </linearGradient>

          {/* Prismatic Cool Sky-Cyan Dispersion Gradient */}
          <linearGradient id={`${uid}_cyanGrad`} x1={isL2R ? '0%' : '100%'} y1="0%" x2={isL2R ? '100%' : '0%'} y2="0%">
            <stop offset="0%" stopColor="#48a8ff" stopOpacity="0" />
            <stop offset={`${Math.min(100, Math.max(0, peakPos * 100))}%`} stopColor="#68b8ff" stopOpacity="0.35" />
            <stop offset={`${Math.min(100, Math.max(0, brightPos * 100))}%`} stopColor="#3898ff" stopOpacity="0.8" />
            <stop offset={`${Math.min(100, Math.max(0, midPos * 100))}%`} stopColor="#2080ff" stopOpacity="0" />
            <stop offset="100%" stopColor="#2080ff" stopOpacity="0" />
          </linearGradient>

          {/* SVG Gaussian Bloom Filters */}
          <filter id={`${uid}_amberGlow`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={3.5 * chromaticIntensity} result="blur" />
            <feColorMatrix type="matrix" values="1 0 0 0 1   0 0.6 0 0 0.6   0 0.1 0 0 0.1  0 0 0 1.2 0" />
          </filter>

          <filter id={`${uid}_cyanGlow`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={3.0 * chromaticIntensity} result="blur" />
            <feColorMatrix type="matrix" values="0.2 0 0 0 0.2   0.6 0 0 0 0.6   1 0 0 0 1  0 0 0 1.1 0" />
          </filter>

          <filter id={`${uid}_coreBloom`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation={4 * bloomStrength} result="blur1" />
            <feGaussianBlur in="SourceGraphic" stdDeviation={14 * bloomStrength} result="blur2" />
            <feGaussianBlur in="SourceGraphic" stdDeviation={32 * bloomStrength} result="blur3" />
            <feMerge>
              <feMergeNode in="blur3" />
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Global Text Style Group */}
        <g
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily="'Plus Jakarta Sans', sans-serif"
          fontWeight="900"
          fontSize="240"
          letterSpacing="-0.04em"
        >
          {/* =================================================================== */}
          {/* LAYER 1: BASE SOLID SMOKED OBSIDIAN BODY WITH 1PX SPECULAR BORDER   */}
          {/* Provides solid, dark metallic body and machined 1px edge bevel      */}
          {/* =================================================================== */}
          <text
            x="600"
            y="200"
            fill={`url(#${uid}_baseBodyGrad)`}
            stroke={`url(#${uid}_bevelStrokeGrad)`}
            strokeWidth="1.8"
            paintOrder="stroke fill"
          >
            {text}
          </text>

          {/* =================================================================== */}
          {/* LAYER 2: TOP-APEX SPECULAR GLINT STROKE                             */}
          {/* Overhead light catching the top bevel border                        */}
          {/* =================================================================== */}
          <text
            x="600"
            y="200"
            fill="none"
            stroke={`url(#${uid}_topGlintGrad)`}
            strokeWidth="1.2"
            opacity="0.85"
          >
            {text}
          </text>

          {/* =================================================================== */}
          {/* LAYER 3: DIRECTIONAL SURFACE ILLUMINATION (Satin to Platinum White) */}
          {/* =================================================================== */}
          <text
            x="600"
            y="200"
            fill={`url(#${uid}_surfaceGrad)`}
            style={{ mixBlendMode: 'screen' }}
          >
            {text}
          </text>

          {/* =================================================================== */}
          {/* LAYER 4: PRISMATIC WARM AMBER FRINGE (Outer Glowing Edge Rim)       */}
          {/* =================================================================== */}
          <text
            x={600 + amberDx}
            y="200"
            fill={`url(#${uid}_amberGrad)`}
            filter={`url(#${uid}_amberGlow)`}
            style={{ mixBlendMode: 'screen' }}
            opacity={0.92}
          >
            {text}
          </text>

          {/* =================================================================== */}
          {/* LAYER 5: PRISMATIC COOL SKY-CYAN FRINGE (Inner Edge Dispersion)     */}
          {/* =================================================================== */}
          <text
            x={600 + cyanDx}
            y="200"
            fill={`url(#${uid}_cyanGrad)`}
            filter={`url(#${uid}_cyanGlow)`}
            style={{ mixBlendMode: 'screen' }}
            opacity={0.88}
          >
            {text}
          </text>

          {/* =================================================================== */}
          {/* LAYER 6: BLINDING INCANDESCENT WHITE CORE & VOLUMETRIC BLOOM        */}
          {/* =================================================================== */}
          <text
            x="600"
            y="200"
            fill={`url(#${uid}_surfaceGrad)`}
            filter={`url(#${uid}_coreBloom)`}
            style={{ mixBlendMode: 'screen' }}
            opacity={1.0}
          >
            {text}
          </text>

          {/* =================================================================== */}
          {/* LAYER 7: RAZOR APEX FILAMENT (Machined Specular White Glint)        */}
          {/* =================================================================== */}
          <text
            x="600"
            y="200"
            fill="none"
            stroke="#ffffff"
            strokeWidth="0.8"
            opacity="0.75"
            style={{ mixBlendMode: 'screen' }}
          >
            {text}
          </text>
        </g>
      </svg>
    </div>
  );
};
