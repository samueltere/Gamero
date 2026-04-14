import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { User as SupabaseAuthUser } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { CATALOG_TRACKS, FEATURED_ARTISTS, FRIEND_ACTIVITY } from '@/data/catalog';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { buildNotifications, buildPersonalizedRows } from '@/lib/music-data';
import { supabase, handleDataError, isSupabaseConfigured, OperationType } from '@/lib/supabase';
import { buildAlbumSummaries } from '@/lib/utils';
import type {
  AlbumSummary,
  AppUser,
  ArtistProfile,
  FriendActivity,
  PersonalizedRow,
  Playlist,
  PlaylistInput,
  RepeatMode,
  SocialNotification,
  Track,
  UploadTrackInput,
} from '@/types/music';

interface MusicContextType {
  user: AppUser | null;
  isAuthReady: boolean;
  currentTrack: Track | null;
  isPlaying: boolean;
  progress: number;
  volume: number;
  queue: Track[];
  activeQueue: Track[];
  repeatMode: RepeatMode;
  isShuffle: boolean;
  allTracks: Track[];
  albums: AlbumSummary[];
  communityTracks: Track[];
  featuredArtists: ArtistProfile[];
  friendActivity: FriendActivity[];
  playlists: Playlist[];
  userPlaylists: Playlist[];
  savedTracks: Track[];
  recentTracks: Track[];
  userUploads: Track[];
  userStudioTracks: Track[];
  followedArtistIds: string[];
  notifications: SocialNotification[];
  unreadNotifications: number;
  personalizedRows: PersonalizedRow[];
  playTrack: (track: Track) => void;
  togglePlay: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  seek: (value: number) => void;
  setVolume: React.Dispatch<React.SetStateAction<number>>;
  addToQueue: (track: Track) => void;
  removeFromQueue: (trackId: string) => void;
  clearQueue: () => void;
  setQueueFromTracks: (tracks: Track[], startTrackId?: string) => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  signIn: () => Promise<void>;
  logout: () => Promise<void>;
  toggleSavedTrack: (trackId: string) => Promise<void>;
  isSavedTrack: (trackId: string) => boolean;
  uploadTrack: (input: UploadTrackInput) => Promise<Track>;
  saveStudioTrack: (track: Track) => Promise<Track>;
  createPlaylist: (input: PlaylistInput) => Promise<Playlist>;
  deletePlaylist: (playlistId: string) => Promise<void>;
  addTrackToPlaylist: (playlistId: string, trackId: string) => Promise<void>;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => Promise<void>;
  playlistHasTrack: (playlistId: string, trackId: string) => boolean;
  startPlaylist: (playlistId: string) => void;
  getPlaylistTracks: (playlistId: string) => Track[];
  toggleFollowArtist: (artistId: string) => Promise<void>;
  isFollowingArtist: (artistId: string) => boolean;
  markNotificationRead: (notificationId: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  getArtistTracks: (artistId: string) => Track[];
  getAlbumTracks: (albumId: string) => Track[];
  getAlbumById: (albumId: string) => AlbumSummary | undefined;
}

interface UserPreferencesRow {
  id: string;
  email: string;
  display_name: string;
  photo_url: string;
  saved_track_ids: string[] | null;
  recent_track_ids: string[] | null;
  followed_artist_ids: string[] | null;
  read_notification_ids: string[] | null;
  updated_at?: string | null;
}

interface TrackRow {
  id: string;
  title: string;
  artist: string;
  artist_id: string | null;
  album: string | null;
  album_art: string;
  url: string;
  duration: number | null;
  genre: string | null;
  mood: string | null;
  lyrics: string | null;
  source: string | null;
  user_id: string | null;
  uploader_name: string | null;
  description: string | null;
  plays: number | null;
  created_at: string | null;
}

interface PlaylistRow {
  id: string;
  name: string;
  description: string | null;
  cover_art: string | null;
  track_ids: string[] | null;
  user_id: string;
  owner_name: string | null;
  is_public: boolean | null;
  followers: number | null;
  created_at: string | null;
  updated_at: string | null;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [prefsReady, setPrefsReady] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.72);
  const [queue, setQueue] = useState<Track[]>([]);
  const [remoteTracks, setRemoteTracks] = useState<Track[]>([]);
  const [remotePlaylists, setRemotePlaylists] = useState<Playlist[]>([]);
  const [savedTrackIds, setSavedTrackIds] = useState<string[]>([]);
  const [recentTrackIds, setRecentTrackIds] = useState<string[]>([]);
  const [followedArtistIds, setFollowedArtistIds] = useState<string[]>([]);
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([]);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const prefsSignatureRef = useRef('');

