import React, { useRef, useEffect } from 'react';

export interface StippleNoiseBlurProps {
  /** Whether the parent is in an active/playing state */
  active?: boolean;
  /** Triggered on press/click to create an impulse dispersion */
  impulse?: number;
  /** Maximum radius of the stipple blur (in pixels) */
  radius?: number;
  /** Inner core radius before stipple falloff starts (in pixels) */
  innerRadius?: number;
  /** Number of stipple grain dots */
  density?: number;
  /** Size of each stipple dot in pixels (default: 1.0) */
  dotSize?: number;
  /** Number of needle spikes radiating from the blur (0 = smooth circle, 8 = matching 8♣ reference) */
  needleCount?: number;
  /** Length of the needle spikes beyond the radius (in pixels) */
  needleLength?: number;
  /** Color of the noise blur: 'light' (black ink for paper) or 'dark' (pure white for obsidian) */
  theme?: 'dark' | 'light';
  /** Degree of animated breathing/turbulence (0 = static, 1 = alive) */
  turbulence?: number;
  /** Falloff exponent curve: higher = sharper drop-off, lower = softer fog */
  falloff?: number;
  className?: string;
}

export const StippleNoiseBlur: React.FC<StippleNoiseBlurProps> = ({
  active = false,
  impulse = 0,
  radius = 90,
  innerRadius = 24,
  density = 2400,
  dotSize = 1.0,
  needleCount = 8,
  needleLength = 60,
  theme = 'dark',
  turbulence = 0.5,
  falloff = 1.6,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const impulseRef = useRef<number>(0);

  // Trigger impulse burst when impulse prop increments
  useEffect(() => {
    if (impulse > 0) {
      impulseRef.current = 1.0;
    }
  }, [impulse]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let width = 0;
    let height = 0;

    const handleResize = () => {
      if (!canvas.parentElement) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.parentElement.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Pre-generate particle distribution arrays
    const count = Math.min(density, 8000);
    // [angle, distFraction, baseAlpha, speed, jitterOffset]
    const particles = new Float32Array(count * 5);

    for (let i = 0; i < count; i++) {
      const idx = i * 5;
      particles[idx] = Math.random() * Math.PI * 2; // angle
      particles[idx + 1] = Math.pow(Math.random(), falloff); // radial distance fraction 0..1
      particles[idx + 2] = 0.35 + Math.random() * 0.65; // base opacity
      particles[idx + 3] = (Math.random() - 0.5) * 0.012; // swirl drift
      particles[idx + 4] = Math.random() * Math.PI * 2; // jitter phase
    }

    let time = 0;

    const render = () => {
      time += 0.02 * turbulence;

      // Decay impulse smoothly
      if (impulseRef.current > 0.01) {
        impulseRef.current *= 0.91; // smooth exponential decay
      } else {
        impulseRef.current = 0;
      }

      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      const isLight = theme === 'light';
      // In light mode (paper), ink is pure black. In dark mode, titanium white. NO colors.
      const dotColor = isLight ? '0, 0, 0' : '255, 255, 255';
      const needleStrokeColor = isLight ? 'rgba(0, 0, 0, 0.85)' : 'rgba(255, 255, 255, 0.85)';
      const needleFlareFill = isLight ? 'rgba(0, 0, 0, 0.09)' : 'rgba(255, 255, 255, 0.09)';

      // Dynamic expansion from active state and click impulse
      const impulseExpansion = impulseRef.current * 28;
      const activePulse = active ? Math.sin(time * 3) * 6 : 0;
      const currentRadius = radius + impulseExpansion + activePulse;
      const currentNeedleLength = needleLength + impulseExpansion * 1.5;

      // 1. Draw Radiating Needles (if needleCount > 0, matching the uploaded 8♣ card)
      if (needleCount > 0) {
        for (let i = 0; i < needleCount; i++) {
          const baseAngle = (i * (Math.PI * 2)) / needleCount - Math.PI / 2;
          const angle = baseAngle + (active ? Math.sin(time + i) * 0.015 : 0);
          const cos = Math.cos(angle);
          const sin = Math.sin(angle);

          const rootDist = Math.max(innerRadius, currentRadius * 0.45);
          const tipDist = currentRadius + currentNeedleLength;

          const x1 = centerX + cos * rootDist;
          const y1 = centerY + sin * rootDist;
          const x2 = centerX + cos * tipDist;
          const y2 = centerY + sin * tipDist;

          // Needle Tapered Flare (curved triangular root tapering into needle)
          const perpX = -sin;
          const perpY = cos;
          const flareWidth = 10 + impulseRef.current * 6;

          ctx.beginPath();
          ctx.moveTo(centerX + cos * (rootDist * 0.7) - perpX * flareWidth, centerY + sin * (rootDist * 0.7) - perpY * flareWidth);
          ctx.bezierCurveTo(
            x1 - perpX * (flareWidth * 0.4),
            y1 - perpY * (flareWidth * 0.4),
            x1 + cos * 15,
            y1 + sin * 15,
            x2,
            y2
          );
          ctx.bezierCurveTo(
            x1 - cos * 15,
            y1 - sin * 15,
            centerX + cos * (rootDist * 0.7) + perpX * flareWidth,
            centerY + sin * (rootDist * 0.7) + perpY * flareWidth,
            centerX + cos * (rootDist * 0.7) + perpX * flareWidth,
            centerY + sin * (rootDist * 0.7) + perpY * flareWidth
          );
          ctx.fillStyle = needleFlareFill;
          ctx.fill();

          // Needle Hairline
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.strokeStyle = needleStrokeColor;
          ctx.lineWidth = 0.85;
          ctx.stroke();
        }
      }

      // 2. Render Stippled Particles
      for (let i = 0; i < count; i++) {
        const idx = i * 5;
        let angle = particles[idx];
        const distFrac = particles[idx + 1];
        const baseAlpha = particles[idx + 2];
        const speed = particles[idx + 3];
        const jitterPhase = particles[idx + 4];

        if (turbulence > 0) {
          particles[idx] += speed * (1 + impulseRef.current * 2);
        }

        // Modulation by needle lobes if needles exist
        let lobeMod = 1.0;
        if (needleCount > 0) {
          lobeMod = 1 + 0.35 * Math.cos(angle * needleCount);
        }

        const effectiveDist = innerRadius + distFrac * (currentRadius - innerRadius) * lobeMod;

        // Subtle organic breathing jitter
        const jitter = turbulence > 0 ? Math.sin(time * 2 + jitterPhase) * 1.5 : 0;
        const px = centerX + Math.cos(angle) * (effectiveDist + jitter);
        const py = centerY + Math.sin(angle) * (effectiveDist + jitter);

        // Density Falloff: high density near innerRadius, feathering out to sparse micro-dots
        const fade = Math.pow(1 - distFrac, 1.2);
        const impulseAlphaBoost = impulseRef.current * 0.3;
        const alpha = Math.min(1, baseAlpha * fade * (active ? 0.9 : 0.6) + impulseAlphaBoost);

        if (alpha > 0.02) {
          ctx.fillStyle = `rgba(${dotColor}, ${alpha})`;
          ctx.fillRect(px, py, dotSize, dotSize);
        }
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [active, radius, innerRadius, density, dotSize, needleCount, needleLength, theme, turbulence, falloff]);

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-visible select-none flex items-center justify-center ${className}`}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block pointer-events-none" />
    </div>
  );
};
