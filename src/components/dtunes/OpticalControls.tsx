import React, { useState, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Volume1 } from 'lucide-react';

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
    sm: 'p-1.5 text-xs rounded-xl min-w-[32px] min-h-[32px]',
    md: 'p-2.5 text-sm rounded-2xl min-w-[42px] min-h-[42px]',
    lg: 'p-3 text-base rounded-2xl min-w-[48px] min-h-[48px]',
  }[size];

  const variantClasses = {
    ghost: active
      ? 'text-white bg-white/15 border border-white/20 shadow-inner'
      : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent',
    glass: active
      ? 'text-white bg-white/20 border border-white/30 shadow-[0_4px_20px_rgba(255,255,255,0.1),inset_0_1px_1px_rgba(255,255,255,0.3)]'
      : 'text-zinc-300 hover:text-white bg-zinc-900/70 hover:bg-zinc-800/80 border border-white/10 hover:border-white/20 shadow-[0_4px_16px_rgba(0,0,0,0.6),inset_0_1px_0.5px_rgba(255,255,255,0.15)]',
    solid: 'bg-white text-black font-semibold hover:bg-zinc-100 shadow-[0_6px_24px_rgba(255,255,255,0.25)]',
    danger: active
      ? 'text-red-400 bg-red-500/20 border border-red-500/30'
      : 'text-zinc-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent',
  }[variant];

  return (
    <button
      className={`relative inline-flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-95 disabled:opacity-35 disabled:pointer-events-none select-none backdrop-blur-md ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// 2. Iconic Hero Play/Pause Button with Specular Ridge
export interface HeroPlayButtonProps {
  isPlaying: boolean;
  onToggle: () => void;
  disabled?: boolean;
  size?: 'md' | 'lg';
}

export const HeroPlayButton: React.FC<HeroPlayButtonProps> = ({
  isPlaying,
  onToggle,
  disabled = false,
  size = 'md',
}) => {
  const isLarge = size === 'lg';
  const dimClass = isLarge ? 'w-16 h-16' : 'w-12 h-12';
  const iconSize = isLarge ? 26 : 20;

  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      aria-label={isPlaying ? 'Pause' : 'Play'}
      className={`relative group ${dimClass} rounded-full flex items-center justify-center bg-white text-zinc-950 font-bold transition-all duration-300 transform active:scale-90 hover:scale-105 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_8px_30px_rgba(255,255,255,0.28)] hover:shadow-[0_10px_35px_rgba(255,255,255,0.45)]`}
    >
      {/* Specular Ridge Rim */}
      <span className="absolute inset-0 rounded-full border border-white/60 pointer-events-none" />

      {/* Subtle Chromatic Aberration Ring on Hover */}
      <span className="absolute -inset-1 rounded-full opacity-0 group-hover:opacity-40 blur-[6px] bg-gradient-to-r from-amber-400 via-white to-cyan-400 transition-opacity duration-300 pointer-events-none" />

      {/* Icon with slight offset for geometric center of play triangle */}
      <span className="relative z-10 transition-transform duration-200">
        {isPlaying ? (
          <Pause size={iconSize} className="fill-current stroke-current" />
        ) : (
          <Play size={iconSize} className="fill-current stroke-current ml-0.5" />
        )}
      </span>
    </button>
  );
};

// 3. Optical Status Badge
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
    default: 'bg-zinc-800/80 text-zinc-300 border-white/10',
    accent: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    success: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    outline: 'bg-transparent text-zinc-400 border-zinc-700/60',
  }[variant];

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-wider uppercase border backdrop-blur-md select-none font-semibold ${variantStyles} ${className}`}
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

// 4. Optical Stipple-Waveform Seekbar with Needle Thumb
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
        className="relative h-9 w-full rounded-xl bg-zinc-950/60 border border-white/5 hover:border-white/15 transition-colors cursor-pointer overflow-hidden flex items-center px-1 group"
      >
        {/* Simulated Acoustic Waveform Bars */}
        <div className="absolute inset-0 flex items-center justify-between px-2 gap-0.5 opacity-40 pointer-events-none">
          {Array.from({ length: 48 }).map((_, i) => {
            // Pseudo-random deterministic waveform heights
            const barHeightPercent = Math.max(15, (Math.sin(i * 0.45) * 0.5 + 0.5) * 75);
            const isPlayed = (i / 48) * 100 <= progressPercent;

            return (
              <span
                key={i}
                style={{ height: `${barHeightPercent}%` }}
                className={`w-[2px] rounded-full transition-colors duration-200 ${
                  isPlayed ? 'bg-white' : 'bg-zinc-700'
                }`}
              />
            );
          })}
        </div>

        {/* Progress Fill Gradient */}
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-white/10 via-white/20 to-white/30 backdrop-blur-xs pointer-events-none transition-all duration-75"
          style={{ width: `${progressPercent}%` }}
        />

        {/* Needle Scrubber Thumb */}
        <div
          className="absolute top-0 bottom-0 pointer-events-none transition-all duration-75 flex flex-col items-center justify-between"
          style={{ left: `${progressPercent}%`, transform: 'translateX(-50%)' }}
        >
          {/* Top Pip */}
          <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]" />
          {/* Razor Hairline Needle */}
          <div className="w-[1.5px] flex-1 bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)]" />
          {/* Bottom Pip */}
          <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]" />
        </div>

        {/* Hover Tooltip with Timestamp */}
        {hoverFraction !== null && (
          <div
            className="absolute -top-7 -translate-x-1/2 px-2 py-0.5 rounded-md bg-zinc-900 border border-white/20 text-[10px] font-mono text-zinc-100 shadow-xl pointer-events-none z-30"
            style={{ left: `${hoverFraction * 100}%` }}
          >
            {formatTime(hoverFraction * safeDuration)}
          </div>
        )}
      </div>

      {/* Monospaced Precision Timestamps */}
      <div className="flex items-center justify-between px-1 text-[11px] font-mono text-zinc-500 font-medium">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(safeDuration)}</span>
      </div>
    </div>
  );
};

// 5. Tactile Optical Volume Slider
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
          className="w-full h-1.5 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-white hover:bg-zinc-700 transition-colors focus:outline-none"
        />
      </div>
      <span className="text-[10px] font-mono text-zinc-500 w-7 text-right">
        {Math.round(volume * 100)}%
      </span>
    </div>
  );
};
