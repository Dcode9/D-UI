import React, { useState } from 'react';
import { ListMusic, History, Trash2, Play, Pause, X } from 'lucide-react';
import { Track } from './types';
import { OpticalButton, formatTime } from './OpticalControls';

export interface QueueDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  queue: Track[];
  history: Track[];
  currentTrackId?: string;
  isPlaying: boolean;
  onSelectTrack: (track: Track) => void;
  onClearQueue?: () => void;
  onClearHistory?: () => void;
  autoplayEnabled?: boolean;
  onToggleAutoplay?: () => void;
  className?: string;
}

export const QueueDrawer: React.FC<QueueDrawerProps> = ({
  isOpen,
  onClose,
  queue,
  history,
  currentTrackId,
  isPlaying,
  onSelectTrack,
  onClearQueue,
  onClearHistory,
  autoplayEnabled = true,
  onToggleAutoplay,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<'queue' | 'history'>('queue');

  if (!isOpen) return null;

  const currentList = activeTab === 'queue' ? queue : history;

  return (
    <div
      className={`glass-dock rounded-3xl p-4 sm:p-5 flex flex-col w-full max-w-md shadow-2xl border border-white/10 z-40 transition-all select-none ${className}`}
    >
      {/* Top Header Row */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-2xl border border-white/5">
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'queue'
                ? 'bg-white text-zinc-950 shadow-md font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <ListMusic size={14} />
            <span>Up Next ({queue.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-white text-zinc-950 shadow-md font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <History size={14} />
            <span>History</span>
          </button>
        </div>

        {/* Close Button */}
        <OpticalButton size="sm" variant="ghost" onClick={onClose} title="Close Drawer">
          <X size={16} />
        </OpticalButton>
      </div>

      {/* Subheader Utility Row: Autoplay & Clear */}
      <div className="flex items-center justify-between py-2.5 px-1">
        {activeTab === 'queue' && onToggleAutoplay ? (
          <button
            onClick={onToggleAutoplay}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono tracking-wider font-bold transition-all border cursor-pointer ${
              autoplayEnabled
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                : 'bg-zinc-800 text-zinc-400 border-zinc-700/60'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                autoplayEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'
              }`}
            />
            <span>AUTOPLAY {autoplayEnabled ? 'ON' : 'OFF'}</span>
          </button>
        ) : (
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
            {activeTab === 'queue' ? 'Queue Matrix' : 'Recently Streamed'}
          </span>
        )}

        {/* Clear Action */}
        {((activeTab === 'queue' && onClearQueue && queue.length > 0) ||
          (activeTab === 'history' && onClearHistory && history.length > 0)) && (
          <button
            onClick={activeTab === 'queue' ? onClearQueue : onClearHistory}
            className="text-[10px] font-mono text-zinc-500 hover:text-red-400 flex items-center gap-1 px-2 py-0.5 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
          >
            <Trash2 size={12} />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Scrollable Track Items */}
      <div className="flex flex-col gap-1.5 max-h-72 overflow-y-auto pr-1">
        {currentList.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center text-zinc-500 gap-2">
            <ListMusic size={28} className="opacity-40" />
            <p className="text-xs">No tracks in {activeTab === 'queue' ? 'queue' : 'history'}</p>
          </div>
        ) : (
          currentList.map((track, idx) => {
            const isCurrent = track.id === currentTrackId;

            return (
              <div
                key={`${track.id}-${idx}`}
                onClick={() => onSelectTrack(track)}
                className={`group flex items-center gap-3 p-2 rounded-xl transition-all cursor-pointer border ${
                  isCurrent
                    ? 'bg-white/10 border-white/20 text-white shadow-sm'
                    : 'bg-zinc-950/40 hover:bg-white/5 border-transparent hover:border-white/10 text-zinc-300'
                }`}
              >
                {/* Track Thumbnail */}
                <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-white/10">
                  <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
                  <div
                    className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
                      isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    {isCurrent && isPlaying ? (
                      <Pause size={14} className="text-white fill-current" />
                    ) : (
                      <Play size={14} className="text-white fill-current ml-0.5" />
                    )}
                  </div>
                </div>

                {/* Track Title & Artist */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate group-hover:text-white transition-colors">
                    {track.title}
                  </p>
                  <p className="text-[11px] text-zinc-500 truncate mt-0.5">{track.artist}</p>
                </div>

                {/* Duration */}
                <span className="text-[10px] font-mono text-zinc-500 group-hover:text-zinc-300 transition-colors">
                  {formatTime(track.duration)}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
