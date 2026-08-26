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
  let currentXPercent = 18;
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

  // Only render during the active intro sweep animation (once settled, the text's own atmospheric bloom handles resting glow)
  if (!isPlaying) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      
      {/* ========================================================================= */}
      {/* 1. ORGANIC VOLUMETRIC PORTAL BEAM (No hard rectangles / zero clipping)    */}
      {/* ========================================================================= */}
      
      {/* Layer A: Golden Amber Outer Halo Ring */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          left: `${currentXPercent}%`,
          top: '50%',
          transform: `translate(-50%, -50%) scale(${sweepScale * 1.15})`,
          width: 'clamp(380px, 48vw, 800px)',
          height: 'clamp(280px, 35vw, 580px)',
          background: `radial-gradient(ellipse at center, rgba(255, 165, 45, ${0.32 * bloomStrength * chromaticIntensity}) 0%, rgba(255, 130, 25, ${0.18 * bloomStrength}) 40%, transparent 75%)`,
          filter: `blur(${50 * bloomStrength}px)`,
          opacity: 0.9,
        }}
      />

      {/* Layer B: Electric Sky-Cyan Optical Rim */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          left: `${currentXPercent + (isL2R ? 4 : -4)}%`,
          top: '50%',
          transform: `translate(-50%, -50%) scale(${sweepScale * 0.95})`,
          width: 'clamp(320px, 40vw, 680px)',
          height: 'clamp(240px, 30vw, 500px)',
          background: `radial-gradient(ellipse at center, rgba(90, 180, 255, ${0.25 * chromaticIntensity}) 0%, rgba(60, 150, 255, ${0.12 * chromaticIntensity}) 45%, transparent 70%)`,
          filter: `blur(${38 * bloomStrength}px)`,
          opacity: 0.85,
        }}
      />

      {/* Layer C: Pure Incandescent Blinding White Core */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          left: `${currentXPercent}%`,
          top: '50%',
          transform: `translate(-50%, -50%) scale(${sweepScale})`,
          width: 'clamp(250px, 32vw, 540px)',
          height: 'clamp(180px, 24vw, 400px)',
          background: `radial-gradient(ellipse at center, rgba(255, 255, 255, ${0.65 * bloomStrength}) 0%, rgba(255, 242, 220, ${0.42 * bloomStrength}) 25%, rgba(255, 190, 80, ${0.14 * bloomStrength}) 55%, transparent 75%)`,
          filter: `blur(${26 * bloomStrength}px)`,
          opacity: 0.95,
        }}
      />

    </div>
  );
};
