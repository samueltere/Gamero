export type TrackSource = 'catalog' | 'community' | 'studio';
export type RepeatMode = 'off' | 'all' | 'one';

export interface Track {
  id: string;
  title: string;
  artist: string;
  artistId?: string;
  album?: string;
  albumArt: string;
  url: string;
  duration: number;
  genre?: string;
  mood?: string;
  lyrics?: string;
  source: TrackSource;
  userId?: string;
  uploaderName?: string;
  description?: string;
  plays?: number;
  createdAt?: unknown;
}

export interface AlbumSummary {
  id: string;
  title: string;
  artist: string;
  artistId?: string;
  coverArt: string;
  trackIds: string[];
  trackCount: number;
  genre?: string;
  source?: TrackSource;
}

export interface ArtistProfile {
  id: string;
  name: string;
  genre: string;
  location: string;
  bio: string;
  accent: string;
  avatar: string;
  heroImage: string;
  monthlyListeners: string;
  followers: string;
  topTrackIds: string[];
  latestRelease: string;
  headline: string;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  coverArt: string;
  trackIds: string[];
  userId: string;
  ownerName: string;
  isPublic: boolean;
  followers: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface SocialNotification {
  id: string;
  title: string;
  body: string;
  link: string;
  kind: 'release' | 'playlist' | 'social' | 'activity';
  createdAt: number;
  isRead: boolean;
}

export interface PersonalizedRow {
  id: string;
  title: string;
  subtitle: string;
  tracks: Track[];
}

export interface FriendActivity {
  id: string;
  name: string;
  avatar: string;
  action: string;
  trackId: string;
  artistId?: string;
  atLabel: string;
}

export interface UploadTrackInput {
  title: string;
  genre: string;
  description: string;
  audioFile: File;
  imageFile: File;
}

export interface StudioDraftInput {
  prompt: string;
  genre: string;
  mood: string;
}

export interface PlaylistInput {
  name: string;
  description: string;
  initialTrackId?: string;
}
