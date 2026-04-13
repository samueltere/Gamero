import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Play, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TrackRow } from '@/components/music/TrackRow';
import { useMusic } from '@/contexts/MusicContext';
import { shareLink } from '@/lib/utils';

export const AlbumPage: React.FC = () => {
  const navigate = useNavigate();
  const { albumId } = useParams();
  const { getAlbumById, getAlbumTracks, setQueueFromTracks } = useMusic();

  const album = albumId ? getAlbumById(albumId) : undefined;
  const tracks = album ? getAlbumTracks(album.id) : [];

  if (!album) {
    return (
      <div className="h-full overflow-y-auto px-4 py-6 md:px-8 md:py-8">
        <div className="mx-auto max-w-4xl">
          <Card className="rounded-[34px] p-8 text-center">
            <h1 className="font-display text-3xl font-semibold">Album not found</h1>
            <p className="mt-4 text-zinc-400">That album does not exist in the current Gamero catalog.</p>
            <Button onClick={() => navigate('/search')} className="mt-6 rounded-full px-6">
              Back to search
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const handleShare = async () => {
    const url = `${window.location.origin}/album/${album.id}`;
    const result = await shareLink(album.title, `Listen to ${album.title} on Gamero`, url).catch(() => 'copied');
    toast.success(result === 'shared' ? 'Album shared.' : 'Album link copied.');
  };

  return (
    <div className="h-full overflow-y-auto px-4 py-6 md:px-8 md:py-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="grid gap-6 xl:grid-cols-[340px_1fr]">
          <Card className="overflow-hidden rounded-[34px]">
            <img src={album.coverArt} alt={album.title} className="aspect-square w-full object-cover" referrerPolicy="no-referrer" />
          </Card>

          <Card className="rounded-[34px] p-6 md:p-8">
            <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">Album</p>
            <h1 className="mt-4 font-display text-4xl font-semibold md:text-5xl">{album.title}</h1>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-zinc-400">
              <span>{album.artist}</span>
              <span>{album.trackCount} tracks</span>
              {album.genre && <span>{album.genre}</span>}
              <span className="capitalize">{album.source || 'catalog'} release</span>
            </div>
            <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-400">
              Play the full album in order, then jump into the artist profile or share the link with other listeners.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button onClick={() => setQueueFromTracks(tracks, tracks[0]?.id)} className="rounded-full px-6" disabled={tracks.length === 0}>
                <Play className="h-4 w-4 fill-current" />
                Play album
              </Button>
              <Button onClick={() => void handleShare()} variant="outline" className="rounded-full px-6">
                <Share2 className="h-4 w-4" />
                Share
              </Button>
              {album.artistId && (
                <Button onClick={() => navigate(`/artist/${album.artistId}`)} variant="outline" className="rounded-full px-6">
                  Open artist
                </Button>
              )}
            </div>
          </Card>
        </section>

        <Card className="rounded-[34px] p-4 md:p-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl font-semibold">Tracklist</h2>
              <p className="mt-2 text-sm text-zinc-400">Everything in this release, ready to play from the first track down.</p>
            </div>
            <Button onClick={() => navigate('/search')} variant="outline" className="rounded-full px-6">
              Find more music
            </Button>
          </div>

          <div className="mt-6 space-y-2">
            {tracks.length > 0 ? (
              tracks.map((track, index) => <TrackRow key={track.id} track={track} index={index + 1} />)
            ) : (
              <div className="rounded-[28px] border border-dashed border-white/10 p-8 text-center">
                <p className="text-lg font-medium text-white">No tracks were attached to this album.</p>
                <p className="mt-3 text-sm leading-7 text-zinc-500">Try another album from search or the library.</p>
              </div>
            )}
          </div>

          {album.artistId && (
            <p className="mt-6 text-sm text-zinc-500">
              Looking for more from this artist?{' '}
              <Link to={`/artist/${album.artistId}`} className="text-gamero-lime hover:text-white">
                Open the artist page
              </Link>
              .
            </p>
          )}
        </Card>
      </div>
    </div>
  );
};
