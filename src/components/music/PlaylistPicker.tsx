import React, { useEffect, useRef, useState } from 'react';
import { Check, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMusic } from '@/contexts/MusicContext';
import { cn } from '@/lib/utils';
import type { Track } from '@/types/music';

interface PlaylistPickerProps {
  track: Track;
  className?: string;
}

export const PlaylistPicker: React.FC<PlaylistPickerProps> = ({ track, className }) => {
  const { addTrackToPlaylist, createPlaylist, playlistHasTrack, removeTrackFromPlaylist, signIn, user, userPlaylists } = useMusic();
  const [isOpen, setIsOpen] = useState(false);
  const [playlistName, setPlaylistName] = useState('');
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [isOpen]);

  const handleTogglePlaylist = async (playlistId: string) => {
    try {
      if (playlistHasTrack(playlistId, track.id)) {
        await removeTrackFromPlaylist(playlistId, track.id);
        toast.success('Removed from playlist.');
      } else {
        await addTrackToPlaylist(playlistId, track.id);
        toast.success('Added to playlist.');
      }
    } catch (error) {
      console.error(error);
      toast.error('Could not update that playlist right now.');
    }
  };

  const handleCreatePlaylist = async () => {
    if (!playlistName.trim()) {
      toast.error('Enter a playlist name first.');
      return;
    }

    try {
      await createPlaylist({
        name: playlistName,
        description: `A Gamero playlist built from ${track.title}.`,
        initialTrackId: track.id,
      });
      setPlaylistName('');
      setIsOpen(false);
      toast.success('Playlist created.');
    } catch (error) {
      console.error(error);
      toast.error('Could not create that playlist.');
    }
  };

  const handleOpen = async () => {
    if (!user) {
      await signIn().catch(console.error);
      return;
    }

    setIsOpen((current) => !current);
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <Button
        variant="ghost"
        size="icon"
        onClick={(event) => {
          event.stopPropagation();
          void handleOpen();
        }}
        className="rounded-full bg-black/40 backdrop-blur-md"
      >
        <Plus className="h-4 w-4" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-12 z-30 w-72 max-w-[calc(100vw-2rem)] rounded-[24px] border border-white/10 bg-gamero-panel p-4 shadow-[0_24px_60px_rgba(0,0,0,0.35)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">Add to playlist</p>
              <p className="mt-1 text-xs text-zinc-500">Choose an existing list or create a new one.</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8 rounded-full">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-4 space-y-2">
            {userPlaylists.length > 0 ? (
              userPlaylists.map((playlist) => {
                const hasTrack = playlistHasTrack(playlist.id, track.id);
                return (
                  <button
                    key={playlist.id}
                    type="button"
                    onClick={() => void handleTogglePlaylist(playlist.id)}
                    className="flex w-full items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-3 text-left transition-colors hover:bg-white/[0.06]"
                  >
                    <img src={playlist.coverArt} alt={playlist.name} className="h-12 w-12 rounded-2xl object-cover" referrerPolicy="no-referrer" />
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 break-words text-sm font-medium text-white">{playlist.name}</p>
                      <p className="truncate text-xs text-zinc-500">{playlist.trackIds.length} tracks</p>
                    </div>
                    {hasTrack && <Check className="h-4 w-4 text-gamero-lime" />}
                  </button>
                );
              })
            ) : (
              <p className="rounded-2xl border border-dashed border-white/10 px-3 py-4 text-sm text-zinc-500">No playlists yet. Create one below.</p>
            )}
          </div>

          <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.03] p-3">
            <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">New playlist</p>
            <Input value={playlistName} onChange={(event) => setPlaylistName(event.target.value)} placeholder="Late night blend" className="mt-3 h-11 rounded-2xl" />
            <Button onClick={() => void handleCreatePlaylist()} className="mt-3 w-full rounded-2xl">
              Create playlist
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
