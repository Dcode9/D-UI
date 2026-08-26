import React from 'react';

export type FlowDirection = 'left-to-right' | 'right-to-left';

export interface WwdcTextEffectProps {
  text?: string;
  direction?: FlowDirection;
  lightPosition?: number;
  bloomStrength?: number;
  chromaticIntensity?: number;
  specularEdgeIntensity?: number;
  oppositeGlowStrength?: number;
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

  // Normalized coordinate (0 to 1) for SVG linearGradient
  const peakPos = Math.max(0, Math.min(1, p / 100));
  const brightOffset = isL2R ? 0.12 : -0.12;
  const midOffset = isL2R ? 0.30 : -0.30;
  const darkOffset = isL2R ? 0.58 : -0.58;

  const brightPos = Math.max(0, Math.min(1, peakPos + brightOffset));
  const midPos = Math.max(0, Math.min(1, peakPos + midOffset));
  const darkPos = Math.max(0, Math.min(1, peakPos + darkOffset));

  // Chromatic dispersion offsets in SVG coordinate units
  const amberDx = isL2R ? -4.5 * chromaticIntensity : 4.5 * chromaticIntensity;
  const cyanDx = isL2R ? 3.0 * chromaticIntensity : -3.0 * chromaticIntensity;

  // Unique ID prefix
  const uid = 'wwdc_3d_opt';

