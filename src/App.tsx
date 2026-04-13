import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';
import { Player } from '@/components/layout/Player';
import { Sidebar } from '@/components/layout/Sidebar';
import { MusicProvider } from '@/contexts/MusicContext';
import { AlbumPage } from '@/pages/Album';
import { ArtistProfilePage } from '@/pages/ArtistProfile';
import { Create } from '@/pages/Create';
import { Home } from '@/pages/Home';
import { Library } from '@/pages/Library';
import { PlaylistPage } from '@/pages/Playlist';
import { Search } from '@/pages/Search';

export default function App() {
  return (
    <MusicProvider>
      <Router>
        <div className="flex h-screen overflow-hidden bg-gamero-bg text-white">
          <Sidebar />

          <main className="flex min-w-0 flex-1 flex-col">
            <Header />
            <div className="flex-1 overflow-hidden pb-40 md:pb-28">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/search" element={<Search />} />
                <Route path="/library" element={<Library />} />
                <Route path="/album/:albumId" element={<AlbumPage />} />
                <Route path="/playlist/:playlistId" element={<PlaylistPage />} />
                <Route path="/studio" element={<Create />} />
                <Route path="/create" element={<Create />} />
                <Route path="/artist/:artistId" element={<ArtistProfilePage />} />
              </Routes>
            </div>
          </main>

          <MobileNav />
          <Player />
          <Toaster position="top-center" theme="dark" />
        </div>
      </Router>
    </MusicProvider>
  );
}
