import React, { useState, useEffect } from 'react';
import { WwdcTextEffect, FlowDirection } from './components/WwdcTextEffect';
import { Metallic3dScene, ModelType } from './components/Metallic3dScene';
import { Sparkles, Box, Sliders } from 'lucide-react';

type ViewTab = 'text-effect' | '3d-metallic';
type TextMode = 'fixed' | 'interactive' | 'sweep';

export const App: React.FC = () => {
  // View Tab
  const [activeTab, setActiveTab] = useState<ViewTab>('text-effect');

  // Text Effect State
  const [selectedText, setSelectedText] = useState<string>("'Verse");
  const [direction, setDirection] = useState<FlowDirection>('left-to-right');
  const [textMode, setTextMode] = useState<TextMode>('fixed');
  const [lightPosition, setLightPosition] = useState<number>(18); // Default 18% for L2R
  const [bloomStrength, setBloomStrength] = useState<number>(1.0);
  const [chromaticIntensity, setChromaticIntensity] = useState<number>(1.0);

  // 3D Metallic Scene State
  const [selectedModel, setSelectedModel] = useState<ModelType>('swift');
  const [roughness, setRoughness] = useState<number>(0.18);
  const [warmGlow, setWarmGlow] = useState<number>(1.1);
  const [coolGlow, setCoolGlow] = useState<number>(1.0);
  const [cursorLight, setCursorLight] = useState<number>(1.2);

  // UI Panel Visibility
  const [showControls, setShowControls] = useState<boolean>(true);

  // Synchronize text direction when changing presets
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

  // Automated ambient sweep for text
  useEffect(() => {
    if (activeTab !== 'text-effect' || textMode !== 'sweep') return;

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
  }, [activeTab, textMode]);

  return (
    <main className="relative w-screen h-screen bg-black overflow-hidden flex flex-col items-center justify-between select-none">
      
      {/* Background Subtle Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 50%, #08080c 0%, #000000 90%)',
        }}
      />

      {/* ========================================================================= */}
      {/* TOP TAB NAVIGATION BAR */}
      {/* ========================================================================= */}
      <header className="relative z-30 pt-8 px-6 flex items-center justify-between w-full max-w-5xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center font-black text-sm text-white shadow-lg">
            D
          </div>
          <span className="font-mono text-xs tracking-widest text-zinc-400 font-semibold hidden sm:inline">
            D-UI // OPTICAL LAB
          </span>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl glass-dock border border-white/10">
          <button
            onClick={() => setActiveTab('text-effect')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'text-effect'
                ? 'bg-white text-black shadow-lg font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>OPTICAL TEXT EFFECT</span>
          </button>

          <button
            onClick={() => setActiveTab('3d-metallic')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === '3d-metallic'
                ? 'bg-white text-black shadow-lg font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>3D METALLIC SHADER</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 font-mono text-[11px] text-zinc-500">
          <span>STATUS:</span>
          <span className="text-emerald-400 font-bold">READY</span>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* MAIN VIEWPORT DISPLAY AREA */}
      {/* ========================================================================= */}
      <div className="relative z-10 w-full flex-1 flex items-center justify-center">
        {activeTab === 'text-effect' ? (
          <WwdcTextEffect
            text={selectedText}
            direction={direction}
            lightPosition={lightPosition}
            interactive={textMode === 'interactive'}
            chromaticIntensity={chromaticIntensity}
            bloomStrength={bloomStrength}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Metallic3dScene
              modelType={selectedModel}
              roughness={roughness}
              metalness={0.95}
              warmGlowIntensity={warmGlow}
              coolGlowIntensity={coolGlow}
              cursorLightIntensity={cursorLight}
            />
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* FLOATING MINIMALIST CONTROL DOCK */}
      {/* ========================================================================= */}
      <div className="relative z-30 pb-8 flex flex-col items-center gap-3 transition-all duration-300">
        
        {/* Toggle Panel Button */}
        <button
          onClick={() => setShowControls(!showControls)}
          className="text-xs font-mono tracking-widest text-zinc-500 hover:text-zinc-300 bg-zinc-900/60 border border-zinc-800/80 px-4 py-1.5 rounded-full backdrop-blur-md transition-all cursor-pointer flex items-center gap-1.5"
        >
          <Sliders className="w-3 h-3 text-zinc-400" />
          <span>{showControls ? 'HIDE CONTROLS' : 'FINE-TUNE SETTINGS'}</span>
        </button>

        {showControls && (
          <div className="glass-dock p-4 sm:p-5 rounded-3xl flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-zinc-300 animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-5xl">
            
            {/* CONTROLS FOR TAB 1: OPTICAL TEXT */}
            {activeTab === 'text-effect' ? (
              <>
                {/* Text Presets */}
                <div className="flex items-center gap-2">
                  <span className="font-mono text-zinc-500 font-semibold uppercase text-[10px]">PRESET:</span>
                  <div className="flex items-center gap-1 bg-black/40 p-1 rounded-2xl border border-white/5">
                    {["'Verse", "D'Verse", "WWDC26"].map((t) => (
                      <button
                        key={t}
                        onClick={() => handleSelectText(t)}
                        className={`px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer ${
                          selectedText === t
                            ? 'bg-white text-black shadow-md font-bold'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="hidden sm:block w-[1px] h-6 bg-white/10" />

                {/* Direction Switcher (L2R vs R2L) */}
                <div className="flex items-center gap-2">
                  <span className="font-mono text-zinc-500 font-semibold uppercase text-[10px]">FLOW:</span>
                  <div className="flex items-center gap-1 bg-black/40 p-1 rounded-2xl border border-white/5">
                    <button
                      onClick={() => {
                        setDirection('left-to-right');
                        setLightPosition(18);
                      }}
                      className={`px-2.5 py-1.5 rounded-xl font-medium transition-all cursor-pointer ${
                        direction === 'left-to-right'
                          ? 'bg-white/20 text-white border border-white/30 font-semibold'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      Left &rarr; Right
                    </button>
                    <button
                      onClick={() => {
                        setDirection('right-to-left');
                        setLightPosition(82);
                      }}
                      className={`px-2.5 py-1.5 rounded-xl font-medium transition-all cursor-pointer ${
                        direction === 'right-to-left'
                          ? 'bg-white/20 text-white border border-white/30 font-semibold'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      Right &rarr; Left
                    </button>
                  </div>
                </div>

                <div className="hidden sm:block w-[1px] h-6 bg-white/10" />

                {/* Modes */}
                <div className="flex items-center gap-2">
                  <span className="font-mono text-zinc-500 font-semibold uppercase text-[10px]">MODE:</span>
                  <div className="flex items-center gap-1 bg-black/40 p-1 rounded-2xl border border-white/5">
                    {[
                      { id: 'fixed', label: 'Fixed Light' },
                      { id: 'interactive', label: 'Cursor Sweep' },
                      { id: 'sweep', label: 'Auto Sweep' },
                    ].map((m) => (
                      <button
                        key={m.id}
                        onClick={() => {
                          setTextMode(m.id as TextMode);
                          if (m.id === 'fixed') setLightPosition(direction === 'left-to-right' ? 18 : 82);
                        }}
                        className={`px-2.5 py-1.5 rounded-xl font-medium transition-all cursor-pointer ${
                          textMode === m.id
                            ? 'bg-white/20 text-white border border-white/30 font-semibold'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Light Position Slider */}
                {textMode === 'fixed' && (
                  <>
                    <div className="hidden sm:block w-[1px] h-6 bg-white/10" />
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-zinc-500 text-[10px]">POS:</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={lightPosition}
                        onChange={(e) => setLightPosition(parseFloat(e.target.value))}
                        className="w-20 accent-white h-1 bg-zinc-800 rounded-lg cursor-pointer"
                      />
                    </div>
                  </>
                )}

                <div className="hidden sm:block w-[1px] h-6 bg-white/10" />

                {/* Bloom & Chromatic Sliders */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-zinc-500 text-[10px]">BLOOM:</span>
                    <input
                      type="range"
                      min="0.4"
                      max="1.8"
                      step="0.1"
                      value={bloomStrength}
                      onChange={(e) => setBloomStrength(parseFloat(e.target.value))}
                      className="w-14 accent-white h-1 bg-zinc-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-zinc-500 text-[10px]">PRISM:</span>
                    <input
                      type="range"
                      min="0.2"
                      max="2.0"
                      step="0.1"
                      value={chromaticIntensity}
                      onChange={(e) => setChromaticIntensity(parseFloat(e.target.value))}
                      className="w-14 accent-white h-1 bg-zinc-800 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              </>
            ) : (
              /* CONTROLS FOR TAB 2: 3D METALLIC SCENE */
              <>
                {/* 3D Model Switcher */}
                <div className="flex items-center gap-2">
                  <span className="font-mono text-zinc-500 font-semibold uppercase text-[10px]">3D MODEL:</span>
                  <div className="flex items-center gap-1 bg-black/40 p-1 rounded-2xl border border-white/5">
                    {[
                      { id: 'swift', label: 'Swift Bird' },
                      { id: 'dverse', label: "D'Verse Portal" },
                      { id: 'apple', label: 'Apple Logo' },
                      { id: 'sphere', label: 'Sphere' },
                      { id: 'torus', label: 'Torus Knot' },
                    ].map((mod) => (
                      <button
                        key={mod.id}
                        onClick={() => setSelectedModel(mod.id as ModelType)}
                        className={`px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer ${
                          selectedModel === mod.id
                            ? 'bg-white text-black shadow-md font-bold'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        {mod.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="hidden sm:block w-[1px] h-6 bg-white/10" />

                {/* 3D Sliders */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-zinc-400 text-[10px]">ROUGH:</span>
                    <input
                      type="range"
                      min="0.05"
                      max="0.6"
                      step="0.02"
                      value={roughness}
                      onChange={(e) => setRoughness(parseFloat(e.target.value))}
                      className="w-14 accent-white h-1 bg-zinc-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-amber-400 text-[10px]">WARM:</span>
                    <input
                      type="range"
                      min="0.3"
                      max="2.5"
                      step="0.1"
                      value={warmGlow}
                      onChange={(e) => setWarmGlow(parseFloat(e.target.value))}
                      className="w-14 accent-amber-400 h-1 bg-zinc-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-sky-400 text-[10px]">COOL:</span>
                    <input
                      type="range"
                      min="0.3"
                      max="2.5"
                      step="0.1"
                      value={coolGlow}
                      onChange={(e) => setCoolGlow(parseFloat(e.target.value))}
                      className="w-14 accent-sky-400 h-1 bg-zinc-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-white text-[10px]">CURSOR:</span>
                    <input
                      type="range"
                      min="0.2"
                      max="2.5"
                      step="0.1"
                      value={cursorLight}
                      onChange={(e) => setCursorLight(parseFloat(e.target.value))}
                      className="w-14 accent-white h-1 bg-zinc-800 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              </>
            )}

          </div>
        )}
      </div>

    </main>
  );
};
