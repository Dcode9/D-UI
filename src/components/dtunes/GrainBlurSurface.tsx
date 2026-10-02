import React, { useId } from 'react';

/**
 * Optimal default settings settled for D'Tunes Optical UI Grain Blur:
 * - Scatter Amplitude: 55px (controls physical displacement vector)
 * - Grain Density: 0.70 (procedural turbulence base frequency)
 * - Optical Diffusion: 8.5px (optical Gaussian spread)
 * - Contrast & Saturation: Native 100% (preserves natural image contrast and chromatic gamut)
 */
export const GRAIN_BLUR_DEFAULTS = {
  scatter: 55,
  grainDensity: 0.70,
  opticalDiffusion: 8.5,
  octaves: 1,
} as const;

export interface GrainBlurFilterProps {
  /** Filter element ID referenced via CSS `url(#id)` */
  id?: string;
  /** Physical pixel displacement scatter reach (default: 55) */
  scatter?: number;
  /** Stochastic grain base frequency (default: 0.70) */
  grainDensity?: number;
  /** Optical Gaussian diffusion blur spread (default: 8.5) */
  opticalDiffusion?: number;
  /** Turbulence octaves: 1 (fast 60fps GPU) or 2 (dense) (default: 1) */
  octaves?: number;
}

/**
 * Master SVG Filter definition for the D'Tunes Color Mezzotint Grain Blur.
 * Mount this once in your app or inside a surface to generate the GPU filter pipeline.
 * Preserves 100% native image contrast and RGB chromaticity without artificial curve clipping.
 */
export const GrainBlurFilter: React.FC<GrainBlurFilterProps> = ({
  id = 'dtunes-mezzotint-filter',
  scatter = GRAIN_BLUR_DEFAULTS.scatter,
  grainDensity = GRAIN_BLUR_DEFAULTS.grainDensity,
  opticalDiffusion = GRAIN_BLUR_DEFAULTS.opticalDiffusion,
  octaves = GRAIN_BLUR_DEFAULTS.octaves,
}) => {
  return (
    <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
      <defs>
        <filter
          id={id}
          x="-35%"
          y="-35%"
          width="170%"
          height="170%"
          colorInterpolationFilters="sRGB"
        >
          {/* Step 1: Optical diffusion of image colors */}
          <feGaussianBlur
            in="SourceGraphic"
            stdDeviation={opticalDiffusion * 0.55}
            result="diffused"
          />
          {/* Step 2: High-frequency stochastic procedural ink grain */}
          <feTurbulence
            type="fractalNoise"
            baseFrequency={grainDensity * 1.25}
            numOctaves={octaves}
            stitchTiles="stitch"
            result="inkGrain"
          />
          {/* Step 3: Physical displacement of color pixels along grain vectors */}
          {/* Preserves 100% native contrast & RGB chromaticity without artificial curves */}
          <feDisplacementMap
            in="diffused"
            in2="inkGrain"
            scale={scatter * 0.65}
            xChannelSelector="R"
            yChannelSelector="G"
            result="jittered"
          />
        </filter>
      </defs>
    </svg>
  );
};

