import React, { useState, useRef } from 'react';
import { Volume2, VolumeX, Volume1, Repeat } from 'lucide-react';
import { RepeatMode } from './types';

// Helper function to format seconds into mm:ss
export const formatTime = (seconds: number): string => {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

// 1. Tactile Smoked Glass Button with Specular Rim
export interface OpticalButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'ghost' | 'glass' | 'solid' | 'danger';
}

export const OpticalButton: React.FC<OpticalButtonProps> = ({
  children,
  active = false,
  size = 'md',
  variant = 'glass',
  className = '',
  ...props
}) => {
  const sizeClasses = {
    sm: 'p-1.5 text-xs rounded-xl min-w-[34px] min-h-[34px]',
    md: 'p-2.5 text-sm rounded-2xl min-w-[42px] min-h-[42px]',
    lg: 'p-3 text-base rounded-2xl min-w-[48px] min-h-[48px]',
  }[size];

  const variantClasses = {
    ghost: active
      ? 'text-cyan-400 bg-white/10 border border-cyan-400/30 shadow-[0_0_12px_rgba(6,182,212,0.15)]'
      : 'text-zinc-400 hover:text-white hover:bg-white/8 border border-transparent',
    glass: active
      ? 'text-cyan-300 bg-white/15 border border-cyan-400/40 shadow-[0_4px_20px_rgba(6,182,212,0.2),inset_0_1px_1px_rgba(255,255,255,0.3)]'
      : 'text-zinc-300 hover:text-white bg-zinc-900/80 hover:bg-zinc-800/90 border border-white/10 hover:border-white/25 shadow-[0_4px_16px_rgba(0,0,0,0.6),inset_0_1px_0.5px_rgba(255,255,255,0.15)]',
    solid: 'bg-white text-black font-semibold hover:bg-zinc-100 shadow-[0_6px_24px_rgba(255,255,255,0.25)]',
    danger: active
      ? 'text-red-400 bg-red-500/20 border border-red-500/30'
      : 'text-zinc-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent',
  }[variant];

  return (
    <button
      className={`relative inline-flex items-center justify-center transition-all duration-150 cursor-pointer active:scale-95 disabled:opacity-35 disabled:pointer-events-none select-none ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {/* Subtle top edge specular highlight */}
      <span className="absolute inset-x-0 top-0 h-[1px] rounded-t-[inherit] bg-white/20 pointer-events-none" />
      {children}
    </button>
  );
};

// 2. Optical Status Badge
export interface OpticalBadgeProps {
  label: string;
  variant?: 'default' | 'accent' | 'success' | 'outline';
  dot?: boolean;
  pulse?: boolean;
  className?: string;
}

export const OpticalBadge: React.FC<OpticalBadgeProps> = ({
  label,
  variant = 'default',
  dot = false,
  pulse = false,
  className = '',
}) => {
  const variantStyles = {
    default: 'bg-zinc-800/90 text-zinc-300 border-white/10',
    accent: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    success: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    outline: 'bg-transparent text-zinc-400 border-zinc-700/60',
  }[variant];

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-wider uppercase border select-none font-semibold ${variantStyles} ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            variant === 'success'
              ? 'bg-emerald-400'
              : variant === 'accent'
              ? 'bg-cyan-400'
              : 'bg-zinc-400'
          } ${pulse ? 'animate-pulse' : ''}`}
        />
      )}
      <span>{label}</span>
    </div>
  );
};

// 3. Optical Stipple-Waveform Seekbar with Needle Thumb
export interface OpticalSeekbarProps {
  currentTime: number;
  duration: number;
  isPlaying?: boolean;
  onSeek: (time: number) => void;
  className?: string;
}

