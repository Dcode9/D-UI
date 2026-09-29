import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';

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

interface BeamConfig {
  spread: number;
  originLen: number;
  blur: number;
  brightness: number;
  stroke?: number;
  cornerSpeed?: number;
  sweepDuration?: number;
}

export const CanvasFluidLightEngine = forwardRef<CanvasFluidLightEngineHandle, CanvasFluidLightEngineProps>(
  ({ onStateChange, targetElementRef, autoPlay = true }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const onStateChangeRef = useRef(onStateChange);

    useEffect(() => {
      onStateChangeRef.current = onStateChange;
    });

    const stateRef = useRef<{
      activeViewState: 1 | 2 | 3;
      animFrameId: number | null;
      orbitProgressAcc: number;
      lastTime: number;
      isPageReady: boolean;
      isTransitioningToDock: boolean;
    }>({
      activeViewState: 1,
      animFrameId: null,
      orbitProgressAcc: 0,
      lastTime: performance.now(),
      isPageReady: false,
      isTransitioningToDock: false,
    });

    // Speed scale and state configs directly from user's reference
    const SPEED_SCALE = 0.8;

    const STATE_1_CFG: BeamConfig = {
      spread: 6,         // 6vw
      originLen: 69,     // 69vw
      blur: 71,          // 71px
      brightness: 2.2,
      stroke: 2.0,
      cornerSpeed: 1.3,
    };

    const STATE_3_CFG: BeamConfig = {
      spread: 73,        // 73vw
      originLen: 63,     // 63vw
      blur: 80,          // 80px
      brightness: 1.9,
      stroke: 0.1,
      sweepDuration: 1.4, // 1.4s sweep
    };

    /**
     * User's exact reference perimeter node geometry
     */
    const getPerimeterNode = (dist: number, W: number, H: number, R: number) => {
      const L_top = W - 2 * R;
      const L_arc = (Math.PI / 2) * R;
      const L_right = H - 2 * R;
      const L_bot = W - 2 * R;
      const L_left = H - 2 * R;

      const P = 2 * L_top + 4 * L_arc + 2 * L_right;
      let d = ((dist % P) + P) % P;

      // 1. Top Edge
      if (d < L_top) {
        const t = d / L_top;
        return { x: R + t * L_top, y: 0, nx: 0, ny: 1, angle: 0 };
      }
      d -= L_top;

      // 2. Top-Right Corner Arc (Local Folding Down)
      if (d < L_arc) {
        const a = -Math.PI / 2 + (d / L_arc) * (Math.PI / 2);
        const cx = W - R;
        const cy = R;
        return {
          x: cx + R * Math.cos(a),
          y: cy + R * Math.sin(a),
          nx: -Math.cos(a),
          ny: -Math.sin(a),
          angle: a + Math.PI / 2,
        };
      }
      d -= L_arc;

      // 3. Right Edge
      if (d < L_right) {
        const t = d / L_right;
        return { x: W, y: R + t * L_right, nx: -1, ny: 0, angle: Math.PI / 2 };
      }
      d -= L_right;

      // 4. Bottom-Right Corner Arc
      if (d < L_arc) {
        const a = (d / L_arc) * (Math.PI / 2);
        const cx = W - R;
        const cy = H - R;
        return {
          x: cx + R * Math.cos(a),
          y: cy + R * Math.sin(a),
          nx: -Math.cos(a),
          ny: -Math.sin(a),
          angle: a + Math.PI / 2,
        };
      }
      d -= L_arc;

      // 5. Bottom Edge
      if (d < L_bot) {
        const t = d / L_bot;
        return { x: W - R - t * L_bot, y: H, nx: 0, ny: -1, angle: Math.PI };
      }
      d -= L_bot;

      // 6. Bottom-Left Corner Arc
      if (d < L_arc) {
        const a = Math.PI / 2 + (d / L_arc) * (Math.PI / 2);
        const cx = R;
        const cy = H - R;
        return {
          x: cx + R * Math.cos(a),
          y: cy + R * Math.sin(a),
          nx: -Math.cos(a),
          ny: -Math.sin(a),
          angle: a + Math.PI / 2,
        };
      }
      d -= L_arc;

      // 7. Left Edge (going UP from H-R to R)
      if (d < L_left) {
        const t = d / L_left;
        return { x: 0, y: H - R - t * L_left, nx: 1, ny: 0, angle: (3 * Math.PI) / 2 };
      }
      d -= L_left;

      // 8. Top-Left Corner Arc
      const a = Math.PI + (d / L_arc) * (Math.PI / 2);
      const cx = R;
      const cy = R;
      return {
        x: cx + R * Math.cos(a),
        y: cy + R * Math.sin(a),
        nx: -Math.cos(a),
        ny: -Math.sin(a),
        angle: a + Math.PI / 2,
      };
    };

    const getVelocityFactor = (progress: number, cornerBoost: number) => {
      const p = ((progress % 1) + 1) % 1;
      const modulation = Math.cos(p * Math.PI * 8);
      return 1.0 + (cornerBoost - 1.0) * 0.5 * (1 + modulation);
    };

    /**
     * Canvas Beam Renderer:
     * - Perimeter ribbon in State 1
     * - Horizontal searchlight sweep in State 2 (fades 100% to null, zero bounding box)
     */
    const renderCanvasBeam = (
      ctx: CanvasRenderingContext2D,
      W: number,
      H: number,
      cfg: BeamConfig,
      currentCenterProgress: number,
      customX: number | null = null,
      customY: number | null = null
    ) => {
      ctx.clearRect(0, 0, W, H);

      // Center Sweep Horizontal Phase (State 2)
      if (customX !== null && customY !== null) {
        const px = (customX / 100) * W;
        const py = (customY / 100) * H;
        const beamW = (cfg.originLen / 100) * W;
        const beamH = (cfg.spread / 100) * W;
        const maxRadius = Math.max(beamW, beamH) * 0.75;

        ctx.save();
        ctx.filter = `blur(${cfg.blur}px)`;
        ctx.globalCompositeOperation = 'screen';

        const b = Math.min(4, Math.max(0.2, cfg.brightness));

        // Diffuse Chromatic Dispersion Halo (Strict Null Falloff at outer edge)
        const grad = ctx.createRadialGradient(px, py, 0, px, py, maxRadius);
        grad.addColorStop(0, `rgba(255, 255, 255, ${Math.min(1, 0.98 * b)})`);
        grad.addColorStop(0.18, `rgba(255, 195, 80, ${Math.min(1, 0.75 * b)})`);
        grad.addColorStop(0.4, `rgba(130, 205, 255, ${Math.min(1, 0.35 * b)})`);
        grad.addColorStop(0.68, `rgba(60, 130, 240, ${Math.min(1, 0.08 * b)})`);
        grad.addColorStop(0.85, 'rgba(0, 0, 0, 0)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(px, py, maxRadius, 0, Math.PI * 2);
        ctx.fill();

        // Incandescent Core Filament
        const coreRadius = maxRadius * 0.35;
        const coreGrad = ctx.createRadialGradient(px, py, 0, px, py, coreRadius);
        coreGrad.addColorStop(0, `rgba(255, 255, 255, ${Math.min(1, 1.0 * b)})`);
        coreGrad.addColorStop(0.45, `rgba(250, 252, 255, ${Math.min(1, 0.6 * b)})`);
        coreGrad.addColorStop(0.85, 'rgba(0, 0, 0, 0)');
        coreGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(px, py, coreRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
        return;
      }

      // Perimeter Local Bending Phase (State 1 Loading)
      const R = 24;
      const L_top = W - 2 * R;
      const L_arc = (Math.PI / 2) * R;
      const L_right = H - 2 * R;
      const P = 2 * L_top + 4 * L_arc + 2 * L_right;

      const beamLength = (cfg.originLen / 100) * P * 0.35;
      const centerDist = currentCenterProgress * P;
      const startDist = centerDist - beamLength / 2;

      const N = 40;
      const innerPoints: { x: number; y: number }[] = [];
      const outerPoints: { x: number; y: number }[] = [];

      for (let i = 0; i < N; i++) {
        const t = i / (N - 1);
        const nodeDist = startDist + t * beamLength;
        const node = getPerimeterNode(nodeDist, W, H, R);

        const envelope = Math.sin(t * Math.PI);
        const spreadPx = (cfg.spread / 100) * W * 0.45 * envelope;

        innerPoints.push({
          x: node.x + node.nx * spreadPx,
          y: node.y + node.ny * spreadPx,
        });
        outerPoints.push({
          x: node.x - node.nx * (spreadPx * 0.15),
          y: node.y - node.ny * (spreadPx * 0.15),
        });
      }

      ctx.save();
      ctx.filter = `blur(${cfg.blur}px)`;
      ctx.globalCompositeOperation = 'screen';

      ctx.beginPath();
      ctx.moveTo(outerPoints[0].x, outerPoints[0].y);
      for (let i = 1; i < N; i++) ctx.lineTo(outerPoints[i].x, outerPoints[i].y);
      for (let i = N - 1; i >= 0; i--) ctx.lineTo(innerPoints[i].x, innerPoints[i].y);
      ctx.closePath();

      const centerNode = getPerimeterNode(centerDist, W, H, R);
      const b = Math.min(4, Math.max(0.2, cfg.brightness));
      const grad = ctx.createRadialGradient(
        centerNode.x,
        centerNode.y,
        0,
        centerNode.x,
        centerNode.y,
        beamLength * 0.75
      );
      grad.addColorStop(0, `rgba(255, 255, 255, ${Math.min(1, 0.95 * b)})`);
      grad.addColorStop(0.25, `rgba(255, 195, 95, ${Math.min(1, 0.75 * b)})`);
      grad.addColorStop(0.55, `rgba(130, 205, 255, ${Math.min(1, 0.35 * b)})`);
      grad.addColorStop(0.85, 'rgba(0, 0, 0, 0)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = grad;
      ctx.fill();

      // Spotlight Core Ribbon
      ctx.beginPath();
      ctx.moveTo(outerPoints[0].x, outerPoints[0].y);
      for (let i = 1; i < N; i++) ctx.lineTo(outerPoints[i].x, outerPoints[i].y);
      for (let i = N - 1; i >= 0; i--) {
        const coreX = (outerPoints[i].x + innerPoints[i].x) / 2;
        const coreY = (outerPoints[i].y + innerPoints[i].y) / 2;
        ctx.lineTo(coreX, coreY);
      }
      ctx.closePath();
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, 0.8 * b)})`;
      ctx.fill();

      ctx.restore();
    };

    /**
     * Start Center Sweep Uncover Phase (State 2 -> State 3)
     */
    const startCenterSweep = () => {
      stateRef.current.activeViewState = 2;
      onStateChangeRef.current?.(2);

      const sweepStartTime = performance.now();
      const sweepDuration = (STATE_3_CFG.sweepDuration || 1.4) * 1000;

      if (targetElementRef?.current) {
        targetElementRef.current.style.opacity = '1';
      }

      const sweepStep = (time: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const W = canvas.width / (window.devicePixelRatio || 1);
        const H = canvas.height / (window.devicePixelRatio || 1);

        const sElapsed = time - sweepStartTime;
        const progress = Math.min(1, sElapsed / sweepDuration);

        // Quintic smoothstep for ultra-buttery zero-jerk acceleration & deceleration
        const easeP =
          progress < 0.5
            ? 16 * Math.pow(progress, 5)
            : 1 - Math.pow(-2 * progress + 2, 5) / 2;

        const currentX = 100 - easeP * 100;
        const currentY = 50;

        const curSpread = STATE_1_CFG.spread + easeP * (STATE_3_CFG.spread - STATE_1_CFG.spread);
        const curOriginLen = STATE_1_CFG.originLen + easeP * (STATE_3_CFG.originLen - STATE_1_CFG.originLen);
        const curBlur = STATE_1_CFG.blur + easeP * (STATE_3_CFG.blur - STATE_1_CFG.blur);
        const curBrightness = STATE_1_CFG.brightness + easeP * (STATE_3_CFG.brightness - STATE_1_CFG.brightness);

        renderCanvasBeam(
          ctx,
          W,
          H,
          { spread: curSpread, originLen: curOriginLen, blur: curBlur, brightness: curBrightness },
          0,
          currentX,
          currentY
        );

        if (targetElementRef?.current) {
          targetElementRef.current.style.setProperty('--uncover-left', `${currentX}%`);
        }

        if (progress < 1) {
          stateRef.current.animFrameId = requestAnimationFrame(sweepStep);
        } else {
          // STATE 3: FINAL LOADED RESTING STATE
          stateRef.current.activeViewState = 3;
          onStateChangeRef.current?.(3);

          if (targetElementRef?.current) {
            targetElementRef.current.style.setProperty('--uncover-left', '0%');
            targetElementRef.current.style.opacity = '1';
          }

          // Clear canvas so the locked commit df455d3 typography glow takes over with zero double-halo
          ctx.clearRect(0, 0, W, H);
        }
      };

      stateRef.current.animFrameId = requestAnimationFrame(sweepStep);
    };

    /**
     * Main Physics Loop:
     * - Runs the perimeter ribbon starting from the LEFT middle
     * - Only loops if components are still loading
     * - Seamlessly transitions to dock at Right Edge when ready
     */
    const startPhysicsLoop = () => {
      if (stateRef.current.animFrameId) cancelAnimationFrame(stateRef.current.animFrameId);
      stateRef.current.lastTime = performance.now();

      const physicsStep = (time: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dt = Math.min(0.1, (time - stateRef.current.lastTime) / 1000);
        stateRef.current.lastTime = time;

        const W = canvas.width / (window.devicePixelRatio || 1);
        const H = canvas.height / (window.devicePixelRatio || 1);
        const R = 24;
        const L_top = W - 2 * R;
        const L_arc = (Math.PI / 2) * R;
        const L_right = H - 2 * R;
        const P = 2 * L_top + 4 * L_arc + 2 * L_right;

        // Dock progress is at the middle of the Right Edge
        const dockDist = L_top + L_arc + L_right / 2;
        const dockProgress = dockDist / P;

        const baseSpeed = 0.25 * SPEED_SCALE;

        if (
          stateRef.current.activeViewState === 1 ||
          (stateRef.current.activeViewState === 2 && stateRef.current.isTransitioningToDock)
        ) {
          const currentVelocity =
            baseSpeed * getVelocityFactor(stateRef.current.orbitProgressAcc, STATE_1_CFG.cornerSpeed || 1.3);
          const prevNormP = ((stateRef.current.orbitProgressAcc % 1) + 1) % 1;
          stateRef.current.orbitProgressAcc += currentVelocity * dt;
          const normP = ((stateRef.current.orbitProgressAcc % 1) + 1) % 1;

          // Check if transitioning to dock at Right Edge
          if (stateRef.current.isTransitioningToDock) {
            const crossedDock =
              (prevNormP < dockProgress && normP >= dockProgress) ||
              Math.abs(normP - dockProgress) < currentVelocity * dt * 1.5;

            if (crossedDock) {
              stateRef.current.isTransitioningToDock = false;
              startCenterSweep();
              return;
            }
          }

          renderCanvasBeam(ctx, W, H, STATE_1_CFG, stateRef.current.orbitProgressAcc);
          stateRef.current.animFrameId = requestAnimationFrame(physicsStep);
        }
      };

      stateRef.current.animFrameId = requestAnimationFrame(physicsStep);
    };

    /**
     * Compute Left Middle start progress
     */
    const getLeftMiddleProgress = (W: number, H: number) => {
      const R = 24;
      const L_top = W - 2 * R;
      const L_arc = (Math.PI / 2) * R;
      const L_right = H - 2 * R;
      const L_bot = W - 2 * R;
      const L_left = H - 2 * R;
      const P = 2 * L_top + 4 * L_arc + 2 * L_right;

      // Distance to middle of Left Edge (going UP from H-R to R)
      const distLeftMiddle = L_top + 3 * L_arc + L_right + L_bot + L_left / 2;
      return distLeftMiddle / P;
    };

    // Public Imperative Handle
    useImperativeHandle(
      ref,
      () => ({
        setPageReady: () => {
          stateRef.current.isPageReady = true;
          stateRef.current.isTransitioningToDock = true;
        },
        replay: () => {
          if (stateRef.current.animFrameId) cancelAnimationFrame(stateRef.current.animFrameId);
          stateRef.current.activeViewState = 1;
          stateRef.current.isPageReady = true;
          stateRef.current.isTransitioningToDock = true; // On replay, dock when it reaches right edge
          onStateChangeRef.current?.(1);

          const canvas = canvasRef.current;
          if (canvas) {
            const W = canvas.width / (window.devicePixelRatio || 1);
            const H = canvas.height / (window.devicePixelRatio || 1);
            stateRef.current.orbitProgressAcc = getLeftMiddleProgress(W, H);
          }

          if (targetElementRef?.current) {
            targetElementRef.current.style.opacity = '0';
            targetElementRef.current.style.setProperty('--uncover-left', '100%');
          }

          startPhysicsLoop();
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
        stateRef.current.isPageReady = false;
        stateRef.current.isTransitioningToDock = false;

        const canvas = canvasRef.current;
        if (canvas) {
          const W = canvas.width / (window.devicePixelRatio || 1);
          const H = canvas.height / (window.devicePixelRatio || 1);
          stateRef.current.orbitProgressAcc = getLeftMiddleProgress(W, H);
        }

        const triggerReady = () => {
          stateRef.current.isPageReady = true;
          stateRef.current.isTransitioningToDock = true;
        };

        if (document.fonts?.ready) {
          document.fonts.ready.then(triggerReady);
        }

        if (document.readyState === 'complete') {
          triggerReady();
        } else {
          window.addEventListener('load', triggerReady, { once: true });
        }

        startPhysicsLoop();
      }

      return () => {
        if (stateRef.current.animFrameId) cancelAnimationFrame(stateRef.current.animFrameId);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoPlay]);

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
