import React, { useRef, useEffect } from 'react';

export interface StippleStarburstVisualizerProps {
  isPlaying?: boolean;
  audioFrequency?: number; // 0 to 1 normalized audio intensity / bass hit
  theme?: 'dark' | 'light';
  className?: string;
  showCardOverlay?: boolean;
  cardNumber?: string;
  cardSuit?: string;
  needleCount?: number;
}

export const StippleStarburstVisualizer: React.FC<StippleStarburstVisualizerProps> = ({
  isPlaying = false,
  audioFrequency = 0.5,
  theme = 'dark',
  className = '',
  showCardOverlay = false,
  cardNumber = '8',
  cardSuit = '♣',
  needleCount = 8,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 320);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 420);

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

    // Particle cloud setup for stipple effect
    const PARTICLE_COUNT = 3200;
    const particles = new Float32Array(PARTICLE_COUNT * 4); // [angle, distFraction, speed, baseAlpha]

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const idx = i * 4;
      particles[idx] = Math.random() * Math.PI * 2; // angle
      // Distribution heavily clustered around center with exponential drop-off
      particles[idx + 1] = Math.pow(Math.random(), 1.7); // distFraction 0..1
      particles[idx + 2] = 0.002 + Math.random() * 0.006; // swirl speed
      particles[idx + 3] = 0.3 + Math.random() * 0.7; // alpha
    }

    let time = 0;

    const render = () => {
      time += 0.02;
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;
      const minDimension = Math.min(width, height);
      const baseRadius = minDimension * 0.22;

      // Audio reactive multiplier
      const energy = isPlaying ? 0.35 + audioFrequency * 0.65 : 0.25;
      const pulse = Math.sin(time * 3) * 0.05 * energy;
      const dynamicRadius = baseRadius * (1 + pulse);

      const isLight = theme === 'light';
      const particleColor = isLight ? '0, 0, 0' : '235, 235, 245';
      const needleColor = isLight ? 'rgba(0, 0, 0, 0.85)' : 'rgba(255, 255, 255, 0.85)';

      // 1. Draw Radiating Needles (8 needles matching the 8 of clubs reference)
      const needles = needleCount;
      for (let i = 0; i < needles; i++) {
        // Asymmetric artistic needle angles as shown in the card reference:
        // Angles radiating outwards towards card corners and cardinal directions
        const baseAngle = (i * (Math.PI * 2)) / needles - Math.PI / 2;
        // Subtle organic sway when playing
        const angle = baseAngle + (isPlaying ? Math.sin(time + i * 1.5) * 0.02 : 0);

        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        // Needle root begins at core perimeter, tapers into long hairline ray
        const rootDist = dynamicRadius * (0.85 + Math.sin(time * 2 + i) * 0.08 * energy);
        const maxDist = minDimension * 0.68 + (isPlaying ? Math.cos(time * 4 + i) * 20 * energy : 0);

        const x1 = centerX + cos * rootDist;
        const y1 = centerY + sin * rootDist;
        const x2 = centerX + cos * maxDist;
        const y2 = centerY + sin * maxDist;

        // Needle base flare: tapered triangular flare transitioning into razor line
        ctx.beginPath();
        const perpX = -sin;
        const perpY = cos;
        const flareWidth = 14 * energy;

        ctx.moveTo(centerX + cos * (rootDist * 0.6) - perpX * flareWidth, centerY + sin * (rootDist * 0.6) - perpY * flareWidth);
        ctx.bezierCurveTo(
          x1 - perpX * (flareWidth * 0.3),
          y1 - perpY * (flareWidth * 0.3),
          x1 + cos * 25,
          y1 + sin * 25,
          x2,
          y2
        );
        ctx.bezierCurveTo(
          x1 - cos * 25,
          y1 - sin * 25,
          centerX + cos * (rootDist * 0.6) + perpX * flareWidth,
          centerY + sin * (rootDist * 0.6) + perpY * flareWidth,
          centerX + cos * (rootDist * 0.6) + perpX * flareWidth,
          centerY + sin * (rootDist * 0.6) + perpY * flareWidth
        );

        ctx.fillStyle = isLight ? `rgba(0, 0, 0, ${0.12 * energy})` : `rgba(255, 255, 255, ${0.12 * energy})`;
        ctx.fill();

        // Razor-sharp needle line
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = needleColor;
        ctx.lineWidth = 1.0;
        ctx.stroke();
      }

      // 2. Draw Procedural Stippled Core
      // Each particle is rendered as a micro stipple point with distance attenuation
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const idx = i * 4;
        let angle = particles[idx];
        const distFrac = particles[idx + 1];
        const speed = particles[idx + 2];
        const baseAlpha = particles[idx + 3];

        // Particle subtle swirl
        if (isPlaying) {
          particles[idx] += speed * (1 + energy);
        }

        // Modulate distance by 8 lobes matching the needles
        const lobeMod = 1 + 0.38 * Math.cos(angle * needles + Math.sin(time + distFrac * 3));
        const currentDist = distFrac * dynamicRadius * lobeMod;

        const px = centerX + Math.cos(angle) * currentDist;
        const py = centerY + Math.sin(angle) * currentDist;

        // Density attenuation: center is dense, edges become fine dither
        const falloff = 1 - Math.pow(distFrac, 1.4);
        const alpha = baseAlpha * falloff * (0.4 + energy * 0.6);

        if (alpha > 0.01) {
          ctx.fillStyle = `rgba(${particleColor}, ${alpha})`;
          // Micro stipple dot size: 0.8 to 1.6 px
          const dotSize = distFrac < 0.25 ? 1.5 : 1.0;
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
  }, [isPlaying, audioFrequency, theme, needleCount]);

  const isLight = theme === 'light';

  return (
    <div
      className={`relative select-none overflow-hidden transition-colors duration-500 ${
        isLight
          ? 'bg-[#f7f6f2] text-zinc-900 border border-zinc-300/80 shadow-2xl'
          : 'bg-[#060609] text-zinc-100 border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.85)]'
      } rounded-3xl ${className}`}
    >
      {/* Visualizer Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block pointer-events-none" />

      {/* Optional Card Corner Typography (Matching 8♣ Reference Image) */}
      {showCardOverlay && (
        <>
          {/* Top Left Card Index */}
          <div className="absolute top-4 left-5 flex flex-col items-center leading-none pointer-events-none z-10">
            <span className="font-mono text-2xl font-black tracking-tighter">{cardNumber}</span>
            <span className="text-base -mt-0.5">{cardSuit}</span>
          </div>

          {/* Bottom Right Inverted Card Index */}
          <div className="absolute bottom-4 right-5 flex flex-col items-center leading-none pointer-events-none z-10 rotate-180">
            <span className="font-mono text-2xl font-black tracking-tighter">{cardNumber}</span>
            <span className="text-base -mt-0.5">{cardSuit}</span>
          </div>
        </>
      )}

      {/* Grain / Noise Filter Overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-25 mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
};
