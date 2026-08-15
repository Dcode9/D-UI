import { useState, useEffect, useRef } from 'react';

export interface LightState {
  x: number;
  y: number;
  nx: number; // Inward normal X
  ny: number; // Inward normal Y
  edgeIndex: number; // 0 = Left, 1 = Top, 2 = Right, 3 = Bottom
  edgeProgress: number; // 0 to 1 along current edge
  angle: number; // Angle of light emission into screen
  speedFactor: number;
}

export function usePerimeterPhysics(speedMultiplier: number = 1.0) {
  const [light, setLight] = useState<LightState>({
    x: 0,
    y: typeof window !== 'undefined' ? window.innerHeight * 0.5 : 400,
    nx: 1,
    ny: 0,
    edgeIndex: 0,
    edgeProgress: 0.5,
    angle: 0,
    speedFactor: 1,
  });

  const stateRef = useRef({
    // Current edge index: 0=Left (going up), 1=Top (going right), 2=Right (going down), 3=Bottom (going left)
    edge: 0,
    edgeProgress: 0.5, // Start at center of left edge
  });

  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const update = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      const w = window.innerWidth;
      const h = window.innerHeight;

      // Physics: Speed factor based on distance from edge center
      // s in [0, 1]. Center is s = 0.5.
      // distToCenter in [0, 1] (0 at center, 1 at corner)
      const currentProgress = stateRef.current.edgeProgress;
      const distToCenter = Math.abs(currentProgress - 0.5) * 2;

      // Base speed and corner acceleration
      // Minimum speed at center (dist = 0), maximum speed at corners (dist = 1)
      const cornerAccel = 1.0 + Math.pow(distToCenter, 2.5) * 3.8;
      const baseEdgeDuration = stateRef.current.edge % 2 === 0 ? 3.8 : 4.5; // seconds per edge
      const step = (dt / baseEdgeDuration) * cornerAccel * speedMultiplier;

      let nextProgress = currentProgress + step;
      let nextEdge = stateRef.current.edge;

      if (nextProgress >= 1.0) {
        nextProgress = nextProgress - 1.0;
        nextEdge = (nextEdge + 1) % 4;
      }

      stateRef.current.edge = nextEdge;
      stateRef.current.edgeProgress = nextProgress;

      // Calculate (x, y) and inward normal (nx, ny)
      let x = 0;
      let y = 0;
      let nx = 0;
      let ny = 0;

      const cornerBlendRadius = 0.12; // fraction near corner where normal smoothly rotates

      switch (nextEdge) {
        case 0: // Left Edge: moving from Bottom (y=h) up to Top (y=0)
          x = 0;
          y = h * (1 - nextProgress);
          nx = 1;
          ny = 0;

          // Corner blend at top (nextProgress -> 1)
          if (nextProgress > 1 - cornerBlendRadius) {
            const t = (nextProgress - (1 - cornerBlendRadius)) / cornerBlendRadius;
            nx = Math.cos((t * Math.PI) / 4);
            ny = Math.sin((t * Math.PI) / 4);
          }
          // Corner blend at bottom (nextProgress -> 0)
          if (nextProgress < cornerBlendRadius) {
            const t = (cornerBlendRadius - nextProgress) / cornerBlendRadius;
            nx = Math.cos((t * Math.PI) / 4);
            ny = -Math.sin((t * Math.PI) / 4);
          }
          break;

        case 1: // Top Edge: moving from Left (x=0) to Right (x=w)
          x = w * nextProgress;
          y = 0;
          nx = 0;
          ny = 1;

          // Corner blend at right (nextProgress -> 1)
          if (nextProgress > 1 - cornerBlendRadius) {
            const t = (nextProgress - (1 - cornerBlendRadius)) / cornerBlendRadius;
            nx = -Math.sin((t * Math.PI) / 4);
            ny = Math.cos((t * Math.PI) / 4);
          }
          // Corner blend at left (nextProgress -> 0)
          if (nextProgress < cornerBlendRadius) {
            const t = (cornerBlendRadius - nextProgress) / cornerBlendRadius;
            nx = Math.sin((t * Math.PI) / 4);
            ny = Math.cos((t * Math.PI) / 4);
          }
          break;

        case 2: // Right Edge: moving from Top (y=0) down to Bottom (y=h)
          x = w;
          y = h * nextProgress;
          nx = -1;
          ny = 0;

          // Corner blend at bottom (nextProgress -> 1)
          if (nextProgress > 1 - cornerBlendRadius) {
            const t = (nextProgress - (1 - cornerBlendRadius)) / cornerBlendRadius;
            nx = -Math.cos((t * Math.PI) / 4);
            ny = -Math.sin((t * Math.PI) / 4);
          }
          // Corner blend at top (nextProgress -> 0)
          if (nextProgress < cornerBlendRadius) {
            const t = (cornerBlendRadius - nextProgress) / cornerBlendRadius;
            nx = -Math.cos((t * Math.PI) / 4);
            ny = Math.sin((t * Math.PI) / 4);
          }
          break;

        case 3: // Bottom Edge: moving from Right (x=w) to Left (x=0)
          x = w * (1 - nextProgress);
          y = h;
          nx = 0;
          ny = -1;

          // Corner blend at left (nextProgress -> 1)
          if (nextProgress > 1 - cornerBlendRadius) {
            const t = (nextProgress - (1 - cornerBlendRadius)) / cornerBlendRadius;
            nx = Math.sin((t * Math.PI) / 4);
            ny = -Math.cos((t * Math.PI) / 4);
          }
          // Corner blend at right (nextProgress -> 0)
          if (nextProgress < cornerBlendRadius) {
            const t = (cornerBlendRadius - nextProgress) / cornerBlendRadius;
            nx = -Math.sin((t * Math.PI) / 4);
            ny = -Math.cos((t * Math.PI) / 4);
          }
          break;
      }

      // Normalize normal
      const len = Math.hypot(nx, ny) || 1;
      nx /= len;
      ny /= len;

      const angle = Math.atan2(ny, nx);

      setLight({
        x,
        y,
        nx,
        ny,
        edgeIndex: nextEdge,
        edgeProgress: nextProgress,
        angle,
        speedFactor: cornerAccel,
      });

      animId = requestAnimationFrame(update);
    };

    animId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animId);
  }, [speedMultiplier]);

  return light;
}
