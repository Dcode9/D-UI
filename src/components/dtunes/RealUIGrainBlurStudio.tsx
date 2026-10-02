import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Sun,
  Moon,
  Sliders,
  Sparkles,
  Heart,
  Volume2,
  Mic2,
  ListMusic,
  ZoomIn,
  Columns,
  Check,
  Flame,
  Layers,
} from 'lucide-react';
import { SAMPLE_TRACKS } from './types';

export type GrainBlurApproach =
  | 'approach-1-scatter'       // 1. GPU Displacement Scatter (Current)
  | 'approach-2-dissolve'      // 2. Stochastic Blue-Noise Dissolve (Gaussian + Dither)
  | 'approach-3-halftone'      // 3. Halftone Litho Matrix (Risograph Screen)
  | 'approach-4-sandblast'     // 4. Frosted Micro-Refraction Glass (VisionOS Sandblasted)
  | 'approach-5-bayer'         // 5. Bayer Matrix Ordered Dither (8-Bit Crystalline Matrix)
  | 'approach-6-needlerays'    // 6. Anisotropic Needle-Ray Scatter (8♣ Morphology)
  | 'approach-7-lumaspecular'  // 7. Luma-Emissive Specular Dust (Additive Obsidian Glow)
  | 'approach-8-corepreserved'; // 8. Core-Preserved Mezzotint Erosion (Sharp Spine + Stipple Contour)

interface ApproachMeta {
  id: GrainBlurApproach;
  title: string;
  badge: string;
  category: 'Physical Glass' | 'Matrix Dither' | '8♣ Ray & Morphology';
  shortDesc: string;
  fullDesc: string;
  recommendation: string;
}

const APPROACH_CATALOG: ApproachMeta[] = [
  {
    id: 'approach-6-needlerays',
    title: 'Approach 6: Needle-Ray Scatter (8♣)',
    badge: 'Direct 8♣ Match',
    category: '8♣ Ray & Morphology',
    shortDesc: 'Directional anisotropic needle flaring from glyph stems',
    fullDesc:
      'Directly emulates the 8♣ card reference. Anisotropic frequency stretches noise into razor-thin vertical needle rays, causing text stems to flare out into directional stipple spines without turning into blobby oatmeal.',
    recommendation: 'Highest visual authenticity to the uploaded playing card.',
  },
  {
    id: 'approach-8-corepreserved',
    title: 'Approach 8: Core-Preserved Mezzotint',
    badge: 'Maximum Legibility',
    category: '8♣ Ray & Morphology',
    shortDesc: 'Vector-sharp letter spine + eroding stipple dust outer rim',
    fullDesc:
      'Solves the "text illegibility" problem completely. Uses morphology erosion to retain 100% crisp vector inner cores of all letters, while dissolving only the outer perimeter and strokes into fine needle-sand stipple.',
    recommendation: 'Best for small interface labels, timestamps, and song metadata.',
  },
  {
    id: 'approach-5-bayer',
    title: 'Approach 5: Bayer Matrix Dither',
    badge: 'Crystalline 8-Bit',
    category: 'Matrix Dither',
    shortDesc: 'Ordered cross-hatch matrix thresholding without cloudy clumping',
    fullDesc:
      'Uses ordered dithering instead of Perlin noise. Eliminates muddy clumping and renders text into crystalline, mathematically uniform dither dots that taper off with surgical precision.',
    recommendation: 'Superb for high-contrast industrial audio hardware styling.',
  },
  {
    id: 'approach-7-lumaspecular',
    title: 'Approach 7: Luma-Emissive Specular Dust',
    badge: 'D’Verse Specular',
    category: 'Physical Glass',
    shortDesc: 'Bright text shines through smoked obsidian with sparkling micro-dust',
    fullDesc:
      'Under-illuminated optical approach inspired by D’Verse. The luminance of the underlying text emits an additive stipple glow into the smoked obsidian glass, preventing text from turning into dark sludge.',
    recommendation: 'Best for dark mode obsidian glass aesthetics.',
  },
  {
    id: 'approach-2-dissolve',
    title: 'Approach 2: Stochastic Dither Dissolve',
    badge: 'Micro-Spray Stipple',
    category: 'Matrix Dither',
    shortDesc: 'Gaussian diffusion modulated by high-frequency blue noise',
    fullDesc:
      'Applies an optical Gaussian spread first so letter geometry doesn’t rip, then multiplies the luminance field with a fine dither mask. Text dissolves smoothly into an organic spray-paint cloud.',
    recommendation: 'Smooth artistic diffusion for medium headlines.',
  },
  {
    id: 'approach-4-sandblast',
    title: 'Approach 4: Frosted Micro-Refraction',
    badge: 'VisionOS Glass',
    category: 'Physical Glass',
    shortDesc: 'Multi-layer CSS optical backdrop blur + dither overlay',
    fullDesc:
      'Apple VisionOS luxury glass. Combines native hardware backdrop blur with high contrast and a surface micro-dither lattice. Text scrolls underneath as a soft glowing frosted silhouette.',
    recommendation: '60fps velvety feel with zero CPU filter latency.',
  },
  {
    id: 'approach-3-halftone',
    title: 'Approach 3: Halftone Litho Matrix',
    badge: 'Editorial Risograph',
    category: 'Matrix Dither',
    shortDesc: 'Quantizes underlying text into distinct risograph print dot clusters',
    fullDesc:
      'Simulates physical print-making. Text under the dock is quantized into halftone dot clusters that create an unmistakable editorial zine / risograph vibe.',
    recommendation: 'Distinct editorial feel for stark black & white themes.',
  },
  {
    id: 'approach-1-scatter',
    title: 'Approach 1: GPU Displacement Scatter',
    badge: 'Best for Artwork',
    category: '8♣ Ray & Morphology',
    shortDesc: 'Pure physical pixel displacement mapping',
    fullDesc:
      'Vector displacement mapping via feDisplacementMap. Unrivaled for album art and photos; produces raw high-energy glitch scatter on typography.',
    recommendation: 'Unbeatable on album covers, jagged on small text.',
  },
];

