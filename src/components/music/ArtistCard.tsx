import React from 'react';
import { Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useMusic } from '@/contexts/MusicContext';
import type { ArtistProfile } from '@/types/music';

interface ArtistCardProps {
  artist: ArtistProfile;
}

export const ArtistCard: React.FC<ArtistCardProps> = ({ artist }) => {
  const { getArtistTracks, playTrack } = useMusic();
  const artistTracks = getArtistTracks(artist.id);
  const primaryTrack = artistTracks[0];

  return (
    <Card className="group overflow-hidden rounded-[30px]">
      <div className="relative">
        <img src={artist.heroImage} alt={artist.name} className="h-52 w-full object-cover" referrerPolicy="no-referrer" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
        {primaryTrack && (
          <Button size="icon" onClick={() => playTrack(primaryTrack)} className="absolute bottom-5 right-5 rounded-full shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
            <Play className="ml-0.5 h-4 w-4 fill-current" />
          </Button>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-center gap-3">
          <img src={artist.avatar} alt={artist.name} className="h-14 w-14 rounded-2xl object-cover" referrerPolicy="no-referrer" />
          <div>
            <Link to={`/artist/${artist.id}`} className="text-lg font-semibold text-white hover:text-gamero-lime">
              {artist.name}
            </Link>
            <p className="text-sm text-zinc-400">{artist.genre}</p>
          </div>
        </div>
        <p className="mt-4 text-sm leading-6 text-zinc-400">{artist.headline}</p>
        <div className="mt-5 flex items-center gap-5 text-xs uppercase tracking-[0.24em] text-zinc-500">
          <span>{artist.monthlyListeners} monthly</span>
          <span>{artist.followers} followers</span>
        </div>
      </div>
    </Card>
  );
};
