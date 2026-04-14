import React, { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { Mic, Search as SearchIcon, Square } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ArtistCard } from '@/components/music/ArtistCard';
import { TrackRow } from '@/components/music/TrackRow';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MOOD_COLLECTIONS } from '@/data/catalog';
import { useMusic } from '@/contexts/MusicContext';

type SpeechRecognitionConstructor = new () => {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

export const Search: React.FC = () => {
  const { albums, allTracks, featuredArtists, getArtistTracks, playTrack } = useMusic();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<InstanceType<SpeechRecognitionConstructor> | null>(null);
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());

  useEffect(() => {
    const searchValue = searchParams.get('q');
    if (searchValue && searchValue !== query) {
      setQuery(searchValue);
    }
  }, [query, searchParams]);

  useEffect(() => () => recognitionRef.current?.stop(), []);

  const trackMatches = useMemo(
    () =>
      deferredQuery
        ? allTracks.filter((track) => {
            const haystack = [track.title, track.artist, track.genre, track.album, track.description, track.mood].join(' ').toLowerCase();
            return haystack.includes(deferredQuery);
          })
        : [],
    [allTracks, deferredQuery],
  );

  const artistMatches = useMemo(
    () =>
      deferredQuery
        ? featuredArtists.filter((artist) => {
            const haystack = [artist.name, artist.genre, artist.bio, artist.location].join(' ').toLowerCase();
            return haystack.includes(deferredQuery);
          })
        : [],
    [deferredQuery, featuredArtists],
  );

  const albumMatches = useMemo(
    () =>
      deferredQuery
        ? albums.filter((album) => {
            const haystack = [album.title, album.artist, album.genre].join(' ').toLowerCase();
            return haystack.includes(deferredQuery);
          })
        : [],
    [albums, deferredQuery],
  );

  const topTrack = trackMatches[0];
  const topAlbum = albumMatches[0];
  const topArtist = artistMatches[0];
  const featuredAlbums = albums.slice(0, 4);

  const handleVoiceSearch = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const speechWindow = window as Window & {
      SpeechRecognition?: SpeechRecognitionConstructor;
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
    };
    const SpeechRecognitionApi = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;

    if (!SpeechRecognitionApi) {
      toast.error('Voice search is not available in this browser.');
      return;
    }

    const recognition = new SpeechRecognitionApi();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript || '')
        .join(' ')
        .trim();

      if (transcript) {
        setQuery(transcript);
        toast.success('Voice search updated.');
      }
    };
    recognition.onerror = () => {
      setIsListening(false);
      toast.error('Voice search could not capture that phrase clearly.');
    };
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  return (
    <div className="h-full overflow-y-auto px-4 py-6 md:px-8 md:py-8">
      <div className="mx-auto max-w-7xl">
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by song, artist, album, mood, or genre"
            className="h-14 rounded-full border-white/10 bg-white/6 pl-12 pr-16 text-base"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleVoiceSearch}
            className={`absolute right-2 top-1/2 -translate-y-1/2 rounded-full ${isListening ? 'bg-gamero-lime text-black hover:bg-gamero-lime/90' : ''}`}
            title={isListening ? 'Stop voice search' : 'Start voice search'}
          >
            {isListening ? <Square className="h-4 w-4 fill-current" /> : <Mic className="h-4 w-4" />}
          </Button>
        </div>

        {deferredQuery ? (
          <div className="mt-10 space-y-10">
            <section className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
              <Card className="rounded-[32px] p-6">
                <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">Top result</p>
                {topTrack ? (
                  <button type="button" onClick={() => playTrack(topTrack)} className="mt-5 w-full text-left">
                    <img src={topTrack.albumArt} alt={topTrack.title} className="h-44 w-44 rounded-[28px] object-cover" referrerPolicy="no-referrer" />
                    <h2 className="mt-5 font-display text-3xl font-semibold">{topTrack.title}</h2>
                    <p className="mt-2 text-zinc-400">{topTrack.artist}</p>
                    <p className="mt-4 max-w-md text-sm leading-7 text-zinc-500">{topTrack.description || topTrack.genre}</p>
                  </button>
                ) : topAlbum ? (
                  <Link to={`/album/${topAlbum.id}`} className="mt-5 block text-left">
                    <img src={topAlbum.coverArt} alt={topAlbum.title} className="h-44 w-44 rounded-[28px] object-cover" referrerPolicy="no-referrer" />
                    <h2 className="mt-5 font-display text-3xl font-semibold">{topAlbum.title}</h2>
                    <p className="mt-2 text-zinc-400">{topAlbum.artist}</p>
                    <p className="mt-4 max-w-md text-sm leading-7 text-zinc-500">
                      {topAlbum.trackCount} tracks {topAlbum.genre ? `• ${topAlbum.genre}` : ''}
                    </p>
                  </Link>
                ) : topArtist ? (
                  <div className="mt-5">
                    <Link to={`/artist/${topArtist.id}`} className="block text-left">
                      <img src={topArtist.avatar} alt={topArtist.name} className="h-36 w-36 rounded-[28px] object-cover" referrerPolicy="no-referrer" />
                      <h2 className="mt-5 font-display text-3xl font-semibold">{topArtist.name}</h2>
                      <p className="mt-2 text-zinc-400">{topArtist.genre}</p>
                      <p className="mt-4 max-w-md text-sm leading-7 text-zinc-500">{topArtist.bio}</p>
                    </Link>
                  </div>
                ) : (
                  <p className="mt-4 text-zinc-500">No results yet. Try a different artist, album, genre, or mood.</p>
                )}
              </Card>

              <Card className="rounded-[32px] p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-2xl font-semibold">Songs</h3>
                    <p className="mt-2 text-sm text-zinc-400">Instant results while you type.</p>
                  </div>
                  <Button variant="outline" className="rounded-full px-5" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    Keep exploring
                  </Button>
                </div>
                <div className="mt-6 space-y-2">
                  {trackMatches.slice(0, 8).map((track, index) => (
                    <TrackRow key={track.id} track={track} index={index + 1} />
                  ))}
                  {trackMatches.length === 0 && <p className="text-sm text-zinc-500">No track matches yet.</p>}
                </div>
              </Card>
            </section>

            <section>
              <div>
                <h3 className="font-display text-3xl font-semibold">Albums</h3>
                <p className="mt-2 text-sm text-zinc-400">Dedicated album results so users can jump straight into full releases.</p>
              </div>
              <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {albumMatches.length > 0 ? (
                  albumMatches.slice(0, 8).map((album) => (
                    <Link key={album.id} to={`/album/${album.id}`} className="block">
                      <Card className="rounded-[30px] p-4 transition-transform hover:-translate-y-1">
                        <img src={album.coverArt} alt={album.title} className="aspect-square w-full rounded-[24px] object-cover" referrerPolicy="no-referrer" />
                        <p className="mt-4 truncate text-lg font-semibold text-white">{album.title}</p>
                        <p className="mt-1 truncate text-sm text-zinc-400">{album.artist}</p>
                        <p className="mt-3 text-sm leading-6 text-zinc-500">
                          {album.trackCount} tracks {album.genre ? `• ${album.genre}` : ''}
                        </p>
                      </Card>
                    </Link>
                  ))
                ) : (
                  <Card className="rounded-[28px] p-6 text-zinc-500">No album matches yet.</Card>
                )}
              </div>
            </section>

            <section>
              <div>
                <h3 className="font-display text-3xl font-semibold">Artists</h3>
                <p className="mt-2 text-sm text-zinc-400">Recognizable profiles with top tracks ready to play.</p>
              </div>
              <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {artistMatches.length > 0 ? (
                  artistMatches.map((artist) => <ArtistCard key={artist.id} artist={artist} />)
                ) : (
                  <Card className="rounded-[28px] p-6 text-zinc-500">
                    Nothing matched that artist search. Try a mood, genre, or song title instead.
                  </Card>
                )}
              </div>
            </section>
          </div>
        ) : (
          <div className="mt-10 grid gap-8 xl:grid-cols-[1fr_0.95fr]">
            <section className="space-y-8">
              <div>
                <h2 className="font-display text-3xl font-semibold">Browse all</h2>
                <p className="mt-2 text-sm text-zinc-400">Jump into a genre or mood without typing.</p>
                <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {MOOD_COLLECTIONS.map((mood) => (
                    <button
                      key={mood.label}
                      type="button"
                      onClick={() => setQuery(mood.label)}
                      className={`flex min-h-[156px] flex-col justify-between overflow-hidden rounded-[26px] bg-gradient-to-br ${mood.accent} p-5 text-left text-black transition-transform hover:-translate-y-1`}
                    >
                      <p className="text-xs uppercase tracking-[0.24em] opacity-70">Browse</p>
                      <p className="mt-6 break-words font-display text-[clamp(1.6rem,2vw,2.35rem)] font-semibold leading-[0.92]">
                        {mood.label}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="font-display text-3xl font-semibold">Featured albums</h2>
                <p className="mt-2 text-sm text-zinc-400">Album-first browsing for listeners who want full releases, not just single tracks.</p>
                <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {featuredAlbums.map((album) => (
                    <Link key={album.id} to={`/album/${album.id}`} className="block">
                      <Card className="rounded-[30px] p-4 transition-transform hover:-translate-y-1">
                        <img src={album.coverArt} alt={album.title} className="aspect-square w-full rounded-[24px] object-cover" referrerPolicy="no-referrer" />
                        <p className="mt-4 truncate text-lg font-semibold text-white">{album.title}</p>
                        <p className="mt-1 truncate text-sm text-zinc-400">{album.artist}</p>
                        <p className="mt-3 text-sm leading-6 text-zinc-500">
                          {album.trackCount} tracks {album.genre ? `• ${album.genre}` : ''}
                        </p>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            </section>

            <section>
              <h2 className="font-display text-3xl font-semibold">Featured artist picks</h2>
              <p className="mt-2 text-sm text-zinc-400">Start from a profile, then dive into full track lists.</p>
              <div className="mt-5 space-y-3">
                {featuredArtists.slice(0, 4).map((artist) => {
                  const artistTracks = getArtistTracks(artist.id);

                  return (
                    <Link
                      key={artist.id}
                      to={`/artist/${artist.id}`}
                      className="flex min-w-0 items-center gap-4 rounded-[26px] border border-white/8 bg-white/[0.04] p-4 transition-colors hover:bg-white/[0.06]"
                    >
                      <img src={artist.avatar} alt={artist.name} className="h-16 w-16 rounded-[22px] object-cover" referrerPolicy="no-referrer" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-lg font-semibold text-white">{artist.name}</p>
                        <p className="truncate text-sm text-zinc-400">{artist.genre}</p>
                      </div>
                      <div className="hidden text-right text-xs uppercase tracking-[0.24em] text-zinc-500 sm:block">
                        <p>{artistTracks.length} tracks</p>
                        <p className="mt-2">{artist.monthlyListeners}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};
