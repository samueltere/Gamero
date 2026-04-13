import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { AlbumSummary, Track } from '@/types/music';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function createAlbumId(track: Pick<Track, 'album' | 'artist'>) {
  return slugify(`${track.artist}-${track.album || 'single'}`);
}

export function buildAlbumSummaries(tracks: Track[]): AlbumSummary[] {
  const albumMap = new Map<string, AlbumSummary>();

  tracks.forEach((track) => {
    if (!track.album) {
      return;
    }

    const albumId = createAlbumId(track);
    const currentAlbum = albumMap.get(albumId);

    if (!currentAlbum) {
      albumMap.set(albumId, {
        id: albumId,
        title: track.album,
        artist: track.artist,
        artistId: track.artistId,
        coverArt: track.albumArt,
        trackIds: [track.id],
        trackCount: 1,
        genre: track.genre,
        source: track.source,
      });
      return;
    }

    currentAlbum.trackIds.push(track.id);
    currentAlbum.trackCount += 1;
  });

  return Array.from(albumMap.values());
}

export async function copyText(value: string) {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return true;
  }

  return false;
}

export async function shareLink(title: string, text: string, url: string) {
  if (typeof navigator !== 'undefined' && navigator.share) {
    await navigator.share({ title, text, url });
    return 'shared';
  }

  await copyText(url);
  return 'copied';
}
