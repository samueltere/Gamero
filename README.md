# Gamero

Gamero is a music streaming and music-sharing web app built with a listener-first experience. Users can sign in with Google, explore artist profiles, listen to tracks, search by song or artist, save music to their library, create playlists, and upload their own songs with cover art from their device.

## What The App Does

- Browse a home feed with featured artists, personalized rows, and friend activity
- Search for songs, artists, albums, genres, and moods
- Play music with play, pause, skip, shuffle, repeat, seek, and queue controls
- Save tracks and organize listening activity in a personal library
- Create and manage playlists
- Upload original music and cover images so other users can listen
- View artist pages and album pages
- Use the studio page as an extra creative tool for quick draft ideas

## How It Works

Gamero uses Firebase Authentication for Google sign-in, Firestore for app data, and Firebase Storage for uploaded music files and cover images.

Main app flow:

1. A user signs in with Google.
2. The app loads tracks, playlists, user preferences, and library data from Firebase.
3. Users can discover music from featured artists and community uploads.
4. Playback is managed through a shared music context, which controls the current track, queue, shuffle, repeat, progress, and volume.
5. When a user uploads a song, the audio file and image are sent to Firebase Storage, and the track details are saved in Firestore.
6. Library actions such as saved tracks, recent plays, followed artists, playlists, and notifications are synced to the user profile in Firestore.

## Programs And Technologies Used

- React
- TypeScript
- Vite
- Tailwind CSS
- Firebase Authentication
- Cloud Firestore
- Firebase Storage
- React Router
- Motion
- Lucide React
- Sonner

## Project Structure

- `src/pages` contains the main app screens such as Home, Search, Library, Create, Album, Artist Profile, and Playlist pages
- `src/contexts/MusicContext.tsx` contains the main playback, library, playlist, and user state logic
- `src/data` contains sample catalog and artist data
- `src/lib` contains Firebase setup, helpers, and music-related utility logic
- `src/components` contains layout, music UI, and reusable interface components

## Run Locally

### Prerequisites

- Node.js
- A Firebase project with Authentication, Firestore, and Storage enabled

### Setup

1. Install dependencies:
   `npm install`
2. Add your Firebase config to the environment setup used by the project.
3. Start the development server:
   `npm run dev`

## Firebase Notes

- Google sign-in is used for authentication
- Track and playlist data are stored in Firestore
- Audio files and cover images are stored in Firebase Storage
- Update `firestore.rules` and `storage.rules` before production deployment

## Summary

Gamero is designed to feel like a Spotify-style music app with added support for community uploads and a simple creative studio experience. The main goal of the app is music listening first, with creation and uploads as extra features around that core experience.
