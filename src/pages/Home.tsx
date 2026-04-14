import React from 'react';
import { ArrowRight, Disc3, Sparkles, Waves } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
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

  const quickPicks = (recentTracks.length ? recentTracks : allTracks).slice(0, 3);
  const topPersonalizedRow = personalizedRows[0];
  const communitySpotlight = communityTracks.slice(0, 4);

  return (
    <div className="h-full overflow-y-auto px-4 py-6 md:px-8 md:py-8">
      <div className="mx-auto max-w-7xl space-y-10">
        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="relative overflow-hidden rounded-[38px] p-8 md:p-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(167,139,250,0.26),transparent_26%),radial-gradient(circle_at_82%_18%,rgba(255,122,138,0.18),transparent_24%),radial-gradient(circle_at_68%_76%,rgba(103,232,249,0.16),transparent_28%)]" />
              <div className="relative z-[1] max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-[var(--gamero-border)] bg-white/8 px-4 py-2 text-xs uppercase tracking-[0.3em] text-[var(--gamero-muted)]">
                  <Sparkles className="h-3.5 w-3.5" />
                  Creator-first ecosystem
                </div>
                <h1 className="mt-6 max-w-2xl font-display text-4xl font-semibold leading-tight md:text-6xl">
                  Gemero turns listening into a living creative space.
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--gamero-muted)] md:text-lg">
                  {user && topPersonalizedRow
                    ? `${topPersonalizedRow.title} is ready, your creator feed is moving, and the studio is one tap away when you want to shape a new sound.`
                    : 'Move between artist worlds, community creations, and your own uploads in a music app designed like a digital gallery instead of a playlist machine.'}
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button onClick={() => navigate('/search')} className="rounded-full px-6">
                    Enter creator feed
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button onClick={() => navigate('/studio')} variant="outline" className="rounded-full px-6">
                    Open creation lab
                  </Button>
                </div>
                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[24px] border border-[var(--gamero-border)] bg-white/10 p-4">
                    <p className="text-3xl font-semibold">{featuredArtists.length}</p>
                    <p className="text-sm text-[var(--gamero-muted)]">Featured creators</p>
                  </div>
                  <div className="rounded-[24px] border border-[var(--gamero-border)] bg-white/10 p-4">
                    <p className="text-3xl font-semibold">{communityTracks.length}</p>
                    <p className="text-sm text-[var(--gamero-muted)]">Community drops</p>
                  </div>
                  <div className="rounded-[24px] border border-[var(--gamero-border)] bg-white/10 p-4">
                    <p className="text-3xl font-semibold">{savedTracks.length}</p>
                    <p className="text-sm text-[var(--gamero-muted)]">Library signals</p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          <div className="grid gap-4">
            <Card className="relative overflow-hidden rounded-[34px] p-6">
              <div className="gamero-orb absolute right-[-16px] top-[-16px] h-36 w-36 opacity-90" />
              <div className="relative">
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--gamero-muted)]">Creation orb</p>
                <h2 className="mt-4 font-display text-3xl font-semibold">Music should look alive while it forms.</h2>
                <p className="mt-4 max-w-sm text-sm leading-7 text-[var(--gamero-muted)]">
                  Gemero keeps a full listening experience, but the studio still feels magical, reactive, and built around creative energy.
                </p>
                <Button onClick={() => navigate('/studio')} className="mt-6 rounded-full px-6">
                  Generate a draft
                </Button>
              </div>
            </Card>

            <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-1">
              {quickPicks.map((track) => (
                <TrackCard key={track.id} track={track} className="rounded-[30px] p-3" />
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <Card className="rounded-[36px] p-6 md:p-8">
            <SectionHeader title="Featured creators" subtitle="People first, tracks second. Each profile should feel like entering a room with its own visual identity." />
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {featuredArtists.slice(0, 4).map((artist, index) => (
                <div key={artist.id} className={index === 0 ? 'md:col-span-2' : ''}>
                  <ArtistCard artist={artist} />
                </div>
              ))}
            </div>
          </Card>

          <Card className="rounded-[36px] p-6 md:p-8">
            <SectionHeader title="Creator feed" subtitle="A music-first social stream that keeps community motion visible without turning the app into a noisy timeline." />
            <div className="mt-6 space-y-4">
              {friendActivity.map((entry) => {
                const track = allTracks.find((item) => item.id === entry.trackId);
                if (!track) return null;

                return (
                  <div key={entry.id} className="flex items-start gap-4 rounded-[26px] border border-[var(--gamero-border)] bg-white/8 p-4">
                    <img src={entry.avatar} alt={entry.name} className="h-14 w-14 rounded-[22px] object-cover" referrerPolicy="no-referrer" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold">{entry.name}</p>
                        <span className="text-[10px] uppercase tracking-[0.24em] text-[var(--gamero-muted)]">{entry.atLabel}</span>
                      </div>
                      <p className="mt-2 text-sm leading-7 text-[var(--gamero-muted)]">
                        {entry.action}{' '}
                        <button type="button" onClick={() => playTrack(track)} className="font-semibold text-[var(--gamero-accent)] hover:text-[var(--gamero-accent-2)]">
                          {track.title}
                        </button>
                        .
                      </p>
                      {entry.artistId && (
                        <Link to={`/artist/${entry.artistId}`} className="mt-3 inline-flex text-xs uppercase tracking-[0.28em] text-[var(--gamero-muted)] hover:text-[var(--gamero-text)]">
                          Open creator room
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </section>

        <section>
          <SectionHeader
            title="Made for you"
            subtitle={user ? 'Taste-based rows that move with your listening, library, and followed artists.' : 'Start listening and saving tracks to unlock your own adaptive Gemero mix rooms.'}
          />
          <div className="mt-5 space-y-8">
            {personalizedRows.map((row, index) => (
              <Card key={row.id} className={`rounded-[34px] p-6 ${index % 2 === 0 ? '' : 'md:ml-12'}`}>
                <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                  <div>
                    <h3 className="font-display text-2xl font-semibold">{row.title}</h3>
                    <p className="mt-1 text-sm text-[var(--gamero-muted)]">{row.subtitle}</p>
                  </div>
                  <Button variant="link" className="justify-start px-0 md:justify-center" onClick={() => navigate('/search')}>
                    More in this mood
                  </Button>
                </div>
                <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {row.tracks.map((track) => (
                    <TrackCard key={`${row.id}-${track.id}`} track={track} />
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <SectionHeader title="Trending rooms" subtitle="Curated chambers of sound rather than endless plain rows." />
          <div className="mt-5 grid gap-6 xl:grid-cols-2">
            {DISCOVERY_ROWS.map((row, index) => {
              const tracks = row.trackIds
                .map((trackId) => allTracks.find((track) => track.id === trackId))
                .filter((track): track is NonNullable<typeof track> => Boolean(track));

              return (
                <Card key={row.title} className={`rounded-[34px] p-6 ${index === 1 ? 'xl:translate-y-8' : ''}`}>
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-[20px] bg-[var(--gamero-gradient)] text-white">
                      <Disc3 className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-display text-2xl font-semibold">{row.title}</h3>
                      <p className="mt-1 text-sm text-[var(--gamero-muted)]">{row.subtitle}</p>
                    </div>
                  </div>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    {tracks.slice(0, 4).map((track) => (
                      <TrackCard key={track.id} track={track} className="p-3" />
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <Card className="rounded-[36px] p-6 md:p-8">
            <div className="flex items-center gap-2 text-[var(--gamero-accent)]">
              <Waves className="h-4 w-4" />
              <p className="text-xs uppercase tracking-[0.32em]">Vibe mode</p>
            </div>
            <h2 className="mt-4 font-display text-3xl font-semibold">Mood-led browsing should feel like moving through rooms, not menus.</h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-[var(--gamero-muted)]">
              Use moods as entry points, let the interface breathe with gradients and space, and keep the visual focus on creators, artwork, and sound identity.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={() => navigate('/studio')} className="rounded-full px-6">
                Open the lab
              </Button>
              <Button onClick={() => navigate('/library')} variant="outline" className="rounded-full px-6">
                Visit your library
              </Button>
            </div>
          </Card>

          <div>
            <SectionHeader title="Browse vibes" subtitle="Mood-driven doors into discovery." />
            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {MOOD_COLLECTIONS.map((mood, index) => (
                <button
                  key={mood.label}
                  type="button"
                  onClick={() => navigate(`/search?q=${encodeURIComponent(mood.label)}`)}
                  className={`rounded-[28px] p-5 text-left text-white shadow-[0_20px_50px_rgba(15,16,32,0.18)] transition-transform hover:-translate-y-1 ${index % 2 === 0 ? 'md:translate-y-6' : ''}`}
                  style={{ backgroundImage: `linear-gradient(135deg, ${mood.accent.includes('from') ? '#8b5cf6, #ff7a8a' : '#8b5cf6, #06b6d4'})` }}
                >
                  <p className="text-sm font-medium uppercase tracking-[0.24em] opacity-75">Mood</p>
                  <p className="mt-6 font-display text-2xl font-semibold">{mood.label}</p>
                </button>
              ))}
            </div>
          </div>
        </section>

        {communitySpotlight.length > 0 && (
          <section>
            <SectionHeader title="Community creations" subtitle="A final room for what people are publishing right now." />
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {communitySpotlight.map((track) => (
                <TrackCard key={track.id} track={track} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        <h2 className="font-display text-3xl font-semibold">{title}</h2>
        <p className="mt-2 text-sm text-[var(--gamero-muted)]">{subtitle}</p>
      </div>
    </div>
  );
}
