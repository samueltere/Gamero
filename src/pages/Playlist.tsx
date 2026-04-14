import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Play, Share2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useMusic } from '@/contexts/MusicContext';
import { shareLink } from '@/lib/utils';

export const PlaylistPage: React.FC = () => {
  const navigate = useNavigate();
  const { playlistId } = useParams();
  const { deletePlaylist, getPlaylistTracks, playlists, playTrack, removeTrackFromPlaylist, startPlaylist, user } = useMusic();

  const playlist = playlists.find((entry) => entry.id === playlistId);
  const tracks = playlist ? getPlaylistTracks(playlist.id) : [];
  const isOwner = playlist?.userId === user?.id;

  if (!playlist) {
    return (
      <div className="h-full overflow-y-auto px-4 py-6 md:px-8 md:py-8">
        <div className="mx-auto max-w-4xl">
          <Card className="rounded-[34px] p-8 text-center">
            <h1 className="font-display text-3xl font-semibold">Playlist not found</h1>
            <p className="mt-4 text-zinc-400">That playlist link does not match anything in the current catalog.</p>
            <Button onClick={() => navigate('/library')} className="mt-6 rounded-full px-6">
              Back to library
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const handleShare = async () => {
    const url = `${window.location.origin}/playlist/${playlist.id}`;
    const result = await shareLink(playlist.name, `Listen to ${playlist.name} on Gemero`, url).catch(() => 'copied');
    toast.success(result === 'shared' ? 'Playlist shared.' : 'Playlist link copied.');
  };

  const handleDelete = async () => {
    if (!isOwner) {
      return;
    }

    await deletePlaylist(playlist.id)
      .then(() => {
        toast.success('Playlist deleted.');
        navigate('/library');
      })
      .catch((error) => {
        console.error(error);
        toast.error('Could not delete that playlist right now.');
      });
  };

  return (
    <div className="h-full overflow-y-auto px-4 py-6 md:px-8 md:py-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="grid gap-6 xl:grid-cols-[340px_1fr]">
          <Card className="overflow-hidden rounded-[34px]">
            <img src={playlist.coverArt} alt={playlist.name} className="aspect-square w-full object-cover" referrerPolicy="no-referrer" />
          </Card>

          <Card className="rounded-[34px] p-6 md:p-8">
            <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">Playlist</p>
            <h1 className="mt-4 font-display text-4xl font-semibold md:text-5xl">{playlist.name}</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-400">{playlist.description || 'A playlist built in Gemero.'}</p>
            <div className="mt-6 flex flex-wrap items-center gap-6 text-sm text-zinc-400">
              <span>{playlist.ownerName}</span>
              <span>{tracks.length} tracks</span>
              <span>{playlist.followers} followers</span>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button onClick={() => (tracks[0] ? startPlaylist(playlist.id) : undefined)} className="rounded-full px-6" disabled={tracks.length === 0}>
                <Play className="h-4 w-4 fill-current" />
                Play playlist
              </Button>
              <Button onClick={() => void handleShare()} variant="outline" className="rounded-full px-6">
                <Share2 className="h-4 w-4" />
                Share
              </Button>
              {isOwner && (
                <Button onClick={() => void handleDelete()} variant="outline" className="rounded-full px-6">
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              )}
            </div>
          </Card>
        </section>

        <Card className="rounded-[34px] p-4 md:p-6">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-display text-3xl font-semibold">Tracks</h2>
              <p className="mt-2 text-sm text-zinc-400">Play the list in order, or remove tracks if you own it.</p>
            </div>
            <Button onClick={() => navigate('/search')} variant="outline" className="rounded-full px-6">
              Find more music
            </Button>
          </div>

          <div className="mt-6 space-y-2">
            {tracks.length > 0 ? (
              tracks.map((track, index) => (
                <div key={track.id} className="grid grid-cols-[1fr,auto] items-center gap-3 rounded-[24px] border border-white/8 bg-white/[0.03] px-4 py-3">
                  <button type="button" onClick={() => playTrack(track)} className="flex min-w-0 items-center gap-4 text-left">
                    <span className="w-8 text-sm text-zinc-500">{String(index + 1).padStart(2, '0')}</span>
                    <img src={track.albumArt} alt={track.title} className="h-14 w-14 rounded-2xl object-cover" referrerPolicy="no-referrer" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">{track.title}</p>
                      {track.artistId ? (
                        <Link to={`/artist/${track.artistId}`} className="truncate text-xs text-zinc-400 hover:text-white">
                          {track.artist}
                        </Link>
                      ) : (
                        <p className="truncate text-xs text-zinc-400">{track.artist}</p>
                      )}
                    </div>
                  </button>
                  {isOwner && (
                    <Button
                      variant="ghost"
                      onClick={() =>
                        void removeTrackFromPlaylist(playlist.id, track.id)
                          .then(() => toast.success('Removed from playlist.'))
                          .catch((error) => {
                            console.error(error);
                            toast.error('Could not remove that track.');
                          })
                      }
                      className="rounded-full"
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))
            ) : (
              <div className="rounded-[28px] border border-dashed border-white/10 p-8 text-center">
                <p className="text-lg font-medium text-white">This playlist is empty.</p>
                <p className="mt-3 text-sm leading-7 text-zinc-500">Use the new playlist buttons on tracks to add songs here.</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
