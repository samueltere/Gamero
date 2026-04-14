import { FEATURED_ARTISTS } from '@/data/catalog';
import type { PersonalizedRow, Playlist, SocialNotification, Track } from '@/types/music';

export function buildPersonalizedRows(
  allTracks: Track[],
  savedTracks: Track[],
  recentTracks: Track[],
  followedArtistIds: string[],
): PersonalizedRow[] {
  const genreScores = new Map<string, number>();

  [...recentTracks, ...savedTracks].forEach((track, index) => {
    if (!track.genre) {
      return;
    }

    const weight = Math.max(6 - index, 1);
    genreScores.set(track.genre, (genreScores.get(track.genre) || 0) + weight);
  });

  allTracks
    .filter((track) => track.artistId && followedArtistIds.includes(track.artistId))
    .forEach((track) => {
      if (track.genre) {
        genreScores.set(track.genre, (genreScores.get(track.genre) || 0) + 4);
      }
    });

  const rankedGenres = Array.from(genreScores.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([genre]) => genre);

  const topGenre = rankedGenres[0];
  const secondGenre = rankedGenres[1];
  const usedTrackIds = new Set<string>();
  const rows: PersonalizedRow[] = [];

  if (topGenre) {
    const dailyMix = collectTracks(allTracks, usedTrackIds, (track) => track.genre === topGenre, 6);
    if (dailyMix.length > 0) {
      rows.push({
        id: 'daily-mix',
        title: 'Your Daily Mix',
        subtitle: `${topGenre} and nearby sounds built from your listening habits.`,
        tracks: dailyMix,
      });
    }
  }

  if (recentTracks[0]) {
    const anchorTrack = recentTracks[0];
    const inspiredByRecent = collectTracks(
      allTracks,
      usedTrackIds,
      (track) =>
        track.id !== anchorTrack.id &&
        (track.genre === anchorTrack.genre || track.artistId === anchorTrack.artistId || track.mood === anchorTrack.mood),
      6,
    );

    if (inspiredByRecent.length > 0) {
      rows.push({
        id: 'because-you-played',
        title: `Because you played ${anchorTrack.title}`,
        subtitle: 'Tracks that sit in the same lane, artist world, or mood.',
        tracks: inspiredByRecent,
      });
    }
  }

  const discoveryPool = collectTracks(
    allTracks,
    usedTrackIds,
    (track) =>
      !savedTracks.some((savedTrack) => savedTrack.id === track.id) &&
      !recentTracks.some((recentTrack) => recentTrack.id === track.id) &&
      (!secondGenre || track.genre === secondGenre || track.genre === topGenre),
    6,
  );

  if (discoveryPool.length > 0) {
    rows.push({
      id: 'weekly-discovery',
      title: 'Weekly Discovery',
      subtitle: 'Fresh picks outside your recent loop so the feed still surprises you.',
      tracks: discoveryPool,
    });
  }

  if (rows.length === 0) {
    rows.push({
      id: 'editor-picks',
      title: 'Editor Picks',
      subtitle: 'A fallback mix until Gemero learns more from your taste.',
      tracks: allTracks.slice(0, 6),
    });
  }

  return rows;
}

export function buildNotifications({
  communityTracks,
  followedArtistIds,
  playlists,
  readNotificationIds,
  userPlaylists,
}: {
  communityTracks: Track[];
  followedArtistIds: string[];
  playlists: Playlist[];
  readNotificationIds: string[];
  userPlaylists: Playlist[];
}) {
  const items: Omit<SocialNotification, 'isRead'>[] = [];

  FEATURED_ARTISTS.filter((artist) => followedArtistIds.includes(artist.id))
    .slice(0, 3)
    .forEach((artist, index) => {
      items.push({
        id: `release-${artist.id}`,
        title: `${artist.name} is active`,
        body: `${artist.latestRelease} is waiting on their profile page.`,
        link: `/artist/${artist.id}`,
        kind: 'release',
        createdAt: Date.now() - index * 60_000,
      });
    });

  communityTracks.slice(0, 2).forEach((track, index) => {
    items.push({
      id: `community-${track.id}`,
      title: 'Fresh community upload',
      body: `${track.title} by ${track.artist} just landed in the catalog.`,
      link: '/studio',
      kind: 'activity',
      createdAt: Date.now() - (index + 3) * 60_000,
    });
  });

  userPlaylists
    .filter((playlist) => playlist.trackIds.length > 0)
    .slice(0, 1)
    .forEach((playlist) => {
      items.push({
        id: `playlist-${playlist.id}`,
        title: 'Playlist ready to share',
        body: `${playlist.name} has ${playlist.trackIds.length} tracks and is ready to send out.`,
        link: `/playlist/${playlist.id}`,
        kind: 'playlist',
        createdAt: Date.now() - 12 * 60_000,
      });
    });

  if (playlists.length > 0) {
    items.push({
      id: 'social-friends',
      title: 'Friends are listening nearby',
      body: 'The friend activity rail has new listening updates.',
      link: '/',
      kind: 'social',
      createdAt: Date.now() - 20 * 60_000,
    });
  }

  return items
    .sort((a, b) => b.createdAt - a.createdAt)
    .map((item) => ({
      ...item,
      isRead: readNotificationIds.includes(item.id),
    }));
}

function collectTracks(tracks: Track[], usedTrackIds: Set<string>, predicate: (track: Track) => boolean, limit: number) {
  const result: Track[] = [];

  tracks.forEach((track) => {
    if (result.length >= limit || usedTrackIds.has(track.id) || !predicate(track)) {
      return;
    }

    usedTrackIds.add(track.id);
    result.push(track);
  });

  return result;
}
