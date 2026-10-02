import React, { useState } from 'react';
import { Heart, Maximize2 } from 'lucide-react';
import { Track } from './types';
import { OpticalButton, OpticalBadge } from './OpticalControls';

export interface NowPlayingIslandProps {
  track: Track;
  isPlaying: boolean;
  onTogglePlay?: () => void;
  onExpand?: () => void;
  onToggleLike?: (id: string) => void;
  className?: string;
}

export const NowPlayingIsland: React.FC<NowPlayingIslandProps> = ({
  track,
  isPlaying,
  onTogglePlay: _onTogglePlay,
  onExpand,
  onToggleLike,
  className = '',
}) => {
  const [isLikedLocal, setIsLikedLocal] = useState(track.isLiked || false);
  const [heartAnim, setHeartAnim] = useState(false);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !isLikedLocal;
    setIsLikedLocal(next);
    setHeartAnim(true);
    setTimeout(() => setHeartAnim(false), 600);
    if (onToggleLike) onToggleLike(track.id);
  };

  return (
    <div
      onDoubleClick={handleLike}
      className={`glass-dock px-3.5 py-2.5 rounded-2xl flex items-center gap-3 transition-all duration-300 hover:border-white/20 select-none group cursor-pointer ${className}`}
      onClick={onExpand}
    >
      {/* Album Artwork with Ambient Bloom */}
      <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border border-white/15 shadow-md">
        {/* Ambient Bloom behind artwork */}
        <div
          className={`absolute -inset-2 bg-cover bg-center blur-md opacity-40 transition-opacity duration-500 pointer-events-none ${
            isPlaying ? 'opacity-70 scale-110' : 'opacity-20'
          }`}
          style={{ backgroundImage: `url(${track.coverUrl})` }}
        />

        <img
          src={track.coverUrl}
          alt={track.title}
          className={`relative z-10 w-full h-full object-cover transition-transform duration-500 ${
            isPlaying ? 'scale-105' : 'scale-100'
          }`}
        />

        {/* Live Audio Equalizer Pip Overlay */}
        {isPlaying && (
          <div className="absolute bottom-1 right-1 z-20 flex items-end gap-0.5 px-1 py-0.5 rounded-sm bg-black/60 backdrop-blur-xs">
            <span className="w-0.5 h-2 bg-cyan-400 animate-pulse" />
            <span className="w-0.5 h-3 bg-cyan-300 animate-bounce" />
            <span className="w-0.5 h-1.5 bg-cyan-400 animate-pulse" />
          </div>
        )}
      </div>

      {/* Metadata Info Island */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-white truncate group-hover:text-cyan-200 transition-colors">
            {track.title}
          </span>
          {track.bitrate && (
            <OpticalBadge label="Hi-Fi" variant="accent" className="hidden sm:inline-flex py-0 px-1.5 text-[8px]" />
          )}
        </div>
        <span className="text-[11px] text-zinc-400 truncate mt-0.5">
          {track.artist}
        </span>
      </div>

      {/* Action Cluster */}
      <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
        {/* Animated Like Button */}
        <button
          onClick={handleLike}
          className={`p-2 rounded-xl transition-all duration-300 cursor-pointer ${
            isLikedLocal
              ? 'text-red-500 hover:text-red-400'
              : 'text-zinc-500 hover:text-zinc-200'
          } ${heartAnim ? 'scale-125' : 'scale-100'}`}
          aria-label={isLikedLocal ? 'Unlike' : 'Like'}
          title="Favorite Track"
        >
          <Heart
            size={18}
            className={`transition-colors ${isLikedLocal ? 'fill-red-500' : 'fill-none'}`}
          />
        </button>

        {/* Expand / Maximize Button */}
        {onExpand && (
          <OpticalButton
            size="sm"
            variant="ghost"
            onClick={onExpand}
            title="Expand to Full Card Player"
          >
            <Maximize2 size={16} />
          </OpticalButton>
        )}
      </div>
    </div>
  );
};
