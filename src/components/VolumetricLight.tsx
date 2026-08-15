import React, { useEffect, useRef } from 'react';
import { LightState } from '../hooks/usePerimeterPhysics';

interface VolumetricLightProps {
  light: LightState;
}

export const VolumetricLight: React.FC<VolumetricLightProps> = ({ light }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dustParticlesRef = useRef<
    Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      baseAlpha: number;
    }>
  >([]);

  // Initialize atmospheric dust motes
  useEffect(() => {
    const particleCount = 140;
    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        size: Math.random() * 1.5 + 0.5,
        baseAlpha: Math.random() * 0.6 + 0.2,
      });
    }
    dustParticlesRef.current = particles;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;

    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    // Clear with pure obsidian black
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, w, h);

    const { x, y, nx, ny } = light;
    const maxDimension = Math.hypot(w, h);
    const beamLength = Math.min(w, h) * 0.95;

    // =========================================================================
    // LAYER 1: WIDE VOLUMETRIC DIFFUSION CONE (The Warm Amber Ambient Atmosphere)
    // =========================================================================
    const targetX = x + nx * beamLength;
    const targetY = y + ny * beamLength;

    // Radial gradient centered at the emitter
    const gradRadius = Math.max(w, h) * 0.85;
    const ambientGrad = ctx.createRadialGradient(x, y, 0, x, y, gradRadius);

    ambientGrad.addColorStop(0, 'rgba(255, 255, 255, 1.0)'); // Blinding pure white
    ambientGrad.addColorStop(0.04, 'rgba(255, 250, 238, 0.95)'); // Warm white core
    ambientGrad.addColorStop(0.12, 'rgba(255, 226, 175, 0.85)'); // Warm cream/gold
    ambientGrad.addColorStop(0.26, 'rgba(238, 160, 50, 0.62)'); // Luminous amber
    ambientGrad.addColorStop(0.48, 'rgba(180, 92, 20, 0.32)'); // Deep warm bronze
    ambientGrad.addColorStop(0.72, 'rgba(85, 34, 6, 0.12)'); // Deep dusk haze
    ambientGrad.addColorStop(0.92, 'rgba(20, 6, 1, 0.03)');
    ambientGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');

    ctx.fillStyle = ambientGrad;
    ctx.fillRect(0, 0, w, h);

    // =========================================================================
    // LAYER 2: DIRECTIONAL CONE SEARCHLIGHT (Grok 3 Style Beam Projection)
    // =========================================================================
    // Project cone into screen
    const coneAngle = 1.35; // ~77 degrees half-spread
    const leftRayAngle = light.angle - coneAngle;
    const rightRayAngle = light.angle + coneAngle;

    const r = maxDimension * 0.9;
    const p1x = x + Math.cos(leftRayAngle) * r;
    const p1y = y + Math.sin(leftRayAngle) * r;
    const p2x = x + Math.cos(rightRayAngle) * r;
    const p2y = y + Math.sin(rightRayAngle) * r;

    const coneGrad = ctx.createRadialGradient(x, y, 0, targetX, targetY, r);
    coneGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    coneGrad.addColorStop(0.06, 'rgba(255, 245, 225, 0.85)');
    coneGrad.addColorStop(0.22, 'rgba(255, 205, 120, 0.55)');
    coneGrad.addColorStop(0.5, 'rgba(215, 125, 30, 0.22)');
    coneGrad.addColorStop(0.8, 'rgba(110, 45, 8, 0.05)');
    coneGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(p1x, p1y);
    ctx.lineTo(p2x, p2y);
    ctx.closePath();
    ctx.fillStyle = coneGrad;
    ctx.fill();

    // =========================================================================
    // LAYER 3: INTENSE EDGE BEZEL BLOOM (The Blinding Bezel Rim)
    // =========================================================================
    // An elongated ellipse along the edge that provides blinding white-hot bezel light
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(light.angle);

    // Ellipse centered at (0, 0) with major axis along the bezel (y-axis in local frame)
    const bezelBloom = ctx.createRadialGradient(0, 0, 0, 0, 0, 240);
    bezelBloom.addColorStop(0, '#ffffff');
    bezelBloom.addColorStop(0.12, 'rgba(255, 255, 250, 0.98)');
    bezelBloom.addColorStop(0.3, 'rgba(255, 235, 190, 0.85)');
    bezelBloom.addColorStop(0.55, 'rgba(240, 165, 55, 0.45)');
    bezelBloom.addColorStop(0.85, 'rgba(170, 80, 15, 0.12)');
    bezelBloom.addColorStop(1.0, 'transparent');

    ctx.fillStyle = bezelBloom;
    ctx.scale(1.0, 2.2); // Elongate along the bezel edge
    ctx.beginPath();
    ctx.arc(0, 0, 200, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // =========================================================================
    // LAYER 4: ATMOSPHERIC DUST PARTICLES
    // =========================================================================
    const particles = dustParticlesRef.current;
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;

      // Calculate distance to light
      const dx = p.x - x;
      const dy = p.y - y;
      const dist = Math.hypot(dx, dy);

      // Dot product with light normal (only illuminate particles in front of the beam)
      const dot = (dx * nx + dy * ny) / (dist || 1);

      if (dot > 0.1 && dist < maxDimension * 0.7) {
        const illumination =
          Math.pow(1 - dist / (maxDimension * 0.7), 1.6) * Math.max(0, dot);
        const alpha = p.baseAlpha * illumination * 0.8;

        if (alpha > 0.02) {
          ctx.fillStyle = dist < 250 ? '#ffffff' : 'rgba(255, 220, 160, 0.9)';
          ctx.globalAlpha = Math.min(1, alpha);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    ctx.restore();
  }, [light]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
    />
  );
};
