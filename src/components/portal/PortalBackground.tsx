import React, { useEffect, useRef } from 'react';
import { ColorTheme, OpticsSettings } from '../../types';

interface PortalBackgroundProps {
  theme: ColorTheme;
  optics: OpticsSettings;
  mousePos: { x: number; y: number };
}

export const PortalBackground: React.FC<PortalBackgroundProps> = ({
  theme,
  optics,
  mousePos,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const resize = () => {
      canvas.width = window.innerWidth * window.devicePixelRatio;
      canvas.height = window.innerHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resize();
    window.addEventListener('resize', resize);

    // Particle Stars
    const starCount = Math.floor(optics.particleDensity * 1.5);
    interface Star {
      x: number;
      y: number;
      size: number;
      baseAlpha: number;
      speed: number;
      twinkleSpeed: number;
      twinklePhase: number;
      color: string;
    }

    const stars: Star[] = [];
    for (let i = 0; i < starCount; i++) {
      const isCyan = Math.random() < 0.25;
      stars.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 1.8 + 0.5,
        baseAlpha: Math.random() * 0.7 + 0.2,
        speed: Math.random() * 0.15 + 0.02,
        twinkleSpeed: Math.random() * 0.03 + 0.01,
        twinklePhase: Math.random() * Math.PI * 2,
        color: isCyan ? theme.primary : '#ffffff',
      });
    }

    let time = 0;

    const render = () => {
      time += 0.02 * optics.pulseSpeed;
      const w = window.innerWidth;
      const h = window.innerHeight;

      // Deep space black background
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, w, h);

      // Subtle dynamic galactic backdrop gradient
      const bgGrad = ctx.createRadialGradient(
        0,
        h * 0.5,
        0,
        0,
        h * 0.5,
        w * 0.8
      );
      bgGrad.addColorStop(0, theme.glow.replace(/[\d.]+\)$/g, `${0.12 * optics.glowIntensity})`));
      bgGrad.addColorStop(0.4, theme.glow.replace(/[\d.]+\)$/g, `${0.03 * optics.glowIntensity})`));
      bgGrad.addColorStop(1, 'transparent');

      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Render Stars with subtle parallax from mouse
      const mouseOffsetX = (mousePos.x / w - 0.5) * 20;
      const mouseOffsetY = (mousePos.y / h - 0.5) * 20;

      for (const s of stars) {
        // Slow continuous horizontal drift
        s.x -= s.speed;
        if (s.x < 0) s.x = w;

        s.twinklePhase += s.twinkleSpeed;
        const currentAlpha =
          s.baseAlpha + Math.sin(s.twinklePhase) * 0.25;

        const posX = s.x + mouseOffsetX * (s.size / 2);
        const posY = s.y + mouseOffsetY * (s.size / 2);

        ctx.fillStyle = s.color;
        ctx.globalAlpha = Math.max(0.05, Math.min(1, currentAlpha));
        ctx.beginPath();
        ctx.arc(posX, posY, s.size, 0, Math.PI * 2);
        ctx.fill();

        // Extra soft glow around larger stars
        if (s.size > 1.4) {
          ctx.fillStyle = theme.primary;
          ctx.globalAlpha = currentAlpha * 0.2 * optics.glowIntensity;
          ctx.beginPath();
          ctx.arc(posX, posY, s.size * 3.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1;
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, [theme, optics, mousePos]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      
      {/* Noise Texture Overlay for Rich Organic Cinematic Texture */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.15) 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />
    </div>
  );
};
