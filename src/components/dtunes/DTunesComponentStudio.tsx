import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Sun, Moon, Sliders, RotateCcw } from 'lucide-react';
import { OpticalButton } from './OpticalControls';
import { StippleNoiseBlur } from './StippleNoiseBlur';

export const DTunesComponentStudio: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [backgroundTheme, setBackgroundTheme] = useState<'dark' | 'light'>('dark');
  const [activeConcept, setActiveConcept] = useState<'A' | 'B' | 'C'>('A');
  const [buttonSize, setButtonSize] = useState<'md' | 'lg'>('lg');
  const [iconStyle, setIconStyle] = useState<'solid' | 'hairline'>('solid');
  const [impulseCount, setImpulseCount] = useState<number>(0);
  const [showParameters, setShowParameters] = useState<boolean>(true);

  // Stipple Noise Blur Parameters
  const [blurRadius, setBlurRadius] = useState<number>(110);
  const [stippleDensity, setStippleDensity] = useState<number>(2800);
  const [dotSize, setDotSize] = useState<number>(1.1);
  const [needleCount, setNeedleCount] = useState<number>(8); // 8 needles matching the 8 of clubs card!
  const [needleLength, setNeedleLength] = useState<number>(75);
  const [turbulence, setTurbulence] = useState<number>(0.5);
  const [falloff, setFalloff] = useState<number>(1.6);

  const isLight = backgroundTheme === 'light';

  // Toggle playback and trigger noise blur impulse burst
  const handlePlayToggle = useCallback(() => {
    setIsPlaying((prev) => !prev);
    setImpulseCount((c) => c + 1);
  }, []);

  // Global Spacebar listener — Works anywhere on the screen regardless of focus!
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or slider
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault(); // Stop page scrolling
        handlePlayToggle();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePlayToggle]);

  const resetParameters = () => {
    setBlurRadius(110);
    setStippleDensity(2800);
    setDotSize(1.1);
    setNeedleCount(8);
    setNeedleLength(75);
    setTurbulence(0.5);
    setFalloff(1.6);
  };

  const btnDimension = buttonSize === 'lg' ? 'w-20 h-20' : 'w-14 h-14';
  const iconPixelSize = buttonSize === 'lg' ? 28 : 20;

  return (
    <div
      className={`min-h-screen w-full transition-colors duration-500 flex flex-col items-center justify-between p-6 sm:p-10 select-none font-sans ${
        isLight ? 'bg-[#f6f5f0] text-zinc-900' : 'bg-[#050508] text-zinc-100'
      }`}
    >
      {/* 1. TOP HEADER */}
      <header className="w-full max-w-5xl flex items-center justify-between pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold tracking-widest text-zinc-400 uppercase">
              D'Tunes Optical UI
            </span>
            <span className="text-zinc-600">•</span>
            <span className="text-xs font-mono text-zinc-500">Component #01 Lab</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight mt-0.5">
            Hero Play / Pause & Noise Blur
          </h1>
        </div>

        {/* Studio Quick Actions */}
        <div className="flex items-center gap-2">
          {/* Parameter Drawer Toggle */}
          <button
            onClick={() => setShowParameters(!showParameters)}
            className={`px-3 py-1.5 rounded-full text-xs font-mono font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
              showParameters
                ? isLight
                  ? 'bg-zinc-900 text-white border-zinc-900'
                  : 'bg-white text-zinc-950 border-white'
                : isLight
                ? 'bg-zinc-200 text-zinc-800 border-zinc-300'
                : 'bg-zinc-900 text-zinc-300 border-zinc-800'
            }`}
          >
            <Sliders size={13} />
            <span>Blur Parameters</span>
          </button>

          {/* Theme Switcher */}
          <button
            onClick={() => setBackgroundTheme(isLight ? 'dark' : 'light')}
            className={`px-3 py-1.5 rounded-full text-xs font-mono font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
              isLight
                ? 'bg-zinc-200 text-zinc-900 border-zinc-300 hover:bg-zinc-300'
                : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800'
            }`}
          >
            {isLight ? <Moon size={13} /> : <Sun size={13} />}
            <span>{isLight ? 'Dark Obsidian' : 'Stark 8♣ Paper'}</span>
          </button>
        </div>
      </header>

      {/* 2. MAIN STAGE */}
      <main className="w-full max-w-5xl flex-1 flex flex-col lg:flex-row items-center justify-center gap-8 my-8">
        {/* LEFT: INSPECTION PEDESTAL WITH LIVING NOISE BLUR */}
        <div className="flex-1 w-full flex flex-col items-center">
          {/* Concept Tabs */}
          <div
            className={`flex items-center gap-1 p-1 rounded-2xl border mb-6 backdrop-blur-md transition-colors ${
              isLight ? 'bg-zinc-200/90 border-zinc-300' : 'bg-zinc-900/90 border-white/10'
            }`}
          >
            {(['A', 'B', 'C'] as const).map((concept) => {
              const labels = {
                A: 'Concept A: Chiseled Porcelain',
                B: 'Concept B: Smoked Titanium',
                C: 'Concept C: Floating Hairline Bezel',
              };
              const isSelected = activeConcept === concept;
              return (
                <button
                  key={concept}
                  onClick={() => setActiveConcept(concept)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? isLight
                        ? 'bg-zinc-950 text-white font-bold shadow'
                        : 'bg-white text-zinc-950 font-bold shadow'
                      : isLight
                      ? 'text-zinc-600 hover:text-zinc-950'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {labels[concept]}
                </button>
              );
            })}
          </div>

          {/* INSPECTION CANVAS */}
          <div
            className={`relative w-full max-w-lg aspect-[16/11] rounded-[36px] border flex flex-col items-center justify-center overflow-hidden transition-all duration-300 select-none ${
              isLight
                ? 'bg-white/90 border-zinc-300 shadow-[0_25px_60px_rgba(0,0,0,0.06)]'
                : 'bg-[#09090e] border-white/10 shadow-[0_30px_70px_rgba(0,0,0,0.85)]'
            }`}
          >
            {/* 1. NOISE BLUR ENGINE (Living procedural stipple dither from uploaded 8♣ card) */}
            <StippleNoiseBlur
              active={isPlaying}
              impulse={impulseCount}
              radius={blurRadius}
              innerRadius={buttonSize === 'lg' ? 36 : 26}
              density={stippleDensity}
              dotSize={dotSize}
              needleCount={needleCount}
              needleLength={needleLength}
              theme={backgroundTheme}
              turbulence={turbulence}
              falloff={falloff}
              className="z-0"
            />

            {/* 2. THE TACTILE BUTTON (Zero colored glow, pure optical chiseled contrast) */}
            <div className="relative z-10 flex flex-col items-center">
              {/* CONCEPT A: Chiseled Porcelain */}
              {activeConcept === 'A' && (
                <button
                  onClick={handlePlayToggle}
                  className={`group relative ${btnDimension} rounded-full transition-all duration-200 transform active:scale-90 hover:scale-105 cursor-pointer flex items-center justify-center ${
                    isLight
                      ? 'bg-zinc-950 text-white border border-zinc-800 shadow-[0_10px_25px_rgba(0,0,0,0.18)]'
                      : 'bg-white text-zinc-950 border border-white/80 shadow-[0_12px_35px_rgba(0,0,0,0.6)]'
                  }`}
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {/* Subtle Inner Specular Ridge Line */}
                  <span className="absolute inset-[1.5px] rounded-full border border-white/20 pointer-events-none" />

                  {/* Icon */}
                  <span className="relative z-10 transition-transform duration-150">
                    {isPlaying ? (
                      <Pause
                        size={iconPixelSize}
                        className={iconStyle === 'solid' ? 'fill-current stroke-current' : 'stroke-current stroke-[2.2]'}
                      />
                    ) : (
                      <Play
                        size={iconPixelSize}
                        className={`${iconStyle === 'solid' ? 'fill-current stroke-current' : 'stroke-current stroke-[2.2]'} ml-0.5`}
                      />
                    )}
                  </span>
                </button>
              )}

              {/* CONCEPT B: Smoked Titanium */}
              {activeConcept === 'B' && (
                <button
                  onClick={handlePlayToggle}
                  className={`group relative ${btnDimension} rounded-full transition-all duration-200 transform active:scale-90 hover:scale-105 cursor-pointer flex items-center justify-center border backdrop-blur-xl ${
                    isLight
                      ? 'bg-zinc-100 text-zinc-900 border-zinc-400/80 shadow-md'
                      : 'bg-zinc-900/90 text-white border-white/25 shadow-[0_12px_35px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.3)]'
                  }`}
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  <span className="relative z-10 transition-transform duration-150">
                    {isPlaying ? (
                      <Pause
                        size={iconPixelSize}
                        className={iconStyle === 'solid' ? 'fill-current stroke-current' : 'stroke-current stroke-[2.2]'}
                      />
                    ) : (
                      <Play
                        size={iconPixelSize}
                        className={`${iconStyle === 'solid' ? 'fill-current stroke-current' : 'stroke-current stroke-[2.2]'} ml-0.5`}
                      />
                    )}
                  </span>
                </button>
              )}

              {/* CONCEPT C: Floating Hairline Bezel */}
              {activeConcept === 'C' && (
                <button
                  onClick={handlePlayToggle}
                  className={`group relative ${btnDimension} rounded-full transition-all duration-200 transform active:scale-90 hover:scale-105 cursor-pointer flex items-center justify-center ${
                    isLight
                      ? 'bg-white text-zinc-950 border-2 border-zinc-900 shadow-md'
                      : 'bg-black text-white border-2 border-white shadow-[0_12px_35px_rgba(0,0,0,0.9)]'
                  }`}
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  <span className="relative z-10 transition-transform duration-150">
                    {isPlaying ? (
                      <Pause
                        size={iconPixelSize}
                        className={iconStyle === 'solid' ? 'fill-current stroke-current' : 'stroke-current stroke-[2.2]'}
                      />
                    ) : (
                      <Play
                        size={iconPixelSize}
                        className={`${iconStyle === 'solid' ? 'fill-current stroke-current' : 'stroke-current stroke-[2.2]'} ml-0.5`}
                      />
                    )}
                  </span>
                </button>
              )}
            </div>

            {/* State Readout at bottom of inspection box */}
            <div className="absolute bottom-4 left-0 right-0 flex flex-col items-center pointer-events-none">
              <span className="font-mono text-[10px] uppercase font-bold tracking-widest text-zinc-500">
                {isPlaying ? 'ACTIVE • PLAYING' : 'IDLE • PAUSED'}
              </span>
              <span className="text-[10px] font-mono text-zinc-400 mt-0.5">
                Press [Space] anywhere on page to toggle & trigger noise burst
              </span>
            </div>
          </div>

          {/* Sibling Transport Bar Preview */}
          <div className="mt-6 flex flex-col items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
              Transport Cluster Integration
            </span>
            <div
              className={`flex items-center gap-3 px-5 py-2.5 rounded-full border backdrop-blur-md ${
                isLight ? 'bg-zinc-200/80 border-zinc-300' : 'bg-black/60 border-white/10'
              }`}
            >
              <OpticalButton size="sm" variant="ghost" title="Shuffle">
                <Shuffle size={15} />
              </OpticalButton>
              <OpticalButton size="sm" variant="ghost" title="Previous">
                <SkipBack size={16} />
              </OpticalButton>

              {/* Mini version in context */}
              <button
                onClick={handlePlayToggle}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all transform active:scale-90 hover:scale-105 cursor-pointer ${
                  isLight ? 'bg-zinc-950 text-white' : 'bg-white text-zinc-950'
                }`}
              >
                {isPlaying ? (
                  <Pause size={16} className="fill-current stroke-current" />
                ) : (
                  <Play size={16} className="fill-current stroke-current ml-0.5" />
                )}
              </button>

              <OpticalButton size="sm" variant="ghost" title="Next">
                <SkipForward size={16} />
              </OpticalButton>
              <OpticalButton size="sm" variant="ghost" title="Repeat">
                <Repeat size={15} />
              </OpticalButton>
            </div>
          </div>
        </div>

        {/* RIGHT: NOISE BLUR PARAMETERS INSPECTOR */}
        {showParameters && (
          <aside
            className={`w-full lg:w-80 rounded-3xl p-5 border flex flex-col gap-4 backdrop-blur-xl ${
              isLight
                ? 'bg-zinc-200/80 border-zinc-300 text-zinc-900'
                : 'bg-zinc-900/80 border-white/10 text-zinc-100'
            }`}
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
                Blur Parameters Lab
              </span>
              <button
                onClick={resetParameters}
                className="text-[10px] font-mono text-zinc-500 hover:text-white flex items-center gap-1 cursor-pointer"
                title="Reset to Defaults"
              >
                <RotateCcw size={11} />
                <span>Reset</span>
              </button>
            </div>

            {/* Slider 1: Blur Radius */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-zinc-400">Dispersion Radius</span>
                <span className="font-bold">{blurRadius}px</span>
              </div>
              <input
                type="range"
                min="50"
                max="180"
                value={blurRadius}
                onChange={(e) => setBlurRadius(Number(e.target.value))}
                className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-white"
              />
            </div>

            {/* Slider 2: Stipple Density */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-zinc-400">Stipple Grain Count</span>
                <span className="font-bold">{stippleDensity}</span>
              </div>
              <input
                type="range"
                min="600"
                max="6000"
                step="200"
                value={stippleDensity}
                onChange={(e) => setStippleDensity(Number(e.target.value))}
                className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-white"
              />
            </div>

            {/* Slider 3: Dot Particle Size */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-zinc-400">Grain Micron Size</span>
                <span className="font-bold">{dotSize.toFixed(1)}px</span>
              </div>
              <input
                type="range"
                min="0.6"
                max="2.4"
                step="0.1"
                value={dotSize}
                onChange={(e) => setDotSize(Number(e.target.value))}
                className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-white"
              />
            </div>

            {/* Slider 4: Needle Spikes Count */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-zinc-400">Needle Rays (Card Spikes)</span>
                <span className="font-bold">{needleCount} needles</span>
              </div>
              <div className="flex items-center gap-1.5">
                {[0, 4, 8, 12].map((n) => (
                  <button
                    key={n}
                    onClick={() => setNeedleCount(n)}
                    className={`flex-1 py-1 rounded-lg text-xs font-mono font-bold cursor-pointer border ${
                      needleCount === n
                        ? 'bg-white text-zinc-950 border-white'
                        : 'bg-black/30 text-zinc-400 border-white/5 hover:border-white/20'
                    }`}
                  >
                    {n === 0 ? 'None' : `${n}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Slider 5: Needle Length */}
            {needleCount > 0 && (
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-zinc-400">Needle Taper Reach</span>
                  <span className="font-bold">{needleLength}px</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="140"
                  value={needleLength}
                  onChange={(e) => setNeedleLength(Number(e.target.value))}
                  className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-white"
                />
              </div>
            )}

            {/* Slider 6: Turbulence / Breathing */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-zinc-400">Living Turbulence</span>
                <span className="font-bold">{Math.round(turbulence * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1.5"
                step="0.05"
                value={turbulence}
                onChange={(e) => setTurbulence(Number(e.target.value))}
                className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-white"
              />
            </div>

            {/* Toggle: Icon Glyph Style */}
            <div className="flex flex-col gap-1 pt-2 border-t border-white/10">
              <span className="text-xs font-mono text-zinc-400">Icon Glyph Style</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIconStyle('solid')}
                  className={`flex-1 py-1 rounded-xl text-xs font-mono font-bold cursor-pointer border ${
                    iconStyle === 'solid'
                      ? 'bg-white text-zinc-950 border-white'
                      : 'bg-black/30 text-zinc-400 border-white/5'
                  }`}
                >
                  Solid Fill
                </button>
                <button
                  onClick={() => setIconStyle('hairline')}
                  className={`flex-1 py-1 rounded-xl text-xs font-mono font-bold cursor-pointer border ${
                    iconStyle === 'hairline'
                      ? 'bg-white text-zinc-950 border-white'
                      : 'bg-black/30 text-zinc-400 border-white/5'
                  }`}
                >
                  Hairline
                </button>
              </div>
            </div>

            {/* Button Size Toggle */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-mono text-zinc-400">Button Scale</span>
              <div className="flex items-center gap-1 font-mono text-xs">
                <button
                  onClick={() => setButtonSize('md')}
                  className={`px-2 py-0.5 rounded cursor-pointer ${
                    buttonSize === 'md' ? 'bg-white text-black font-bold' : 'text-zinc-500'
                  }`}
                >
                  MD (56px)
                </button>
                <button
                  onClick={() => setButtonSize('lg')}
                  className={`px-2 py-0.5 rounded cursor-pointer ${
                    buttonSize === 'lg' ? 'bg-white text-black font-bold' : 'text-zinc-500'
                  }`}
                >
                  LG (80px)
                </button>
              </div>
            </div>
          </aside>
        )}
      </main>

      {/* 3. FOOTER */}
      <footer className="w-full max-w-5xl pt-4 border-t border-white/10 flex items-center justify-between text-xs text-zinc-500 font-mono">
        <div>Component #01 • Stipple Noise Blur & Hero Playback</div>
        <div>Active: {isPlaying ? 'YES' : 'NO'} • Impulses: {impulseCount}</div>
      </footer>
    </div>
  );
};