export const OpticalSeekbar: React.FC<OpticalSeekbarProps> = ({
  currentTime,
  duration,
  isPlaying: _isPlaying = false,
  onSeek,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoverFraction, setHoverFraction] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const safeDuration = duration > 0 ? duration : 1;
  const progressPercent = Math.min(100, Math.max(0, (currentTime / safeDuration) * 100));

  const handlePointer = (e: React.PointerEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const frac = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    setHoverFraction(frac);
    if (isDragging || e.buttons === 1) {
      onSeek(frac * safeDuration);
    }
  };

  return (
    <div className={`w-full flex flex-col gap-1 select-none ${className}`}>
      {/* Waveform / Scrubber Track */}
      <div
        ref={containerRef}
        onPointerDown={(e) => {
          setIsDragging(true);
          handlePointer(e);
        }}
        onPointerMove={handlePointer}
        onPointerUp={() => setIsDragging(false)}
        onPointerLeave={() => {
          if (!isDragging) setHoverFraction(null);
        }}
        className="relative h-9 w-full rounded-xl bg-zinc-950/80 border border-white/10 hover:border-white/25 transition-colors cursor-pointer overflow-hidden flex items-center px-1 group"
      >
        {/* Subtle dither background grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-25"
          style={{
            backgroundImage: `radial-gradient(circle 1px at 1px 1px, rgba(255,255,255,0.6) 1px, transparent 0)`,
            backgroundSize: '4px 4px',
          }}
        />

        {/* Simulated Acoustic Waveform Bars */}
        <div className="absolute inset-0 flex items-center justify-between px-2 gap-0.5 opacity-60 pointer-events-none">
          {Array.from({ length: 48 }).map((_, i) => {
            // Pseudo-random deterministic waveform heights
            const barHeightPercent = Math.max(15, (Math.sin(i * 0.45) * 0.5 + 0.5) * 75);
            const isPlayed = (i / 48) * 100 <= progressPercent;

            return (
              <span
                key={i}
                style={{ height: `${barHeightPercent}%` }}
                className={`w-[2px] rounded-full transition-colors duration-150 ${
                  isPlayed ? 'bg-cyan-400/90' : 'bg-zinc-700'
                }`}
              />
            );
          })}
        </div>

        {/* Progress Fill Gradient */}
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500/10 via-white/15 to-white/25 pointer-events-none transition-all duration-75"
          style={{ width: `${progressPercent}%` }}
        />

        {/* Needle Scrubber Thumb */}
        <div
          className="absolute top-0 bottom-0 pointer-events-none transition-all duration-75 flex flex-col items-center justify-between"
          style={{ left: `${progressPercent}%`, transform: 'translateX(-50%)' }}
        >
          {/* Top Pip */}
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.9)]" />
          {/* Razor Hairline Needle */}
          <div className="w-[1.5px] flex-1 bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)]" />
          {/* Bottom Pip */}
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.9)]" />
        </div>

        {/* Hover Tooltip with Timestamp */}
        {hoverFraction !== null && (
          <div
            className="absolute -top-7 -translate-x-1/2 px-2 py-0.5 rounded-md bg-zinc-900 border border-white/25 text-[10px] font-mono text-zinc-100 shadow-xl pointer-events-none z-30"
            style={{ left: `${hoverFraction * 100}%` }}
          >
            {formatTime(hoverFraction * safeDuration)}
          </div>
        )}
      </div>

      {/* Monospaced Precision Timestamps */}
      <div className="flex items-center justify-between px-1 text-[11px] font-mono text-zinc-400 font-medium">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(safeDuration)}</span>
      </div>
    </div>
  );
};

// 4. Tactile Optical Volume Slider
export interface OpticalVolumeProps {
  volume: number; // 0 to 1
  onChange: (v: number) => void;
  className?: string;
}

export const OpticalVolumeControl: React.FC<OpticalVolumeProps> = ({
  volume,
  onChange,
  className = '',
}) => {
  const [previousVolume, setPreviousVolume] = useState(volume > 0 ? volume : 0.7);

  const toggleMute = () => {
    if (volume > 0) {
      setPreviousVolume(volume);
      onChange(0);
    } else {
      onChange(previousVolume || 0.7);
    }
  };

  const Icon = volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <div className={`flex items-center gap-2 group select-none ${className}`}>
      <OpticalButton
        size="sm"
        variant="ghost"
        onClick={toggleMute}
        title={volume === 0 ? 'Unmute' : 'Mute'}
      >
        <Icon className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
      </OpticalButton>

      <div className="w-20 sm:w-24 relative flex items-center">
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          aria-label="Volume slider"
          className="w-full h-1.5 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-cyan-400 hover:bg-zinc-700 transition-colors focus:outline-none"
        />
      </div>
      <span className="text-[10px] font-mono text-zinc-400 w-7 text-right">
        {Math.round(volume * 100)}%
      </span>
    </div>
  );
};

// 5. Repeat Mode Button with Indicator
export interface OpticalRepeatButtonProps {
  repeatMode: RepeatMode;
  onToggle: () => void;
}

export const OpticalRepeatButton: React.FC<OpticalRepeatButtonProps> = ({
  repeatMode,
  onToggle,
}) => {
  const isActive = repeatMode !== 'off';

  return (
    <OpticalButton
      size="sm"
      variant="ghost"
      active={isActive}
      onClick={onToggle}
      title={`Repeat: ${repeatMode === 'one' ? 'Repeat 1' : repeatMode === 'all' ? 'Repeat All' : 'Off'}`}
      className="relative"
    >
      <Repeat size={16} className={isActive ? 'text-cyan-400' : 'text-zinc-400'} />
      {repeatMode === 'one' && (
        <span className="absolute -top-0.5 -right-0.5 text-[8px] font-mono font-bold text-cyan-400 bg-zinc-900 rounded-full px-1 border border-cyan-400/40">
          1
        </span>
      )}
    </OpticalButton>
  );
};