  useEffect(() => {
    void loadTracks();
    void loadPlaylists();
  }, []);

  useEffect(() => {
    const applyAuthUser = async (nextAuthUser: SupabaseAuthUser | null) => {
      const nextUser = mapSupabaseUser(nextAuthUser);
      setUser(nextUser);
      setIsAuthReady(true);

      if (!nextUser) {
        setSavedTrackIds([]);
        setRecentTrackIds([]);
        setFollowedArtistIds([]);
        setReadNotificationIds([]);
        setPrefsReady(true);
        prefsSignatureRef.current = '';
        return;
      }

      await ensureUserProfile(nextUser);
      await loadUserPreferences(nextUser.id);
    };

    void supabase.auth.getUser().then(({ data, error }) => {
      if (error) {
        handleDataError(error, OperationType.GET, 'auth/user', { throwError: false });
      }
      return applyAuthUser(data.user ?? null);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      void applyAuthUser(session?.user ?? null);
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || !prefsReady) {
      return;
    }

    const signature = JSON.stringify({ savedTrackIds, recentTrackIds, followedArtistIds, readNotificationIds });
    if (signature === prefsSignatureRef.current) {
      return;
    }

    prefsSignatureRef.current = signature;
    void upsertUserPreferences(user, {
      saved_track_ids: savedTrackIds,
      recent_track_ids: recentTrackIds,
      followed_artist_ids: followedArtistIds,
      read_notification_ids: readNotificationIds,
    }).catch((error) => handleDataError(error, OperationType.UPDATE, `users/${user.id}`, { throwError: false }));
  }, [user, prefsReady, savedTrackIds, recentTrackIds, followedArtistIds, readNotificationIds]);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = 'metadata';
    }
    const audio = audioRef.current;
    const updateProgress = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };
    const handleEnded = () => nextTrack();
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', handleEnded);
    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [queue, currentTrack, remoteTracks, isShuffle, repeatMode]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const allTracks = useMemo(() => mergeTracks(remoteTracks, CATALOG_TRACKS), [remoteTracks]);
  const activeQueue = useMemo(() => (queue.length > 0 ? queue : allTracks), [queue, allTracks]);
  const communityTracks = useMemo(() => remoteTracks.filter((track) => track.source === 'community'), [remoteTracks]);
  const playlists = useMemo(() => remotePlaylists.filter((playlist) => playlist.isPublic || playlist.userId === user?.id), [remotePlaylists, user]);
  const userPlaylists = useMemo(() => (user ? playlists.filter((playlist) => playlist.userId === user.id) : []), [playlists, user]);
  const albums = useMemo(() => buildAlbumSummaries(allTracks), [allTracks]);
  const savedTracks = useMemo(() => mapIdsToTracks(savedTrackIds, allTracks), [savedTrackIds, allTracks]);
  const recentTracks = useMemo(() => mapIdsToTracks(recentTrackIds, allTracks), [recentTrackIds, allTracks]);
  const userUploads = useMemo(() => (user ? remoteTracks.filter((track) => track.userId === user.id && track.source === 'community') : []), [remoteTracks, user]);
  const userStudioTracks = useMemo(() => (user ? remoteTracks.filter((track) => track.userId === user.id && track.source === 'studio') : []), [remoteTracks, user]);
  const personalizedRows = useMemo(() => buildPersonalizedRows(allTracks, savedTracks, recentTracks, followedArtistIds), [allTracks, savedTracks, recentTracks, followedArtistIds]);
  const notifications = useMemo(() => buildNotifications({ communityTracks, followedArtistIds, playlists, readNotificationIds, userPlaylists }), [communityTracks, followedArtistIds, playlists, readNotificationIds, userPlaylists]);
  const unreadNotifications = notifications.filter((notification) => !notification.isRead).length;

  const signIn = async () => {
    if (!isSupabaseConfigured()) {
      toast.error('Supabase environment variables are missing.');
      return;
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: {
          access_type: 'offline',
          prompt: 'select_account',
        },
      },
    });

    if (error) {
      handleDataError(error, OperationType.GET, 'auth/google', { throwError: false });
      toast.error('Google sign-in failed. Check your Supabase auth settings and try again.');
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      handleDataError(error, OperationType.DELETE, 'auth/session', { throwError: false });
      toast.error('Sign-out failed. Try again.');
    }
  };

  const playTrack = (track: Track) => {
    if (!track.url) return;
    if (currentTrack?.id === track.id) return togglePlay();
    setCurrentTrack(track);
    setIsPlaying(true);
    setProgress(0);
    rememberTrack(track.id, setRecentTrackIds);
    if (audioRef.current) {
      audioRef.current.src = track.url;
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(console.error);
    }
  };

  const togglePlay = () => {
    if (!currentTrack || !audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }
    audioRef.current.play().catch(console.error);
    setIsPlaying(true);
  };

  const nextTrack = () => {
    if (!activeQueue.length) return;
    if (repeatMode === 'one' && currentTrack && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(console.error);
      setIsPlaying(true);
      return;
    }
    const currentIndex = activeQueue.findIndex((track) => track.id === currentTrack?.id);
    if (isShuffle && activeQueue.length > 1) {
      const options = activeQueue.filter((track) => track.id !== currentTrack?.id);
      return playTrack(options[Math.floor(Math.random() * options.length)]);
    }
    if (currentIndex < 0) return playTrack(activeQueue[0]);
    if (currentIndex === activeQueue.length - 1 && repeatMode === 'off') {
      audioRef.current?.pause();
      return setIsPlaying(false);
    }
    playTrack(activeQueue[(currentIndex + 1) % activeQueue.length]);
  };

  const prevTrack = () => {
    if (!activeQueue.length) return;
    if (audioRef.current && audioRef.current.currentTime > 5) {
      audioRef.current.currentTime = 0;
      return setProgress(0);
    }
    const currentIndex = activeQueue.findIndex((track) => track.id === currentTrack?.id);
    if (isShuffle && activeQueue.length > 1) {
      const options = activeQueue.filter((track) => track.id !== currentTrack?.id);
      return playTrack(options[Math.floor(Math.random() * options.length)]);
    }
    if (currentIndex <= 0) return playTrack(activeQueue[repeatMode === 'all' ? activeQueue.length - 1 : 0]);
    playTrack(activeQueue[currentIndex - 1]);
  };

  const seek = (value: number) => {
    if (!audioRef.current || !audioRef.current.duration) return;
    audioRef.current.currentTime = (value / 100) * audioRef.current.duration;
    setProgress(value);
  };

  const addToQueue = (track: Track) => setQueue((current) => (current.some((item) => item.id === track.id) ? current : [...current, track]));
  const removeFromQueue = (trackId: string) => setQueue((current) => current.filter((track) => track.id !== trackId));
  const clearQueue = () => setQueue([]);
  const setQueueFromTracks = (tracks: Track[], startTrackId?: string) => {
    const uniqueTracks = mergeTracks(tracks, []);
    setQueue(uniqueTracks);
    const startTrack = startTrackId ? uniqueTracks.find((track) => track.id === startTrackId) : uniqueTracks[0];
    if (startTrack) playTrack(startTrack);
  };
  const toggleShuffle = () => setIsShuffle((current) => !current);
  const cycleRepeat = () => setRepeatMode((current) => (current === 'off' ? 'all' : current === 'all' ? 'one' : 'off'));

  const toggleSavedTrack = async (trackId: string) => {
    if (!user) return;
    setSavedTrackIds((current) => (current.includes(trackId) ? current.filter((id) => id !== trackId) : [trackId, ...current].slice(0, 80)));
  };
  const isSavedTrack = (trackId: string) => savedTrackIds.includes(trackId);

  const uploadTrack = async ({ title, genre, description, audioFile, imageFile }: UploadTrackInput) => {
    if (!user) throw new Error('Continue with Google before uploading music.');

    const trackId = createId('track');
    const ownerName = user.displayName || user.email.split('@')[0] || 'Gemero Creator';
    const [audioUpload, imageUpload, derivedDuration] = await Promise.all([
      uploadToCloudinary(audioFile, `gemero/tracks/${user.id}`),
      uploadToCloudinary(imageFile, `gemero/covers/${user.id}`),
      getAudioDuration(audioFile),
    ]);

    const uploadedTrack: Track = {
      id: trackId,
      title: title.trim(),
      artist: ownerName,
      album: 'Community Uploads',
      albumArt: imageUpload.secureUrl,
      url: audioUpload.secureUrl,
      duration: audioUpload.duration || derivedDuration,
      genre,
      description: description.trim(),
      source: 'community',
      userId: user.id,
      uploaderName: ownerName,
      createdAt: new Date().toISOString(),
      plays: 0,
    };

    const trackRow = trackToRow(uploadedTrack);
    const { error } = await supabase.from('tracks').insert(trackRow);
    if (error) {
      handleDataError(error, OperationType.WRITE, `tracks/${trackId}`);
    }

    setRemoteTracks((current) => mergeTracks([uploadedTrack], current));
    return uploadedTrack;
  };

  const saveStudioTrack = async (track: Track) => {
    if (!user) throw new Error('Continue with Google before saving a studio draft.');

    const studioTrack: Track = {
      ...track,
      id: track.id || createId('studio'),
      source: 'studio',
      userId: user.id,
      uploaderName: user.displayName || user.email.split('@')[0] || 'Gemero Studio',
      createdAt: new Date().toISOString(),
    };

    const { error } = await supabase.from('tracks').upsert(trackToRow(studioTrack));
    if (error) {
      handleDataError(error, OperationType.WRITE, `tracks/${studioTrack.id}`);
    }

    setRemoteTracks((current) => mergeTracks([studioTrack], current.filter((entry) => entry.id !== studioTrack.id)));
    return studioTrack;
  };

  const createPlaylist = async ({ name, description, initialTrackId }: PlaylistInput) => {
    if (!user) throw new Error('Continue with Google before creating a playlist.');

    const playlistId = createId('playlist');
    const initialTrack = initialTrackId ? allTracks.find((track) => track.id === initialTrackId) : undefined;
    const timestamp = new Date().toISOString();
    const playlist: Playlist = {
      id: playlistId,
      name: name.trim(),
      description: description.trim(),
      coverArt: initialTrack?.albumArt || `https://picsum.photos/seed/${playlistId}/800/800`,
      trackIds: initialTrack ? [initialTrack.id] : [],
      userId: user.id,
      ownerName: user.displayName || user.email.split('@')[0] || 'Gemero Listener',
      isPublic: true,
      followers: 0,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const { error } = await supabase.from('playlists').insert(playlistToRow(playlist));
    if (error) {
      handleDataError(error, OperationType.WRITE, `playlists/${playlistId}`);
    }

    setRemotePlaylists((current) => [playlist, ...current.filter((entry) => entry.id !== playlist.id)]);
    return playlist;
  };

  const deletePlaylist = async (playlistId: string) => {
    const playlist = playlists.find((entry) => entry.id === playlistId);
    if (!playlist || playlist.userId !== user?.id) throw new Error('You can only delete your own playlists.');

    const { error } = await supabase.from('playlists').delete().eq('id', playlistId);
    if (error) {
      handleDataError(error, OperationType.DELETE, `playlists/${playlistId}`);
    }

    setRemotePlaylists((current) => current.filter((entry) => entry.id !== playlistId));
  };

  const addTrackToPlaylist = async (playlistId: string, trackId: string) => {
    const playlist = playlists.find((entry) => entry.id === playlistId);
    const track = allTracks.find((entry) => entry.id === trackId);
    if (!playlist || !track || playlist.userId !== user?.id || playlist.trackIds.includes(trackId)) return;

    const nextPlaylist: Playlist = {
      ...playlist,
      trackIds: [...playlist.trackIds, trackId],
      coverArt: playlist.trackIds.length === 0 ? track.albumArt : playlist.coverArt,
      updatedAt: new Date().toISOString(),
    };

    const { error } = await supabase.from('playlists').update(playlistToRow(nextPlaylist)).eq('id', playlistId);
    if (error) {
      handleDataError(error, OperationType.UPDATE, `playlists/${playlistId}`);
    }

    setRemotePlaylists((current) => current.map((entry) => (entry.id === playlistId ? nextPlaylist : entry)));
  };

  const removeTrackFromPlaylist = async (playlistId: string, trackId: string) => {
    const playlist = playlists.find((entry) => entry.id === playlistId);
    if (!playlist || playlist.userId !== user?.id) return;

    const nextTrackIds = playlist.trackIds.filter((id) => id !== trackId);
    const nextTrack = nextTrackIds.map((id) => allTracks.find((track) => track.id === id)).find(Boolean);
    const nextPlaylist: Playlist = {
      ...playlist,
      trackIds: nextTrackIds,
      coverArt: nextTrack?.albumArt || `https://picsum.photos/seed/${playlistId}/800/800`,
      updatedAt: new Date().toISOString(),
    };

    const { error } = await supabase.from('playlists').update(playlistToRow(nextPlaylist)).eq('id', playlistId);
    if (error) {
      handleDataError(error, OperationType.UPDATE, `playlists/${playlistId}`);
    }

    setRemotePlaylists((current) => current.map((entry) => (entry.id === playlistId ? nextPlaylist : entry)));
  };

  const playlistHasTrack = (playlistId: string, trackId: string) => playlists.some((playlist) => playlist.id === playlistId && playlist.trackIds.includes(trackId));
  const getPlaylistTracks = (playlistId: string) => mapIdsToTracks(playlists.find((entry) => entry.id === playlistId)?.trackIds || [], allTracks);
  const startPlaylist = (playlistId: string) => setQueueFromTracks(getPlaylistTracks(playlistId));
  const toggleFollowArtist = async (artistId: string) => {
    if (!user) return;
    setFollowedArtistIds((current) => (current.includes(artistId) ? current.filter((id) => id !== artistId) : [artistId, ...current]));
  };
  const isFollowingArtist = (artistId: string) => followedArtistIds.includes(artistId);
  const markNotificationRead = async (notificationId: string) => setReadNotificationIds((current) => (current.includes(notificationId) ? current : [notificationId, ...current]));
  const markAllNotificationsRead = async () => setReadNotificationIds(notifications.map((notification) => notification.id));
  const getArtistTracks = (artistId: string) => allTracks.filter((track) => track.artistId === artistId);
  const getAlbumById = (albumId: string) => albums.find((album) => album.id === albumId);
  const getAlbumTracks = (albumId: string) => mapIdsToTracks(getAlbumById(albumId)?.trackIds || [], allTracks);

  return (
    <MusicContext.Provider value={{ user, isAuthReady, currentTrack, isPlaying, progress, volume, queue, activeQueue, repeatMode, isShuffle, allTracks, albums, communityTracks, featuredArtists: FEATURED_ARTISTS, friendActivity: FRIEND_ACTIVITY, playlists, userPlaylists, savedTracks, recentTracks, userUploads, userStudioTracks, followedArtistIds, notifications, unreadNotifications, personalizedRows, playTrack, togglePlay, nextTrack, prevTrack, seek, setVolume, addToQueue, removeFromQueue, clearQueue, setQueueFromTracks, toggleShuffle, cycleRepeat, signIn, logout, toggleSavedTrack, isSavedTrack, uploadTrack, saveStudioTrack, createPlaylist, deletePlaylist, addTrackToPlaylist, removeTrackFromPlaylist, playlistHasTrack, startPlaylist, getPlaylistTracks, toggleFollowArtist, isFollowingArtist, markNotificationRead, markAllNotificationsRead, getArtistTracks, getAlbumTracks, getAlbumById }}>
      {children}
    </MusicContext.Provider>
  );

  async function loadTracks() {
    if (!isSupabaseConfigured()) {
      setRemoteTracks([]);
      return;
    }

    const { data, error } = await supabase
      .from('tracks')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(120);

    if (error) {
      handleDataError(error, OperationType.LIST, 'tracks', { throwError: false });
      return;
    }

    setRemoteTracks((data || []).map(mapTrackRow));
  }

  async function loadPlaylists() {
    if (!isSupabaseConfigured()) {
      setRemotePlaylists([]);
      return;
    }

    const { data, error } = await supabase
      .from('playlists')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(80);

    if (error) {
      handleDataError(error, OperationType.LIST, 'playlists', { throwError: false });
      return;
    }

    setRemotePlaylists((data || []).map(mapPlaylistRow));
  }

  async function loadUserPreferences(userId: string) {
    if (!isSupabaseConfigured()) {
      setPrefsReady(true);
      return;
    }

    const { data, error } = await supabase.from('users').select('*').eq('id', userId).maybeSingle<UserPreferencesRow>();

    if (error) {
      handleDataError(error, OperationType.GET, `users/${userId}`, { throwError: false });
      setPrefsReady(true);
      return;
    }

    const nextPrefs = {
      followedArtistIds: asStringArray(data?.followed_artist_ids),
      readNotificationIds: asStringArray(data?.read_notification_ids),
      recentTrackIds: asStringArray(data?.recent_track_ids),
      savedTrackIds: asStringArray(data?.saved_track_ids),
    };

    const signature = JSON.stringify(nextPrefs);
    prefsSignatureRef.current = signature;
    setSavedTrackIds(nextPrefs.savedTrackIds);
    setRecentTrackIds(nextPrefs.recentTrackIds);
    setFollowedArtistIds(nextPrefs.followedArtistIds);
    setReadNotificationIds(nextPrefs.readNotificationIds);
    setPrefsReady(true);
  }
};

