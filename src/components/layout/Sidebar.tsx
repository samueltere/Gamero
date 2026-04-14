import React from 'react';
import { Home, Library, Search, Sparkles } from 'lucide-react';
import { AppLogo } from '@/components/layout/AppLogo';
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
    <aside className="hidden h-full w-80 flex-col border-r border-[var(--gamero-border)] bg-[color-mix(in_srgb,var(--gamero-bg)_74%,transparent)] p-6 backdrop-blur-xl md:flex">
      <div className="mb-10 flex items-center gap-3 px-2">
        <AppLogo className="h-14 w-14 rounded-[22px] p-1.5" />
        <div>
          <p className="text-[11px] uppercase tracking-[0.32em] text-[var(--gamero-muted)]">Living Sound Lab</p>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Gemero</h1>
        </div>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-[24px] px-4 py-3 text-sm font-medium transition-all duration-200',
                isActive ? 'bg-white/12 text-[var(--gamero-text)] shadow-[0_16px_30px_rgba(167,139,250,0.12)]' : 'text-[var(--gamero-muted)] hover:bg-white/8 hover:text-[var(--gamero-text)]',
              )
            }
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <Card className="mt-8 overflow-hidden rounded-[30px] p-5">
        <div className="gamero-orb gamero-breathe absolute -right-8 top-5 h-28 w-28 opacity-65 blur-[2px]" />
        <p className="relative text-[11px] uppercase tracking-[0.28em] text-[var(--gamero-muted)]">Your studio wing</p>
        <div className="relative mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-[22px] bg-white/10 p-4">
            <p className="text-2xl font-semibold">{savedTracks.length}</p>
            <p className="text-xs text-[var(--gamero-muted)]">Saved tracks</p>
          </div>
          <div className="rounded-[22px] bg-white/10 p-4">
            <p className="text-2xl font-semibold">{userUploads.length}</p>
            <p className="text-xs text-[var(--gamero-muted)]">Uploads</p>
          </div>
        </div>
        <p className="relative mt-4 text-sm leading-7 text-[var(--gamero-muted)]">
          Gemero is meant to feel like a creator gallery. Sign in to sync your library, publish music, and shape your own visual music space.
        </p>
        {user ? (
          <Button onClick={() => navigate('/studio')} className="relative mt-5 w-full justify-center rounded-2xl">
            Open Studio
          </Button>
        ) : (
          <Button onClick={signIn} className="relative mt-5 w-full justify-center rounded-2xl">
            Continue with Google
          </Button>
        )}
      </Card>
    </aside>
  );
};
