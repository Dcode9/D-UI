import React, { useState, useEffect } from 'react';
import { ColorTheme, OpticsSettings } from '../../types';
import { Sparkles, ArrowUpRight, Compass, ShieldCheck } from 'lucide-react';

interface MergedTitleProps {
  theme: ColorTheme;
  optics: OpticsSettings;
  mousePos: { x: number; y: number };
  onExploreClick?: () => void;
}

export const MergedTitle: React.FC<MergedTitleProps> = ({
  theme,
  optics,
  mousePos,
  onExploreClick,
}) => {
  const [mounted, setMounted] = useState(false);
  const [isHoveringVerse, setIsHoveringVerse] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate mouse tilt and light angle relative to screen center
  const normalizedMouseX = mousePos.x / (window.innerWidth || 1) - 0.5;
  const normalizedMouseY = mousePos.y / (window.innerHeight || 1) - 0.5;

  const dynamicTiltX = optics.interactiveLighting ? normalizedMouseY * 12 : 0;
  const dynamicTiltY = optics.interactiveLighting ? -normalizedMouseX * 18 : 0;

  // Specular light angle across 'Verse
  const lightShiftX = optics.interactiveLighting ? normalizedMouseX * 40 : 0;

  const verseLetters = [
    { char: "'", id: 0 },
    { char: "V", id: 1 },
    { char: "e", id: 2 },
    { char: "r", id: 3 },
    { char: "s", id: 4 },
    { char: "e", id: 5 },
  ];

  return (
    <div className="relative w-full h-full min-h-screen flex items-center justify-start overflow-hidden select-none">
      {/* ========================================================================= */}
      {/* 1. THE GIANT 'D' LUMINOUS GEOMETRY PROJECTING FROM THE LEFT EDGE */}
      {/* ========================================================================= */}
      <div
        className={`absolute left-0 top-0 bottom-0 pointer-events-none transition-all duration-1000 ease-out z-10 ${
          mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
        }`}
        style={{
          width: 'clamp(280px, 45vw, 650px)',
          filter: `drop-shadow(0 0 ${40 * optics.glowIntensity}px ${theme.borderGlow})`,
        }}
      >
        {/* Deep Volumetric Aura expanding into the void */}
        <div
          className="absolute -left-24 top-1/2 -translate-y-1/2 w-full h-[85vh] rounded-r-full blur-[90px] pointer-events-none transition-all duration-700"
          style={{
            background: `radial-gradient(ellipse at left center, ${theme.glow} 0%, ${theme.glow.replace(/[\d.]+\)$/g, '0.08)')} 55%, transparent 80%)`,
            opacity: 0.85 * optics.glowIntensity,
          }}
        />

        {/* Outer Radiant Corona */}
        <div
          className="absolute -left-12 top-1/2 -translate-y-1/2 w-[90%] h-[70vh] rounded-r-[48%] blur-[40px] pointer-events-none animate-radial-pulse"
          style={{
            background: `radial-gradient(ellipse at left center, ${theme.primary} 15%, ${theme.secondary} 60%, transparent 85%)`,
            opacity: 0.55 * optics.glowIntensity,
          }}
        />

        {/* Main Architectural 'D' Curve SVG with Specular Gradients */}
        <svg
          className="w-full h-full"
          viewBox="0 0 500 900"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Core Neon Gradient */}
            <linearGradient id="dEdgeGradient" x1="0%" y1="0%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="25%" stopColor={theme.primary} stopOpacity="0.9" />
              <stop offset="70%" stopColor={theme.secondary} stopOpacity="0.75" />
              <stop offset="100%" stopColor={theme.accent} stopOpacity="0.4" />
            </linearGradient>

            {/* Inner Fill Atmospheric Glow */}
            <radialGradient id="dInnerVoid" cx="15%" cy="50%" r="85%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.18" />
              <stop offset="35%" stopColor={theme.primary} stopOpacity="0.1" />
              <stop offset="75%" stopColor={theme.secondary} stopOpacity="0.02" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>

            {/* White-Hot Laser Filament Filter */}
            <filter id="laserGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="8" result="blur1" />
              <feGaussianBlur stdDeviation="22" result="blur2" />
              <feMerge>
                <feMergeNode in="blur2" />
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* D Interior Subtle Plasma Fill */}
          <path
            d="M 0 60 C 260 90, 440 250, 440 450 C 440 650, 260 810, 0 840 Z"
            fill="url(#dInnerVoid)"
          />

          {/* D Outer Ambient Arc Line */}
          <path
            d="M 0 50 C 280 80, 465 245, 465 450 C 465 655, 280 820, 0 850"
            stroke={theme.secondary}
            strokeWidth="1.5"
            strokeOpacity="0.4"
            fill="none"
          />

          {/* D Primary Luminous Arc (The Core "D" Geometry) */}
          <path
            d="M 0 60 C 260 90, 440 250, 440 450 C 440 650, 260 810, 0 840"
            stroke="url(#dEdgeGradient)"
            strokeWidth="5"
            strokeLinecap="round"
            filter="url(#laserGlow)"
            fill="none"
          />

          {/* Pure White Core Filament for Razor-Sharp Energy Edge */}
          <path
            d="M 0 60 C 260 90, 440 250, 440 450 C 440 650, 260 810, 0 840"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeOpacity="0.95"
            fill="none"
          />

          {/* Dynamic Light Beam Emitter Ring at the apex of the D */}
          <circle
            cx="440"
            cy="450"
            r="7"
            fill="#ffffff"
            filter="url(#laserGlow)"
            className="animate-ping opacity-75"
          />
          <circle cx="440" cy="450" r="3.5" fill="#ffffff" />
        </svg>

        {/* Ambient Left Spine Flare */}
        <div
          className="absolute left-0 top-1/4 bottom-1/4 w-3 bg-gradient-to-r from-white via-cyan-300 to-transparent blur-[2px]"
          style={{ opacity: 0.8 * optics.glowIntensity }}
        />
      </div>

      {/* ========================================================================= */}
      {/* 2. THE ILLUMINATED " 'Verse " TYPOGRAPHY & HERO CONTENT */}
      {/* ========================================================================= */}
      <div
        className="relative z-20 w-full max-w-7xl mx-auto px-6 sm:px-12 md:px-20 lg:px-28 py-16 flex flex-col items-start justify-center"
        style={{
          transform: `perspective(1000px) rotateX(${dynamicTiltX}deg) rotateY(${dynamicTiltY}deg)`,
          transition: 'transform 0.15s ease-out',
        }}
      >
        {/* Ecosystem Sub-badge */}
        <div
          className={`flex items-center gap-2.5 px-4 py-1.5 rounded-full glass-panel mb-6 transition-all duration-700 delay-200 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{
            borderColor: `${theme.primary}33`,
            boxShadow: `0 0 20px ${theme.borderGlow}`,
          }}
        >
          <span className="relative flex h-2 w-2">
            <span
              className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
              style={{ backgroundColor: theme.primary }}
            />
            <span
              className="relative inline-flex rounded-full h-2 w-2"
              style={{ backgroundColor: theme.primary }}
            />
          </span>
          <span className="font-mono text-xs tracking-wider uppercase text-zinc-300 font-semibold flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5" style={{ color: theme.primary }} />
            D&apos;VERSE ARCHITECTURE // NEXT-GEN REDESIGN
          </span>
        </div>

        {/* =================================================================== */}
        {/* MAIN MERGED TITLE HEADLINE: [D GLOW ARC] + [ 'Verse ] */}
        {/* =================================================================== */}
        <div
          className={`relative flex items-center transition-all duration-1000 delay-300 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          onMouseEnter={() => setIsHoveringVerse(true)}
          onMouseLeave={() => setIsHoveringVerse(false)}
        >
          {/* Visual Indicator of the Left-Edge D Connection */}
          <div className="hidden lg:flex items-center mr-4 text-white/30 font-mono text-sm tracking-widest">
            <div
              className="w-12 h-[1px]"
              style={{
                background: `linear-gradient(90deg, ${theme.primary}, transparent)`,
              }}
            />
          </div>

          <h1 className="flex items-baseline font-black tracking-[-0.04em] text-6xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[10.5rem] leading-none">
            {/* The 'Verse wordmark illuminated from the left */}
            <div className="flex items-baseline relative">
              {verseLetters.map((item, idx) => {
                // Distance from left D-glow increases attenuation
                const specularHighlight = Math.max(0.1, 1 - idx * 0.14);

                return (
                  <span
                    key={item.id}
                    data-letter={item.char}
                    className="specular-letter transition-transform duration-300 ease-out inline-block font-extrabold"
                    style={{
                      // Custom CSS variables for letter specular lighting
                      '--glow-color': theme.borderGlow,
                      background: `linear-gradient(${
                        105 + lightShiftX
                      }deg, #ffffff 0%, #ffffff ${
                        25 * specularHighlight
                      }%, ${theme.primary} ${
                        50 * specularHighlight
                      }%, #94a3b8 75%, #334155 100%)`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      filter: `drop-shadow(-${6 * specularHighlight}px 0px ${
                        16 * specularHighlight * optics.glowIntensity
                      }px ${theme.glow})`,
                      transform: isHoveringVerse
                        ? `translateY(-${(6 - idx) * 2}px) scale(${
                            1 + (6 - idx) * 0.015
                          })`
                        : 'translateY(0) scale(1)',
                    } as React.CSSProperties}
                  >
                    {item.char}
                  </span>
                );
              })}
            </div>
          </h1>
        </div>

        {/* Dynamic Tagline with Directional Rim Highlights */}
        <p
          className={`mt-6 max-w-2xl text-lg sm:text-xl md:text-2xl text-zinc-400 font-normal leading-relaxed tracking-wide transition-all duration-1000 delay-500 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          Your dimensional portal to the{' '}
          <span className="font-semibold text-white">Dcode9 Multiverse</span>.
          Illuminated by unified celestial optics, seamless cross-app state, and modular cosmic architecture.
        </p>

        {/* Action Button Group */}
        <div
          className={`mt-10 flex flex-wrap items-center gap-4 transition-all duration-1000 delay-700 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          {/* Primary Action Button */}
          <button
            onClick={onExploreClick}
            className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-full font-bold text-sm md:text-base tracking-wide text-black overflow-hidden shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
            style={{
              background: `linear-gradient(135deg, #ffffff 0%, ${theme.primary} 70%, ${theme.secondary} 100%)`,
              boxShadow: `0 0 35px ${theme.borderGlow}`,
            }}
          >
            <span className="relative z-10 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-black" />
              <span>ENTER THE VOID</span>
              <ArrowUpRight className="w-4 h-4 text-black transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </button>

          {/* Secondary Pill Button */}
          <a
            href="https://github.com/Dcode9/D-verse"
            target="_blank"
            rel="noopener noreferrer"
            className="glass-pill-btn flex items-center gap-2.5 px-6 py-4 rounded-full text-sm font-semibold text-zinc-300 hover:text-white transition-all"
          >
            <ShieldCheck className="w-4 h-4 text-zinc-400" />
            <span>ECOSYSTEM STATUS: OPERATIONAL</span>
          </a>
        </div>

        {/* Micro-Telemetry Readouts (Futuristic portal coordinates) */}
        <div
          className={`mt-12 pt-8 border-t border-white/5 w-full max-w-2xl flex flex-wrap items-center justify-between gap-6 font-mono text-xs text-zinc-500 transition-all duration-1000 delay-900 ${
            mounted ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-zinc-600">APERTURE:</span>
            <span className="text-zinc-300 font-semibold">LEFT-EDGE D-FLUX</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-zinc-600">SPECTRUM:</span>
            <span
              className="font-semibold uppercase"
              style={{ color: theme.primary }}
            >
              {theme.name}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-zinc-600">REFRACTION:</span>
            <span className="text-zinc-300">
              {(optics.glowIntensity * 1.42).toFixed(2)}x
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
