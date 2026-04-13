import React from 'react';
import { Heart, Pause, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PlaylistPicker } from '@/components/music/PlaylistPicker';
import { useMusic } from '@/contexts/MusicContext';
import { cn } from '@/lib/utils';
import type { Track } from '@/types/music';

interface TrackRowProps {
  track: Track;
  index?: number;
}

export const TrackRow: React.FC<TrackRowProps> = ({ track, index }) => {
  const { currentTrack, isPlaying, isSavedTrack, playTrack, toggleSavedTrack } = useMusic();
  const isCurrent = currentTrack?.id === track.id;

  return (
    <div className="grid grid-cols-[auto,1fr,auto,auto] items-center gap-3 rounded-[24px] px-4 py-3 transition-colors hover:bg-white/6 md:grid-cols-[40px,1.2fr,0.8fr,120px,auto,auto,auto]">
      <button
        type="button"
        onClick={() => playTrack(track)}
        className={cn('flex h-10 w-10 items-center justify-center rounded-full bg-white/6 text-zinc-400 transition-colors hover:text-white', isCurrent && 'text-gamero-lime')}
      >
        {isCurrent && isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="ml-0.5 h-4 w-4 fill-current" />}
      </button>

      <div className="flex min-w-0 items-center gap-3">
        <div className="hidden w-7 text-center text-sm text-zinc-500 md:block">{index ? index.toString().padStart(2, '0') : '--'}</div>
        <img src={track.albumArt} alt={track.title} className="h-12 w-12 rounded-2xl object-cover" referrerPolicy="no-referrer" />
        <div className="min-w-0">
          <p className={cn('truncate text-sm font-semibold text-white', isCurrent && 'text-gamero-lime')}>{track.title}</p>
          {track.artistId ? (
            <Link to={`/artist/${track.artistId}`} className="truncate text-xs text-zinc-400 hover:text-white">
              {track.artist}
            </Link>
          ) : (
            <p className="truncate text-xs text-zinc-400">{track.artist}</p>
          )}
        </div>
      </div>

      <p className="hidden truncate text-sm text-zinc-500 md:block">{track.album || track.source}</p>
      <p className="hidden text-sm text-zinc-500 md:block">{track.genre || 'Open format'}</p>

      <PlaylistPicker track={track} />

      <Button
        variant="ghost"
        size="icon"
        onClick={() => void toggleSavedTrack(track.id)}
        className={cn('rounded-full', isSavedTrack(track.id) && 'text-gamero-lime')}
      >
        <Heart className={cn('h-4 w-4', isSavedTrack(track.id) && 'fill-current')} />
      </Button>

      <p className="text-sm text-zinc-500">{formatTime(track.duration)}</p>
    </div>
  );
};

function formatTime(seconds: number) {
  const safeSeconds = Number.isFinite(seconds) ? seconds : 0;
  const minutes = Math.floor(safeSeconds / 60);
  const remainder = Math.floor(safeSeconds % 60);
  return `${minutes}:${remainder.toString().padStart(2, '0')}`;
}
