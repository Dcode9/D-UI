import React, { useEffect, useRef, useState } from 'react';
import { ColorTheme } from '../../types';

interface PerimeterLoaderProps {
  theme: ColorTheme;
  onComplete: () => void;
  onSkip: () => void;
}

export const PerimeterLoader: React.FC<PerimeterLoaderProps> = ({
  theme,
  onComplete,
  onSkip,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [progress, setProgress] = useState<number>(0);
  const [statusText, setStatusText] = useState<string>('IGNITING PERIMETER FLUX');
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let startTime: number | null = null;
    const duration = 2800; // 2.8 seconds for smooth perimeter orbit

    const resize = () => {
      canvas.width = window.innerWidth * window.devicePixelRatio;
      canvas.height = window.innerHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resize();
    window.addEventListener('resize', resize);

    // Particle sparks following the beam
    interface Spark {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      life: number;
    }
    const sparks: Spark[] = [];

    const getPerimeterPoint = (t: number, w: number, h: number) => {
      // Perimeter total length = 2*(w + h)
      // We start at left center (0, h/2) and go clockwise:
      // 1. Up along left edge: (0, h/2) -> (0, 0) [Length = h/2]
      // 2. Right along top edge: (0, 0) -> (w, 0) [Length = w]
      // 3. Down along right edge: (w, 0) -> (w, h) [Length = h]
      // 4. Left along bottom edge: (w, h) -> (0, h) [Length = w]
      // 5. Up along left edge: (0, h) -> (0, h/2) [Length = h/2]
      const totalPerimeter = 2 * (w + h);
      const currentDist = t * totalPerimeter;

      const seg1 = h / 2;
      const seg2 = seg1 + w;
      const seg3 = seg2 + h;
      const seg4 = seg3 + w;

      let x = 0;
      let y = h / 2;
      let edge: 'left-up' | 'top' | 'right' | 'bottom' | 'left-down' = 'left-up';

      if (currentDist <= seg1) {
        // Up along left edge
        x = 0;
        y = h / 2 - (currentDist / seg1) * (h / 2);
        edge = 'left-up';
      } else if (currentDist <= seg2) {
        // Right along top
        const d = currentDist - seg1;
        x = (d / w) * w;
        y = 0;
        edge = 'top';
      } else if (currentDist <= seg3) {
        // Down along right
        const d = currentDist - seg2;
        x = w;
        y = (d / h) * h;
        edge = 'right';
      } else if (currentDist <= seg4) {
        // Left along bottom
        const d = currentDist - seg3;
        x = w - (d / w) * w;
        y = h;
        edge = 'bottom';
      } else {
        // Up along left to center
        const d = currentDist - seg4;
        x = 0;
        y = h - (d / (h / 2)) * (h / 2);
        edge = 'left-down';
      }

      return { x, y, edge };
    };

    const render = (time: number) => {
      if (!startTime) startTime = time;
      const elapsed = time - startTime;
      const rawProgress = Math.min(elapsed / duration, 1.0);

      // Smooth custom easing
      const easedProgress =
        rawProgress < 0.5
          ? 2 * rawProgress * rawProgress
          : -1 + (4 - 2 * rawProgress) * rawProgress;

      const currentProgressPercent = Math.floor(rawProgress * 100);
      setProgress(currentProgressPercent);

      // Update telemetry status text
      if (rawProgress < 0.25) {
        setStatusText('INITIALIZING LEFT PERIMETER FLUX');
      } else if (rawProgress < 0.5) {
        setStatusText('CALIBRATING TOP-RIGHT OPTIC CIRCUIT');
      } else if (rawProgress < 0.75) {
        setStatusText('STABILIZING BOTTOM VECTOR FIELD');
      } else if (rawProgress < 0.95) {
        setStatusText("CONVERGING 'D' SPATIAL SINGULARITY");
      } else {
        setStatusText('PORTAL READY // IGNITING');
      }

      const w = window.innerWidth;
      const h = window.innerHeight;

      // Draw pure obsidian void
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, w, h);

      // Draw faint baseline border wireframe
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      ctx.strokeRect(0, 0, w, h);

      // Sample positions for beam trail
      const trailLength = 0.25; // fraction of perimeter
      const trailSteps = 40;
      const point = getPerimeterPoint(easedProgress, w, h);

      // Emit sparks at beam tip
      if (rawProgress < 0.98 && Math.random() < 0.6) {
        sparks.push({
          x: point.x,
          y: point.y,
          vx: (Math.random() - 0.5) * 3 + (point.x === 0 ? 2 : point.x === w ? -2 : 0),
          vy: (Math.random() - 0.5) * 3 + (point.y === 0 ? 2 : point.y === h ? -2 : 0),
          size: Math.random() * 2 + 1,
          alpha: 1,
          life: 1,
        });
      }

      // Draw trailing glowing path
      for (let i = 0; i < trailSteps; i++) {
        const stepFrac = i / trailSteps;
        const trailT = Math.max(0, easedProgress - stepFrac * trailLength);
        const p1 = getPerimeterPoint(trailT, w, h);
        const p2 = getPerimeterPoint(
          Math.max(0, trailT - trailLength / trailSteps),
          w,
          h
        );

        const alpha = Math.pow(1 - stepFrac, 1.8) * (1 - (rawProgress > 0.95 ? (rawProgress - 0.95) / 0.05 : 0));
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = theme.primary;
        ctx.globalAlpha = alpha * 0.8;
        ctx.lineWidth = 2 + (1 - stepFrac) * 3;
        ctx.stroke();
      }

      // Draw high-intensity light spill from active edge into center void
      const innerGradient = ctx.createRadialGradient(
        point.x,
        point.y,
        0,
        point.x,
        point.y,
        Math.min(w, h) * 0.45
      );
      innerGradient.addColorStop(0, theme.glow);
      innerGradient.addColorStop(0.3, theme.glow.replace(/[\d.]+\)$/g, '0.08)'));
      innerGradient.addColorStop(1, 'transparent');

      ctx.fillStyle = innerGradient;
      ctx.globalAlpha = 0.9;
      ctx.fillRect(0, 0, w, h);

      // Draw white-hot energy core head
      ctx.globalAlpha = 1;
      const headGlow = ctx.createRadialGradient(
        point.x,
        point.y,
        0,
        point.x,
        point.y,
        35
      );
      headGlow.addColorStop(0, '#ffffff');
      headGlow.addColorStop(0.2, '#ffffff');
      headGlow.addColorStop(0.5, theme.primary);
      headGlow.addColorStop(1, 'transparent');

      ctx.fillStyle = headGlow;
      ctx.beginPath();
      ctx.arc(point.x, point.y, 35, 0, Math.PI * 2);
      ctx.fill();

      // Render & update sparks
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx;
        s.y += s.vy;
        s.life -= 0.03;
        s.alpha = s.life;

        if (s.life <= 0) {
          sparks.splice(i, 1);
          continue;
        }

        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = s.alpha * 0.9;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;

      if (rawProgress < 1.0) {
        animationFrameId = requestAnimationFrame(render);
      } else {
        // Trace finished! Trigger convergence & fade out
        setIsFadingOut(true);
        setTimeout(() => {
          onComplete();
        }, 500);
      }
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, [theme, onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col justify-between p-6 md:p-10 pointer-events-auto bg-black transition-opacity duration-700 ${
        isFadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background Canvas for Border Tracing */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      {/* Top Telemetry Header */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-2.5 h-2.5 rounded-full animate-ping"
            style={{ backgroundColor: theme.primary }}
          />
          <div className="flex flex-col">
            <span className="font-mono text-xs tracking-widest text-zinc-400 font-medium">
              D&apos;VERSE ARCHITECTURE // V3.0
            </span>
            <span className="font-mono text-[10px] text-zinc-600">
              ORIGIN: DCODE9 ECOSYSTEM
            </span>
          </div>
        </div>

        {/* Skip Button */}
        <button
          onClick={onSkip}
          className="glass-pill-btn group flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono text-zinc-300 hover:text-white transition-all cursor-pointer"
        >
          <span>SKIP SEQUENCE</span>
          <span className="text-zinc-500 group-hover:translate-x-0.5 transition-transform">
            &rarr;
          </span>
        </button>
      </div>

      {/* Center Pitch-Black Core with Minimal Dynamic Pulse */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto">
        <div className="relative flex items-center justify-center">
          {/* Subtle concentric aura in the pitch black center */}
          <div
            className="w-32 h-32 md:w-48 md:h-48 rounded-full border border-white/5 animate-ping opacity-20 pointer-events-none"
            style={{ borderColor: theme.primary }}
          />

          <div className="absolute text-center flex flex-col items-center">
            <span
              className="text-4xl md:text-6xl font-black tracking-tighter"
              style={{
                background: `linear-gradient(135deg, #ffffff 30%, ${theme.primary} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: `drop-shadow(0 0 25px ${theme.primary})`,
              }}
            >
              D&apos;
            </span>
            <span className="font-mono text-[11px] tracking-[0.3em] text-zinc-500 mt-2">
              INITIATING
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Progress & Status Bar */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 font-mono text-xs text-zinc-400">
            <span
              className="inline-block w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: theme.primary }}
            />
            <span className="tracking-wider">{statusText}</span>
          </div>
          <div className="w-48 md:w-64 h-1 bg-zinc-900 rounded-full overflow-hidden border border-white/10">
            <div
              className="h-full transition-all duration-75 rounded-full"
              style={{
                width: `${progress}%`,
                background: `linear-gradient(90deg, ${theme.secondary}, ${theme.primary})`,
                boxShadow: `0 0 12px ${theme.primary}`,
              }}
            />
          </div>
        </div>

        <div className="font-mono text-2xl md:text-3xl font-bold tracking-tight text-white flex items-baseline gap-1">
          <span>{progress.toString().padStart(2, '0')}</span>
          <span className="text-sm font-normal text-zinc-500">%</span>
        </div>
      </div>
    </div>
  );
};
