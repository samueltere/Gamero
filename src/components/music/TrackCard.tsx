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
    <Card className={cn('group overflow-hidden rounded-[28px] p-4 transition-transform hover:-translate-y-1', className)}>
      <div className="relative overflow-hidden rounded-[24px]">
        <img
          src={track.albumArt}
          alt={track.title}
          className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
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
            className={cn('rounded-full bg-black/40 backdrop-blur-md', isSavedTrack(track.id) && 'text-gamero-lime')}
          >
            <Heart className={cn('h-4 w-4', isSavedTrack(track.id) && 'fill-current')} />
          </Button>
        </div>
      </div>

      <div className="mt-4">
        <p className="truncate text-base font-semibold text-white">{track.title}</p>
        <p className="mt-1 truncate text-sm text-zinc-400">{track.artist}</p>
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-zinc-500">{track.description || track.genre}</p>
      </div>
    </Card>
  );
};