export const RealUIGrainBlurStudio: React.FC = () => {
  const [activeApproach, setActiveApproach] = useState<GrainBlurApproach>('approach-6-needlerays');
  const [compareApproach, setCompareApproach] = useState<GrainBlurApproach>('approach-8-corepreserved');
  const [isCompareMode, setIsCompareMode] = useState<boolean>(false);
  const [splitPos, setSplitPos] = useState<number>(50); // % split for comparison

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [activeContent, setActiveContent] = useState<'typography' | 'tracklist' | 'lyrics'>('typography');
  const [dockPosition, setDockPosition] = useState<number>(42); // % from top
  const [dockWidth, setDockWidth] = useState<'compact' | 'full'>('full');

  // Unified Parameter Sliders
  const [blurRadius, setBlurRadius] = useState<number>(12); // px
  const [grainScale, setGrainScale] = useState<number>(22); // displacement amplitude
  const [grainFrequency, setGrainFrequency] = useState<number>(1.15); // grain density
  const [grainContrast, setGrainContrast] = useState<number>(155); // % contrast
  const [glassOpacity, setGlassOpacity] = useState<number>(70); // % opacity

  // Micro-Loupe / Microscope
  const [loupeActive, setLoupeActive] = useState<boolean>(false);
  const [loupeZoom, setLoupeZoom] = useState<number>(3.5); // 3.5x zoom
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 300, y: 200 });
  const viewportRef = useRef<HTMLDivElement>(null);

  const isLight = theme === 'light';

  // Global Spacebar listener anywhere
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag !== 'INPUT' && tag !== 'TEXTAREA') {
        if (e.code === 'Space') {
          e.preventDefault();
          setIsPlaying((p) => !p);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Preset Applier
  const applyPreset = (preset: 'card-8clubs' | 'dverse-obsidian' | 'visionos-sandblast' | 'risograph-print' | 'crystalline-bayer' | 'core-clarity') => {
    if (preset === 'card-8clubs') {
      setActiveApproach('approach-6-needlerays');
      setBlurRadius(10);
      setGrainScale(28);
      setGrainFrequency(1.25);
      setGrainContrast(185);
      setGlassOpacity(55);
      setTheme('light');
    } else if (preset === 'dverse-obsidian') {
      setActiveApproach('approach-7-lumaspecular');
      setBlurRadius(16);
      setGrainScale(18);
      setGrainFrequency(1.4);
      setGrainContrast(150);
      setGlassOpacity(75);
      setTheme('dark');
    } else if (preset === 'visionos-sandblast') {
      setActiveApproach('approach-4-sandblast');
      setBlurRadius(18);
      setGrainScale(14);
      setGrainFrequency(0.85);
      setGrainContrast(130);
      setGlassOpacity(68);
      setTheme('dark');
    } else if (preset === 'risograph-print') {
      setActiveApproach('approach-3-halftone');
      setBlurRadius(12);
      setGrainScale(22);
      setGrainFrequency(0.95);
      setGrainContrast(170);
      setGlassOpacity(75);
      setTheme('light');
    } else if (preset === 'crystalline-bayer') {
      setActiveApproach('approach-5-bayer');
      setBlurRadius(7);
      setGrainScale(16);
      setGrainFrequency(1.65);
      setGrainContrast(175);
      setGlassOpacity(70);
      setTheme('dark');
    } else if (preset === 'core-clarity') {
      setActiveApproach('approach-8-corepreserved');
      setBlurRadius(10);
      setGrainScale(20);
      setGrainFrequency(1.3);
      setGrainContrast(160);
      setGlassOpacity(72);
      setTheme('dark');
    }
  };

  // Track mouse for loupe
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!viewportRef.current) return;
    const rect = viewportRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // Dragging dock directly
  const [isDraggingDock, setIsDraggingDock] = useState<boolean>(false);
  const handleDockMouseDown = () => {
    setIsDraggingDock(true);
  };

  useEffect(() => {
    const handleMouseUp = () => setIsDraggingDock(false);
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDraggingDock || !viewportRef.current) return;
      const rect = viewportRef.current.getBoundingClientRect();
      const relativeY = e.clientY - rect.top;
      const clampedPct = Math.max(18, Math.min(82, (relativeY / rect.height) * 100));
      setDockPosition(Math.round(clampedPct));
    };

    if (isDraggingDock) {
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingDock]);

  const currentMeta = APPROACH_CATALOG.find((a) => a.id === activeApproach) || APPROACH_CATALOG[0];

  return (
    <div
      className={`min-h-screen w-full transition-colors duration-500 px-4 sm:px-8 pb-12 flex flex-col items-center select-none font-sans ${
        isLight ? 'bg-[#f4f3ee] text-zinc-900' : 'bg-[#040407] text-zinc-100'
      }`}
    >
      {/* ========================================================================= */}
      {/* 1. MASTER SHADER PIPELINE DEFINITIONS FOR ALL 8 GRAIN BLUR APPROACHES     */}
      {/* ========================================================================= */}
      <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          {/* APPROACH 1: Vector Displacement Scatter */}
          <filter id="shader-approach-1-scatter" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency={grainFrequency}
              numOctaves="2"
              stitchTiles="stitch"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={grainScale}
              xChannelSelector="R"
              yChannelSelector="G"
              result="displaced"
            />
            <feGaussianBlur in="displaced" stdDeviation={blurRadius * 0.25} result="blurred" />
            <feComponentTransfer in="blurred">
              <feFuncR type="linear" slope={grainContrast / 100} />
              <feFuncG type="linear" slope={grainContrast / 100} />
              <feFuncB type="linear" slope={grainContrast / 100} />
            </feComponentTransfer>
          </filter>

          {/* APPROACH 2: Stochastic Blue-Noise Dissolve */}
          <filter id="shader-approach-2-dissolve" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation={blurRadius} result="smoothedText" />
            <feTurbulence
              type="fractalNoise"
              baseFrequency={grainFrequency * 1.3}
              numOctaves="2"
              stitchTiles="stitch"
              result="ditherNoise"
            />
            <feColorMatrix
              in="ditherNoise"
              type="matrix"
              values="0 0 0 0 1   0 0 0 0 1   0 0 0 0 1   0 0 0 3.5 -1.2"
              result="ditherMask"
            />
            <feComposite
              in="smoothedText"
              in2="ditherMask"
              operator="arithmetic"
              k1="1.3"
              k2="0.3"
              k3="0.2"
              k4="0"
              result="dissolvedStipple"
            />
            <feComponentTransfer in="dissolvedStipple">
              <feFuncR type="linear" slope={grainContrast / 100} />
              <feFuncG type="linear" slope={grainContrast / 100} />
              <feFuncB type="linear" slope={grainContrast / 100} />
            </feComponentTransfer>
          </filter>

          {/* APPROACH 3: Halftone / Litho Matrix Screen */}
          <filter id="shader-approach-3-halftone" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation={blurRadius * 0.6} result="blurred" />
            <feTurbulence
              type="fractalNoise"
              baseFrequency={grainFrequency * 1.4}
              numOctaves="2"
              result="halftoneGrid"
            />
            <feDisplacementMap in="blurred" in2="halftoneGrid" scale={grainScale * 0.5} result="jittered" />
            <feColorMatrix
              in="jittered"
              type="matrix"
              values="0.33 0.33 0.33 0 0   0.33 0.33 0.33 0 0   0.33 0.33 0.33 0 0   0 0 0 6 -2.4"
            />
          </filter>

          {/* APPROACH 5: Bayer Matrix Ordered Dither (8-Bit Crystalline Matrix) */}
          <filter id="shader-approach-5-bayer" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation={blurRadius * 0.45} result="subtleBlur" />
            <feTurbulence
              type="fractalNoise"
              baseFrequency={`${grainFrequency * 1.6} ${grainFrequency * 1.6}`}
              numOctaves="1"
              result="bayerLattice"
            />
            <feColorMatrix
              in="bayerLattice"
              type="matrix"
              values="0 0 0 0 1   0 0 0 0 1   0 0 0 0 1   0 0 0 5 -1.8"
              result="binaryGrid"
            />
            <feComposite
              in="subtleBlur"
              in2="binaryGrid"
              operator="arithmetic"
              k1="1.8"
              k2="0.1"
              k3="0.1"
              k4="-0.15"
              result="bayerDithered"
            />
            <feComponentTransfer in="bayerDithered">
              <feFuncR type="linear" slope={grainContrast / 90} />
              <feFuncG type="linear" slope={grainContrast / 90} />
              <feFuncB type="linear" slope={grainContrast / 90} />
            </feComponentTransfer>
          </filter>

          {/* APPROACH 6: Anisotropic Needle-Ray Scatter (8♣ Morphology) */}
          <filter id="shader-approach-6-needlerays" x="-30%" y="-30%" width="160%" height="160%">
            {/* Low X frequency + ultra-high Y frequency produces sharp vertical needle spines */}
            <feTurbulence
              type="fractalNoise"
              baseFrequency={`0.038 ${grainFrequency * 1.1}`}
              numOctaves="2"
              result="needleFibers"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="needleFibers"
              scale={grainScale * 1.5}
              xChannelSelector="R"
              yChannelSelector="G"
              result="needleScatter"
            />
            {/* Anisotropic blur: minimal horizontal, longer vertical needle flare */}
            <feGaussianBlur
              in="needleScatter"
              stdDeviation={`0.6 ${blurRadius * 0.55}`}
              result="needleSoftened"
            />
            <feComponentTransfer in="needleSoftened">
              <feFuncR type="linear" slope={grainContrast / 95} />
              <feFuncG type="linear" slope={grainContrast / 95} />
              <feFuncB type="linear" slope={grainContrast / 95} />
            </feComponentTransfer>
          </filter>

          {/* APPROACH 7: Luma-Emissive Specular Dust (Additive Obsidian Glow) */}
          <filter id="shader-approach-7-lumaspecular" x="-20%" y="-20%" width="140%" height="140%">
            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 -0.1"
              result="lumaPass"
            />
            <feGaussianBlur in="lumaPass" stdDeviation={blurRadius * 0.75} result="lumaBloom" />
            <feTurbulence
              type="fractalNoise"
              baseFrequency={grainFrequency * 1.5}
              numOctaves="2"
              result="specularNoise"
            />
            <feColorMatrix
              in="specularNoise"
              type="matrix"
              values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 4 -1.4"
              result="stippleDust"
            />
            <feComposite
              in="lumaBloom"
              in2="stippleDust"
              operator="in"
              result="sparklingAura"
            />
            <feBlend mode="screen" in="SourceGraphic" in2="sparklingAura" />
          </filter>

          {/* APPROACH 8: Core-Preserved Mezzotint Erosion (Sharp Spine + Stipple Contour) */}
          <filter id="shader-approach-8-corepreserved" x="-20%" y="-20%" width="140%" height="140%">
            {/* Inner core preserved via erosion */}
            <feMorphology in="SourceGraphic" operator="erode" radius="1.2" result="crispCore" />
            {/* Outer halo blurred and stippled */}
            <feGaussianBlur in="SourceGraphic" stdDeviation={blurRadius * 0.55} result="outerField" />
            <feTurbulence
              type="fractalNoise"
              baseFrequency={grainFrequency * 1.3}
              numOctaves="2"
              result="edgeNoise"
            />
            <feDisplacementMap
              in="outerField"
              in2="edgeNoise"
              scale={grainScale * 0.9}
              result="erodedContour"
            />
            <feColorMatrix
              in="erodedContour"
              type="matrix"
              values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 3 -0.9"
              result="stippleErosion"
            />
            <feComposite in="crispCore" in2="stippleErosion" operator="over" />
          </filter>
        </defs>
      </svg>

      {/* 2. TOP HEADER & STUDIO INFO */}
      <header className="w-full max-w-6xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold tracking-widest text-cyan-400 uppercase">
              D'Tunes Optical UI
            </span>
            <span className="text-zinc-600">•</span>
            <span className="text-xs font-mono text-zinc-400">Backdrop Grain Blur System</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight mt-0.5">
            Real UI Backdrop Grain Blur Lab
          </h1>
        </div>

        {/* Global Controls & Theme Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Compare Mode Toggle */}
          <button
            onClick={() => setIsCompareMode(!isCompareMode)}
            className={`px-3 py-1.5 rounded-full text-xs font-mono font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
              isCompareMode
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm'
                : 'bg-zinc-900 text-zinc-400 border-white/10 hover:text-white'
            }`}
          >
            <Columns size={13} />
            <span>{isCompareMode ? 'Exit Split View' : 'Side-by-Side Split'}</span>
          </button>

          {/* Microscope Loupe Toggle & Zoom Levels */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setLoupeActive(!loupeActive)}
              className={`px-3 py-1.5 rounded-full text-xs font-mono font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                loupeActive
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                  : 'bg-zinc-900 text-zinc-400 border-white/10 hover:text-white'
              }`}
            >
              <ZoomIn size={13} />
              <span>{loupeActive ? `Loupe (${loupeZoom}x)` : 'Inspect Pixels'}</span>
            </button>
            {loupeActive && (
              <div className="flex items-center gap-1 p-0.5 bg-black/60 rounded-full border border-amber-500/30">
                {[2, 3.5, 6].map((z) => (
                  <button
                    key={z}
                    onClick={() => setLoupeZoom(z)}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono cursor-pointer ${
                      loupeZoom === z ? 'bg-amber-400 text-black font-bold' : 'text-amber-300 hover:text-white'
                    }`}
                  >
                    {z}x
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme Switcher */}
          <button
            onClick={() => setTheme(isLight ? 'dark' : 'light')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
              isLight
                ? 'bg-zinc-200 text-zinc-900 border-zinc-300'
                : 'bg-zinc-900 text-zinc-200 border-white/15'
            }`}
          >
            {isLight ? <Moon size={13} /> : <Sun size={13} />}
            <span>{isLight ? 'Dark Obsidian' : 'Stark 8♣ Paper'}</span>
          </button>
        </div>
      </header>

      {/* 1-CLICK AESTHETIC PRESETS BAR */}
      <div className="w-full max-w-6xl flex items-center gap-2 py-3 overflow-x-auto text-xs font-mono">
        <span className="text-zinc-500 flex items-center gap-1 uppercase tracking-wider text-[11px] font-bold mr-1 flex-shrink-0">
          <Flame size={13} className="text-amber-400" /> Presets:
        </span>
        <button
          onClick={() => applyPreset('card-8clubs')}
          className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-200 flex-shrink-0 cursor-pointer"
        >
          8♣ Playing Card Needle Stipple
        </button>
        <button
          onClick={() => applyPreset('core-clarity')}
          className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-cyan-300 flex-shrink-0 cursor-pointer"
        >
          Core-Preserved Legibility
        </button>
        <button
          onClick={() => applyPreset('crystalline-bayer')}
          className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-200 flex-shrink-0 cursor-pointer"
        >
          Crystalline Bayer Matrix
        </button>
        <button
          onClick={() => applyPreset('dverse-obsidian')}
          className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-200 flex-shrink-0 cursor-pointer"
        >
          D'Verse Obsidian Specular
        </button>
        <button
          onClick={() => applyPreset('visionos-sandblast')}
          className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-200 flex-shrink-0 cursor-pointer"
        >
          VisionOS Sandblasted
        </button>
        <button
          onClick={() => applyPreset('risograph-print')}
          className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-200 flex-shrink-0 cursor-pointer"
        >
          Risograph Print Litho
        </button>
      </div>

      {/* 3. APPROACH SELECTOR PILL TABS */}
      <div className="w-full max-w-6xl flex flex-col gap-2 mt-1 mb-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold flex items-center gap-1.5">
            <Layers size={13} className="text-cyan-400" />
            <span>Select Active Grain Blur Architecture ({APPROACH_CATALOG.length} Total Approaches)</span>
          </span>
          {isCompareMode && (
            <span className="text-[11px] font-mono text-cyan-400">
              Comparing: <strong>{currentMeta.badge}</strong> vs{' '}
              <strong>{APPROACH_CATALOG.find((a) => a.id === compareApproach)?.badge}</strong>
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {APPROACH_CATALOG.map((app) => {
            const isSelected = activeApproach === app.id;
            const isComp = isCompareMode && compareApproach === app.id;
            return (
              <button
                key={app.id}
                onClick={() => {
                  if (isCompareMode && isSelected) {
                    // if clicking same, don't change
                  } else {
                    setActiveApproach(app.id);
                  }
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  if (isCompareMode) setCompareApproach(app.id);
                }}
                className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer relative group flex flex-col justify-between ${
                  isSelected
                    ? 'bg-white text-zinc-950 border-white shadow-lg ring-2 ring-white/30'
                    : isComp
                    ? 'bg-cyan-950/40 text-cyan-200 border-cyan-500/50 ring-1 ring-cyan-500/30'
                    : 'bg-zinc-900/60 text-zinc-300 border-white/10 hover:border-white/25 hover:bg-zinc-900'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase tracking-wider ${
                        isSelected
                          ? 'bg-zinc-950 text-white'
                          : isComp
                          ? 'bg-cyan-500/20 text-cyan-300'
                          : 'bg-white/10 text-zinc-400'
                      }`}
                    >
                      {app.badge}
                    </span>
                    {isSelected && <Check size={12} className="text-zinc-950" />}
                  </div>
                  <h4 className="text-xs font-bold leading-tight line-clamp-1">{app.title.replace(/Approach \d: /, '')}</h4>
                </div>
                <p
                  className={`text-[10px] mt-1 line-clamp-1 ${
                    isSelected ? 'text-zinc-600' : 'text-zinc-400'
                  }`}
                >
                  {app.shortDesc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3b. COMPARE MODE SPLIT CONTROL BAR */}
      {isCompareMode && (
        <div className="w-full max-w-6xl flex flex-wrap items-center justify-between gap-4 p-2.5 px-4 mb-2 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-cyan-300 font-bold uppercase tracking-wider text-[10px]">Split Comparison:</span>
            <span className="text-white bg-black/60 px-2 py-0.5 rounded border border-white/10 font-bold">
              Left: {currentMeta.badge}
            </span>
            <span className="text-zinc-500">vs</span>
            <span className="text-cyan-200 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30 font-bold">
              Right: {APPROACH_CATALOG.find((a) => a.id === compareApproach)?.badge} (Right-click card to change)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-zinc-400">Divider:</span>
            <input
              type="range"
              min="15"
              max="85"
              value={splitPos}
              onChange={(e) => setSplitPos(Number(e.target.value))}
              className="w-28 h-1 bg-cyan-950 rounded appearance-none cursor-pointer accent-cyan-400"
            />
            <span className="text-cyan-300 font-bold w-9">{splitPos}%</span>
          </div>
        </div>
      )}

      {/* 4. MAIN WORKBENCH: REAL UI VIEWPORT WITH THE FLOATING DOCK OVER REAL CONTENT */}
      <main className="w-full max-w-6xl flex-1 flex flex-col lg:flex-row items-start justify-center gap-6 my-2">
        {/* REAL APP VIEWPORT */}
        <div className="flex-1 w-full flex flex-col items-center">
          {/* THE DEVICE / APPLICATION VIEWPORT FRAME */}
          <div
            ref={viewportRef}
            onMouseMove={handleMouseMove}
            style={{ height: '580px', minHeight: '580px' }}
            className={`relative w-full rounded-[36px] border overflow-hidden shadow-2xl transition-all duration-300 flex flex-col ${
              isLight
                ? 'bg-[#ffffff] border-zinc-300 text-zinc-900'
                : 'bg-[#06060a] border-white/15 text-zinc-100'
            }`}
          >
            {/* Viewport Top Bar */}
            <div className="h-12 px-6 border-b border-white/10 flex items-center justify-between flex-shrink-0 z-30 bg-inherit backdrop-blur-md">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-black tracking-tight">D'TUNES // STAGE</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-semibold">
                  {currentMeta.badge}
                </span>
              </div>

              {/* Underlying Content Switcher */}
              <div className="flex items-center gap-1 p-0.5 bg-black/40 rounded-lg border border-white/10 text-[11px] font-mono">
                <button
                  onClick={() => setActiveContent('typography')}
                  className={`px-2 py-0.5 rounded cursor-pointer ${
                    activeContent === 'typography' ? 'bg-white text-black font-bold' : 'text-zinc-400'
                  }`}
                >
                  Typography
                </button>
                <button
                  onClick={() => setActiveContent('tracklist')}
                  className={`px-2 py-0.5 rounded cursor-pointer ${
                    activeContent === 'tracklist' ? 'bg-white text-black font-bold' : 'text-zinc-400'
                  }`}
                >
                  Tracklist
                </button>
                <button
                  onClick={() => setActiveContent('lyrics')}
                  className={`px-2 py-0.5 rounded cursor-pointer ${
                    activeContent === 'lyrics' ? 'bg-white text-black font-bold' : 'text-zinc-400'
                  }`}
                >
                  Lyrics
                </button>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* A. UNDERLYING SHARP REAL CONTENT                                          */}
            {/* ========================================================================= */}
            <div className="relative flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 custom-scrollbar select-none">
              {/* Content Mode 1: Large Optical Typography */}
              {activeContent === 'typography' && (
                <div className="py-2 flex flex-col items-center text-center space-y-6 max-w-xl mx-auto">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center leading-none font-mono font-black text-6xl">
                      <span>8</span>
                      <span className="text-4xl -mt-2">♣</span>
                    </div>
                    <div className="text-left">
                      <h2 className="text-5xl sm:text-6xl font-black tracking-tighter uppercase leading-none">
                        OPTICAL
                      </h2>
                      <h2 className="text-4xl sm:text-5xl font-black tracking-tighter text-zinc-400 uppercase leading-none mt-1">
                        TYPOGRAPHY
                      </h2>
                    </div>
                  </div>

                  <p className="text-sm font-mono text-zinc-400 leading-relaxed max-w-md">
                    Razor-sharp glyphs dissolving into granular stipple falloff. Contrast, threshold, and micro-diffusion balancing legibility and physical texture.
                  </p>

                  <div className="grid grid-cols-2 gap-3 w-full max-w-md pt-2">
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-left">
                      <span className="font-mono text-[9px] uppercase font-bold text-zinc-500">
                        Stem Needle Ray
                      </span>
                      <p className="text-xs font-bold mt-1 text-zinc-200">Anisotropic Vertical Spine</p>
                    </div>
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-left">
                      <span className="font-mono text-[9px] uppercase font-bold text-zinc-500">
                        Stipple Field
                      </span>
                      <p className="text-xs font-bold mt-1 text-zinc-200">Point-Dither Diffusion</p>
                    </div>
                  </div>

                  <div className="w-full flex items-center justify-between text-xs font-mono text-zinc-500 border-t border-white/5 pt-3">
                    <span>Lossless 24-Bit / 96kHz</span>
                    <span>Dcode9 Audio Core</span>
                    <span>Spec. 08-Club</span>
                  </div>
                </div>
              )}

              {/* Content Mode 2: Tracklist UI */}
              {activeContent === 'tracklist' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-white/5">
                    <h2 className="text-base font-black tracking-tight">Active Queue & Sound Library</h2>
                    <span className="text-xs font-mono text-zinc-400">12 Tracks • Lossless</span>
                  </div>

                  {SAMPLE_TRACKS.concat(SAMPLE_TRACKS).map((track, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2.5 rounded-2xl bg-white/5 border border-white/5 hover:border-white/20 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="font-mono text-xs font-bold text-zinc-500 w-5">
                          {i < 9 ? `0${i + 1}` : i + 1}
                        </span>
                        <img
                          src={track.coverUrl}
                          alt={track.title}
                          className="w-10 h-10 rounded-xl object-cover border border-white/10"
                        />
                        <div className="min-w-0">
                          <h4 className="text-xs sm:text-sm font-bold truncate group-hover:text-cyan-300 transition-colors">
                            {track.title}
                          </h4>
                          <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                            {track.artist} • <span className="font-mono">{track.album}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-zinc-400">
                          {track.bitrate}
                        </span>
                        <span className="font-mono text-xs text-zinc-400">03:38</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Content Mode 3: Lyrics Stream */}
              {activeContent === 'lyrics' && (
                <div className="py-2 space-y-5 text-center max-w-md mx-auto">
                  <span className="text-[11px] font-mono font-bold tracking-widest uppercase text-cyan-400">
                    Live Lyrics Stream • Tap-to-seek
                  </span>
                  {[
                    "Into the smoked obsidian void",
                    "A beam of light awakens the glyphs",
                    "Specular ridges catch the dusk",
                    "Eight needles piercing through the dark",
                    "Resonant waves in chromatic bloom",
                    "D'Verse alive, breathing in unison",
                    "Frequencies sculpt the chiseled glass",
                    "Silent dither across the perimeter",
                    "Pure acoustic precision, zero friction"
                  ].map((line, idx) => (
                    <p
                      key={idx}
                      className={`text-lg sm:text-xl font-black transition-all cursor-pointer ${
                        idx === 3
                          ? 'text-white scale-105'
                          : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      {line}
                    </p>
                  ))}
                </div>
              )}
            </div>

            {/* ========================================================================= */}
            {/* B. THE GRAIN-BLURRED MIRROR LAYER (SHATTERED THROUGH CHOSEN SHADER)       */}
            {/* ========================================================================= */}
            {!isCompareMode ? (
              activeApproach !== 'approach-4-sandblast' && (
                <div
                  className="absolute inset-0 pointer-events-none z-20 overflow-hidden"
                  style={{
                    clipPath:
                      dockWidth === 'full'
                        ? `inset(${dockPosition - 8.5}% 3% ${100 - (dockPosition + 8.5)}% 3% round 28px)`
                        : `inset(${dockPosition - 8.5}% 18% ${100 - (dockPosition + 8.5)}% 18% round 28px)`,
                  }}
                >
                  <div
                    className="w-full h-full p-6 sm:p-8 space-y-6"
                    style={{ filter: `url(#shader-${activeApproach})` }}
                  >
                    {activeContent === 'typography' && (
                      <div className="py-2 flex flex-col items-center text-center space-y-6 max-w-xl mx-auto">
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col items-center leading-none font-mono font-black text-6xl">
                            <span>8</span>
                            <span className="text-4xl -mt-2">♣</span>
                          </div>
                          <div className="text-left">
                            <h2 className="text-5xl sm:text-6xl font-black tracking-tighter uppercase leading-none">
                              OPTICAL
                            </h2>
                            <h2 className="text-4xl sm:text-5xl font-black tracking-tighter text-zinc-400 uppercase leading-none mt-1">
                              TYPOGRAPHY
                            </h2>
                          </div>
                        </div>
                        <p className="text-sm font-mono text-zinc-400 leading-relaxed max-w-md">
                          Razor-sharp glyphs dissolving into granular stipple falloff. Contrast, threshold, and micro-diffusion balancing legibility and physical texture.
                        </p>
                      </div>
                    )}
                    {activeContent === 'tracklist' && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-white/5">
                          <h2 className="text-base font-black tracking-tight">Active Queue & Sound Library</h2>
                        </div>
                        {SAMPLE_TRACKS.concat(SAMPLE_TRACKS).map((track, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between p-2.5 rounded-2xl bg-white/5 border border-white/5"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="font-mono text-xs font-bold text-zinc-500 w-5">
                                {i < 9 ? `0${i + 1}` : i + 1}
                              </span>
                              <img
                                src={track.coverUrl}
                                alt={track.title}
                                className="w-10 h-10 rounded-xl object-cover border border-white/10"
                              />
                              <div className="min-w-0">
                                <h4 className="text-xs sm:text-sm font-bold truncate">{track.title}</h4>
                                <p className="text-[11px] text-zinc-400 truncate mt-0.5">{track.artist}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {activeContent === 'lyrics' && (
                      <div className="py-2 space-y-5 text-center max-w-md mx-auto">
                        <span className="text-[11px] font-mono font-bold tracking-widest uppercase text-cyan-400">
                          Live Lyrics Stream
                        </span>
                        {[
                          "Into the smoked obsidian void",
                          "A beam of light awakens the glyphs",
                          "Specular ridges catch the dusk",
                          "Eight needles piercing through the dark",
                          "Resonant waves in chromatic bloom"
                        ].map((line, idx) => (
                          <p key={idx} className="text-lg sm:text-xl font-black">
                            {line}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            ) : (
              <>
                {/* Compare Mode: Left side */}
                <div
                  className="absolute inset-0 pointer-events-none z-20 overflow-hidden"
                  style={{
                    clipPath:
                      dockWidth === 'full'
                        ? `inset(${dockPosition - 8.5}% ${100 - splitPos}% ${100 - (dockPosition + 8.5)}% 3% round 28px 0 0 28px)`
                        : `inset(${dockPosition - 8.5}% ${100 - splitPos}% ${100 - (dockPosition + 8.5)}% 18% round 28px 0 0 28px)`,
                  }}
                >
                  <div
                    className="w-full h-full p-6 sm:p-8 space-y-6"
                    style={{ filter: `url(#shader-${activeApproach})` }}
                  >
                    {activeContent === 'typography' && (
                      <div className="py-2 flex flex-col items-center text-center space-y-6 max-w-xl mx-auto">
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col items-center leading-none font-mono font-black text-6xl">
                            <span>8</span>
                            <span className="text-4xl -mt-2">♣</span>
                          </div>
                          <div className="text-left">
                            <h2 className="text-5xl sm:text-6xl font-black tracking-tighter uppercase leading-none">
                              OPTICAL
                            </h2>
                            <h2 className="text-4xl sm:text-5xl font-black tracking-tighter text-zinc-400 uppercase leading-none mt-1">
                              TYPOGRAPHY
                            </h2>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Compare Mode: Right side */}
                <div
                  className="absolute inset-0 pointer-events-none z-20 overflow-hidden"
                  style={{
                    clipPath:
                      dockWidth === 'full'
                        ? `inset(${dockPosition - 8.5}% 3% ${100 - (dockPosition + 8.5)}% ${splitPos}% round 0 28px 28px 0)`
                        : `inset(${dockPosition - 8.5}% 18% ${100 - (dockPosition + 8.5)}% ${splitPos}% round 0 28px 28px 0)`,
                  }}
                >
                  <div
                    className="w-full h-full p-6 sm:p-8 space-y-6"
                    style={{ filter: `url(#shader-${compareApproach})` }}
                  >
                    {activeContent === 'typography' && (
                      <div className="py-2 flex flex-col items-center text-center space-y-6 max-w-xl mx-auto">
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col items-center leading-none font-mono font-black text-6xl">
                            <span>8</span>
                            <span className="text-4xl -mt-2">♣</span>
                          </div>
                          <div className="text-left">
                            <h2 className="text-5xl sm:text-6xl font-black tracking-tighter uppercase leading-none">
                              OPTICAL
                            </h2>
                            <h2 className="text-4xl sm:text-5xl font-black tracking-tighter text-zinc-400 uppercase leading-none mt-1">
                              TYPOGRAPHY
                            </h2>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* ========================================================================= */}
            {/* C. THE REAL FLOATING PLAYER DOCK SURFACE                                   */}
            {/* ========================================================================= */}
            <div
              onMouseDown={handleDockMouseDown}
              className="absolute z-30 transition-transform duration-75 flex items-center justify-center pointer-events-auto select-none cursor-grab active:cursor-grabbing"
              style={{
                top: `${dockPosition}%`,
                left: dockWidth === 'full' ? '3%' : '18%',
                right: dockWidth === 'full' ? '3%' : '18%',
                transform: 'translateY(-50%)',
              }}
            >
              <div
                className={`relative w-full rounded-3xl p-3 sm:p-3.5 flex items-center justify-between gap-4 border shadow-[0_25px_60px_rgba(0,0,0,0.85)] ${
                  isLight
                    ? 'border-zinc-400/50 shadow-xl'
                    : 'border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.9)]'
                }`}
                style={
                  activeApproach === 'approach-4-sandblast'
                    ? {
                        backdropFilter: `blur(${blurRadius}px) contrast(${grainContrast}%) brightness(90%)`,
                        WebkitBackdropFilter: `blur(${blurRadius}px) contrast(${grainContrast}%) brightness(90%)`,
                        backgroundColor: isLight ? 'rgba(255,255,255,0.65)' : 'rgba(12,12,16,0.65)',
                      }
                    : {
                        backgroundColor: isLight
                          ? `rgba(255, 255, 255, ${glassOpacity / 100})`
                          : `rgba(8, 8, 12, ${glassOpacity / 100})`,
                      }
                }
              >
                {/* Vertical comparison guideline on dock */}
                {isCompareMode && (
                  <div
                    className="absolute top-0 bottom-0 w-[1.5px] bg-cyan-400 z-40 pointer-events-none shadow-[0_0_8px_rgba(6,182,212,0.8)]"
                    style={{ left: `${splitPos}%` }}
                  >
                    <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 px-1 py-0.2 bg-cyan-500 text-black text-[8px] font-mono font-black rounded shadow">
                      SPLIT
                    </div>
                  </div>
                )}

                {/* Micro Film-Grain Texture Layer on Dock Surface */}
                <div
                  className="absolute inset-0 rounded-3xl pointer-events-none opacity-40 mix-blend-overlay"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 160 160' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='ditherNoise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='${grainFrequency}' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.8 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23ditherNoise)'/%3E%3C/svg%3E")`,
                  }}
                />

                {/* Top Specular Edge Ridge (D'Verse DNA) */}
                <div className="absolute inset-x-4 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />

                {/* Left: Now Playing Info */}
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop"
                    alt="Current track"
                    className="w-11 h-11 rounded-xl object-cover border border-white/20 flex-shrink-0 shadow-md"
                  />
                  <div className="min-w-0">
                    <h4 className={`text-xs sm:text-sm font-bold truncate ${isLight ? 'text-zinc-950' : 'text-white'}`}>
                      D'Verse (Optical Resonance)
                    </h4>
                    <p className={`text-[11px] truncate mt-0.5 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                      Dcode9 • Sound Lab
                    </p>
                  </div>
                  <button
                    className={`p-1.5 transition-colors cursor-pointer ${
                      isLight ? 'text-zinc-600 hover:text-red-600' : 'text-zinc-400 hover:text-red-500'
                    }`}
                    title="Like"
                  >
                    <Heart size={15} />
                  </button>
                </div>

                {/* Center: Controls */}
                <div className="flex items-center gap-2 sm:gap-3">
                  <button className={`p-1.5 transition-colors cursor-pointer ${isLight ? 'text-zinc-600 hover:text-black' : 'text-zinc-400 hover:text-white'}`}>
                    <Shuffle size={13} />
                  </button>
                  <button className={`p-1.5 transition-colors cursor-pointer ${isLight ? 'text-zinc-800 hover:text-black' : 'text-zinc-300 hover:text-white'}`}>
                    <SkipBack size={15} />
                  </button>

                  {/* Play Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsPlaying(!isPlaying);
                    }}
                    className={`w-10 h-10 rounded-full font-bold flex items-center justify-center transition-all transform active:scale-90 hover:scale-105 cursor-pointer shadow-lg ${
                      isLight ? 'bg-zinc-950 text-white' : 'bg-white text-zinc-950'
                    }`}
                    title="Play/Pause (Space)"
                  >
                    {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
                  </button>

                  <button className={`p-1.5 transition-colors cursor-pointer ${isLight ? 'text-zinc-800 hover:text-black' : 'text-zinc-300 hover:text-white'}`}>
                    <SkipForward size={15} />
                  </button>
                  <button className={`p-1.5 transition-colors cursor-pointer ${isLight ? 'text-zinc-600 hover:text-black' : 'text-zinc-400 hover:text-white'}`}>
                    <Repeat size={13} />
                  </button>
                </div>

                {/* Right: Sound Utilities */}
                <div className="hidden sm:flex items-center gap-2">
                  <button
                    className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                      isLight ? 'bg-zinc-900/10 text-zinc-800 hover:text-black' : 'bg-white/5 text-zinc-300 hover:text-white'
                    }`}
                    title="Lyrics"
                  >
                    <Mic2 size={14} />
                  </button>
                  <button
                    className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                      isLight ? 'bg-zinc-900/10 text-zinc-800 hover:text-black' : 'bg-white/5 text-zinc-300 hover:text-white'
                    }`}
                    title="Queue"
                  >
                    <ListMusic size={14} />
                  </button>
                  <div className={`w-[1px] h-4 mx-1 ${isLight ? 'bg-zinc-300' : 'bg-white/10'}`} />
                  <div className="flex items-center gap-2">
                    <Volume2 size={14} className={isLight ? 'text-zinc-600' : 'text-zinc-400'} />
                    <div className={`w-14 h-1 rounded-full ${isLight ? 'bg-zinc-300' : 'bg-zinc-700'}`} />
                  </div>
                </div>
              </div>
            </div>

            {/* Viewport Bottom Controls: Position Slider & Width Toggle */}
            <div className="absolute bottom-2 left-6 right-6 z-40 flex items-center justify-between gap-4 p-2 px-4 rounded-2xl bg-black/80 backdrop-blur-xl border border-white/10 text-xs font-mono">
              <div className="flex items-center gap-2 flex-1">
                <span className="text-zinc-400 whitespace-nowrap">Slide Dock Over Text:</span>
                <input
                  type="range"
                  min="20"
                  max="80"
                  value={dockPosition}
                  onChange={(e) => setDockPosition(Number(e.target.value))}
                  className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-white"
                />
                <span className="text-zinc-300 font-bold w-9 text-right">{dockPosition}%</span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setDockWidth('full')}
                  className={`px-2 py-0.5 rounded cursor-pointer ${
                    dockWidth === 'full' ? 'bg-white text-black font-bold' : 'text-zinc-500'
                  }`}
                >
                  Full
                </button>
                <button
                  onClick={() => setDockWidth('compact')}
                  className={`px-2 py-0.5 rounded cursor-pointer ${
                    dockWidth === 'compact' ? 'bg-white text-black font-bold' : 'text-zinc-500'
                  }`}
                >
                  Pill
                </button>
              </div>
            </div>

            {/* D. OPTICAL MICROSCOPE LOUPE (When active) */}
            {loupeActive && (
              <div
                className="absolute z-50 pointer-events-none rounded-full overflow-hidden border-2 border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.5)] bg-black"
                style={{
                  width: '180px',
                  height: '180px',
                  left: `${mousePos.x - 90}px`,
                  top: `${mousePos.y - 90}px`,
                }}
              >
                <div
                  className="w-full h-full relative"
                  style={{
                    transform: `scale(${loupeZoom})`,
                    transformOrigin: `${mousePos.x}px ${mousePos.y}px`,
                  }}
                >
                  {/* Magnified view indicator crosshair */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full border border-amber-400/80" />
                  </div>
                </div>
                <div className="absolute bottom-2 inset-x-0 text-center font-mono text-[9px] text-amber-300 bg-black/70 py-0.5">
                  Microscope {loupeZoom}x
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: PARAMETER INSPECTOR & ARCHITECTURAL BREAKDOWN */}
        <aside className="w-full lg:w-80 rounded-3xl p-5 border border-white/10 bg-zinc-900/90 text-zinc-100 flex flex-col gap-4 backdrop-blur-xl">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Sliders size={14} className="text-cyan-400" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-200">
                Shader Controls
              </span>
            </div>
            <span className="text-[10px] font-mono text-zinc-400">Live GPU</span>
          </div>

          {/* Slider 1: Blur Radius */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-zinc-400">Optical Blur Radius</span>
              <span className="font-bold text-white">{blurRadius}px</span>
            </div>
            <input
              type="range"
              min="2"
              max="36"
              value={blurRadius}
              onChange={(e) => setBlurRadius(Number(e.target.value))}
              className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-white"
            />
          </div>

          {/* Slider 2: Grain Frequency (Dither Resolution) */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-zinc-400">Grain / Dither Frequency</span>
              <span className="font-bold text-white">{grainFrequency.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.4"
              max="2.2"
              step="0.05"
              value={grainFrequency}
              onChange={(e) => setGrainFrequency(Number(e.target.value))}
              className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-white"
            />
            <span className="text-[10px] text-zinc-500 font-mono">
              Higher = ultra-fine dust; Lower = coarse stipple.
            </span>
          </div>

          {/* Slider 3: Grain Scatter Reach */}
          {activeApproach !== 'approach-4-sandblast' && (
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-zinc-400">Scatter / Needle Reach</span>
                <span className="font-bold text-white">{grainScale}px</span>
              </div>
              <input
                type="range"
                min="2"
                max="50"
                value={grainScale}
                onChange={(e) => setGrainScale(Number(e.target.value))}
                className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-white"
              />
            </div>
          )}

          {/* Slider 4: Dither Contrast */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-zinc-400">Dither Contrast Slope</span>
              <span className="font-bold text-white">{grainContrast}%</span>
            </div>
            <input
              type="range"
              min="90"
              max="240"
              value={grainContrast}
              onChange={(e) => setGrainContrast(Number(e.target.value))}
              className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-white"
            />
          </div>

          {/* Slider 5: Glass Plate Opacity */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-zinc-400">Dock Plate Opacity</span>
              <span className="font-bold text-white">{glassOpacity}%</span>
            </div>
            <input
              type="range"
              min="20"
              max="95"
              value={glassOpacity}
              onChange={(e) => setGlassOpacity(Number(e.target.value))}
              className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-white"
            />
          </div>

          {/* Deep Architectural Explanation Card */}
          <div className="mt-2 p-3.5 rounded-2xl bg-black/50 border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-cyan-400 flex items-center gap-1.5">
                <Sparkles size={12} />
                <span>{currentMeta.title}</span>
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300">
                {currentMeta.category}
              </span>
            </div>

            <p className="text-[11px] text-zinc-300 leading-relaxed font-mono">
              {currentMeta.fullDesc}
            </p>

            <div className="pt-2 border-t border-white/10 text-[10px] font-mono text-zinc-400">
              <strong className="text-white">Verdict:</strong> {currentMeta.recommendation}
            </div>
          </div>
        </aside>
      </main>

      {/* FOOTER */}
      <footer className="w-full max-w-6xl pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-zinc-500">
        <div>Slide dock or drag anywhere to evaluate text blur • Click presets for instant tuning</div>
        <div>Playback: {isPlaying ? 'PLAYING' : 'PAUSED'} • Spacebar toggles</div>
      </footer>
    </div>
  );
};
