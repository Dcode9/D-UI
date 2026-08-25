import React, { useEffect, useState } from 'react';

export interface LoadingPortalSweepProps {
  isPlaying: boolean;
  onComplete?: () => void;
  direction?: 'left-to-right' | 'right-to-left';
  chromaticIntensity?: number;
  bloomStrength?: number;
  onProgressUpdate?: (progress: number) => void;
}

export const LoadingPortalSweep: React.FC<LoadingPortalSweepProps> = ({
  isPlaying,
  onComplete,
  direction = 'left-to-right',
  chromaticIntensity = 1.0,
  bloomStrength = 1.0,
  onProgressUpdate,
}) => {
  const [animProgress, setAnimProgress] = useState<number>(isPlaying ? 0 : 1);

  const isL2R = direction === 'left-to-right';

  useEffect(() => {
    if (!isPlaying) {
      setAnimProgress(1);
      if (onProgressUpdate) onProgressUpdate(1);
      return;
    }

    setAnimProgress(0);
    if (onProgressUpdate) onProgressUpdate(0);

    const duration = 2400; // 2.4s cinematic physics sweep
    const startTime = performance.now();
    let animId: number;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);

      // Physics Easing: Accelerates from the edge, decelerates smoothly into resting position
      // Custom ease-out cubic/quintic curve
      const eased = 1 - Math.pow(1 - t, 3.5);
      
      setAnimProgress(eased);
      if (onProgressUpdate) onProgressUpdate(eased);

      if (t < 1) {
        animId = requestAnimationFrame(tick);
      } else {
        if (onComplete) onComplete();
      }
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, onComplete, onProgressUpdate]);

  // Calculate coordinates of the moving sweep light
  // For Left-to-Right: starts at -10vw, sweeps across to the rest position at 18vw / 18%
  // During the sweep peak (at t = 0.55), it sweeps all the way across to 80% to illuminate the text, then pulls back and settles at 18%!
  
  let currentXPercent = 18;
  let sweepOpacity = 1.0;
  let sweepScale = 1.0;

  if (isPlaying) {
    if (isL2R) {
      if (animProgress < 0.65) {
        // Phase 1: Rapid forward sweep from left edge across the scene
        const p1 = animProgress / 0.65;
        const easeForward = Math.sin((p1 * Math.PI) / 2);
        currentXPercent = -15 + easeForward * 95; // sweeps from -15% to 80%
        sweepScale = 0.8 + easeForward * 0.6;
      } else {
        // Phase 2: Smooth settle and lock into final left portal position (18%)
        const p2 = (animProgress - 0.65) / 0.35;
        const easeSettle = 1 - Math.pow(1 - p2, 3);
        currentXPercent = 80 - easeSettle * 62; // settles from 80% down to 18%
        sweepScale = 1.4 - easeSettle * 0.4;
      }
    } else {
      // Right to left
      if (animProgress < 0.65) {
        const p1 = animProgress / 0.65;
        const easeForward = Math.sin((p1 * Math.PI) / 2);
        currentXPercent = 115 - easeForward * 95;
        sweepScale = 0.8 + easeForward * 0.6;
      } else {
        const p2 = (animProgress - 0.65) / 0.35;
        const easeSettle = 1 - Math.pow(1 - p2, 3);
        currentXPercent = 20 + easeSettle * 62;
        sweepScale = 1.4 - easeSettle * 0.4;
      }
    }
  } else {
    currentXPercent = isL2R ? 18 : 82;
    sweepScale = 1.0;
  }

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      
      {/* ========================================================================= */}
      {/* 1. VOLUMETRIC PORTAL LIGHT BEAM WITH CHROMATIC DISPERSION SIGNATURE       */}
      {/* ========================================================================= */}
      
      {/* Layer A: Golden Amber Outer Halo Ring */}
      <div
        className="absolute rounded-full pointer-events-none transition-transform duration-75"
        style={{
          left: `${currentXPercent}%`,
          top: '50%',
          transform: `translate(-50%, -50%) scale(${sweepScale * 1.15})`,
          width: 'clamp(350px, 45vw, 750px)',
          height: 'clamp(260px, 32vw, 550px)',
          background: `radial-gradient(ellipse at center, rgba(255, 175, 50, ${0.28 * bloomStrength * chromaticIntensity}) 0%, rgba(255, 140, 30, ${0.16 * bloomStrength}) 40%, transparent 75%)`,
          filter: `blur(${45 * bloomStrength}px)`,
          opacity: sweepOpacity,
        }}
      />

      {/* Layer B: Electric Sky-Cyan Optical Rim */}
      <div
        className="absolute rounded-full pointer-events-none transition-transform duration-75"
        style={{
          left: `${currentXPercent + (isL2R ? 3 : -3)}%`,
          top: '50%',
          transform: `translate(-50%, -50%) scale(${sweepScale * 0.95})`,
          width: 'clamp(300px, 38vw, 650px)',
          height: 'clamp(220px, 28vw, 480px)',
          background: `radial-gradient(ellipse at center, rgba(100, 190, 255, ${0.22 * chromaticIntensity}) 0%, rgba(70, 160, 255, ${0.12 * chromaticIntensity}) 45%, transparent 70%)`,
          filter: `blur(${35 * bloomStrength}px)`,
          opacity: sweepOpacity * 0.9,
        }}
      />

      {/* Layer C: Pure Incandescent Blinding White Core */}
      <div
        className="absolute rounded-full pointer-events-none transition-transform duration-75"
        style={{
          left: `${currentXPercent}%`,
          top: '50%',
          transform: `translate(-50%, -50%) scale(${sweepScale})`,
          width: 'clamp(240px, 30vw, 520px)',
          height: 'clamp(170px, 22vw, 380px)',
          background: `radial-gradient(ellipse at center, rgba(255, 255, 255, ${0.65 * bloomStrength}) 0%, rgba(255, 245, 225, ${0.45 * bloomStrength}) 25%, rgba(255, 200, 100, ${0.15 * bloomStrength}) 55%, transparent 75%)`,
          filter: `blur(${24 * bloomStrength}px)`,
          opacity: sweepOpacity,
        }}
      />

      {/* Layer D: Razor-Thin Edge Filament Glare (Horizontal Laser Glint) */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: `${currentXPercent}%`,
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'clamp(180px, 22vw, 400px)',
          height: '3px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.95) 50%, transparent 100%)',
          filter: `blur(1.5px) drop-shadow(0 0 8px #ffffff)`,
          opacity: sweepOpacity * 0.85,
        }}
      />

    </div>
  );
};
