import React, { useState, useRef, useMemo } from 'react';

export type FlowDirection = 'left-to-right' | 'right-to-left';

export interface WwdcTextEffectProps {
  text?: string;
  direction?: FlowDirection;
  bloomStrength?: number;
  chromaticIntensity?: number;
  hoverGlintStrength?: number;
  enableHover?: boolean;
}

export const WwdcTextEffect: React.FC<WwdcTextEffectProps> = ({
  text = 'WWDC26',
  direction = 'right-to-left',
  bloomStrength = 1.0,
  chromaticIntensity = 1.0,
  hoverGlintStrength = 1.0,
  enableHover = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoverProgress, setHoverProgress] = useState<number | null>(null);

  const isL2R = direction === 'left-to-right';
  const characters = useMemo(() => text.split(''), [text]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enableHover || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width;
    setHoverProgress(Math.max(0, Math.min(1, relX)));
  };

  const handleMouseLeave = () => {
    setHoverProgress(null);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative flex items-center justify-center select-none py-16 px-8 cursor-default"
    >
      {/* ========================================================================= */}
      {/* 1. VOLUMETRIC GLOW BLOOM (Anchored to the Glowing End) */}
      {/* ========================================================================= */}
      <div
        className="absolute pointer-events-none rounded-full transition-all duration-300 ease-out"
        style={{
          left: isL2R ? '22%' : '78%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'clamp(280px, 35vw, 620px)',
          height: 'clamp(180px, 24vw, 440px)',
          background: `radial-gradient(ellipse at center, rgba(255, 255, 255, ${0.5 * bloomStrength}) 0%, rgba(255, 242, 220, ${0.35 * bloomStrength}) 20%, rgba(255, 175, 60, ${0.18 * bloomStrength}) 42%, rgba(100, 180, 255, ${0.08 * chromaticIntensity}) 65%, transparent 80%)`,
          filter: `blur(${32 * bloomStrength}px)`,
          opacity: 0.95,
          zIndex: 0,
        }}
      />

      {/* ========================================================================= */}
      {/* 2. PRIMARY TYPOGRAPHY CONTAINER WITH PER-GLYPH SPECULAR CHISELING */}
      {/* ========================================================================= */}
      <div className="relative flex items-center justify-center font-['Plus_Jakarta_Sans',sans-serif] font-extrabold tracking-[-0.04em] text-[18vw] sm:text-[19vw] md:text-[20vw] lg:text-[21vw] leading-none z-10">
        {characters.map((char, index) => {
          // Normalized position of this character across the text (0.0 to 1.0)
          const charNormPos = characters.length > 1 ? index / (characters.length - 1) : 0.5;
          
          // Effective illumination ratio: 0.0 = deep smoked glass, 1.0 = blinding white
          const illumRatio = isL2R ? 1.0 - charNormPos : charNormPos;

          // Interactive Hover Catchlight calculation for this specific character
          let charHoverBoost = 0;
          if (hoverProgress !== null) {
            const charCenterNorm = (index + 0.5) / characters.length;
            const distFromCursor = Math.abs(hoverProgress - charCenterNorm);
            charHoverBoost = Math.max(0, 1 - distFromCursor * 3.5) * hoverGlintStrength;
          }

          // Optical state thresholds:
          // illumRatio <= 0.35: Dark Smoked Glass / Titanium (like WW)
          // illumRatio > 0.35 && illumRatio <= 0.68: Satin Aluminum / Transition Chrome (like D)
          // illumRatio > 0.68 && illumRatio <= 0.84: Bright Platinum / Clean White (like C)
          // illumRatio > 0.84: Blinding White Incandescent + Chromatic Halo (like 26)

          const isDarkSmoked = illumRatio <= 0.38;
          const isTransitionZone = illumRatio > 0.38 && illumRatio <= 0.68;
          const isSolidBright = illumRatio > 0.68 && illumRatio <= 0.84;
          const isGlowingBlinding = illumRatio > 0.84;

          // Base Fill Style
          let baseFillGradient = '';
          let specularStrokeColor = '';
          let specularStrokeWidth = '1px';
          let bodyOpacity = 0.95;

          if (isDarkSmoked) {
            // Smoked acrylic / dark glass with crisp 1px silver contour bevel
            baseFillGradient = 'linear-gradient(180deg, #24242c 0%, #16161a 50%, #0a0a0d 100%)';
            specularStrokeColor = `rgba(180, 185, 205, ${0.35 + 0.4 * charHoverBoost})`;
            specularStrokeWidth = '1px';
            bodyOpacity = 0.65 + 0.25 * charHoverBoost;
          } else if (isTransitionZone) {
            // Smooth Satin Aluminum / Brushed Chrome
            const leftShade = isL2R ? '#c0c4d0' : '#282830';
            const rightShade = isL2R ? '#282830' : '#c0c4d0';
            baseFillGradient = `linear-gradient(90deg, ${leftShade} 0%, #767a86 50%, ${rightShade} 100%)`;
            specularStrokeColor = `rgba(230, 235, 250, ${0.6 + 0.35 * charHoverBoost})`;
            specularStrokeWidth = '1px';
            bodyOpacity = 0.88 + 0.12 * charHoverBoost;
          } else if (isSolidBright) {
            // Pure Neutral Platinum / Solid White
            baseFillGradient = 'linear-gradient(180deg, #ffffff 0%, #e8ecf4 70%, #d0d4e0 100%)';
            specularStrokeColor = 'rgba(255, 255, 255, 0.95)';
            specularStrokeWidth = '1px';
            bodyOpacity = 1.0;
          } else {
            // Blinding White Core
            baseFillGradient = 'linear-gradient(180deg, #ffffff 0%, #ffffff 100%)';
            specularStrokeColor = '#ffffff';
            specularStrokeWidth = '1.2px';
            bodyOpacity = 1.0;
          }

          return (
            <div
              key={index}
              className="relative inline-block transition-transform duration-150"
              style={{
                transform: charHoverBoost > 0.3 ? `translateY(-${charHoverBoost * 2}px)` : 'none',
              }}
            >
              {/* LAYER 1: CHROMATIC ABERRATION - WARM AMBER OUTER RIM (Only on Glowing Glyphs) */}
              {isGlowingBlinding && (
                <span
                  aria-hidden="true"
                  className="absolute inset-0 block font-extrabold pointer-events-none"
                  style={{
                    transform: isL2R ? 'translateX(-4px)' : 'translateX(4px)',
                    color: 'transparent',
                    background: isL2R
                      ? 'linear-gradient(to right, #ff9e24 0%, #ffc048 70%, transparent 100%)'
                      : 'linear-gradient(to right, transparent 0%, #ffc048 30%, #ff9e24 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mixBlendMode: 'screen',
                    filter: `blur(${2.2 * chromaticIntensity}px) drop-shadow(${isL2R ? -5 : 5}px 0 12px rgba(255, 155, 40, ${0.95 * chromaticIntensity}))`,
                    opacity: 0.95,
                  }}
                >
                  {char}
                </span>
              )}

              {/* LAYER 2: CHROMATIC ABERRATION - COOL SKY CYAN INNER RIM (Only on Glowing Glyphs) */}
              {isGlowingBlinding && (
                <span
                  aria-hidden="true"
                  className="absolute inset-0 block font-extrabold pointer-events-none"
                  style={{
                    transform: isL2R ? 'translateX(3px)' : 'translateX(-3px)',
                    color: 'transparent',
                    background: isL2R
                      ? 'linear-gradient(to right, transparent 0%, #68b8ff 60%, #a4d4ff 100%)'
                      : 'linear-gradient(to right, #a4d4ff 0%, #68b8ff 40%, transparent 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mixBlendMode: 'screen',
                    filter: `blur(${1.8 * chromaticIntensity}px) drop-shadow(${isL2R ? 4 : -4}px 0 10px rgba(80, 175, 255, ${0.85 * chromaticIntensity}))`,
                    opacity: 0.85,
                  }}
                >
                  {char}
                </span>
              )}

              {/* LAYER 3: BLINDING INCANDESCENT CORE & MULTI-STAGE BLOOM (For Glowing & Solid Bright Glyphs) */}
              {(isGlowingBlinding || isSolidBright) && (
                <span
                  aria-hidden="true"
                  className="absolute inset-0 block font-extrabold pointer-events-none"
                  style={{
                    color: 'transparent',
                    background: '#ffffff',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mixBlendMode: 'screen',
                    filter: isGlowingBlinding
                      ? `drop-shadow(0 0 ${4 * bloomStrength}px #ffffff) drop-shadow(0 0 ${16 * bloomStrength}px rgba(255, 255, 255, 0.95)) drop-shadow(0 0 ${38 * bloomStrength}px rgba(235, 242, 255, 0.7))`
                      : `drop-shadow(0 0 ${2 * bloomStrength}px #ffffff) drop-shadow(0 0 ${8 * bloomStrength}px rgba(255, 255, 255, 0.45))`,
                    opacity: isGlowingBlinding ? 1.0 : 0.85,
                  }}
                >
                  {char}
                </span>
              )}

              {/* LAYER 4: BASE BODY SURFACE GRADIENT */}
              <span
                className="relative block font-extrabold"
                style={{
                  background: baseFillGradient,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  opacity: bodyOpacity,
                  filter: isDarkSmoked ? 'drop-shadow(0 15px 30px rgba(0, 0, 0, 0.95))' : 'none',
                }}
              >
                {char}
              </span>

              {/* LAYER 5: CRISP 1PX PHYSICAL SPECULAR BEVEL STROKE (The Machined Rim) */}
              <span
                aria-hidden="true"
                className="absolute inset-0 block font-extrabold pointer-events-none"
                style={{
                  WebkitTextStroke: `${specularStrokeWidth} transparent`,
                  background: `linear-gradient(135deg, ${specularStrokeColor} 0%, rgba(255, 255, 255, ${0.1 + 0.5 * charHoverBoost}) 50%, rgba(255, 255, 255, 0.02) 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mixBlendMode: 'screen',
                  opacity: 0.95,
                  filter: charHoverBoost > 0.2 ? `drop-shadow(0 0 6px rgba(255, 255, 255, ${charHoverBoost}))` : 'none',
                }}
              >
                {char}
              </span>

              {/* LAYER 6: INTERACTIVE HOVER SURFACE SHEEN HIGHLIGHT */}
              {charHoverBoost > 0.05 && (
                <span
                  aria-hidden="true"
                  className="absolute inset-0 block font-extrabold pointer-events-none"
                  style={{
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.7) 0%, rgba(200,220,255,0.3) 50%, transparent 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mixBlendMode: 'screen',
                    opacity: charHoverBoost * 0.75,
                    filter: `drop-shadow(0 0 ${8 * charHoverBoost}px rgba(255, 255, 255, 0.8))`,
                  }}
                >
                  {char}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
