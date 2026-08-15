import React, { useState } from 'react';
import { ColorTheme, ColorThemeId, OpticsSettings } from '../../types';
import {
  RotateCcw,
  Sliders,
  Sparkles,
  Sun,
  Eye,
  ChevronUp,
  ChevronDown,
  Palette,
} from 'lucide-react';

interface PortalControlsProps {
  currentTheme: ColorTheme;
  themes: ColorTheme[];
  onSelectTheme: (id: ColorThemeId) => void;
  optics: OpticsSettings;
  onChangeOptics: (newOptics: Partial<OpticsSettings>) => void;
  onReplayLoader: () => void;
}

export const PortalControls: React.FC<PortalControlsProps> = ({
  currentTheme,
  themes,
  onSelectTheme,
  optics,
  onChangeOptics,
  onReplayLoader,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3 select-none">
      {/* Expanded Optics Lab Panel */}
      {isOpen && (
        <div
          className="glass-panel p-5 rounded-3xl w-80 sm:w-96 flex flex-col gap-4 text-white animate-in fade-in slide-in-from-bottom-4 duration-300"
          style={{
            borderColor: `${currentTheme.primary}40`,
            boxShadow: `0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px ${currentTheme.borderGlow}`,
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Sliders
                className="w-4 h-4"
                style={{ color: currentTheme.primary }}
              />
              <span className="font-bold text-sm tracking-wide">
                OPTICS & SPECTRUM LAB
              </span>
            </div>
            <span className="font-mono text-[10px] text-zinc-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
              D-UI // V1.0
            </span>
          </div>

          {/* Theme Palette Selection */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs text-zinc-300 font-medium">
              <span className="flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-zinc-400" />
                <span>Chromatic Spectrum</span>
              </span>
              <span
                className="font-mono font-bold"
                style={{ color: currentTheme.primary }}
              >
                {currentTheme.name}
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => onSelectTheme(t.id)}
                  className={`group relative h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer border ${
                    currentTheme.id === t.id
                      ? 'border-white scale-105 shadow-lg'
                      : 'border-white/10 hover:border-white/40'
                  }`}
                  style={{
                    background: `linear-gradient(135deg, ${t.primary}, ${t.secondary})`,
                    boxShadow:
                      currentTheme.id === t.id
                        ? `0 0 15px ${t.glow}`
                        : undefined,
                  }}
                  title={t.name}
                >
                  {currentTheme.id === t.id && (
                    <Sparkles className="w-3.5 h-3.5 text-white drop-shadow-md" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Sliders */}
          <div className="flex flex-col gap-3.5 pt-1">
            {/* Glow Intensity */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs text-zinc-300">
                <span className="flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-zinc-400" />
                  <span>D-Glow Luminescence</span>
                </span>
                <span className="font-mono text-zinc-400">
                  {Math.round(optics.glowIntensity * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.3"
                max="1.8"
                step="0.05"
                value={optics.glowIntensity}
                onChange={(e) =>
                  onChangeOptics({ glowIntensity: parseFloat(e.target.value) })
                }
                className="w-full accent-cyan-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                style={{ accentColor: currentTheme.primary }}
              />
            </div>

            {/* Starfield Particle Density */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs text-zinc-300">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Cosmic Stardust Density</span>
                </span>
                <span className="font-mono text-zinc-400">
                  {optics.particleDensity}
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="120"
                step="5"
                value={optics.particleDensity}
                onChange={(e) =>
                  onChangeOptics({ particleDensity: parseInt(e.target.value) })
                }
                className="w-full accent-cyan-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                style={{ accentColor: currentTheme.primary }}
              />
            </div>

            {/* Interactive Raytracing Tilt Toggle */}
            <div className="flex items-center justify-between pt-1 border-t border-white/10">
              <div className="flex items-center gap-2 text-xs text-zinc-300">
                <Eye className="w-3.5 h-3.5 text-zinc-400" />
                <span>Dynamic Cursor Raytracing</span>
              </div>
              <button
                onClick={() =>
                  onChangeOptics({
                    interactiveLighting: !optics.interactiveLighting,
                  })
                }
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                  optics.interactiveLighting ? 'bg-cyan-500' : 'bg-zinc-800'
                }`}
                style={{
                  backgroundColor: optics.interactiveLighting
                    ? currentTheme.primary
                    : undefined,
                }}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    optics.interactiveLighting ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Bottom Floating Bar */}
      <div className="flex items-center gap-2">
        {/* Replay Perimeter Animation Button */}
        <button
          onClick={onReplayLoader}
          className="glass-pill-btn group flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold text-zinc-200 hover:text-white cursor-pointer shadow-xl"
          style={{
            borderColor: `${currentTheme.primary}40`,
          }}
        >
          <RotateCcw className="w-3.5 h-3.5 group-hover:-rotate-45 transition-transform" />
          <span>REPLAY INTRO LOADER</span>
        </button>

        {/* Toggle Optics Lab Panel Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="glass-pill-btn flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold text-white cursor-pointer shadow-xl"
          style={{
            borderColor: `${currentTheme.primary}60`,
            boxShadow: `0 0 20px ${currentTheme.borderGlow}`,
          }}
        >
          <Sliders
            className="w-3.5 h-3.5"
            style={{ color: currentTheme.primary }}
          />
          <span>OPTICS LAB</span>
          {isOpen ? (
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
          ) : (
            <ChevronUp className="w-3.5 h-3.5 text-zinc-400" />
          )}
        </button>
      </div>
    </div>
  );
};
