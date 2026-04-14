import React, { useState } from 'react';
import {
  ChevronDown,
  Heart,
  ListMusic,
  Maximize2,
  Pause,
  Play,
  Repeat,
  Shuffle,
  SkipBack,
  SkipForward,
  Trash2,
  Volume2,
  X,
} from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useMusic } from '@/contexts/MusicContext';
import { cn } from '@/lib/utils';

export const Player: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    progress,
    queue,
    volume,
    activeQueue,
    clearQueue,
    cycleRepeat,
    isShuffle,
    togglePlay,
    toggleShuffle,
    nextTrack,
    prevTrack,
    removeFromQueue,
    repeatMode,
    seek,
    setVolume,
    isSavedTrack,
    toggleSavedTrack,
    playTrack,
  } = useMusic();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);

  if (!currentTrack) {
    return null;
  }

  const trackBadge =
    currentTrack.source === 'studio'
      ? 'Studio draft'
      : currentTrack.source === 'community'
        ? 'Community upload'
        : 'Artist release';
  const queueTitle = queue.length > 0 ? 'Your queue' : 'Up next';
  const queueSubtitle =
    queue.length > 0 ? 'Tracks you added manually to play next.' : 'Gamero will keep playing from the current listening lane.';
  const repeatLabel = repeatMode === 'off' ? 'Repeat off' : repeatMode === 'all' ? 'Repeat all' : 'Repeat one';

  return (
    <>
      <motion.div
        initial={{ y: 80 }}
        animate={{ y: 0 }}
        className="fixed bottom-16 left-0 right-0 z-50 border-t border-[var(--gamero-border)] bg-[color-mix(in_srgb,var(--gamero-bg)_72%,transparent)] px-3 py-3 backdrop-blur-xl md:bottom-0 md:left-80 md:px-6"
      >
        <div className="flex items-center gap-3 md:gap-6">
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className="flex min-w-0 flex-1 items-center gap-3 text-left md:max-w-sm"
          >
            <img
              src={currentTrack.albumArt}
              alt={currentTrack.title}
              className="h-14 w-14 rounded-2xl object-cover md:h-16 md:w-16"
              referrerPolicy="no-referrer"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{currentTrack.title}</p>
              <p className="truncate text-xs text-[var(--gamero-muted)]">{currentTrack.artist}</p>
              <p className="hidden text-[11px] uppercase tracking-[0.28em] text-[var(--gamero-muted)] md:block">{trackBadge}</p>
            </div>
          </button>

          <div className="flex flex-1 flex-col items-center gap-2">
            <div className="flex items-center gap-3 md:gap-5">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleShuffle}
                className={cn('hidden rounded-full md:inline-flex', isShuffle && 'bg-white/10 text-[var(--gamero-accent)]')}
              >
                <Shuffle className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={prevTrack} className="rounded-full">
                <SkipBack className="h-5 w-5 fill-current" />
              </Button>
              <Button onClick={togglePlay} size="icon" className="h-11 w-11 rounded-full">
                {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="ml-0.5 h-5 w-5 fill-current" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={nextTrack} className="rounded-full">
                <SkipForward className="h-5 w-5 fill-current" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={cycleRepeat}
                className={cn('hidden rounded-full md:inline-flex', repeatMode !== 'off' && 'bg-white/10 text-[var(--gamero-accent)]')}
                title={repeatLabel}
              >
                <Repeat className="h-4 w-4" />
              </Button>
            </div>

            <div className="hidden w-full max-w-xl items-center gap-3 md:flex">
              <span className="w-10 text-right text-[11px] text-[var(--gamero-muted)]">{formatTime((progress / 100) * currentTrack.duration)}</span>
              <Slider value={[progress]} max={100} step={0.1} onValueChange={(values) => seek(values[0])} />
              <span className="w-10 text-[11px] text-[var(--gamero-muted)]">{formatTime(currentTrack.duration)}</span>
            </div>
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => void toggleSavedTrack(currentTrack.id)}
              className={cn('rounded-full', isSavedTrack(currentTrack.id) && 'text-[var(--gamero-accent)]')}
            >
              <Heart className={cn('h-4 w-4', isSavedTrack(currentTrack.id) && 'fill-current')} />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setIsQueueOpen((current) => !current)} className="relative rounded-full">
              <ListMusic className="h-4 w-4" />
              {activeQueue.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-white/10 px-1 text-[10px] font-medium text-[var(--gamero-text)]">
                  {Math.min(activeQueue.length, 99)}
                </span>
              )}
            </Button>
            <div className="flex w-28 items-center gap-2">
              <Volume2 className="h-4 w-4 text-[var(--gamero-muted)]" />
              <Slider value={[volume * 100]} max={100} onValueChange={(values) => setVolume(values[0] / 100)} />
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsExpanded(true)} className="rounded-full">
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>

      {isExpanded && (
        <div className="fixed inset-0 z-[70] bg-[radial-gradient(circle_at_top,_rgba(167,139,250,0.22),_transparent_34%),radial-gradient(circle_at_72%_20%,rgba(255,122,138,0.18),_transparent_26%),linear-gradient(180deg,_#17182f_0%,_#0f1020_100%)] px-5 py-8">
          <div className="mx-auto flex h-full max-w-6xl flex-col">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={() => setIsExpanded(false)} className="rounded-full">
                <ChevronDown className="h-6 w-6" />
              </Button>
              <p className="text-[11px] uppercase tracking-[0.32em] text-[var(--gamero-muted)]">{trackBadge}</p>
            </div>

            <div className="flex flex-1 flex-col items-center justify-center gap-10 md:flex-row md:items-stretch">
              <div className="w-full max-w-md">
                <img
                  src={currentTrack.albumArt}
                  alt={currentTrack.title}
                  className="aspect-square w-full rounded-[32px] object-cover shadow-[0_40px_100px_rgba(0,0,0,0.35)]"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="flex w-full max-w-2xl flex-col justify-center gap-8">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.32em] text-[var(--gamero-muted)]">{currentTrack.genre || 'Discovery'}</p>
                  <h2 className="mt-3 font-display text-4xl font-semibold md:text-6xl">{currentTrack.title}</h2>
                  <p className="mt-2 text-xl text-[var(--gamero-muted)]">{currentTrack.artist}</p>
                  {currentTrack.description && <p className="mt-5 max-w-xl text-base leading-7 text-[var(--gamero-muted)]">{currentTrack.description}</p>}
                </div>

                <div className="space-y-3">
                  <Slider value={[progress]} max={100} step={0.1} onValueChange={(values) => seek(values[0])} />
                  <div className="flex justify-between text-sm text-[var(--gamero-muted)]">
                    <span>{formatTime((progress / 100) * currentTrack.duration)}</span>
                    <span>{formatTime(currentTrack.duration)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 md:gap-6">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleShuffle}
                    className={cn('rounded-full', isShuffle && 'bg-white/10 text-[var(--gamero-accent)]')}
                  >
                    <Shuffle className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={prevTrack} className="rounded-full">
                    <SkipBack className="h-7 w-7 fill-current" />
                  </Button>
                  <Button onClick={togglePlay} className="h-16 w-16 rounded-full p-0">
                    {isPlaying ? <Pause className="h-7 w-7 fill-current" /> : <Play className="ml-1 h-7 w-7 fill-current" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={nextTrack} className="rounded-full">
                    <SkipForward className="h-7 w-7 fill-current" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={cycleRepeat}
                    className={cn('rounded-full', repeatMode !== 'off' && 'bg-white/10 text-[var(--gamero-accent)]')}
                    title={repeatLabel}
                  >
                    <Repeat className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => void toggleSavedTrack(currentTrack.id)}
                    className={cn('rounded-full', isSavedTrack(currentTrack.id) && 'text-[var(--gamero-accent)]')}
                  >
                    <Heart className={cn('h-6 w-6', isSavedTrack(currentTrack.id) && 'fill-current')} />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setIsQueueOpen((current) => !current)} className="rounded-full">
                    <ListMusic className="h-5 w-5" />
                  </Button>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--gamero-muted)]">
                  <span className={cn('rounded-full border px-4 py-2', isShuffle ? 'border-[var(--gamero-accent)]/35 bg-[var(--gamero-accent)]/10 text-[var(--gamero-accent)]' : 'border-white/10')}>
                    {isShuffle ? 'Shuffle on' : 'Shuffle off'}
                  </span>
                  <span className={cn('rounded-full border px-4 py-2', repeatMode !== 'off' ? 'border-[var(--gamero-accent)]/35 bg-[var(--gamero-accent)]/10 text-[var(--gamero-accent)]' : 'border-white/10')}>
                    {repeatLabel}
                  </span>
                  <span className="rounded-full border border-white/10 px-4 py-2">{activeQueue.length} tracks lined up</span>
                </div>

                <div className="rounded-[28px] border border-[var(--gamero-border)] bg-white/[0.04] p-6">
                  <p className="text-[11px] uppercase tracking-[0.32em] text-[var(--gamero-muted)]">Lyrics / Notes</p>
                  <div className="mt-5 space-y-3 text-lg leading-8 text-[var(--gamero-muted)]">
                    {currentTrack.lyrics ? (
                      currentTrack.lyrics.split('\n').map((line, index) => (
                        <p key={`${line}-${index}`}>{line}</p>
                      ))
                    ) : (
                      <p>No lyrics added yet. This release currently plays as an instrumental or audio-only upload.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isQueueOpen && (
        <div className="gamero-room fixed bottom-36 right-4 z-[72] w-[min(26rem,calc(100vw-2rem))] rounded-[30px] p-4 md:bottom-28 md:right-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-[var(--gamero-muted)]">{queueTitle}</p>
              <h3 className="mt-2 font-display text-2xl font-semibold">{queueSubtitle}</h3>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsQueueOpen(false)} className="rounded-full">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-4 max-h-[50vh] space-y-2 overflow-y-auto pr-1">
            {activeQueue.slice(0, 12).map((track) => {
              const isCurrent = currentTrack.id === track.id;

              return (
                <div key={track.id} className="flex items-center gap-3 rounded-[22px] border border-[var(--gamero-border)] bg-white/[0.05] p-3">
                  <button type="button" onClick={() => playTrack(track)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                    <img src={track.albumArt} alt={track.title} className="h-12 w-12 rounded-2xl object-cover" referrerPolicy="no-referrer" />
                    <div className="min-w-0">
                      <p className={cn('truncate text-sm font-semibold', isCurrent && 'text-[var(--gamero-accent)]')}>{track.title}</p>
                      <p className="truncate text-xs text-[var(--gamero-muted)]">{track.artist}</p>
                    </div>
                  </button>
                  {queue.length > 0 && (
                    <Button variant="ghost" size="icon" onClick={() => removeFromQueue(track.id)} className="rounded-full text-[var(--gamero-muted)] hover:text-[var(--gamero-text)]">
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            {queue.length > 0 && (
              <Button variant="outline" onClick={clearQueue} className="rounded-full px-5">
                <Trash2 className="h-4 w-4" />
                Clear queue
              </Button>
            )}
            <Button variant="ghost" onClick={() => setIsQueueOpen(false)} className="rounded-full px-5">
              Close
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

function formatTime(seconds: number) {
  const safeSeconds = Number.isFinite(seconds) ? seconds : 0;
  const minutes = Math.floor(safeSeconds / 60);
  const remainder = Math.floor(safeSeconds % 60);
  return `${minutes}:${remainder.toString().padStart(2, '0')}`;
}
