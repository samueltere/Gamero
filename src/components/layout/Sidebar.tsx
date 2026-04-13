import React from 'react';
import { Disc3, Home, Library, Search, Sparkles } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useMusic } from '@/contexts/MusicContext';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Search, label: 'Search', path: '/search' },
  { icon: Library, label: 'Library', path: '/library' },
  { icon: Sparkles, label: 'Studio', path: '/studio' },
];

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const { savedTracks, signIn, user, userUploads } = useMusic();

  return (
    <aside className="hidden h-full w-72 flex-col border-r border-white/8 bg-black/35 p-6 md:flex">
      <div className="mb-10 flex items-center gap-3 px-2">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gamero-lime text-black shadow-[0_12px_30px_rgba(147,248,114,0.35)]">
          <Disc3 className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.32em] text-zinc-500">Music Platform</p>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Gamero</h1>
        </div>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors',
                isActive ? 'bg-white/10 text-white' : 'text-zinc-400 hover:bg-white/6 hover:text-white',
              )
            }
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <Card className="mt-8 rounded-[24px] border-white/8 bg-white/[0.03] p-5">
        <p className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">Your space</p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white/6 p-3">
            <p className="text-2xl font-semibold text-white">{savedTracks.length}</p>
            <p className="text-xs text-zinc-400">Saved tracks</p>
          </div>
          <div className="rounded-2xl bg-white/6 p-3">
            <p className="text-2xl font-semibold text-white">{userUploads.length}</p>
            <p className="text-xs text-zinc-400">Uploads</p>
          </div>
        </div>
        <p className="mt-4 text-sm leading-6 text-zinc-400">
          Sign in with Google to sync your library, publish music, and keep your studio drafts in one place.
        </p>
        {user ? (
          <Button onClick={() => navigate('/studio')} className="mt-5 w-full justify-center rounded-2xl">
            Open Studio
          </Button>
        ) : (
          <Button onClick={signIn} className="mt-5 w-full justify-center rounded-2xl">
            Continue with Google
          </Button>
        )}
      </Card>
    </aside>
  );
};
