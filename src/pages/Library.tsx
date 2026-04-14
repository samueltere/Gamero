import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { TrackCard } from '@/components/music/TrackCard';
import { TrackRow } from '@/components/music/TrackRow';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMusic } from '@/contexts/MusicContext';
import type { AlbumSummary, ArtistProfile, Playlist, Track } from '@/types/music';

type LibrarySortMode = 'recent' | 'title' | 'artist';

export const Library: React.FC = () => {
  const navigate = useNavigate();
  const {
    albums,
    createPlaylist,
    featuredArtists,
    followedArtistIds,
    recentTracks,
    savedTracks,
    signIn,
    startPlaylist,
    user,
    userPlaylists,
    userStudioTracks,
    userUploads,
  } = useMusic();
  const [playlistName, setPlaylistName] = useState('');
  const [filterValue, setFilterValue] = useState('');
  const [sortMode, setSortMode] = useState<LibrarySortMode>('recent');
  const filterQuery = filterValue.trim().toLowerCase();

  const handleCreatePlaylist = async () => {
    if (!playlistName.trim()) {
      toast.error('Enter a playlist name first.');
      return;
    }

    try {
      const playlist = await createPlaylist({
        name: playlistName,
        description: 'A playlist created from your Gemero library.',
      });
      setPlaylistName('');
      toast.success('Playlist created.');
      navigate(`/playlist/${playlist.id}`);
    } catch (error) {
      console.error(error);
      toast.error('Could not create that playlist right now.');
    }
  };

  const libraryTracks = useMemo(() => dedupeTracks([...savedTracks, ...recentTracks, ...userUploads, ...userStudioTracks]), [recentTracks, savedTracks, userStudioTracks, userUploads]);

  const visiblePlaylists = useMemo(
    () => sortPlaylists(userPlaylists.filter((playlist) => matchesPlaylist(playlist, filterQuery)), sortMode),
    [filterQuery, sortMode, userPlaylists],
  );
  const visibleAlbums = useMemo(() => {
    const libraryTrackIds = new Set(libraryTracks.map((track) => track.id));
    return sortAlbums(albums.filter((album) => album.trackIds.some((trackId) => libraryTrackIds.has(trackId)) && matchesAlbum(album, filterQuery)), sortMode);
  }, [albums, filterQuery, libraryTracks, sortMode]);
  const visibleArtists = useMemo(() => {
    const libraryArtistIds = new Set(libraryTracks.map((track) => track.artistId).filter((artistId): artistId is string => Boolean(artistId)));
    followedArtistIds.forEach((artistId) => libraryArtistIds.add(artistId));
    return sortArtists(featuredArtists.filter((artist) => libraryArtistIds.has(artist.id) && matchesArtist(artist, filterQuery)), sortMode);
  }, [featuredArtists, filterQuery, followedArtistIds, libraryTracks, sortMode]);
  const visibleSavedTracks = useMemo(() => sortTracks(savedTracks.filter((track) => matchesTrack(track, filterQuery)), sortMode), [filterQuery, savedTracks, sortMode]);
  const visibleRecentTracks = useMemo(() => sortTracks(recentTracks.filter((track) => matchesTrack(track, filterQuery)), sortMode), [filterQuery, recentTracks, sortMode]);
  const visibleUploads = useMemo(() => sortTracks(userUploads.filter((track) => matchesTrack(track, filterQuery)), sortMode), [filterQuery, sortMode, userUploads]);
  const visibleStudioTracks = useMemo(() => sortTracks(userStudioTracks.filter((track) => matchesTrack(track, filterQuery)), sortMode), [filterQuery, sortMode, userStudioTracks]);

  return (
    <div className="h-full overflow-y-auto px-4 py-6 md:px-8 md:py-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <Card className="rounded-[34px] p-6 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">Your collection</p>
              <h1 className="mt-3 font-display text-4xl font-semibold">Everything you&apos;ve saved, played, and published.</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-400">
                Keep artist releases close, revisit recent listens, manage uploads, and sort your library by playlists, albums, artists, or tracks.
              </p>
            </div>

            {!user && (
              <Button onClick={signIn} className="rounded-full px-6">
                Continue with Google
              </Button>
            )}
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-[1fr_220px]">
            <Input
              value={filterValue}
              onChange={(event) => setFilterValue(event.target.value)}
              placeholder="Filter playlists, albums, artists, or tracks"
              className="h-12 rounded-2xl"
            />
            <select
              value={sortMode}
              onChange={(event) => setSortMode(event.target.value as LibrarySortMode)}
              className="h-12 rounded-2xl border border-white/10 bg-white/5 px-4 text-white focus:border-gamero-lime/60 focus:outline-none"
            >
              <option value="recent" className="bg-gamero-bg text-white">
                Recent first
              </option>
              <option value="title" className="bg-gamero-bg text-white">
                Alphabetical
              </option>
              <option value="artist" className="bg-gamero-bg text-white">
                Artist A-Z
              </option>
            </select>
          </div>
          <p className="mt-3 text-sm text-zinc-500">Filters apply across every tab so the library stays easy to scan.</p>
        </Card>

        <Tabs defaultValue="playlists" className="space-y-6">
          <TabsList>
            <TabsTrigger value="playlists">Playlists</TabsTrigger>
            <TabsTrigger value="albums">Albums</TabsTrigger>
            <TabsTrigger value="artists">Artists</TabsTrigger>
            <TabsTrigger value="saved">Saved</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="uploads">Uploads</TabsTrigger>
            <TabsTrigger value="studio">Studio</TabsTrigger>
          </TabsList>

          <TabsContent value="playlists">
            {user ? (
              <div className="space-y-6">
                <Card className="rounded-[32px] p-6">
                  <h2 className="font-display text-3xl font-semibold">Create a playlist</h2>
                  <p className="mt-3 text-sm leading-7 text-zinc-400">Start a new list here, then use the plus button on any track to fill it.</p>
                  <div className="mt-5 flex flex-col gap-3 md:flex-row">
                    <Input value={playlistName} onChange={(event) => setPlaylistName(event.target.value)} placeholder="Night drive rotation" className="h-12 rounded-2xl" />
                    <Button onClick={() => void handleCreatePlaylist()} className="rounded-2xl px-6">
                      <Plus className="h-4 w-4" />
                      Create playlist
                    </Button>
                  </div>
                </Card>

                {visiblePlaylists.length > 0 ? (
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {visiblePlaylists.map((playlist) => (
                      <Card key={playlist.id} className="overflow-hidden rounded-[30px] p-4">
                        <Link to={`/playlist/${playlist.id}`} className="block min-w-0">
                          <img src={playlist.coverArt} alt={playlist.name} className="aspect-square w-full rounded-[24px] object-cover" referrerPolicy="no-referrer" />
                          <p className="mt-4 line-clamp-2 break-words text-lg font-semibold text-white">{playlist.name}</p>
                          <p className="mt-1 text-sm text-zinc-400">{playlist.trackIds.length} tracks</p>
                          <p className="mt-3 line-clamp-2 text-sm leading-6 text-zinc-500">{playlist.description || 'Open the playlist to add, remove, and share tracks.'}</p>
                        </Link>
                        <Button onClick={() => startPlaylist(playlist.id)} className="mt-4 w-full rounded-2xl">
                          <Play className="h-4 w-4 fill-current" />
                          Play
                        </Button>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <EmptyState title="No playlists yet." description="Create your first playlist above, then add tracks from search, home, or artist pages." />
                )}
              </div>
            ) : (
              <EmptyState title="Sign in to create playlists." description="Playlist creation is tied to your account so you can keep editing and sharing them later." action={<Button onClick={signIn}>Continue with Google</Button>} />
            )}
          </TabsContent>

          <TabsContent value="albums">
            {visibleAlbums.length > 0 ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {visibleAlbums.map((album) => (
                  <Link key={album.id} to={`/album/${album.id}`} className="block">
                    <Card className="rounded-[30px] p-4 transition-transform hover:-translate-y-1">
                      <img src={album.coverArt} alt={album.title} className="aspect-square w-full rounded-[24px] object-cover" referrerPolicy="no-referrer" />
                      <p className="mt-4 line-clamp-2 break-words text-lg font-semibold text-white">{album.title}</p>
                      <p className="mt-1 truncate text-sm text-zinc-400">{album.artist}</p>
                      <p className="mt-3 text-sm leading-6 text-zinc-500">
                        {album.trackCount} tracks {album.genre ? `• ${album.genre}` : ''}
                      </p>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState title="No albums in your library yet." description="Save songs or play full releases and albums will appear here for quick access." action={<Button onClick={() => navigate('/search')}>Browse albums</Button>} />
            )}
          </TabsContent>

          <TabsContent value="artists">
            {visibleArtists.length > 0 ? (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {visibleArtists.map((artist) => (
                  <Link key={artist.id} to={`/artist/${artist.id}`} className="block">
                    <Card className="rounded-[30px] p-5 transition-transform hover:-translate-y-1">
                      <div className="flex items-center gap-4">
                        <img src={artist.avatar} alt={artist.name} className="h-20 w-20 rounded-[24px] object-cover" referrerPolicy="no-referrer" />
                        <div className="min-w-0">
                          <p className="line-clamp-2 break-words text-xl font-semibold text-white">{artist.name}</p>
                          <p className="truncate text-sm text-zinc-400">{artist.genre}</p>
                          {followedArtistIds.includes(artist.id) && <p className="mt-2 text-xs uppercase tracking-[0.24em] text-gamero-lime">Following</p>}
                        </div>
                      </div>
                      <p className="mt-4 line-clamp-3 text-sm leading-7 text-zinc-500">{artist.bio}</p>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState title="No artists saved yet." description="Play songs, save tracks, or follow artists and they will start building up here." action={<Button onClick={() => navigate('/search')}>Discover artists</Button>} />
            )}
          </TabsContent>

          <TabsContent value="saved">
            {visibleSavedTracks.length > 0 ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {visibleSavedTracks.map((track) => (
                  <TrackCard key={track.id} track={track} />
                ))}
              </div>
            ) : (
              <EmptyState title="Your saved tracks will land here." description="Tap the heart on any release or upload to keep it in your library." action={<Button onClick={() => navigate('/search')}>Discover music</Button>} />
            )}
          </TabsContent>

          <TabsContent value="recent">
            {visibleRecentTracks.length > 0 ? (
              <Card className="rounded-[32px] p-4">
                <div className="space-y-2">
                  {visibleRecentTracks.map((track, index) => (
                    <TrackRow key={track.id} track={track} index={index + 1} />
                  ))}
                </div>
              </Card>
            ) : (
              <EmptyState title="Nothing played yet." description="Start a track from Home or Search and Gemero will keep your recent listening here." action={<Button onClick={() => navigate('/')}>Browse artists</Button>} />
            )}
          </TabsContent>

          <TabsContent value="uploads">
            {user ? (
              visibleUploads.length > 0 ? (
                <Card className="rounded-[32px] p-4">
                  <div className="space-y-2">
                    {visibleUploads.map((track, index) => (
                      <TrackRow key={track.id} track={track} index={index + 1} />
                    ))}
                  </div>
                </Card>
              ) : (
                <EmptyState title="You haven&apos;t uploaded a track yet." description="Add audio and cover art from your device, then publish it so listeners can stream it." action={<Button onClick={() => navigate('/studio')}>Open studio</Button>} />
              )
            ) : (
              <EmptyState title="Sign in to publish music." description="Uploads are tied to your Google account so you can manage them later." action={<Button onClick={signIn}>Continue with Google</Button>} />
            )}
          </TabsContent>

          <TabsContent value="studio">
            {user ? (
              visibleStudioTracks.length > 0 ? (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {visibleStudioTracks.map((track) => (
                    <TrackCard key={track.id} track={track} />
                  ))}
                </div>
              ) : (
                <EmptyState title="No studio drafts yet." description="Build a prompt-based draft in the studio and save it here for later playback." action={<Button onClick={() => navigate('/studio')}>Create a draft</Button>} />
              )
            ) : (
              <EmptyState title="Sign in to save studio drafts." description="Your saved drafts and uploads stay attached to your account." action={<Button onClick={signIn}>Continue with Google</Button>} />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <Card className="rounded-[32px] p-8 text-center">
      <h2 className="font-display text-2xl font-semibold">{title}</h2>
      <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-zinc-400">{description}</p>
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </Card>
  );
}

function dedupeTracks(tracks: Track[]) {
  const seen = new Set<string>();
  return tracks.filter((track) => {
    if (seen.has(track.id)) {
      return false;
    }

    seen.add(track.id);
    return true;
  });
}

function matchesTrack(track: Track, filterQuery: string) {
  if (!filterQuery) {
    return true;
  }

  return [track.title, track.artist, track.album, track.genre, track.description].join(' ').toLowerCase().includes(filterQuery);
}

function matchesPlaylist(playlist: Playlist, filterQuery: string) {
  if (!filterQuery) {
    return true;
  }

  return [playlist.name, playlist.description, playlist.ownerName].join(' ').toLowerCase().includes(filterQuery);
}

function matchesAlbum(album: AlbumSummary, filterQuery: string) {
  if (!filterQuery) {
    return true;
  }

  return [album.title, album.artist, album.genre].join(' ').toLowerCase().includes(filterQuery);
}

function matchesArtist(artist: ArtistProfile, filterQuery: string) {
  if (!filterQuery) {
    return true;
  }

  return [artist.name, artist.genre, artist.location, artist.bio].join(' ').toLowerCase().includes(filterQuery);
}

function sortTracks(tracks: Track[], sortMode: LibrarySortMode) {
  if (sortMode === 'recent') {
    return tracks;
  }

  const collator = new Intl.Collator(undefined, { sensitivity: 'base' });
  return [...tracks].sort((a, b) => collator.compare(sortMode === 'artist' ? a.artist : a.title, sortMode === 'artist' ? b.artist : b.title));
}

function sortPlaylists(playlists: Playlist[], sortMode: LibrarySortMode) {
  if (sortMode === 'recent') {
    return playlists;
  }

  const collator = new Intl.Collator(undefined, { sensitivity: 'base' });
  return [...playlists].sort((a, b) => {
    const left = sortMode === 'artist' ? a.ownerName : a.name;
    const right = sortMode === 'artist' ? b.ownerName : b.name;
    return collator.compare(left, right);
  });
}

function sortAlbums(albums: AlbumSummary[], sortMode: LibrarySortMode) {
  if (sortMode === 'recent') {
    return albums;
  }

  const collator = new Intl.Collator(undefined, { sensitivity: 'base' });
  return [...albums].sort((a, b) => {
    const left = sortMode === 'artist' ? a.artist : a.title;
    const right = sortMode === 'artist' ? b.artist : b.title;
    return collator.compare(left, right);
  });
}

function sortArtists(artists: ArtistProfile[], sortMode: LibrarySortMode) {
  if (sortMode === 'recent') {
    return artists;
  }

  const collator = new Intl.Collator(undefined, { sensitivity: 'base' });
  return [...artists].sort((a, b) => collator.compare(a.name, b.name));
}
