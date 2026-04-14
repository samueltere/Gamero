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
    <Card className="group overflow-hidden rounded-[34px]">
      <div className="relative">
        <img src={artist.heroImage} alt={artist.name} className="h-60 w-full object-cover transition-transform duration-700 group-hover:scale-105" referrerPolicy="no-referrer" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute left-5 top-5 rounded-full border border-white/15 bg-black/30 px-3 py-1 text-[10px] uppercase tracking-[0.28em] text-white/80 backdrop-blur-md">
          Creator room
        </div>
        {primaryTrack && (
          <Button size="icon" onClick={() => playTrack(primaryTrack)} className="absolute bottom-5 right-5 rounded-full shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
            <Play className="ml-0.5 h-4 w-4 fill-current" />
          </Button>
        )}
      </div>

      <div className="p-6">
        <div className="flex items-center gap-3">
          <img src={artist.avatar} alt={artist.name} className="h-16 w-16 rounded-[24px] object-cover" referrerPolicy="no-referrer" />
          <div>
            <Link to={`/artist/${artist.id}`} className="text-xl font-semibold hover:text-[var(--gamero-accent)]">
              {artist.name}
            </Link>
            <p className="text-sm text-[var(--gamero-muted)]">{artist.genre}</p>
          </div>
        </div>
        <p className="mt-4 text-sm leading-7 text-[var(--gamero-muted)]">{artist.headline}</p>
        <div className="mt-5 flex items-center gap-3 text-xs uppercase tracking-[0.22em] text-[var(--gamero-muted)]">
          <span className="rounded-full border border-[var(--gamero-border)] px-3 py-1">{artist.monthlyListeners} monthly</span>
          <span className="rounded-full border border-[var(--gamero-border)] px-3 py-1">{artist.followers} followers</span>
        </div>
      </div>
    </Card>
  );
};