  return (
    <div className="relative flex items-center justify-center select-none w-full max-w-6xl px-4 py-8">
      
      {/* ========================================================================= */}
      {/* 1. ATMOSPHERIC VOLUMETRIC BLOOM (Centered at the Incandescent Light Core) */}
      {/* ========================================================================= */}
      {/* Outer Golden Amber Halo */}
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
      {/* Pure White Core Bloom */}
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
      {/* Electric Sky-Cyan Inner Halo */}
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
      {/* 2. PURE VECTOR SVG 3D LIQUID GLASS & SPECULAR BEVEL ENGINE                */}
      {/* Zero bounding-box glitches, ZERO overlapping wireframe lines!            */}
      {/* ========================================================================= */}
      <svg
        viewBox="0 0 1200 400"
        className="w-full h-auto overflow-visible relative z-10"
      >
        <defs>
          {/* Base Solid Smoked Titanium / Liquid-Glass Body Fill */}
          <linearGradient id={`${uid}_baseFaceGrad`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2c2d36" />
            <stop offset="35%" stopColor="#1a1a20" />
            <stop offset="70%" stopColor="#0e0f13" />
            <stop offset="100%" stopColor="#050507" />
          </linearGradient>

          {/* Directional Surface Illumination (Blinding White -> Satin Platinum -> Smoked Gray) */}
          <linearGradient id={`${uid}_surfaceIllumGrad`} x1={isL2R ? '0%' : '100%'} y1="0%" x2={isL2R ? '100%' : '0%'} y2="0%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset={`${Math.min(100, Math.max(0, peakPos * 100))}%`} stopColor="#ffffff" stopOpacity="1" />
            <stop offset={`${Math.min(100, Math.max(0, brightPos * 100))}%`} stopColor="#e0e4f0" stopOpacity="0.95" />
            <stop offset={`${Math.min(100, Math.max(0, midPos * 100))}%`} stopColor="#555866" stopOpacity="0.75" />
            <stop offset={`${Math.min(100, Math.max(0, darkPos * 100))}%`} stopColor="#1e1f26" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#08080a" stopOpacity="0" />
          </linearGradient>

          {/* 3D Specular Bevel Border Stroke (Outlines the entire perimeter with a crisp 3D rim) */}
          <linearGradient id={`${uid}_rimSpecularStroke`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#8a90a4" stopOpacity={`${0.75 * specularEdgeIntensity}`} />
            <stop offset="30%" stopColor="#585c6c" stopOpacity={`${0.5 * specularEdgeIntensity}`} />
            <stop offset="70%" stopColor="#2e303a" stopOpacity={`${0.3 * specularEdgeIntensity}`} />
            <stop offset="100%" stopColor="#14151a" stopOpacity={`${0.15 * specularEdgeIntensity}`} />
          </linearGradient>

          {/* Glowing Side Specular Rim (Illuminated edge glint) */}
          <linearGradient id={`${uid}_illuminatedRimStroke`} x1={isL2R ? '0%' : '100%'} y1="0%" x2={isL2R ? '100%' : '0%'} y2="0%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset={`${Math.min(100, Math.max(0, peakPos * 100))}%`} stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset={`${Math.min(100, Math.max(0, brightPos * 100))}%`} stopColor="#d2d7ea" stopOpacity="0.7" />
            <stop offset={`${Math.min(100, Math.max(0, midPos * 100))}%`} stopColor="#70768a" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#30323a" stopOpacity="0" />
          </linearGradient>

          {/* Prismatic Warm Amber Dispersion Gradient */}
          <linearGradient id={`${uid}_amberGrad`} x1={isL2R ? '0%' : '100%'} y1="0%" x2={isL2R ? '100%' : '0%'} y2="0%">
            <stop offset="0%" stopColor="#ff9a24" stopOpacity="0.95" />
            <stop offset={`${Math.min(100, Math.max(0, peakPos * 100))}%`} stopColor="#ffbf48" stopOpacity="0.9" />
            <stop offset={`${Math.min(100, Math.max(0, brightPos * 100))}%`} stopColor="#ff9020" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#ff8010" stopOpacity="0" />
          </linearGradient>

          {/* Prismatic Cool Sky-Cyan Dispersion Gradient */}
          <linearGradient id={`${uid}_cyanGrad`} x1={isL2R ? '0%' : '100%'} y1="0%" x2={isL2R ? '100%' : '0%'} y2="0%">
            <stop offset="0%" stopColor="#48a8ff" stopOpacity="0" />
            <stop offset={`${Math.min(100, Math.max(0, peakPos * 100))}%`} stopColor="#68b8ff" stopOpacity="0.35" />
            <stop offset={`${Math.min(100, Math.max(0, brightPos * 100))}%`} stopColor="#3898ff" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#2080ff" stopOpacity="0" />
          </linearGradient>

          {/* SVG Gaussian Bloom Filters */}
          <filter id={`${uid}_amberGlow`} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation={3.5 * chromaticIntensity} result="blur" />
            <feColorMatrix type="matrix" values="1 0 0 0 1   0 0.6 0 0 0.6   0 0.1 0 0 0.1  0 0 0 1.2 0" />
          </filter>

          <filter id={`${uid}_cyanGlow`} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation={3.0 * chromaticIntensity} result="blur" />
            <feColorMatrix type="matrix" values="0.2 0 0 0 0.2   0.6 0 0 0 0.6   1 0 0 0 1  0 0 0 1.1 0" />
          </filter>

          <filter id={`${uid}_coreBloom`} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur in="SourceGraphic" stdDeviation={4 * bloomStrength} result="blur1" />
            <feGaussianBlur in="SourceGraphic" stdDeviation={14 * bloomStrength} result="blur2" />
            <feGaussianBlur in="SourceGraphic" stdDeviation={30 * bloomStrength} result="blur3" />
            <feMerge>
              <feMergeNode in="blur3" />
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* 3D Depth Shadow Filter for physical realism */}
          <filter id={`${uid}_depthShadow`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="16" stdDeviation="20" floodColor="#000000" floodOpacity="0.95" />
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.8" />
          </filter>
        </defs>

        {/* Global Text Style Group */}
        <g
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily="'Plus Jakarta Sans', -apple-system, sans-serif"
          fontWeight="900"
          fontSize="240"
          letterSpacing="-0.04em"
        >
          {/* =================================================================== */}
          {/* LAYER 1: BASE 3D SOLID SMOKED GRAPHITE FACE + 3D BEVEL RIM STROKE   */}
          {/* Uses paint-order="stroke fill" so the solid face covers the inside  */}
          {/* of the stroke, leaving ONLY the clean outer 1.5px bevel edge!       */}
          {/* =================================================================== */}
          <text
            x="600"
            y="200"
            fill={`url(#${uid}_baseFaceGrad)`}
            stroke={`url(#${uid}_rimSpecularStroke)`}
            strokeWidth="3.0"
            paintOrder="stroke fill"
            filter={`url(#${uid}_depthShadow)`}
          >
            {text}
          </text>

          {/* =================================================================== */}
          {/* LAYER 2: ILLUMINATED SPECULAR RIM HIGHLIGHT STROKE                  */}
          {/* Boosts the outer bevel brightness on the illuminated side           */}
          {/* =================================================================== */}
          <text
            x="600"
            y="200"
            fill="none"
            stroke={`url(#${uid}_illuminatedRimStroke)`}
            strokeWidth="2.2"
            paintOrder="stroke fill"
            style={{ mixBlendMode: 'screen' }}
          >
            {text}
          </text>

          {/* =================================================================== */}
          {/* LAYER 3: DIRECTIONAL SURFACE ILLUMINATION (Satin to Platinum White) */}
          {/* =================================================================== */}
          <text
            x="600"
            y="200"
            fill={`url(#${uid}_surfaceIllumGrad)`}
            style={{ mixBlendMode: 'screen' }}
          >
            {text}
          </text>

          {/* =================================================================== */}
          {/* LAYER 4: PRISMATIC WARM AMBER FRINGE (Outer Dispersive Glowing Rim) */}
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
            opacity={0.86}
          >
            {text}
          </text>

          {/* =================================================================== */}
          {/* LAYER 6: BLINDING INCANDESCENT WHITE CORE & MULTI-STAGE BLOOM       */}
          {/* =================================================================== */}
          <text
            x="600"
            y="200"
            fill={`url(#${uid}_surfaceIllumGrad)`}
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
            opacity="0.8"
            style={{ mixBlendMode: 'screen' }}
          >
            {text}
          </text>
        </g>
      </svg>
    </div>
  );
};