export function useMusic() {
  const context = useContext(MusicContext);
  if (!context) throw new Error('useMusic must be used within a MusicProvider');
  return context;
}

function mapSupabaseUser(nextUser: SupabaseAuthUser | null): AppUser | null {
  if (!nextUser) {
    return null;
  }

  return {
    id: nextUser.id,
    email: nextUser.email || '',
    displayName: getUserDisplayName(nextUser),
    photoURL: String(nextUser.user_metadata?.avatar_url || nextUser.user_metadata?.picture || ''),
  };
}

function getUserDisplayName(user: SupabaseAuthUser) {
  return String(
    user.user_metadata?.full_name
      || user.user_metadata?.name
      || user.user_metadata?.user_name
      || user.email?.split('@')[0]
      || 'Gemero listener',
  );
}

async function ensureUserProfile(nextUser: AppUser) {
  await upsertUserPreferences(nextUser, {
    followed_artist_ids: [],
    read_notification_ids: [],
    recent_track_ids: [],
    saved_track_ids: [],
  });
}

async function upsertUserPreferences(
  nextUser: AppUser,
  preferences: {
    followed_artist_ids: string[];
    read_notification_ids: string[];
    recent_track_ids: string[];
    saved_track_ids: string[];
  },
) {
  const payload: UserPreferencesRow = {
    id: nextUser.id,
    email: nextUser.email,
    display_name: nextUser.displayName,
    photo_url: nextUser.photoURL,
    followed_artist_ids: preferences.followed_artist_ids,
    read_notification_ids: preferences.read_notification_ids,
    recent_track_ids: preferences.recent_track_ids,
    saved_track_ids: preferences.saved_track_ids,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from('users').upsert(payload, { onConflict: 'id' });
  if (error) {
    handleDataError(error, OperationType.WRITE, `users/${nextUser.id}`);
  }
}

function normalizeTrackSource(value: unknown): Track['source'] {
  return value === 'catalog' || value === 'studio' ? value : 'community';
}

function mergeTracks(primaryTracks: Track[], fallbackTracks: Track[]) {
  const seen = new Set<string>();
  const merged: Track[] = [];
  [...primaryTracks, ...fallbackTracks].forEach((track) => {
    if (!seen.has(track.id)) {
      seen.add(track.id);
      merged.push(track);
    }
  });
  return merged;
}

function mapIdsToTracks(trackIds: string[], tracks: Track[]) {
  return trackIds.map((trackId) => tracks.find((track) => track.id === trackId)).filter((track): track is Track => Boolean(track));
}

function rememberTrack(trackId: string, update: React.Dispatch<React.SetStateAction<string[]>>) {
  update((current) => [trackId, ...current.filter((id) => id !== trackId)].slice(0, 40));
}

function asStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === 'string') : [];
}

