import React from 'react';
import { Sliders, RotateCcw } from 'lucide-react';
import { FlowDirection } from './WwdcTextEffect';

export interface LabControlsProps {
  selectedText: string;
  onSelectText: (text: string) => void;
  direction: FlowDirection;
  onDirectionChange: (dir: FlowDirection) => void;
  bloomStrength: number;
  onBloomChange: (val: number) => void;
  chromaticIntensity: number;
  onChromaticChange: (val: number) => void;
  specularEdgeIntensity: number;
  onSpecularEdgeChange: (val: number) => void;
  onReplayAnimation: () => void;
  showControls: boolean;
  onToggleControls: () => void;
}

export const LabControlsDock: React.FC<LabControlsProps> = ({
  selectedText,
  onSelectText,
  direction,
  onDirectionChange,
  bloomStrength,
  onBloomChange,
  chromaticIntensity,
  onChromaticChange,
  specularEdgeIntensity,
  onSpecularEdgeChange,
  onReplayAnimation,
  showControls,
  onToggleControls,
}) => {
  return (
    <div className="relative z-30 pb-8 flex flex-col items-center gap-3 transition-all duration-300">
      {/* Toggle Panel Button */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleControls}
          className="text-xs font-mono tracking-widest text-zinc-500 hover:text-zinc-300 bg-zinc-900/60 border border-zinc-800/80 px-4 py-1.5 rounded-full backdrop-blur-md transition-all cursor-pointer flex items-center gap-1.5 shadow-lg"
        >
          <Sliders className="w-3 h-3 text-zinc-400" />
          <span>{showControls ? 'HIDE CONTROLS' : 'FINE-TUNE SETTINGS'}</span>
        </button>

        <button
          onClick={onReplayAnimation}
          className="text-xs font-mono tracking-widest text-amber-400/90 hover:text-amber-300 bg-amber-950/30 border border-amber-500/30 px-3.5 py-1.5 rounded-full backdrop-blur-md transition-all cursor-pointer flex items-center gap-1.5 shadow-lg hover:bg-amber-900/40"
          title="Replay Loading Portal Sweep Animation"
        >
          <RotateCcw className="w-3 h-3" />
          <span>REPLAY INTRO</span>
        </button>
      </div>

      {showControls && (
        <div className="glass-dock p-4 sm:p-5 rounded-3xl flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-zinc-300 animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-5xl">
          {/* Text Presets */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-zinc-500 font-semibold uppercase text-[10px]">
              PRESET:
            </span>
            <div className="flex items-center gap-1 bg-black/40 p-1 rounded-2xl border border-white/5">
              {["'Verse", "D'Verse", 'WWDC26'].map((t) => (
                <button
                  key={t}
                  onClick={() => onSelectText(t)}
                  className={`px-3.5 py-1.5 rounded-xl font-medium transition-all cursor-pointer ${
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
            <span className="font-mono text-zinc-500 font-semibold uppercase text-[10px]">
              FLOW:
            </span>
            <div className="flex items-center gap-1 bg-black/40 p-1 rounded-2xl border border-white/5">
              <button
                onClick={() => onDirectionChange('left-to-right')}
                className={`px-2.5 py-1.5 rounded-xl font-medium transition-all cursor-pointer ${
                  direction === 'left-to-right'
                    ? 'bg-white/20 text-white border border-white/30 font-semibold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Left &rarr; Right
              </button>
              <button
                onClick={() => onDirectionChange('right-to-left')}
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

          {/* Fine Tuning Sliders */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-zinc-400 text-[10px]">EDGES:</span>
              <input
                type="range"
                min="0.2"
                max="2.5"
                step="0.1"
                value={specularEdgeIntensity}
                onChange={(e) => onSpecularEdgeChange(parseFloat(e.target.value))}
                className="w-14 accent-white h-1 bg-zinc-800 rounded-lg cursor-pointer"
                title="Specular Border & Edge Highlight Intensity"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <span className="font-mono text-zinc-400 text-[10px]">BLOOM:</span>
              <input
                type="range"
                min="0.4"
                max="2.0"
                step="0.1"
                value={bloomStrength}
                onChange={(e) => onBloomChange(parseFloat(e.target.value))}
                className="w-14 accent-white h-1 bg-zinc-800 rounded-lg cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <span className="font-mono text-amber-400 text-[10px]">PRISM:</span>
              <input
                type="range"
                min="0.2"
                max="2.5"
                step="0.1"
                value={chromaticIntensity}
                onChange={(e) => onChromaticChange(parseFloat(e.target.value))}
                className="w-14 accent-amber-400 h-1 bg-zinc-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
