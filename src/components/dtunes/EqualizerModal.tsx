import React, { useState } from 'react';
import { Sliders, X, RotateCcw } from 'lucide-react';
import { EqualizerBand } from './types';
import { OpticalButton, OpticalBadge } from './OpticalControls';

export interface EqualizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

const DEFAULT_BANDS: EqualizerBand[] = [
  { label: 'Sub', freq: '60Hz', value: 4 },
  { label: 'Bass', freq: '230Hz', value: 2 },
  { label: 'Mid', freq: '910Hz', value: 0 },
  { label: 'Presence', freq: '3.6kHz', value: 3 },
  { label: 'Air', freq: '14kHz', value: 5 },
];

const PRESETS: Record<string, number[]> = {
  'Audiophile Flat': [0, 0, 0, 0, 0],
  'Sub Bass Punch': [8, 5, 1, 2, 3],
  'Acoustic Air': [2, 1, 0, 4, 7],
  'Vocal Clarity': [-2, 1, 5, 4, 2],
  'Late Night Warmth': [4, 3, 1, -1, -3],
};

export const EqualizerModal: React.FC<EqualizerModalProps> = ({
  isOpen,
  onClose,
  className = '',
}) => {
  const [bands, setBands] = useState<EqualizerBand[]>(DEFAULT_BANDS);
  const [activePreset, setActivePreset] = useState<string>('Custom');

  if (!isOpen) return null;

  const handleBandChange = (index: number, val: number) => {
    const updated = [...bands];
    updated[index].value = val;
    setBands(updated);
    setActivePreset('Custom');
  };

  const applyPreset = (name: string) => {
    const values = PRESETS[name];
    if (!values) return;
    const updated = bands.map((b, i) => ({ ...b, value: values[i] }));
    setBands(updated);
    setActivePreset(name);
  };

  const resetFlat = () => {
    applyPreset('Audiophile Flat');
  };

  return (
    <div
      className={`glass-dock rounded-3xl p-5 sm:p-6 flex flex-col w-full max-w-lg shadow-[0_30px_70px_rgba(0,0,0,0.9)] border border-white/10 z-50 select-none ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-300 border border-purple-500/20">
            <Sliders size={16} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Studio Graphic Equalizer</span>
              <OpticalBadge label="32-Bit DSP" variant="default" className="text-[8px] py-0 px-1.5" />
            </h3>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Parametric Acoustic Shaping & Harmonic Balance
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <OpticalButton size="sm" variant="ghost" onClick={resetFlat} title="Reset to Flat">
            <RotateCcw size={14} />
          </OpticalButton>
          <OpticalButton size="sm" variant="ghost" onClick={onClose} title="Close Equalizer">
            <X size={16} />
          </OpticalButton>
        </div>
      </div>

      {/* Preset Buttons */}
      <div className="flex items-center gap-1.5 py-3 overflow-x-auto no-scrollbar">
        {Object.keys(PRESETS).map((p) => (
          <button
            key={p}
            onClick={() => applyPreset(p)}
            className={`px-2.5 py-1 rounded-xl text-[10px] font-mono whitespace-nowrap transition-all cursor-pointer border ${
              activePreset === p
                ? 'bg-white text-zinc-950 border-white font-bold shadow-md'
                : 'bg-black/40 text-zinc-400 hover:text-white border-white/5 hover:border-white/10'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Vertical Faders Deck */}
      <div className="flex items-center justify-between gap-3 sm:gap-6 py-6 px-4 bg-black/40 rounded-2xl border border-white/5 my-2">
        {bands.map((band, idx) => (
          <div key={band.freq} className="flex flex-col items-center gap-2 flex-1">
            {/* Decibel Value */}
            <span className="text-[11px] font-mono text-zinc-400 font-semibold">
              {band.value > 0 ? `+${band.value}` : band.value}dB
            </span>

            {/* Fader Channel */}
            <div className="relative h-44 w-7 flex items-center justify-center bg-zinc-900/90 rounded-full border border-white/10 shadow-inner group">
              {/* Zero dB Center Detent Line */}
              <div className="absolute top-1/2 left-1 right-1 h-[1px] bg-white/20 pointer-events-none" />

              {/* Native range slider rotated vertically */}
              <input
                type="range"
                min="-12"
                max="12"
                step="0.5"
                value={band.value}
                onChange={(e) => handleBandChange(idx, parseFloat(e.target.value))}
                className="w-40 -rotate-90 origin-center cursor-pointer appearance-none bg-transparent accent-white hover:accent-cyan-300 transition-colors focus:outline-none"
                style={{ width: '150px' }}
                aria-label={`${band.label} (${band.freq})`}
              />
            </div>

            {/* Frequency & Label */}
            <div className="flex flex-col items-center mt-1">
              <span className="text-[11px] font-bold text-zinc-200">{band.label}</span>
              <span className="text-[9px] font-mono text-zinc-500">{band.freq}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Status */}
      <div className="pt-2 flex items-center justify-between text-[10px] font-mono text-zinc-500">
        <span>PRESET: {activePreset}</span>
        <span className="text-zinc-400 font-semibold">ZERO-LATENCY CONVOLUTION</span>
      </div>
    </div>
  );
};
