import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';

export interface CanvasFluidLightEngineProps {
  onStateChange?: (state: 1 | 2 | 3) => void;
  targetElementRef?: React.RefObject<HTMLElement | null>;
  autoPlay?: boolean;
}

export interface CanvasFluidLightEngineHandle {
  setPageReady: () => void;
  replay: () => void;
  getState: () => 1 | 2 | 3;
}

export const CanvasFluidLightEngine = forwardRef<CanvasFluidLightEngineHandle, CanvasFluidLightEngineProps>(
  ({ onStateChange, targetElementRef, autoPlay = true }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const onStateChangeRef = useRef(onStateChange);

    useEffect(() => {
      onStateChangeRef.current = onStateChange;
    });

    const stateRef = useRef<{
      activeViewState: 1 | 2 | 3; // 1 = Perimeter Orbit, 2 = Center Sweep, 3 = Settled
      animFrameId: number | null;
      orbitDistance: number; // in pixels along perimeter
      orbitStartTime: number;
      lastTime: number;
      isPageReady: boolean;
      sweepStartTime: number;
      settledGlowPos: number; // percent
    }>({
      activeViewState: 1,
      animFrameId: null,
      orbitDistance: 0,
      orbitStartTime: performance.now(),
      lastTime: performance.now(),
      isPageReady: false,
      sweepStartTime: 0,
      settledGlowPos: 18,
    });

    // Configuration constants
    const CORNER_RADIUS = 28;
    const SWEEP_DURATION_MS = 1450; // 1.45s buttery smooth horizontal sweep

    // 1. Precise Perimeter Geometry starting from the MIDDLE OF THE LEFT EDGE
    const getPerimeterPoint = (dist: number, W: number, H: number, R: number) => {
      const L_V = Math.max(10, H - 2 * R);
      const L_H = Math.max(10, W - 2 * R);
      const L_arc = (Math.PI / 2) * R;
      const P = 2 * L_V + 2 * L_H + 4 * L_arc;

      let d = ((dist % P) + P) % P;

      // Segment 1: Upper half of Left Edge (going UP from (0, H/2) to (0, R))
      const seg1 = L_V / 2;
      if (d < seg1) {
        const t = d / seg1;
        return {
          x: 0,
          y: H / 2 - t * (H / 2 - R),
          nx: 1,
          ny: 0,
          angle: -Math.PI / 2,
        };
      }
      d -= seg1;

      // Segment 2: Top-Left Corner Arc (from (0, R) to (R, 0))
      if (d < L_arc) {
        const u = d / L_arc;
        const a = Math.PI - u * (Math.PI / 2); // pi -> pi/2
        return {
          x: R + R * Math.cos(a),
          y: R - R * Math.sin(a),
          nx: Math.cos(a + Math.PI),
          ny: Math.sin(a),
          angle: -Math.PI / 2 + u * (Math.PI / 2),
        };
      }
      d -= L_arc;

      // Segment 3: Top Edge (going RIGHT from (R, 0) to (W - R, 0))
      if (d < L_H) {
        const t = d / L_H;
        return {
          x: R + t * L_H,
          y: 0,
          nx: 0,
          ny: 1,
          angle: 0,
        };
      }
      d -= L_H;

      // Segment 4: Top-Right Corner Arc (from (W - R, 0) to (W, R))
      if (d < L_arc) {
        const u = d / L_arc;
        const a = Math.PI / 2 - u * (Math.PI / 2); // pi/2 -> 0
        return {
          x: W - R + R * Math.cos(a),
          y: R - R * Math.sin(a),
          nx: -Math.cos(a),
          ny: Math.sin(a),
          angle: u * (Math.PI / 2),
        };
      }
      d -= L_arc;

      // Segment 5: Right Edge (going DOWN from (W, R) to (W, H - R))
      // Notice: Middle of Right Edge is at d = L_V / 2!
      if (d < L_V) {
        const t = d / L_V;
        return {
          x: W,
          y: R + t * L_V,
          nx: -1,
          ny: 0,
          angle: Math.PI / 2,
        };
      }
      d -= L_V;

      // Segment 6: Bottom-Right Corner Arc (from (W, H - R) to (W - R, H))
      if (d < L_arc) {
        const u = d / L_arc;
        const a = 0 - u * (Math.PI / 2); // 0 -> -pi/2
        return {
          x: W - R + R * Math.cos(a),
          y: H - R - R * Math.sin(a),
          nx: -Math.cos(a),
          ny: -Math.sin(a),
          angle: Math.PI / 2 + u * (Math.PI / 2),
        };
      }
      d -= L_arc;

      // Segment 7: Bottom Edge (going LEFT from (W - R, H) to (R, H))
      if (d < L_H) {
        const t = d / L_H;
        return {
          x: W - R - t * L_H,
          y: H,
          nx: 0,
          ny: -1,
          angle: Math.PI,
        };
      }
      d -= L_H;

      // Segment 8: Bottom-Left Corner Arc (from (R, H) to (0, H - R))
      if (d < L_arc) {
        const u = d / L_arc;
        const a = -Math.PI / 2 - u * (Math.PI / 2); // -pi/2 -> -pi
        return {
          x: R + R * Math.cos(a),
          y: H - R - R * Math.sin(a),
          nx: Math.cos(a + Math.PI),
          ny: -Math.sin(a),
          angle: Math.PI + u * (Math.PI / 2),
        };
      }
      d -= L_arc;

      // Segment 9: Lower half of Left Edge (going UP from (0, H - R) to (0, H/2))
      const t = d / (L_V / 2);
      return {
        x: 0,
        y: H - R - t * (H / 2 - R),
        nx: 1,
        ny: 0,
        angle: -Math.PI / 2,
      };
    };

    // 2. High-Fidelity Volumetric Glow Renderer (Zero Boundary Cutoffs, 100% Fades to Null)
    const drawVolumetricBeam = (
      ctx: CanvasRenderingContext2D,
      px: number,
      py: number,
      beamW: number,
      beamH: number,
      intensity: number = 1.0
    ) => {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';

      // Layer 1: Wide Diffuse Atmospheric Halo (Fades completely to 0 null well before edge)
      const maxRadius = Math.max(beamW, beamH) * 1.8;
      const diffuseGrad = ctx.createRadialGradient(px, py, 0, px, py, maxRadius);
      diffuseGrad.addColorStop(0, `rgba(255, 175, 55, ${0.4 * intensity})`);
      diffuseGrad.addColorStop(0.18, `rgba(255, 135, 30, ${0.22 * intensity})`);
      diffuseGrad.addColorStop(0.35, `rgba(90, 160, 255, ${0.1 * intensity})`);
      diffuseGrad.addColorStop(0.55, `rgba(30, 80, 200, ${0.025 * intensity})`);
      diffuseGrad.addColorStop(0.75, `rgba(10, 30, 100, ${0.003 * intensity})`);
      diffuseGrad.addColorStop(0.9, 'rgba(0, 0, 0, 0)');
      diffuseGrad.addColorStop(1, 'rgba(0, 0, 0, 0)'); // Strict null falloff

      ctx.fillStyle = diffuseGrad;
      ctx.beginPath();
      ctx.arc(px, py, maxRadius, 0, Math.PI * 2);
      ctx.fill();

      // Layer 2: Electric Cyan Core Corona
      const cyanRadius = maxRadius * 0.55;
      const cyanGrad = ctx.createRadialGradient(px, py, 0, px, py, cyanRadius);
      cyanGrad.addColorStop(0, `rgba(220, 245, 255, ${0.6 * intensity})`);
      cyanGrad.addColorStop(0.25, `rgba(90, 190, 255, ${0.28 * intensity})`);
      cyanGrad.addColorStop(0.5, `rgba(40, 140, 255, ${0.05 * intensity})`);
      cyanGrad.addColorStop(0.8, 'rgba(0, 0, 0, 0)');
      cyanGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = cyanGrad;
      ctx.beginPath();
      ctx.arc(px, py, cyanRadius, 0, Math.PI * 2);
      ctx.fill();

      // Layer 3: Blinding Incandescent White Core Filament
      const coreRadius = maxRadius * 0.25;
      const coreGrad = ctx.createRadialGradient(px, py, 0, px, py, coreRadius);
      coreGrad.addColorStop(0, `rgba(255, 255, 255, ${0.98 * intensity})`);
      coreGrad.addColorStop(0.3, `rgba(255, 250, 240, ${0.8 * intensity})`);
      coreGrad.addColorStop(0.6, `rgba(230, 240, 255, ${0.2 * intensity})`);
      coreGrad.addColorStop(0.85, 'rgba(0, 0, 0, 0)');
      coreGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(px, py, coreRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    // 3. Fluid Perimeter Ribbon Render (40-node local bending geometry)
    const drawPerimeterRibbon = (
      ctx: CanvasRenderingContext2D,
      W: number,
      H: number,
      R: number,
      centerDist: number
    ) => {
      const beamLen = Math.min(W, H) * 0.65;
      const startDist = centerDist - beamLen / 2;
      const N = 40;

      const innerPoints: { x: number; y: number }[] = [];
      const outerPoints: { x: number; y: number }[] = [];

      for (let i = 0; i < N; i++) {
        const t = i / (N - 1);
        const nodeDist = startDist + t * beamLen;
        const node = getPerimeterPoint(nodeDist, W, H, R);

        // Sinusoidal bell-curve envelope for natural tapered fluid tail
        const envelope = Math.sin(t * Math.PI);
        const spread = 45 * envelope;

        innerPoints.push({
          x: node.x + node.nx * spread,
          y: node.y + node.ny * spread,
        });
        outerPoints.push({
          x: node.x - node.nx * (spread * 0.15),
          y: node.y - node.ny * (spread * 0.15),
        });
      }

      ctx.save();
      ctx.globalCompositeOperation = 'screen';

      // Multi-layer diffuse fluid fill
      ctx.beginPath();
      ctx.moveTo(outerPoints[0].x, outerPoints[0].y);
      for (let i = 1; i < N; i++) ctx.lineTo(outerPoints[i].x, outerPoints[i].y);
      for (let i = N - 1; i >= 0; i--) ctx.lineTo(innerPoints[i].x, innerPoints[i].y);
      ctx.closePath();

      const centerNode = getPerimeterPoint(centerDist, W, H, R);
      const grad = ctx.createRadialGradient(
        centerNode.x,
        centerNode.y,
        0,
        centerNode.x,
        centerNode.y,
        beamLen * 0.7
      );
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      grad.addColorStop(0.2, 'rgba(255, 200, 90, 0.65)');
      grad.addColorStop(0.5, 'rgba(100, 180, 255, 0.25)');
      grad.addColorStop(0.8, 'rgba(40, 100, 220, 0.05)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = grad;
      ctx.fill();

      // Razor white core ribbon
      ctx.beginPath();
      ctx.moveTo(outerPoints[0].x, outerPoints[0].y);
      for (let i = 1; i < N; i++) ctx.lineTo(outerPoints[i].x, outerPoints[i].y);
      for (let i = N - 1; i >= 0; i--) {
        const cx = (outerPoints[i].x + innerPoints[i].x) / 2;
        const cy = (outerPoints[i].y + innerPoints[i].y) / 2;
        ctx.lineTo(cx, cy);
      }
      ctx.closePath();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.fill();

      ctx.restore();
    };

    // 4. Main Unified Physics & Animation Loop (Zero React Re-render Lag)
    const runLoop = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const now = performance.now();
      const lastTime = stateRef.current.lastTime;
      stateRef.current.lastTime = now;

      const W = canvas.width / (window.devicePixelRatio || 1);
      const H = canvas.height / (window.devicePixelRatio || 1);
      const R = CORNER_RADIUS;

      const L_V = Math.max(10, H - 2 * R);
      const L_H = Math.max(10, W - 2 * R);
      const L_arc = (Math.PI / 2) * R;
      const P = 2 * L_V + 2 * L_H + 4 * L_arc;

      ctx.clearRect(0, 0, W, H);

      // =========================================================================
      // STATE 1: PERIMETER LOADING ORBIT (Starts on LEFT middle, travels to RIGHT)
      // =========================================================================
      if (stateRef.current.activeViewState === 1) {
        const orbitPeriod = 4.2; // 4.2s for full orbit (~2.1s from Left to Right edge)
        const prevElapsed = Math.max(0, (lastTime - stateRef.current.orbitStartTime) / 1000);
        const currElapsed = Math.max(0, (now - stateRef.current.orbitStartTime) / 1000);

        const prevCycle = (prevElapsed / orbitPeriod) % 1;
        const currCycle = (currElapsed / orbitPeriod) % 1;
        const currDist = currCycle * P;
        stateRef.current.orbitDistance = currDist;

        // Check if beam crosses the Right Edge (at 50% of the orbit)
        const crossedRightEdge =
          (prevCycle < 0.5 && currCycle >= 0.5) ||
          (currElapsed >= orbitPeriod * 0.5 && prevElapsed < orbitPeriod * 0.5);

        // ONLY transition to sweep if ALL components are fully loaded!
        if (crossedRightEdge && stateRef.current.isPageReady) {
          stateRef.current.activeViewState = 2;
          stateRef.current.sweepStartTime = now;
          onStateChangeRef.current?.(2);
        } else {
          drawPerimeterRibbon(ctx, W, H, R, currDist);
        }
      }

      // =========================================================================
      // STATE 2: BUTTERY SMOOTH HORIZONTAL CENTER SWEEP (Right -> Left)
      // =========================================================================
      if (stateRef.current.activeViewState === 2) {
        const elapsed = now - stateRef.current.sweepStartTime;
        const rawProgress = Math.min(1, elapsed / SWEEP_DURATION_MS);

        // Quintic smoothstep for ultra-fluid, zero-jerk acceleration & deceleration
        const ease =
          rawProgress < 0.5
            ? 16 * Math.pow(rawProgress, 5)
            : 1 - Math.pow(-2 * rawProgress + 2, 5) / 2;

        const currentXPct = 100 - ease * 100; // 100% -> 0%
        const px = (currentXPct / 100) * W;
        const py = H / 2;

        // Draw sweeping volumetric searchlight across viewport (BEHIND = TEXT, FRONT = GLOW)
        const beamW = Math.max(300, W * 0.5);
        const beamH = Math.max(300, H * 0.6);
        drawVolumetricBeam(ctx, px, py, beamW, beamH, 1.25);

        // Update target text container directly on DOM for 120fps buttery smoothness
        if (targetElementRef?.current) {
          const el = targetElementRef.current;
          el.style.opacity = '1';
          el.style.setProperty('--uncover-pct', `${currentXPct}%`);
          el.style.setProperty('--light-pos', `${currentXPct}%`);
        }

        if (rawProgress >= 1) {
          stateRef.current.activeViewState = 3;
          onStateChangeRef.current?.(3);
        }
      }

      // =========================================================================
      // STATE 3: SETTLED PORTAL RESTING ILLUMINATION
      // =========================================================================
      if (stateRef.current.activeViewState === 3) {
        let px = (stateRef.current.settledGlowPos / 100) * W;
        let py = H / 2;

        const innerEl =
          (targetElementRef?.current?.firstElementChild as HTMLElement) ||
          targetElementRef?.current;
        const textRect = innerEl?.getBoundingClientRect();
        if (textRect) {
          // Precisely align with the incandescent core of 'V in the text
          px = textRect.left + (stateRef.current.settledGlowPos / 100) * textRect.width;
          py = textRect.top + textRect.height * 0.48;
        }

        // Focused atmospheric aura with smooth zero-boundary null falloff
        const beamW = 220;
        const beamH = 280;
        drawVolumetricBeam(ctx, px, py, beamW, beamH, 0.45);

        if (targetElementRef?.current) {
          const el = targetElementRef.current;
          el.style.opacity = '1';
          el.style.setProperty('--uncover-pct', '0%');
          el.style.setProperty('--light-pos', `${stateRef.current.settledGlowPos}%`);
        }
      }

      stateRef.current.animFrameId = requestAnimationFrame(runLoop);
    };

    // Public Imperative Handle
    useImperativeHandle(
      ref,
      () => ({
        setPageReady: () => {
          stateRef.current.isPageReady = true;
        },
        replay: () => {
          stateRef.current.activeViewState = 1;
          stateRef.current.orbitDistance = 0; // Starts from LEFT side
          stateRef.current.orbitStartTime = performance.now();
          stateRef.current.lastTime = performance.now();
          stateRef.current.isPageReady = true; // On replay, page assets are already loaded
          onStateChangeRef.current?.(1);

          if (targetElementRef?.current) {
            targetElementRef.current.style.opacity = '0';
            targetElementRef.current.style.setProperty('--uncover-pct', '100%');
            targetElementRef.current.style.setProperty('--light-pos', '100%');
          }
        },
        getState: () => stateRef.current.activeViewState,
      }),
      [targetElementRef]
    );

    // Canvas Resize Handler
    useEffect(() => {
      const handleResize = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.scale(dpr, dpr);
      };

      window.addEventListener('resize', handleResize);
      handleResize();

      return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Lifecycle
    useEffect(() => {
      if (autoPlay) {
        stateRef.current.activeViewState = 1;
        stateRef.current.orbitDistance = 0; // Starts on LEFT side
        stateRef.current.orbitStartTime = performance.now();
        stateRef.current.lastTime = performance.now();

        // Listen for genuine page & font load completion
        const markReady = () => {
          stateRef.current.isPageReady = true;
        };

        if (document.fonts?.ready) {
          document.fonts.ready.then(markReady);
        }

        if (document.readyState === 'complete') {
          markReady();
        } else {
          window.addEventListener('load', markReady, { once: true });
          document.addEventListener('readystatechange', () => {
            if (document.readyState === 'complete') markReady();
          });
        }

        stateRef.current.animFrameId = requestAnimationFrame(runLoop);
      }

      return () => {
        if (stateRef.current.animFrameId) cancelAnimationFrame(stateRef.current.animFrameId);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none z-20"
        style={{ mixBlendMode: 'screen' }}
      />
    );
  }
);

CanvasFluidLightEngine.displayName = 'CanvasFluidLightEngine';
