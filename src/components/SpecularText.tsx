import React, { useMemo } from 'react';
import { LightState } from '../hooks/usePerimeterPhysics';

interface SpecularTextProps {
  light: LightState;
  text?: string;
}

export const SpecularText: React.FC<SpecularTextProps> = ({
  light,
  text = "'Verse",
}) => {
  // Letters split for individual raytracing calculations
  const letters = useMemo(() => text.split(''), [text]);

  // Center coordinate of the entire text block (approx center of screen)
  const screenW = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const screenH = typeof window !== 'undefined' ? window.innerHeight : 800;

  // Vector from text center to current light position
  const dx = light.x - screenW * 0.5;
  const dy = light.y - screenH * 0.5;
  const dist = Math.hypot(dx, dy) || 1;
  const lightDirX = dx / dist;
  const lightDirY = dy / dist;

  // Light proximity intensity factor (closer light = brighter specular)
  const maxDim = Math.hypot(screenW, screenH) * 0.5;
  const proximity = Math.max(0.2, 1 - dist / (maxDim * 1.3));

  return (
    <div className="relative z-10 w-full h-full flex items-center justify-center pointer-events-none select-none">
      {/* Dynamic SVG Filter Defs for Real Raytraced Specular Lighting */}
      <svg className="absolute w-0 h-0" aria-hidden="true">
        <defs>
          {/* Main Directional Gradient on Font Body */}
          <linearGradient
            id="fontBodyLighting"
            x1={`${50 - lightDirX * 50}%`}
            y1={`${50 - lightDirY * 50}%`}
            x2={`${50 + lightDirX * 50}%`}
            y2={`${50 + lightDirY * 50}%`}
          >
            <stop
              offset="0%"
              stopColor="#08080a"
              stopOpacity="0.95"
            />
            <stop
              offset="45%"
              stopColor="#1c1c22"
              stopOpacity="0.9"
            />
            <stop
              offset="70%"
              stopColor="#543c20"
              stopOpacity={0.4 + 0.5 * proximity}
            />
            <stop
              offset="90%"
              stopColor="#d69f48"
              stopOpacity={0.6 + 0.4 * proximity}
            />
            <stop
              offset="100%"
              stopColor="#fff8e7"
              stopOpacity={0.8 + 0.2 * proximity}
            />
          </linearGradient>

          {/* Sharp Specular Rim Stroke Gradient */}
          <linearGradient
            id="fontRimHighlight"
            x1={`${50 - lightDirX * 50}%`}
            y1={`${50 - lightDirY * 50}%`}
            x2={`${50 + lightDirX * 50}%`}
            y2={`${50 + lightDirY * 50}%`}
          >
            <stop
              offset="0%"
              stopColor="rgba(255, 255, 255, 0.03)"
            />
            <stop
              offset="60%"
              stopColor="rgba(255, 210, 120, 0.25)"
            />
            <stop
              offset="85%"
              stopColor="rgba(255, 240, 190, 0.85)"
            />
            <stop
              offset="100%"
              stopColor="#ffffff"
            />
          </linearGradient>

          {/* Intense Specular Glow Filter for illuminated edge */}
          <filter id="specularGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      {/* ========================================================================= */}
      {/* SCULPTURAL GROK-STYLE TYPOGRAPHY WITH DIRECTIONAL SPECULAR HIGHLIGHTS */}
      {/* ========================================================================= */}
      <div className="relative flex items-center justify-center tracking-[-0.04em] font-syne font-black text-[18vw] sm:text-[20vw] md:text-[22vw] lg:text-[24vw] leading-none">
        {letters.map((char, index) => {
          // Calculate individual letter distance and relative light incidence
          const letterOffsetFraction = (index - letters.length * 0.5) / (letters.length || 1);
          const letterCenterX = screenW * 0.5 + letterOffsetFraction * (screenW * 0.5);
          const letterCenterY = screenH * 0.5;

          const ldx = light.x - letterCenterX;
          const ldy = light.y - letterCenterY;
          const lDist = Math.hypot(ldx, ldy) || 1;
          const lDirX = ldx / lDist;
          const lDirY = ldy / lDist;

          // Local letter light incidence angle
          const localAngle = (Math.atan2(ldy, ldx) * 180) / Math.PI;
          const localProximity = Math.max(0.1, 1 - lDist / (maxDim * 1.2));

          return (
            <div
              key={index}
              className="relative inline-block"
              style={{
                filter: `drop-shadow(${lDirX * 8 * localProximity}px ${
                  lDirY * 8 * localProximity
                }px ${18 * localProximity}px rgba(235, 160, 50, ${
                  0.35 * localProximity
                }))`,
              }}
            >
              {/* 1. Base Letterform Surface */}
              <span
                className="relative block font-black"
                style={{
                  background: `linear-gradient(${
                    localAngle + 90
                  }deg, #050507 0%, #15151a 45%, #6e4b1e 75%, #f1b34e 92%, #fff9ec 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  opacity: 0.95,
                }}
              >
                {char}
              </span>

              {/* 2. Specular Edge Stroke Layer (Direct Light Reflection on the Glyph Contour) */}
              <span
                aria-hidden="true"
                className="absolute inset-0 block font-black pointer-events-none"
                style={{
                  WebkitTextStroke: `${Math.max(1, 2.5 * localProximity)}px transparent`,
                  background: `linear-gradient(${
                    localAngle + 90
                  }deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.08) 50%, rgba(255,200,100,0.5) 75%, rgba(255,245,210,0.95) 92%, #ffffff 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mixBlendMode: 'screen',
                  filter: `drop-shadow(${lDirX * 3}px ${lDirY * 3}px ${
                    6 * localProximity
                  }px rgba(255, 230, 150, ${0.9 * localProximity}))`,
                }}
              >
                {char}
              </span>

              {/* 3. Razor-Thin Pure White Specular Apex Highlight */}
              <span
                aria-hidden="true"
                className="absolute inset-0 block font-black pointer-events-none opacity-80"
                style={{
                  WebkitTextStroke: '1px transparent',
                  background: `linear-gradient(${
                    localAngle + 90
                  }deg, transparent 80%, rgba(255,255,255,0.7) 94%, #ffffff 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mixBlendMode: 'screen',
                }}
              >
                {char}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