function createId(prefix: string) {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto ? `${prefix}-${crypto.randomUUID()}` : `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function getAudioDuration(file: File) {
  return new Promise<number>((resolve) => {
    const audio = document.createElement('audio');
    const objectUrl = URL.createObjectURL(file);
    audio.preload = 'metadata';
    audio.src = objectUrl;
    audio.onloadedmetadata = () => {
      resolve(Math.round(audio.duration || 0));
      URL.revokeObjectURL(objectUrl);
    };
    audio.onerror = () => {
      resolve(0);
      URL.revokeObjectURL(objectUrl);
    };
  });
}

function mapTrackRow(trackRow: TrackRow): Track {
  return {
    id: trackRow.id,
    title: trackRow.title || 'Untitled Track',
    artist: trackRow.artist || 'Unknown Artist',
    artistId: trackRow.artist_id || undefined,
    album: trackRow.album || undefined,
    albumArt: trackRow.album_art || 'https://picsum.photos/seed/gamero-fallback/800/800',
    url: trackRow.url || '',
    duration: Number(trackRow.duration || 0),
    genre: trackRow.genre || undefined,
    mood: trackRow.mood || undefined,
    lyrics: trackRow.lyrics || undefined,
    source: normalizeTrackSource(trackRow.source),
    userId: trackRow.user_id || undefined,
    uploaderName: trackRow.uploader_name || undefined,
    description: trackRow.description || undefined,
    plays: Number(trackRow.plays || 0),
    createdAt: trackRow.created_at || undefined,
  };
}

function trackToRow(track: Track): TrackRow {
  return {
    id: track.id,
    title: track.title,
    artist: track.artist,
    artist_id: track.artistId || null,
    album: track.album || null,
    album_art: track.albumArt,
    url: track.url,
    duration: track.duration,
    genre: track.genre || null,
    mood: track.mood || null,
    lyrics: track.lyrics || null,
    source: track.source,
    user_id: track.userId || null,
    uploader_name: track.uploaderName || null,
    description: track.description || null,
    plays: track.plays || 0,
    created_at: typeof track.createdAt === 'string' ? track.createdAt : new Date().toISOString(),
  };
}

function mapPlaylistRow(playlistRow: PlaylistRow): Playlist {
  return {
    id: playlistRow.id,
    name: playlistRow.name || 'Untitled Playlist',
    description: playlistRow.description || '',
    coverArt: playlistRow.cover_art || `https://picsum.photos/seed/${playlistRow.id}/800/800`,
    trackIds: asStringArray(playlistRow.track_ids),
    userId: playlistRow.user_id,
    ownerName: playlistRow.owner_name || 'Gemero Listener',
    isPublic: playlistRow.is_public !== false,
    followers: Number(playlistRow.followers || 0),
    createdAt: playlistRow.created_at || undefined,
    updatedAt: playlistRow.updated_at || undefined,
  };
}

function playlistToRow(playlist: Playlist): PlaylistRow {
  return {
    id: playlist.id,
    name: playlist.name,
    description: playlist.description,
    cover_art: playlist.coverArt,
    track_ids: playlist.trackIds,
    user_id: playlist.userId,
    owner_name: playlist.ownerName,
    is_public: playlist.isPublic,
    followers: playlist.followers,
    created_at: typeof playlist.createdAt === 'string' ? playlist.createdAt : new Date().toISOString(),
    updated_at: typeof playlist.updatedAt === 'string' ? playlist.updatedAt : new Date().toISOString(),
  };
}
