

# Gamero

Gamero is a listener-first music app with:

- Google sign-in
- Featured artist profiles and demo catalogs
- Community music uploads with cover art from device
- Personal library with saved and recent tracks
- A studio page for quick prompt-based draft creation

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   `npm install`
2. Start the app:
   `npm run dev`

## Firebase Notes

- The app expects Firebase Auth, Firestore, and Storage to be enabled.
- Track uploads write metadata to `tracks` and upload audio/cover files to Storage.
- Update Firestore and Storage rules before deploying.