export interface GrainBlurSurfaceProps {
  /** Visual variant container shape */
  variant?: 'pill' | 'circle' | 'card' | 'panel' | 'fullscreen' | 'raw';
  /** Scatter displacement reach (default: 55) */
  scatter?: number;
  /** Grain density frequency (default: 0.70) */
  grainDensity?: number;
  /** Optical diffusion blur spread (default: 8.5) */
  opticalDiffusion?: number;
  /** Turbulence octaves (default: 1) */
  octaves?: number;
  /** Theme: 'dark' (obsidian) or 'light' (stark paper) */
  theme?: 'dark' | 'light';
  /** Specular border catch highlight */
  bordered?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

/**
 * Tactile glassmorphic surface container with the settled D'Tunes Mezzotint Blur.
 */
export const GrainBlurSurface: React.FC<GrainBlurSurfaceProps> = ({
  variant = 'card',
  scatter = GRAIN_BLUR_DEFAULTS.scatter,
  grainDensity = GRAIN_BLUR_DEFAULTS.grainDensity,
  opticalDiffusion = GRAIN_BLUR_DEFAULTS.opticalDiffusion,
  octaves = GRAIN_BLUR_DEFAULTS.octaves,
  theme = 'dark',
  bordered = true,
  className = '',
  style = {},
  children,
}) => {
  const rawId = useId();
  const filterId = `grain-blur-${rawId.replace(/:/g, '')}`;
  const isLight = theme === 'light';

  const shapeClasses = {
    pill: 'rounded-full px-6 py-3',
    circle: 'rounded-full aspect-square p-4',
    card: 'rounded-[32px] p-6',
    panel: 'rounded-2xl p-4',
    fullscreen: 'rounded-none inset-0 p-8',
    raw: 'rounded-none p-0',
  }[variant];

  return (
    <div
      className={`relative overflow-hidden select-none ${shapeClasses} ${
        bordered
          ? isLight
            ? 'border border-zinc-400/40 shadow-[0_15px_35px_rgba(0,0,0,0.08)]'
            : 'border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.25)]'
          : ''
      } ${className}`}
      style={style}
    >
      {/* 1. Procedural GPU Grain Shader Definition */}
      <GrainBlurFilter
        id={filterId}
        scatter={scatter}
        grainDensity={grainDensity}
        opticalDiffusion={opticalDiffusion}
        octaves={octaves}
      />

      {/* 2. Dither-Grain Backdrop Base */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backdropFilter: `blur(${opticalDiffusion}px)`,
          WebkitBackdropFilter: `blur(${opticalDiffusion}px)`,
          backgroundColor: isLight ? 'rgba(255, 255, 255, 0.45)' : 'rgba(8, 8, 12, 0.65)',
        }}
      />

      {/* 3. Specular Ridge Highlight */}
      {bordered && (
        <div
          className={`absolute inset-0 pointer-events-none rounded-[inherit] ${
            isLight ? 'border-t border-white/80' : 'border-t border-white/30'
          }`}
        />
      )}

      {/* 4. Foreground Content */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
};

export interface GrainBlurLensProps {
  /** Radius of circular lens in pixels (default: 110) */
  radius?: number;
  /** Center X coordinate in percentage (0 to 100) */
  x?: number;
  /** Center Y coordinate in percentage (0 to 100) */
  y?: number;
  /** Scatter reach (default: 55) */
  scatter?: number;
  /** Grain density (default: 0.70) */
  grainDensity?: number;
  /** Optical diffusion (default: 8.5) */
  opticalDiffusion?: number;
  /** Turbulence octaves (default: 1) */
  octaves?: number;
  /** Whether to render minimal hairline rim with cardinal reticles */
  showRim?: boolean;
  className?: string;
  style?: React.CSSProperties;
  /** Children elements that are filtered and masked */
  children: React.ReactNode;
}

/**
 * Optical Lens component that renders children with zero ghosting:
 * Inside the lens circular footprint, 0% of the underlying sharp content is visible;
 * only the disintegrated chromatic mezzotint stipple particles exist.
 */
export const GrainBlurLens: React.FC<GrainBlurLensProps> = ({
  radius = 110,
  x = 50,
  y = 50,
  scatter = GRAIN_BLUR_DEFAULTS.scatter,
  grainDensity = GRAIN_BLUR_DEFAULTS.grainDensity,
  opticalDiffusion = GRAIN_BLUR_DEFAULTS.opticalDiffusion,
  octaves = GRAIN_BLUR_DEFAULTS.octaves,
  showRim = true,
  className = '',
  style = {},
  children,
}) => {
  const rawId = useId();
  const filterId = `lens-filter-${rawId.replace(/:/g, '')}`;

  return (
    <div className={`relative overflow-hidden ${className}`} style={style}>
      {/* 1. Filter Definition */}
      <GrainBlurFilter
        id={filterId}
        scatter={scatter}
        grainDensity={grainDensity}
        opticalDiffusion={opticalDiffusion}
        octaves={octaves}
      />

      {/* 2. Sharp Layer: Inverted masked so 0% shows through inside lens */}
      <div
        className="w-full h-full"
        style={{
          maskImage: `radial-gradient(circle ${radius}px at ${x}% ${y}%, transparent 95%, black 100%)`,
          WebkitMaskImage: `radial-gradient(circle ${radius}px at ${x}% ${y}%, transparent 95%, black 100%)`,
        }}
      >
        {children}
      </div>

      {/* 3. Filtered Grain Layer: Clipped strictly inside lens */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          filter: `url(#${filterId})`,
          clipPath: `circle(${radius}px at ${x}% ${y}%)`,
          WebkitClipPath: `circle(${radius}px at ${x}% ${y}%)`,
          transform: 'translateZ(0)',
          willChange: 'filter',
        }}
      >
        {children}
      </div>

      {/* 4. Minimalist Reticle Rim */}
      {showRim && (
        <div
          className="absolute pointer-events-none rounded-full flex items-center justify-center"
          style={{
            width: `${radius * 2}px`,
            height: `${radius * 2}px`,
            left: `${x}%`,
            top: `${y}%`,
            transform: 'translate(-50%, -50%)',
            boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.4), 0 20px 50px rgba(0,0,0,0.5)',
          }}
        >
          <div className="absolute top-0 w-3 h-[1px] bg-white/70" />
          <div className="absolute bottom-0 w-3 h-[1px] bg-white/70" />
          <div className="absolute left-0 h-3 w-[1px] bg-white/70" />
          <div className="absolute right-0 h-3 w-[1px] bg-white/70" />
        </div>
      )}
    </div>
  );
};
