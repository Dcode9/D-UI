import React, { useEffect, useRef } from 'react';

export const App: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rimGlowRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const rimGlow = rimGlowRef.current;
    if (!container || !canvas || !rimGlow) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    /* ========================================================
       STATE CONFIGURATIONS
       ======================================================== */
    const SPEED_SCALE = 0.8;

    const STATE_1_CFG = {
      spread: 6, // 6vw
      originLen: 69, // 69vw
      blur: 71, // 71px
      brightness: 2.2, // 2.2
      cornerSpeed: 1.3, // 1.3x corner speed ramp
    };

    const STATE_3_CFG = {
      spread: 73, // 73vw
      originLen: 63, // 63vw
      blur: 80, // 80px
      brightness: 1.9, // 1.9
      sweepDuration: 1.4, // 1.4s sweep
    };

    let activeViewState = 1; // 1 = Loading Orbit, 2 = Docking & Center Sweep, 3 = Loaded
    let animFrameId: number | null = null;
    let orbitProgressAcc = 0; // Accumulated perimeter distance
    let lastTime = performance.now();
    let isTransitioningToDock = false;

    // Canvas Resizer with DPI scaling
    function resizeCanvas() {
      if (!container || !canvas || !ctx) return;
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    /**
     * PERIMETER GEOMETRY & LOCAL CORNER BENDING MATHEMATICS
     * Returns exact point (x, y), normal (nx, ny), and angle at any distance along rounded rectangle.
     */
    function getPerimeterNode(dist: number, W: number, H: number, R: number) {
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

      // 2. Top-Right Corner Arc
      if (d < L_arc) {
        const a = -Math.PI / 2 + (d / L_arc) * (Math.PI / 2);
        const cx = W - R,
          cy = R;
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
        const cx = W - R,
          cy = H - R;
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
        const cx = R,
          cy = H - R;
        return {
          x: cx + R * Math.cos(a),
          y: cy + R * Math.sin(a),
          nx: -Math.cos(a),
          ny: -Math.sin(a),
          angle: a + Math.PI / 2,
        };
      }
      d -= L_arc;

      // 7. Left Edge
      if (d < L_left) {
        const t = d / L_left;
        return {
          x: 0,
          y: H - R - t * L_left,
          nx: 1,
          ny: 0,
          angle: (3 * Math.PI) / 2,
        };
      }
      d -= L_left;

      // 8. Top-Left Corner Arc
      const a = Math.PI + (d / L_arc) * (Math.PI / 2);
      const cx = R,
        cy = R;
      return {
        x: cx + R * Math.cos(a),
        y: cy + R * Math.sin(a),
        nx: -Math.cos(a),
        ny: -Math.sin(a),
        angle: a + Math.PI / 2,
      };
    }

    /**
     * SPEED RAMPING MODULATION FACTOR
     */
    function getVelocityFactor(progress: number, cornerBoost: number) {
      const p = ((progress % 1) + 1) % 1;
      const modulation = Math.cos(p * Math.PI * 8);
      return 1.0 + (cornerBoost - 1.0) * 0.5 * (1 + modulation);
    }

    /**
     * CANVAS BENDING BEAM RENDER PIPELINE
     */
    function renderCanvasBeam(
      cfg: {
        spread: number;
        originLen: number;
        blur: number;
        brightness: number;
      },
      currentCenterProgress: number,
      customX: number | null = null,
      customY: number | null = null
    ) {
      if (!container || !ctx) return;
      const rect = container.getBoundingClientRect();
      const W = rect.width;
      const H = rect.height;

      ctx.clearRect(0, 0, W, H);

      // Center Sweep Horizontal Phase (State 2 -> 3)
      if (customX !== null && customY !== null) {
        const px = (customX / 100) * W;
        const py = (customY / 100) * H;
        const beamW = (cfg.originLen / 100) * W;
        const beamH = (cfg.spread / 100) * W;

        ctx.save();
        ctx.filter = `blur(${cfg.blur}px)`;
        ctx.globalCompositeOperation = 'screen';

        const grad = ctx.createRadialGradient(
          px,
          py,
          0,
          px,
          py,
          Math.max(beamW, beamH) * 0.6
        );
        const b = Math.min(4, Math.max(0.2, cfg.brightness));
        grad.addColorStop(0, `rgba(255, 255, 255, ${Math.min(1, 0.95 * b)})`);
        grad.addColorStop(0.3, `rgba(210, 220, 240, ${Math.min(1, 0.65 * b)})`);
        grad.addColorStop(0.65, `rgba(140, 160, 200, ${Math.min(1, 0.3 * b)})`);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(px, py, beamW / 2, beamH / 2, Math.PI / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        return;
      }

      // Perimeter Local Bending Phase (State 1 Loading)
      const R = 24; // Corner radius matching viewport
      const L_top = W - 2 * R;
      const L_arc = (Math.PI / 2) * R;
      const L_right = H - 2 * R;
      const P = 2 * L_top + 4 * L_arc + 2 * L_right;

      const beamLength = (cfg.originLen / 100) * P * 0.35;
      const centerDist = currentCenterProgress * P;
      const startDist = centerDist - beamLength / 2;

      const N = 40; // 40 Nodes along beam ribbon
      const innerPoints: Array<{ x: number; y: number }> = [];
      const outerPoints: Array<{ x: number; y: number }> = [];

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
      grad.addColorStop(0.35, `rgba(210, 220, 240, ${Math.min(1, 0.65 * b)})`);
      grad.addColorStop(0.7, `rgba(140, 160, 200, ${Math.min(1, 0.3 * b)})`);
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
    }

    /**
     * START CENTER SWEEP UNCOVER PHASE (State 2 -> State 3)
     */
    function startCenterSweep() {
      const sweepStartTime = performance.now();
      const sweepDuration = STATE_3_CFG.sweepDuration * 1000; // 1.4s

      function sweepStep(time: number) {
        const sElapsed = time - sweepStartTime;
        const progress = Math.min(1, sElapsed / sweepDuration);

        const easeP =
          progress < 0.5
            ? 2 * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;

        const currentX = 100 - easeP * 100;
        const currentY = 50;

        const curSpread =
          STATE_1_CFG.spread +
          easeP * (STATE_3_CFG.spread - STATE_1_CFG.spread);
        const curOriginLen =
          STATE_1_CFG.originLen +
          easeP * (STATE_3_CFG.originLen - STATE_1_CFG.originLen);
        const curBlur =
          STATE_1_CFG.blur + easeP * (STATE_3_CFG.blur - STATE_1_CFG.blur);
        const curBrightness =
          STATE_1_CFG.brightness +
          easeP * (STATE_3_CFG.brightness - STATE_1_CFG.brightness);

        renderCanvasBeam(
          {
            spread: curSpread,
            originLen: curOriginLen,
            blur: curBlur,
            brightness: curBrightness,
          },
          0,
          currentX,
          currentY
        );

        if (container) {
          container.style.setProperty('--uncover-left', `${currentX}%`);
        }

        if (progress < 1) {
          animFrameId = requestAnimationFrame(sweepStep);
        } else {
          // STATE 3 REACHED: FINAL LOADED RESTING STATE AT LEFT EDGE
          activeViewState = 3;
          if (rimGlow) {
            rimGlow.className = 'verse-text-rim-glow rim-glow-state-3';
          }
          if (container) {
            container.style.setProperty('--uncover-left', '0%');
          }
          renderCanvasBeam(STATE_3_CFG, 0, 0, 50);
        }
      }
      animFrameId = requestAnimationFrame(sweepStep);
    }

    /**
     * MAIN PHYSICS LOOP WITH CONTINUOUS SPEED MATCHING ON DOCKING
     */
    function startPhysicsLoop() {
      if (animFrameId) cancelAnimationFrame(animFrameId);
      lastTime = performance.now();

      function physicsStep(time: number) {
        const dt = (time - lastTime) / 1000;
        lastTime = time;

        const baseSpeed = 0.25 * SPEED_SCALE;

        if (
          activeViewState === 1 ||
          (activeViewState === 2 && isTransitioningToDock)
        ) {
          const currentVelocity =
            baseSpeed *
            getVelocityFactor(orbitProgressAcc, STATE_1_CFG.cornerSpeed);
          orbitProgressAcc += currentVelocity * dt;

          // Check if transitioning to dock at Right Edge (Target Progress = 0.375)
          if (isTransitioningToDock) {
            const normP = ((orbitProgressAcc % 1) + 1) % 1;
            if (
              Math.abs(normP - 0.375) < 0.02 ||
              (normP > 0.375 && normP < 0.42)
            ) {
              isTransitioningToDock = false;
              startCenterSweep(); // Launch 1.4s horizontal sweep
              return;
            }
          }

          renderCanvasBeam(STATE_1_CFG, orbitProgressAcc);
          animFrameId = requestAnimationFrame(physicsStep);
        }
      }
      animFrameId = requestAnimationFrame(physicsStep);
    }

    // Auto-initiate docking after 1.8s of perimeter orbiting
    const dockTimer = setTimeout(() => {
      activeViewState = 2;
      isTransitioningToDock = true;
    }, 1800);

    // Initial state
    rimGlow.className = 'verse-text-rim-glow rim-glow-state-1';
    container.style.setProperty('--uncover-left', '100%');
    startPhysicsLoop();

    return () => {
      if (animFrameId) cancelAnimationFrame(animFrameId);
      clearTimeout(dockTimer);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <main
      id="heroContainer"
      ref={containerRef}
      className="relative w-screen h-screen bg-black overflow-hidden select-none bg-grid-pattern"
    >
      {/* High-DPI Canvas Light Engine */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-20"
      />

      {/* Uncover Content Wrapper */}
      <div className="uncover-content-wrapper">
        <div className="relative inline-block select-none">
          <span className="verse-text-base">'Verse</span>
          <span
            ref={rimGlowRef}
            className="verse-text-rim-glow rim-glow-state-1"
          >
            'Verse
          </span>
        </div>
      </div>
    </main>
  );
};
