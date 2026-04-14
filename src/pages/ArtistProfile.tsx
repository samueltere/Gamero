import React from 'react';
import { BellRing, Heart, Play, Share2 } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ArtistCard } from '@/components/music/ArtistCard';
import { TrackRow } from '@/components/music/TrackRow';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useMusic } from '@/contexts/MusicContext';
import { cn, shareLink } from '@/lib/utils';

export const ArtistProfilePage: React.FC = () => {
  const { artistId } = useParams();
  const { featuredArtists, getArtistTracks, isFollowingArtist, isSavedTrack, playTrack, signIn, toggleFollowArtist, toggleSavedTrack, user } = useMusic();

  const artist = featuredArtists.find((entry) => entry.id === artistId);

  if (!artist) {
    return (
      <div className="h-full overflow-y-auto px-4 py-6 md:px-8 md:py-8">
        <div className="mx-auto max-w-4xl">
          <Card className="rounded-[34px] p-8 text-center">
            <h1 className="font-display text-3xl font-semibold">Artist not found</h1>
            <p className="mt-4 text-zinc-400">That profile is missing from the demo catalog.</p>
          </Card>
        </div>
      </div>
    );
  }

  const tracks = getArtistTracks(artist.id);
  const topTrack = tracks[0];
  const similarArtists = featuredArtists.filter((entry) => entry.id !== artist.id).slice(0, 3);
  const isFollowing = isFollowingArtist(artist.id);

  const handleFollow = async () => {
    if (!user) {
      await signIn().catch(console.error);
      return;
    }

    await toggleFollowArtist(artist.id);
    toast.success(isFollowing ? `You unfollowed ${artist.name}.` : `Now following ${artist.name}.`);
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/artist/${artist.id}`;
    const result = await shareLink(artist.name, `Listen to ${artist.name} on Gemero`, url).catch(() => 'copied');
    toast.success(result === 'shared' ? 'Artist page shared.' : 'Artist link copied.');
  };

  return (
    <div className="h-full overflow-y-auto px-4 py-6 md:px-8 md:py-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="overflow-hidden rounded-[36px] border border-white/8 bg-white/[0.04]">
          <div className="relative">
            <img src={artist.heroImage} alt={artist.name} className="h-[380px] w-full object-cover" referrerPolicy="no-referrer" />
            <div className="absolute inset-0 bg-gradient-to-t from-gamero-bg via-gamero-bg/35 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
              <p className="text-xs uppercase tracking-[0.32em] text-zinc-300">Artist profile</p>
              <h1 className="mt-4 font-display text-4xl font-semibold md:text-6xl">{artist.name}</h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-zinc-200">{artist.bio}</p>
              <div className="mt-6 flex flex-wrap items-center gap-6 text-sm text-zinc-300">
                <span>{artist.genre}</span>
                <span>{artist.location}</span>
                <span>{artist.monthlyListeners} monthly listeners</span>
                <span>{artist.followers} followers</span>
                {isFollowing && <span className="rounded-full border border-gamero-lime/30 bg-gamero-lime/10 px-3 py-1 text-gamero-lime">Following</span>}
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                {topTrack && (
                  <>
                    <Button onClick={() => playTrack(topTrack)} className="rounded-full px-6">
                      <Play className="h-4 w-4 fill-current" />
                      Play top track
                    </Button>
                    <Button variant="outline" className="rounded-full px-6" onClick={() => void toggleSavedTrack(topTrack.id)}>
                      <Heart className={cn('h-4 w-4', isSavedTrack(topTrack.id) && 'fill-current text-gamero-lime')} />
                      Save top track
                    </Button>
                  </>
                )}
                <Button variant={isFollowing ? 'outline' : 'default'} className="rounded-full px-6" onClick={() => void handleFollow()}>
                  <BellRing className="h-4 w-4" />
                  {isFollowing ? 'Following' : 'Follow artist'}
                </Button>
                <Button variant="outline" className="rounded-full px-6" onClick={() => void handleShare()}>
                  <Share2 className="h-4 w-4" />
                  Share profile
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <Card className="rounded-[34px] p-6">
            <div>
              <h2 className="font-display text-3xl font-semibold">Top tracks</h2>
              <p className="mt-2 text-sm text-zinc-400">Sample catalog songs attached to this profile.</p>
            </div>
            <div className="mt-6 space-y-2">
              {tracks.map((track, index) => (
                <TrackRow key={track.id} track={track} index={index + 1} />
              ))}
            </div>
          </Card>

          <div className="space-y-6">
            <Card className="rounded-[34px] p-6">
              <h2 className="font-display text-3xl font-semibold">Latest release</h2>
              <p className="mt-3 text-sm leading-7 text-zinc-400">{artist.latestRelease}</p>
              <p className="mt-3 text-sm leading-7 text-zinc-500">
                Follow this artist to keep new-release notifications flowing into your Gemero header.
              </p>
              {topTrack && (
                <div className="mt-6 overflow-hidden rounded-[28px] border border-white/8">
                  <img src={topTrack.albumArt} alt={topTrack.title} className="aspect-square w-full object-cover" referrerPolicy="no-referrer" />
                  <div className="p-5">
                    <p className="text-xl font-semibold text-white">{topTrack.title}</p>
                    <p className="mt-2 text-zinc-400">{topTrack.album}</p>
                    <p className="mt-3 text-sm leading-7 text-zinc-500">{topTrack.description}</p>
                  </div>
                </div>
              )}
            </Card>

            <div>
              <h2 className="font-display text-3xl font-semibold">More artists to try</h2>
              <div className="mt-5 grid gap-5">
                {similarArtists.map((entry) => (
                  <ArtistCard key={entry.id} artist={entry} />
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
