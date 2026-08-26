import React, { useState, useEffect, useRef } from 'react';
import { WwdcTextEffect, FlowDirection } from './components/WwdcTextEffect';
import { ControlDock } from './components/ControlDock';
import { CanvasFluidLightEngine, CanvasFluidLightEngineHandle } from './components/CanvasFluidLightEngine';
import { Sparkles, Activity, RotateCcw, Layers } from 'lucide-react';

type TextMode = 'fixed' | 'sweep';
type ActiveView = 'text-effect' | 'loading-engine' | 'split-view';

export const App: React.FC = () => {
  // Navigation View
  const [activeView, setActiveView] = useState<ActiveView>('text-effect');

  // Text Effect State (Locked to commit df455d3a0bcc94a36bb962cb8225275a6d02b0c4)
  const [selectedText, setSelectedText] = useState<string>("'Verse");
  const [direction, setDirection] = useState<FlowDirection>('left-to-right');
  const [textMode, setTextMode] = useState<TextMode>('fixed');
  const [lightPosition, setLightPosition] = useState<number>(18);
  const [bloomStrength, setBloomStrength] = useState<number>(1.0);
  const [chromaticIntensity, setChromaticIntensity] = useState<number>(1.0);
  const [oppositeGlowStrength, setOppositeGlowStrength] = useState<number>(1.0);
  const [showControls, setShowControls] = useState<boolean>(true);

  // Canvas Engine State (Locked to the user's provided HTML engine)
  const [uncoverLeft, setUncoverLeft] = useState<number>(100);
  const [engineState, setEngineState] = useState<1 | 2 | 3>(1);
  const engineRef = useRef<CanvasFluidLightEngineHandle>(null);

  // Sync direction when changing text presets
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

  // Ambient sweep mode for text effect
  useEffect(() => {
    if (textMode !== 'sweep') return;

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
  }, [textMode]);

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
      {/* TOP HEADER & VIEW MODE SELECTOR                                           */}
      {/* ========================================================================= */}
      <div className="relative z-30 w-full max-w-6xl px-6 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center font-black text-sm text-white shadow-lg">
            D
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-wide text-white flex items-center gap-1.5 font-['Space_Grotesk']">
              <span>D&apos;VERSE</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-amber-300">
                LAB SANDBOX
              </span>
            </span>
          </div>
        </div>

        {/* View Switcher: Text Effect vs Canvas Loading Engine vs Side-by-Side */}
        <div className="flex items-center gap-1 p-1 rounded-2xl glass-dock border border-white/10 text-xs">
          <button
            onClick={() => setActiveView('text-effect')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-medium transition-all cursor-pointer ${
              activeView === 'text-effect'
                ? 'bg-white text-black font-bold shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>1. Locked Text Effect</span>
          </button>

          <button
            onClick={() => setActiveView('loading-engine')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-medium transition-all cursor-pointer ${
              activeView === 'loading-engine'
                ? 'bg-amber-400 text-black font-bold shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>2. Locked Canvas Loading & Swipe</span>
          </button>

          <button
            onClick={() => setActiveView('split-view')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-medium transition-all cursor-pointer ${
              activeView === 'split-view'
                ? 'bg-cyan-400 text-black font-bold shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Preview Both</span>
          </button>
        </div>

        <div className="hidden lg:flex items-center gap-2 font-mono text-[11px] text-zinc-500">
          <span>COMMIT:</span>
          <span className="text-zinc-300 font-bold font-mono">df455d3</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MAIN VIEWPORT DISPLAY AREA                                                */}
      {/* ========================================================================= */}
      <div className="relative z-10 w-full flex-1 flex items-center justify-center p-4">
        
        {/* VIEW 1: LOCKED TEXT EFFECT (COMMIT df455d3) */}
        {activeView === 'text-effect' && (
          <div className="w-full flex items-center justify-center animate-in fade-in duration-300">
            <WwdcTextEffect
              text={selectedText}
              direction={direction}
              lightPosition={lightPosition}
              bloomStrength={bloomStrength}
              chromaticIntensity={chromaticIntensity}
              oppositeGlowStrength={oppositeGlowStrength}
            />
          </div>
        )}

        {/* VIEW 2: LOCKED CANVAS FLUID LOADING & SWIPE ENGINE (FROM HTML) */}
        {activeView === 'loading-engine' && (
          <div className="relative w-full max-w-4xl aspect-video rounded-2xl bg-[#000000] border border-neutral-800/90 overflow-hidden shadow-2xl flex items-center justify-center animate-in fade-in duration-300">
            
            {/* Canvas Fluid Light Engine (Perimeter Orbit + Center Sweep) */}
            <CanvasFluidLightEngine
              ref={engineRef}
              autoPlay={true}
              onUncoverProgress={setUncoverLeft}
              onStateChange={setEngineState}
            />

            {/* Uncover Mask Reveal Area */}
            <div
              className="relative z-10 w-full h-full flex flex-col items-center justify-center"
              style={{
                clipPath: `inset(0 0 0 ${uncoverLeft}%)`,
                willChange: 'clip-path',
              }}
            >
              <div className="text-center">
                <span className="font-['Orbitron'] font-black text-6xl tracking-wider text-white">
                  &apos;VERSE
                </span>
                <p className="text-xs font-mono text-neutral-400 mt-2 tracking-widest uppercase">
                  State: {engineState === 1 ? '1 / Loading Orbit' : engineState === 2 ? '2 / Docking & Sweep' : '3 / Settled Resting Beam'}
                </p>
              </div>
            </div>

            {/* Loading Badge & Trigger Controls */}
            <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
              <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-neutral-900/80 border border-neutral-700/80 text-amber-300">
                {engineState === 1 ? '● Orbiting Perimeter' : engineState === 2 ? '● Sweeping Center' : '● Loaded State'}
              </span>
            </div>

          </div>
        )}

        {/* VIEW 3: SPLIT / COMBINED SANDBOX PREVIEW */}
        {activeView === 'split-view' && (
          <div className="relative w-full max-w-5xl aspect-video rounded-2xl bg-[#000000] border border-neutral-800/90 overflow-hidden shadow-2xl flex items-center justify-center animate-in fade-in duration-300">
            
            {/* Fluid Canvas Light Engine */}
            <CanvasFluidLightEngine
              ref={engineRef}
              autoPlay={true}
              onUncoverProgress={setUncoverLeft}
              onStateChange={setEngineState}
            />

            {/* Locked Text Effect inside Uncover Layer */}
            <div
              className="relative z-10 w-full h-full flex items-center justify-center"
              style={{
                clipPath: `inset(0 0 0 ${uncoverLeft}%)`,
                willChange: 'clip-path',
              }}
            >
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
        )}

      </div>

      {/* ========================================================================= */}
      {/* BOTTOM CONTROLS DOCK                                                      */}
      {/* ========================================================================= */}
      {activeView === 'text-effect' ? (
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
      ) : (
        <div className="relative z-30 pb-8 flex items-center gap-3">
          <button
            onClick={() => engineRef.current?.replay()}
            className="text-xs font-mono tracking-widest text-amber-400 hover:text-amber-300 bg-amber-950/40 border border-amber-500/40 px-5 py-2.5 rounded-full backdrop-blur-md transition-all cursor-pointer flex items-center gap-2 shadow-xl hover:bg-amber-900/50 hover:scale-105"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>REPLAY LOADING & SWIPE ANIMATION</span>
          </button>
        </div>
      )}

    </main>
  );
};
