import React, { useState, useEffect, useRef, useCallback } from 'react';
import { WwdcTextEffect, FlowDirection } from './components/WwdcTextEffect';
import { ControlDock } from './components/ControlDock';
import { CanvasFluidLightEngine, CanvasFluidLightEngineHandle } from './components/CanvasFluidLightEngine';
import { RotateCcw } from 'lucide-react';

type TextMode = 'fixed' | 'sweep';

export const App: React.FC = () => {
  // Text Effect State (Locked to commit df455d3a0bcc94a36bb962cb8225275a6d02b0c4)
  const [selectedText, setSelectedText] = useState<string>("'Verse");
  const [direction, setDirection] = useState<FlowDirection>('left-to-right');
  const [textMode, setTextMode] = useState<TextMode>('fixed');
  const [lightPosition, setLightPosition] = useState<number>(18);
  const [bloomStrength, setBloomStrength] = useState<number>(1.0);
  const [chromaticIntensity, setChromaticIntensity] = useState<number>(1.0);
  const [oppositeGlowStrength, setOppositeGlowStrength] = useState<number>(1.0);
  const [showControls, setShowControls] = useState<boolean>(true);

  // Dynamic Parallel Sweep & Loading State
  const [uncoverLeft, setUncoverLeft] = useState<number>(100);
  const [engineState, setEngineState] = useState<1 | 2 | 3>(1);
  const engineRef = useRef<CanvasFluidLightEngineHandle>(null);

  // Synchronize direction when changing text presets
  const handleSelectText = (t: string) => {
    setSelectedText(t);
    if (t === "'Verse" || t === "D'Verse") {
      setDirection('left-to-right');
      setLightPosition(18);
    } else {
      setDirection('right-to-left');
      setLightPosition(82);
    }
  };

  // Parallel Beam Tracking: As the sweep light travels across during State 2,
  // the text effect's lightPosition follows in exact parallel lockstep!
  const handleBeamPositionUpdate = useCallback(
    (xPercent: number, _yPercent: number, state: 1 | 2 | 3) => {
      if (state === 2) {
        // Parallel track text illumination with sweeping light beam
        setLightPosition(xPercent);
      } else if (state === 3) {
        // Settled left glow position for 'Verse
        setLightPosition(direction === 'left-to-right' ? 18 : 82);
      }
    },
    [direction]
  );

  // Ambient sweep mode for text effect when manually enabled
  useEffect(() => {
    if (textMode !== 'sweep' || engineState !== 3) return;

    let animId: number;
    let startTime = performance.now();

    const sweepLoop = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      const pos = 50 + 35 * Math.sin(elapsed * 1.2);
      setLightPosition(pos);
      animId = requestAnimationFrame(sweepLoop);
    };

    animId = requestAnimationFrame(sweepLoop);
    return () => cancelAnimationFrame(animId);
  }, [textMode, engineState]);

  return (
    <main className="relative w-screen h-screen bg-[#040406] overflow-hidden flex flex-col items-center justify-between select-none text-[#e2e2e8]">
      
      {/* Background Subtle Radial Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 50%, #08080e 0%, #040406 95%)',
        }}
      />

      {/* ========================================================================= */}
      {/* TOP NAVIGATION HEADER                                                     */}
      {/* ========================================================================= */}
      <header className="relative z-30 pt-6 px-6 flex items-center justify-between w-full max-w-6xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center font-black text-sm text-white shadow-lg">
            D
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-wide text-white flex items-center gap-1.5 font-['Space_Grotesk']">
              <span>D&apos;VERSE</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-amber-300">
                PORTAL ENGINE
              </span>
            </span>
          </div>
        </div>

        {/* Status Indicator & Replay Button */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900/80 border border-neutral-800 text-xs font-mono text-zinc-300">
            <span
              className={`w-2 h-2 rounded-full ${
                engineState === 1
                  ? 'bg-amber-400 animate-ping'
                  : engineState === 2
                  ? 'bg-cyan-400 animate-pulse'
                  : 'bg-emerald-400'
              }`}
            />
            <span className="text-[11px]">
              {engineState === 1
                ? 'LOADING ORBIT'
                : engineState === 2
                ? 'PARALLEL SWEEP'
                : 'PORTAL READY'}
            </span>
          </div>

          <button
            onClick={() => engineRef.current?.replay()}
            className="px-3.5 py-1 rounded-full text-xs font-mono text-amber-300 bg-amber-950/30 border border-amber-500/30 hover:bg-amber-900/40 transition-all flex items-center gap-1.5 cursor-pointer shadow-lg hover:scale-105"
            title="Replay Loading & Parallel Sweep Animation"
          >
            <RotateCcw className="w-3 h-3" />
            <span>REPLAY INTRO</span>
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* MAIN VIEWPORT DISPLAY AREA (UNIFIED CANVAS FLUID ENGINE + TEXT ILLUMINATION)*/}
      {/* ========================================================================= */}
      <div className="relative z-10 w-full flex-1 flex items-center justify-center p-4">
        
        <div
          id="sandboxViewport"
          className="relative w-full max-w-5xl aspect-video rounded-2xl bg-[#000000] border border-neutral-800/90 overflow-hidden shadow-2xl flex items-center justify-center select-none"
        >
          {/* HIGH-DPI CANVAS LIGHT ENGINE (Fluid Corner Folding + Horizontal Sweep) */}
          <CanvasFluidLightEngine
            ref={engineRef}
            autoPlay={true}
            onUncoverProgress={setUncoverLeft}
            onBeamPositionUpdate={handleBeamPositionUpdate}
            onStateChange={setEngineState}
          />

          {/* DYNAMIC UNCOVER WRAPPER (Reveals text in lockstep with the sweeping light beam) */}
          <div
            className="relative z-10 w-full h-full flex items-center justify-center"
            style={{
              clipPath: `inset(0 0 0 ${uncoverLeft}%)`,
              willChange: 'clip-path',
            }}
          >
            {/* LOCKED TEXT EFFECT (COMMIT df455d3) WITH PARALLEL BEAM GLOW TRACKING */}
            <WwdcTextEffect
              text={selectedText}
              direction={direction}
              lightPosition={lightPosition}
              bloomStrength={bloomStrength}
              chromaticIntensity={chromaticIntensity}
              oppositeGlowStrength={oppositeGlowStrength}
            />
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* FLOATING CONTROLS DOCK                                                    */}
      {/* ========================================================================= */}
      <ControlDock
        selectedText={selectedText}
        onSelectText={handleSelectText}
        direction={direction}
        onSetDirection={setDirection}
        onSetLightPosition={setLightPosition}
        textMode={textMode}
        onSetTextMode={setTextMode}
        lightPosition={lightPosition}
        bloomStrength={bloomStrength}
        onSetBloomStrength={setBloomStrength}
        chromaticIntensity={chromaticIntensity}
        onSetChromaticIntensity={setChromaticIntensity}
        oppositeGlowStrength={oppositeGlowStrength}
        onSetOppositeGlowStrength={setOppositeGlowStrength}
        showControls={showControls}
        onToggleControls={() => setShowControls(!showControls)}
      />

    </main>
  );
};
