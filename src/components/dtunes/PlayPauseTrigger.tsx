import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GrainBlurFilter, GRAIN_BLUR_DEFAULTS } from './GrainBlurSurface';

export interface PlayPauseTriggerProps {
  /** External controlled playing state */
  isPlaying?: boolean;
  /** Callback fired on toggle */
  onToggle?: (playing: boolean) => void;
  /** Diameter of central button in px (default: 84) */
  size?: number;
  /** Radius of the mezzotint blur aura in px (default: 130) */
  auraRadius?: number;
  /** Whether the noise blur aura is active only when playing or also on hover */
  auraMode?: 'always' | 'playing-only' | 'hover-or-playing';
  /** Background theme: 'dark' (obsidian) or 'light' (stark paper) */
  theme?: 'dark' | 'light';
  /** Whether global spacebar listener is enabled */
  enableSpacebar?: boolean;
  /** Optional custom scatter override (defaults to settled 55px) */
  scatter?: number;
  /** Optional custom grain density override (defaults to settled 0.70) */
  grainDensity?: number;
  /** Optional custom diffusion override (defaults to settled 8.5px) */
  opticalDiffusion?: number;
  /** Disabled interaction */
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const PlayPauseTrigger: React.FC<PlayPauseTriggerProps> = ({
  isPlaying: controlledPlaying,
  onToggle,
  size = 84,
  auraRadius = 130,
  auraMode = 'hover-or-playing',
  theme = 'dark',
  enableSpacebar = true,
  scatter = GRAIN_BLUR_DEFAULTS.scatter,
  grainDensity = GRAIN_BLUR_DEFAULTS.grainDensity,
  opticalDiffusion = GRAIN_BLUR_DEFAULTS.opticalDiffusion,
  disabled = false,
  className = '',
  style = {},
}) => {
  const [internalPlaying, setInternalPlaying] = useState<boolean>(false);
  const [isPressed, setIsPressed] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [burstKey, setBurstKey] = useState<number>(0);

  const isControlled = controlledPlaying !== undefined;
  const isPlaying = isControlled ? controlledPlaying : internalPlaying;
  const isLight = theme === 'light';

  const filterId = useRef(`dtunes-trigger-blur-${Math.random().toString(36).substring(2, 9)}`).current;

  // Toggle playback
  const handleToggle = () => {
    if (disabled) return;
    const next = !isPlaying;
    if (!isControlled) {
      setInternalPlaying(next);
    }
    onToggle?.(next);
    setBurstKey((prev) => prev + 1);
  };

  // Global spacebar listener anywhere on the page
  useEffect(() => {
    if (!enableSpacebar || disabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        const target = e.target as HTMLElement | null;
        if (
          target &&
          (target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.isContentEditable)
        ) {
          return;
        }
        e.preventDefault();
        setIsPressed(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        const target = e.target as HTMLElement | null;
        if (
          target &&
          (target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.isContentEditable)
        ) {
          return;
        }
        e.preventDefault();
        setIsPressed(false);
        handleToggle();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [enableSpacebar, disabled, isPlaying]);

  // Determine whether the mezzotint blur aura is active
  const isAuraActive =
    auraMode === 'always'
      ? true
      : auraMode === 'playing-only'
      ? isPlaying
      : isPlaying || isHovered || isPressed;

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{
        width: `${auraRadius * 2}px`,
        height: `${auraRadius * 2}px`,
        ...style,
      }}
    >
      {/* 1. MASTER MEZZOTINT BLUR SHADER (Settled Optimal Defaults: 55px / 0.70 / 8.5px) */}
      <GrainBlurFilter
        id={filterId}
        scatter={scatter}
        grainDensity={grainDensity}
        opticalDiffusion={opticalDiffusion}
        octaves={1}
      />

      {/* 2. OPTICAL NOISE BLUR AURA (Zero generic glow! Pure physical mezzotint dither) */}
      <AnimatePresence>
        {isAuraActive && (
          <motion.div
            key="blur-aura"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{
              opacity: 1,
              scale: isPressed ? 1.08 : isPlaying ? 1.0 : 0.94,
            }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            className="absolute inset-0 pointer-events-none flex items-center justify-center"
          >
            {/* The tactile circular noise-blur lens layer */}
            <div
              className="rounded-full"
              style={{
                width: `${auraRadius * 2}px`,
                height: `${auraRadius * 2}px`,
                filter: `url(#${filterId})`,
                clipPath: `circle(50% at 50% 50%)`,
                WebkitClipPath: `circle(50% at 50% 50%)`,
                transform: 'translateZ(0)',
                willChange: 'filter, transform',
                backgroundColor: isLight
                  ? 'rgba(255, 255, 255, 0.4)'
                  : 'rgba(15, 15, 22, 0.55)',
              }}
            />

            {/* Tactile perimeter reticle ring (Fine stipple rim) */}
            <div
              className="absolute rounded-full border pointer-events-none"
              style={{
                width: `${auraRadius * 2}px`,
                height: `${auraRadius * 2}px`,
                borderColor: isLight
                  ? 'rgba(0, 0, 0, 0.12)'
                  : 'rgba(255, 255, 255, 0.15)',
                boxShadow: isLight
                  ? 'inset 0 0 20px rgba(0,0,0,0.04)'
                  : 'inset 0 0 30px rgba(0,0,0,0.6)',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. TACTILE CLICK / SPACEBAR BURST WAVE (Noise displacement ripple on trigger) */}
      <AnimatePresence>
        {burstKey > 0 && (
          <motion.div
            key={burstKey}
            initial={{ opacity: 0.8, scale: 0.7 }}
            animate={{ opacity: 0, scale: 1.25 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="absolute rounded-full pointer-events-none border"
            style={{
              width: `${size * 1.5}px`,
              height: `${size * 1.5}px`,
              borderColor: isLight
                ? 'rgba(0, 0, 0, 0.35)'
                : 'rgba(255, 255, 255, 0.45)',
            }}
          />
        )}
      </AnimatePresence>

      {/* 4. CENTRAL CHISELED TRIGGER BUTTON */}
      <motion.button
        type="button"
        disabled={disabled}
        onClick={handleToggle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setIsPressed(false);
        }}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        animate={{
          scale: isPressed ? 0.92 : isHovered ? 1.04 : 1.0,
        }}
        transition={{ type: 'spring', stiffness: 450, damping: 25 }}
        style={{
          width: `${size}px`,
          height: `${size}px`,
        }}
        className={`relative z-20 rounded-full flex items-center justify-center cursor-pointer outline-none transition-shadow ${
          disabled ? 'opacity-40 cursor-not-allowed' : ''
        } ${
          isLight
            ? 'bg-zinc-100 text-zinc-950 border border-zinc-300 shadow-[0_10px_25px_rgba(0,0,0,0.12),inset_0_1px_1px_rgba(255,255,255,0.9)]'
            : 'bg-[#0d0d12] text-white border border-white/20 shadow-[0_15px_35px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.3)]'
        }`}
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {/* Specular ridge catch */}
        <div
          className={`absolute inset-0 rounded-full pointer-events-none ${
            isLight ? 'border-t border-white' : 'border-t border-white/50'
          }`}
        />

        {/* Needle Reticle Crossbars on rim */}
        <div
          className={`absolute top-1 left-1/2 -translate-x-1/2 w-2 h-[1px] ${
            isLight ? 'bg-zinc-400' : 'bg-white/40'
          }`}
        />
        <div
          className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-2 h-[1px] ${
            isLight ? 'bg-zinc-400' : 'bg-white/40'
          }`}
        />
        <div
          className={`absolute left-1 top-1/2 -translate-y-1/2 h-2 w-[1px] ${
            isLight ? 'bg-zinc-400' : 'bg-white/40'
          }`}
        />
        <div
          className={`absolute right-1 top-1/2 -translate-y-1/2 h-2 w-[1px] ${
            isLight ? 'bg-zinc-400' : 'bg-white/40'
          }`}
        />

        {/* 5. SURGICAL GEOMETRIC ICON MORPH (Play Triangle <-> Dual Needle Bars) */}
        <div className="relative w-6 h-6 flex items-center justify-center pointer-events-none">
          <AnimatePresence mode="wait" initial={false}>
            {isPlaying ? (
              <motion.svg
                key="pause-icon"
                viewBox="0 0 24 24"
                width={size * 0.3}
                height={size * 0.3}
                fill="currentColor"
                initial={{ opacity: 0, scale: 0.7, rotate: -20 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.7, rotate: 20 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              >
                {/* Dual surgical needle bars */}
                <rect x="5.5" y="4" width="3.5" height="16" rx="1.5" />
                <rect x="15" y="4" width="3.5" height="16" rx="1.5" />
              </motion.svg>
            ) : (
              <motion.svg
                key="play-icon"
                viewBox="0 0 24 24"
                width={size * 0.3}
                height={size * 0.3}
                fill="currentColor"
                initial={{ opacity: 0, scale: 0.7, rotate: 20 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.7, rotate: -20 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="translate-x-[1.5px]"
              >
                {/* Equilateral play triangle with micro-radii */}
                <path d="M6.5 4.8c0-.7.7-1.1 1.3-.7l12.4 6.8c.6.4.6 1.3 0 1.7L7.8 19.4c-.6.4-1.3 0-1.3-.7V4.8z" />
              </motion.svg>
            )}
          </AnimatePresence>
        </div>
      </motion.button>
    </div>
  );
};
