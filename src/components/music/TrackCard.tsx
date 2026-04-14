import React from 'react';
import { Heart, Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PlaylistPicker } from '@/components/music/PlaylistPicker';
import { useMusic } from '@/contexts/MusicContext';
import { cn } from '@/lib/utils';
import type { Track } from '@/types/music';

interface TrackCardProps {
  track: Track;
  className?: string;
}

export const TrackCard: React.FC<TrackCardProps> = ({ track, className }) => {
  const { currentTrack, isPlaying, isSavedTrack, playTrack, toggleSavedTrack } = useMusic();
  const isCurrent = currentTrack?.id === track.id;

  return (
    <Card className={cn('group overflow-hidden rounded-[30px] p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(167,139,250,0.15)]', className)}>
      <div className="relative overflow-hidden rounded-[26px]">
        <img
          src={track.albumArt}
          alt={track.title}
          className="aspect-square w-full object-cover transition-transform duration-700 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/68 via-black/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        {track.source === 'studio' && (
          <div className="absolute left-4 top-4 rounded-full border border-white/15 bg-black/30 px-3 py-1 text-[10px] uppercase tracking-[0.28em] text-white/80 backdrop-blur-md">
            Creation
          </div>
        )}
        <Button size="icon" onClick={() => playTrack(track)} className="absolute bottom-4 right-4 rounded-full shadow-[0_18px_40px_rgba(0,0,0,0.3)]">
          {isCurrent && isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="ml-0.5 h-4 w-4 fill-current" />}
        </Button>
        <div className="absolute right-4 top-4 flex items-center gap-2">
          <PlaylistPicker track={track} />
          <Button
            variant="ghost"
            size="icon"
            onClick={(event) => {
              event.stopPropagation();
              void toggleSavedTrack(track.id);
            }}
            className={cn('rounded-full bg-black/40 backdrop-blur-md', isSavedTrack(track.id) && 'text-[var(--gamero-accent)]')}
          >
            <Heart className={cn('h-4 w-4', isSavedTrack(track.id) && 'fill-current')} />
          </Button>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-base font-semibold">{track.title}</p>
            <p className="mt-1 truncate text-sm text-[var(--gamero-muted)]">{track.artist}</p>
          </div>
          {track.genre && <span className="rounded-full bg-white/8 px-3 py-1 text-[10px] uppercase tracking-[0.26em] text-[var(--gamero-muted)]">{track.genre}</span>}
        </div>
        <p className="mt-3 line-clamp-2 text-sm leading-7 text-[var(--gamero-muted)]">{track.description || track.genre}</p>
      </div>
    </Card>
  );
};
