import React from 'react';
import { Sparkles, Sliders } from 'lucide-react';
import { FlowDirection } from './WwdcTextEffect';

type TextMode = 'fixed' | 'sweep';

interface ControlDockProps {
  selectedText: string;
  onSelectText: (t: string) => void;
  direction: FlowDirection;
  onSetDirection: (d: FlowDirection) => void;
  onSetLightPosition: (p: number) => void;
  textMode: TextMode;
  onSetTextMode: (m: TextMode) => void;
  lightPosition: number;
  bloomStrength: number;
  onSetBloomStrength: (v: number) => void;
  chromaticIntensity: number;
  onSetChromaticIntensity: (v: number) => void;
  specularEdgeIntensity: number;
  onSetSpecularEdgeIntensity: (v: number) => void;
  oppositeGlowStrength: number;
  onSetOppositeGlowStrength: (v: number) => void;
  showControls: boolean;
  onToggleControls: () => void;
}

export const ControlDock: React.FC<ControlDockProps> = ({
  selectedText,
  onSelectText,
  direction,
  onSetDirection,
  onSetLightPosition,
  textMode,
  onSetTextMode,
  lightPosition,
  bloomStrength,
  onSetBloomStrength,
  chromaticIntensity,
  onSetChromaticIntensity,
  specularEdgeIntensity,
  onSetSpecularEdgeIntensity,
  oppositeGlowStrength,
  onSetOppositeGlowStrength,
  showControls,
  onToggleControls,
}) => {
  return (
    <div className="relative z-30 pb-8 flex flex-col items-center gap-3 transition-all duration-300">
      
      {/* Toggle Panel Button */}
      <button
        onClick={onToggleControls}
        className="text-xs font-mono tracking-widest text-zinc-500 hover:text-zinc-300 bg-zinc-900/60 border border-zinc-800/80 px-4 py-1.5 rounded-full backdrop-blur-md transition-all cursor-pointer flex items-center gap-1.5"
      >
        <Sliders className="w-3 h-3 text-zinc-400" />
        <span>{showControls ? 'HIDE CONTROLS' : 'FINE-TUNE SETTINGS'}</span>
      </button>

      {showControls && (
        <div className="glass-dock p-4 sm:p-5 rounded-3xl flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-zinc-300 max-w-5xl">
          
          {/* Text Presets */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-zinc-500 font-semibold uppercase text-[10px]">PRESET:</span>
            <div className="flex items-center gap-1 bg-black/40 p-1 rounded-2xl border border-white/5">
              {["'Verse", "D'Verse", "WWDC26"].map((t) => (
                <button
                  key={t}
                  onClick={() => onSelectText(t)}
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

          {/* Direction Switcher */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-zinc-500 font-semibold uppercase text-[10px]">FLOW:</span>
            <div className="flex items-center gap-1 bg-black/40 p-1 rounded-2xl border border-white/5">
              <button
                onClick={() => {
                  onSetDirection('left-to-right');
                  onSetLightPosition(18);
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
                  onSetDirection('right-to-left');
                  onSetLightPosition(82);
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
                { id: 'sweep', label: 'Auto Sweep' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    onSetTextMode(m.id as TextMode);
                    if (m.id === 'fixed') onSetLightPosition(direction === 'left-to-right' ? 18 : 82);
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
                  onChange={(e) => onSetLightPosition(parseFloat(e.target.value))}
                  className="w-20 accent-white h-1 bg-zinc-800 rounded-lg cursor-pointer"
                />
              </div>
            </>
          )}

          <div className="hidden sm:block w-[1px] h-6 bg-white/10" />

          {/* Fine Tuning Sliders */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-zinc-400 text-[10px]">3D BEVEL:</span>
              <input
                type="range"
                min="0.2"
                max="2.5"
                step="0.1"
                value={specularEdgeIntensity}
                onChange={(e) => onSetSpecularEdgeIntensity(parseFloat(e.target.value))}
                className="w-14 accent-white h-1 bg-zinc-800 rounded-lg cursor-pointer"
                title="3D Specular Bevel Border Intensity"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <span className="font-mono text-zinc-500 text-[10px]">BLOOM:</span>
              <input
                type="range"
                min="0.4"
                max="1.8"
                step="0.1"
                value={bloomStrength}
                onChange={(e) => onSetBloomStrength(parseFloat(e.target.value))}
                className="w-14 accent-white h-1 bg-zinc-800 rounded-lg cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <span className="font-mono text-amber-400 text-[10px]">PRISM:</span>
              <input
                type="range"
                min="0.2"
                max="2.0"
                step="0.1"
                value={chromaticIntensity}
                onChange={(e) => onSetChromaticIntensity(parseFloat(e.target.value))}
                className="w-14 accent-amber-400 h-1 bg-zinc-800 rounded-lg cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <span className="font-mono text-sky-400 text-[10px]">BACK RIM:</span>
              <input
                type="range"
                min="0.0"
                max="2.0"
                step="0.1"
                value={oppositeGlowStrength}
                onChange={(e) => onSetOppositeGlowStrength(parseFloat(e.target.value))}
                className="w-14 accent-sky-400 h-1 bg-zinc-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export const AppHeader: React.FC = () => (
  <header className="relative z-30 pt-8 px-6 flex items-center justify-between w-full max-w-5xl">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center font-black text-sm text-white shadow-lg">
        D
      </div>
      <div className="flex flex-col">
        <span className="font-bold text-sm tracking-wide text-white flex items-center gap-1.5">
          <span>D&apos;VERSE</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-zinc-300">
            OPTICAL ENGINE
          </span>
        </span>
      </div>
    </div>

    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-zinc-300 font-mono">
      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
      <span>SPECULAR TYPOGRAPHY V2</span>
    </div>
  </header>
);
