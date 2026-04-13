import React from 'react';
import { ArrowRight, Disc3, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArtistCard } from '@/components/music/ArtistCard';
import { TrackCard } from '@/components/music/TrackCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DISCOVERY_ROWS, MOOD_COLLECTIONS } from '@/data/catalog';
import { useMusic } from '@/contexts/MusicContext';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { allTracks, communityTracks, featuredArtists, friendActivity, personalizedRows, playTrack, recentTracks, savedTracks, user } = useMusic();

  const quickPicks = (recentTracks.length ? recentTracks : allTracks).slice(0, 4);
  const topPersonalizedRow = personalizedRows[0];

  return (
    <div className="h-full overflow-y-auto px-4 py-6 md:px-8 md:py-8">
      <div className="mx-auto max-w-7xl space-y-10">
        <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="relative overflow-hidden rounded-[34px] border-white/8 bg-[radial-gradient(circle_at_top_left,_rgba(147,248,114,0.24),_transparent_32%),linear-gradient(135deg,_rgba(255,255,255,0.08),_rgba(255,255,255,0.02))] p-8">
              <div className="absolute -right-12 top-0 h-44 w-44 rounded-full bg-gamero-lime/10 blur-3xl" />
              <div className="relative max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-xs uppercase tracking-[0.3em] text-zinc-300">
                  <Disc3 className="h-3.5 w-3.5" />
                  Listener first
                </div>
                <h1 className="mt-6 font-display text-4xl font-semibold leading-tight md:text-6xl">
                  Stream artist releases, discover new favorites, and publish your own music on Gamero.
                </h1>
                <p className="mt-5 max-w-xl text-base leading-8 text-zinc-300 md:text-lg">
                  {user && topPersonalizedRow
                    ? `${topPersonalizedRow.title} is ready with picks shaped by your recent listening, saved tracks, and followed artists.`
                    : 'Sign in with Google, browse featured artists, save tracks to your library, and upload original music with cover art from your device so anyone can listen.'}
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button onClick={() => navigate('/search')} className="rounded-full px-6">
                    Explore music
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button onClick={() => navigate('/studio')} variant="outline" className="rounded-full px-6">
                    Open studio
                  </Button>
                </div>
                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[24px] border border-white/8 bg-black/20 p-4">
                    <p className="text-3xl font-semibold text-white">{featuredArtists.length}</p>
                    <p className="text-sm text-zinc-400">Featured artists</p>
                  </div>
                  <div className="rounded-[24px] border border-white/8 bg-black/20 p-4">
                    <p className="text-3xl font-semibold text-white">{communityTracks.length}</p>
                    <p className="text-sm text-zinc-400">Community releases</p>
                  </div>
                  <div className="rounded-[24px] border border-white/8 bg-black/20 p-4">
                    <p className="text-3xl font-semibold text-white">{savedTracks.length}</p>
                    <p className="text-sm text-zinc-400">Saved for later</p>
                  </div>
                </div>
                <p className="mt-5 text-sm text-zinc-500">
                  {user ? `Welcome back, ${user.displayName || 'listener'}.` : 'Sign in to sync uploads and saved songs across sessions.'}
                </p>
              </div>
            </Card>
          </motion.div>

          <div className="grid gap-4">
            {quickPicks.map((track) => (
              <TrackCard key={track.id} track={track} className="rounded-[30px] p-3" />
            ))}
          </div>
        </section>

        <section>
          <SectionHeader
            title="Made for you"
            subtitle={
              user
                ? 'Dynamic rows that respond to what you play, save, and follow inside Gamero.'
                : 'Start listening and saving tracks to unlock Daily Mix and Weekly Discovery recommendations.'
            }
          />
          <div className="mt-5 space-y-8">
            {personalizedRows.map((row) => (
              <div key={row.id}>
                <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                  <div>
                    <h3 className="font-display text-2xl font-semibold">{row.title}</h3>
                    <p className="mt-1 text-sm text-zinc-400">{row.subtitle}</p>
                  </div>
                  <Button variant="link" className="justify-start px-0 md:justify-center" onClick={() => navigate('/search')}>
                    Find more like this
                  </Button>
                </div>
                <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
                  {row.tracks.map((track) => (
                    <TrackCard key={`${row.id}-${track.id}`} track={track} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <SectionHeader
            title="Featured artists"
            subtitle="Sample artist profiles with full track lists and listening pages."
            actionLabel="Browse all"
            onAction={() => navigate('/search')}
          />
          <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {featuredArtists.slice(0, 3).map((artist) => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </div>
        </section>

        <section>
          <SectionHeader
            title="Friend activity"
            subtitle="A light social layer so you can see what other listeners are spinning without cluttering the app."
          />
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {friendActivity.map((entry) => {
              const track = allTracks.find((item) => item.id === entry.trackId);

              if (!track) {
                return null;
              }

              return (
                <Card key={entry.id} className="rounded-[30px] p-5">
                  <div className="flex items-center gap-3">
                    <img src={entry.avatar} alt={entry.name} className="h-12 w-12 rounded-full object-cover" referrerPolicy="no-referrer" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">{entry.name}</p>
                      <p className="truncate text-xs text-zinc-500">{entry.atLabel}</p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-zinc-400">
                    <span className="font-medium text-white">{entry.name}</span> {entry.action}{' '}
                    <button type="button" onClick={() => playTrack(track)} className="font-medium text-gamero-lime hover:text-white">
                      {track.title}
                    </button>
                    .
                  </p>
                  <div className="mt-5 flex items-center justify-between gap-3">
                    <p className="truncate text-sm text-zinc-500">{track.artist}</p>
                    {entry.artistId ? (
                      <Link to={`/artist/${entry.artistId}`} className="text-xs uppercase tracking-[0.24em] text-zinc-400 hover:text-white">
                        Open artist
                      </Link>
                    ) : (
                      <Button variant="ghost" size="sm" className="rounded-full px-3" onClick={() => playTrack(track)}>
                        Play
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        {DISCOVERY_ROWS.map((row) => {
          const tracks = row.trackIds
            .map((trackId) => allTracks.find((track) => track.id === trackId))
            .filter((track): track is NonNullable<typeof track> => Boolean(track));

          return (
            <section key={row.title}>
              <SectionHeader title={row.title} subtitle={row.subtitle} />
              <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
                {tracks.map((track) => (
                  <TrackCard key={track.id} track={track} />
                ))}
              </div>
            </section>
          );
        })}

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <Card className="rounded-[34px] p-6 md:p-8">
            <div className="flex items-center gap-2 text-gamero-lime">
              <Sparkles className="h-4 w-4" />
              <p className="text-xs uppercase tracking-[0.32em]">Studio tools</p>
            </div>
            <h2 className="mt-4 font-display text-3xl font-semibold">Prompt-based track drafts and instant cover concepts.</h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-zinc-400">
              Gamero keeps creation in the background, not the spotlight. Upload finished songs from your device or sketch a new direction in the studio when you want a fast starting point.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={() => navigate('/studio')} className="rounded-full px-6">
                Create in studio
              </Button>
              <Button onClick={() => navigate('/library')} variant="outline" className="rounded-full px-6">
                Open your library
              </Button>
            </div>
          </Card>

          <div>
            <SectionHeader title="Browse moods" subtitle="Fast entry points for search and discovery." />
            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {MOOD_COLLECTIONS.map((mood) => (
                <button
                  key={mood.label}
                  type="button"
                  onClick={() => navigate(`/search?q=${encodeURIComponent(mood.label)}`)}
                  className={`rounded-[26px] bg-gradient-to-br ${mood.accent} p-5 text-left text-black shadow-[0_20px_50px_rgba(0,0,0,0.18)] transition-transform hover:-translate-y-1`}
                >
                  <p className="text-sm font-medium uppercase tracking-[0.24em] opacity-70">Mood</p>
                  <p className="mt-4 font-display text-2xl font-semibold">{mood.label}</p>
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

function SectionHeader({
  title,
  subtitle,
  actionLabel,
  onAction,
}: {
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        <h2 className="font-display text-3xl font-semibold">{title}</h2>
        <p className="mt-2 text-sm text-zinc-400">{subtitle}</p>
      </div>
      {actionLabel && onAction && (
        <Button variant="link" className="justify-start px-0 md:justify-center" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
