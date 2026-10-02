import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface PlayPauseTriggerProps {
  /** External controlled playing state */
  isPlaying?: boolean;
  /** Callback fired on toggle */
  onToggle?: (playing: boolean) => void;
  /** Diameter of central button in px (default: 56) */
  size?: number;
  /** Background theme: 'dark' (obsidian) or 'light' (stark paper) */
  theme?: 'dark' | 'light';
  /** Whether global spacebar listener is enabled */
  enableSpacebar?: boolean;
  /** Disabled interaction */
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const PlayPauseTrigger: React.FC<PlayPauseTriggerProps> = ({
  isPlaying: controlledPlaying,
  onToggle,
  size = 56,
  theme = 'dark',
  enableSpacebar = true,
  disabled = false,
  className = '',
  style = {},
}) => {
  const [internalPlaying, setInternalPlaying] = useState<boolean>(false);
  const [isPressed, setIsPressed] = useState<boolean>(false);

  const isControlled = controlledPlaying !== undefined;
  const isPlaying = isControlled ? controlledPlaying : internalPlaying;
  const isLight = theme === 'light';

  // Toggle playback
  const handleToggle = () => {
    if (disabled) return;
    const next = !isPlaying;
    if (!isControlled) {
      setInternalPlaying(next);
    }
    onToggle?.(next);
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

  return (
    <motion.button
      type="button"
      disabled={disabled}
      onClick={handleToggle}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      animate={{
        scale: isPressed ? 0.92 : 1.0,
      }}
      transition={{ type: 'spring', stiffness: 600, damping: 25 }}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        ...style,
      }}
      className={`relative rounded-full flex items-center justify-center cursor-pointer outline-none select-none transition-shadow shrink-0 ${
        disabled ? 'opacity-40 cursor-not-allowed' : ''
      } ${
        isLight
          ? 'bg-zinc-100 text-zinc-950 border border-zinc-300 shadow-[0_10px_25px_rgba(0,0,0,0.12),inset_0_1px_1px_rgba(255,255,255,0.9)]'
          : 'bg-[#0d0d12] text-white border border-white/20 shadow-[0_15px_35px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.3)]'
      } ${className}`}
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
        className={`absolute top-0.5 left-1/2 -translate-x-1/2 w-1.5 h-[1px] ${
          isLight ? 'bg-zinc-400' : 'bg-white/40'
        }`}
      />
      <div
        className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-[1px] ${
          isLight ? 'bg-zinc-400' : 'bg-white/40'
        }`}
      />
      <div
        className={`absolute left-0.5 top-1/2 -translate-y-1/2 h-1.5 w-[1px] ${
          isLight ? 'bg-zinc-400' : 'bg-white/40'
        }`}
      />
      <div
        className={`absolute right-0.5 top-1/2 -translate-y-1/2 h-1.5 w-[1px] ${
          isLight ? 'bg-zinc-400' : 'bg-white/40'
        }`}
      />

      {/* Fast, Snappy Geometric Icon Morph (0.12s ultra-responsive) */}
      <div className="relative w-6 h-6 flex items-center justify-center pointer-events-none">
        <AnimatePresence initial={false}>
          {isPlaying ? (
            <motion.svg
              key="pause-icon"
              viewBox="0 0 24 24"
              width={size * 0.38}
              height={size * 0.38}
              fill="currentColor"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.12, ease: 'easeOut' }}
              className="absolute"
            >
              <rect x="5" y="4" width="4" height="16" rx="1.5" />
              <rect x="15" y="4" width="4" height="16" rx="1.5" />
            </motion.svg>
          ) : (
            <motion.svg
              key="play-icon"
              viewBox="0 0 24 24"
              width={size * 0.38}
              height={size * 0.38}
              fill="currentColor"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.12, ease: 'easeOut' }}
              className="absolute translate-x-[1.5px]"
            >
              <path d="M6.5 4.8c0-.7.7-1.1 1.3-.7l12.4 6.8c.6.4.6 1.3 0 1.7L7.8 19.4c-.6.4-1.3 0-1.3-.7V4.8z" />
            </motion.svg>
          )}
        </AnimatePresence>
      </div>
    </motion.button>
  );
};
