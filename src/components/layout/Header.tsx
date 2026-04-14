import React, { useState } from 'react';
import { Bell, CheckCheck, ChevronLeft, ChevronRight, LogOut, MoonStar, Search as SearchIcon, SunMedium } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useMusic } from '@/contexts/MusicContext';
import { useTheme } from '@/contexts/ThemeContext';

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/': {
    title: 'Home',
    subtitle: 'Trending releases, featured artists, and fresh community uploads.',
  },
  '/search': {
    title: 'Search',
    subtitle: 'Find songs, artists, genres, and moods in a few keystrokes.',
  },
  '/library': {
    title: 'Library',
    subtitle: 'Your saved tracks, recent plays, and personal uploads.',
  },
  '/studio': {
    title: 'Studio',
    subtitle: 'Upload finished music or shape a new draft with a prompt.',
  },
  '/create': {
    title: 'Studio',
    subtitle: 'Upload finished music or shape a new draft with a prompt.',
  },
};

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { logout, markAllNotificationsRead, markNotificationRead, notifications, signIn, unreadNotifications, user } = useMusic();
  const { theme, toggleTheme } = useTheme();

  const page = location.pathname.startsWith('/artist/')
    ? {
        title: 'Artist',
        subtitle: 'Play top tracks and explore full artist pages.',
      }
    : location.pathname.startsWith('/album/')
      ? {
          title: 'Album',
          subtitle: 'Play full releases track by track or jump back to the artist.',
        }
    : location.pathname.startsWith('/playlist/')
      ? {
          title: 'Playlist',
          subtitle: 'Play, share, and manage public playlists from the community.',
        }
    : pageTitles[location.pathname] || pageTitles['/'];

  const handleNotificationClick = async (notificationId: string, link: string) => {
    await markNotificationRead(notificationId);
    setIsNotificationsOpen(false);
    navigate(link);
  };

  return (
    <header className="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-[var(--gamero-border)] bg-[color-mix(in_srgb,var(--gamero-bg)_72%,transparent)] px-4 backdrop-blur-xl md:px-8">
      <div className="flex min-w-0 items-center gap-4">
        <div className="hidden items-center gap-2 sm:flex">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full border border-[var(--gamero-border)] bg-white/8"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(1)}
            className="rounded-full border border-[var(--gamero-border)] bg-white/8"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.32em] text-[var(--gamero-muted)]">{page.title}</p>
          <h2 className="truncate font-display text-xl font-semibold md:text-2xl">{page.subtitle}</h2>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/search')}
          className="rounded-full border border-[var(--gamero-border)] bg-white/8"
        >
          <SearchIcon className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full border border-[var(--gamero-border)] bg-white/8">
          {theme === 'dark' ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
        </Button>
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsNotificationsOpen((current) => !current)}
            className="relative rounded-full border border-[var(--gamero-border)] bg-white/8"
          >
            <Bell className="h-4 w-4" />
            {unreadNotifications > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--gamero-accent-2)] px-1 text-[10px] font-semibold text-white">
                {Math.min(unreadNotifications, 9)}
              </span>
            )}
          </Button>

          {isNotificationsOpen && (
            <div className="gamero-room absolute right-0 top-14 z-50 w-[min(26rem,calc(100vw-2rem))] rounded-[28px] p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-[var(--gamero-muted)]">Notifications</p>
                  <h3 className="mt-2 font-display text-2xl font-semibold">What&apos;s new</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => void markAllNotificationsRead()}
                  className="rounded-full px-4 text-xs uppercase tracking-[0.22em]"
                >
                  <CheckCheck className="h-4 w-4" />
                  Mark all
                </Button>
              </div>

              <div className="mt-4 space-y-2">
                {notifications.length > 0 ? (
                  notifications.slice(0, 6).map((notification) => (
                    <button
                      key={notification.id}
                      type="button"
                      onClick={() => void handleNotificationClick(notification.id, notification.link)}
                      className="flex w-full items-start gap-3 rounded-[22px] border border-[var(--gamero-border)] bg-white/[0.05] p-4 text-left transition-colors hover:bg-white/[0.09]"
                    >
                      <span className={`mt-1 h-2.5 w-2.5 rounded-full ${notification.isRead ? 'bg-zinc-500' : 'bg-[var(--gamero-accent)]'}`} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <p className="truncate text-sm font-semibold">{notification.title}</p>
                          <span className="text-[10px] uppercase tracking-[0.24em] text-[var(--gamero-muted)]">{notification.kind}</span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-[var(--gamero-muted)]">{notification.body}</p>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="rounded-[22px] border border-dashed border-[var(--gamero-border)] p-5 text-sm leading-7 text-[var(--gamero-muted)]">
                    Follow artists, save tracks, and build playlists to start getting useful updates here.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {user ? (
          <div className="flex items-center gap-3 rounded-full border border-[var(--gamero-border)] bg-white/8 p-1 pl-3">
            <div className="hidden text-right sm:block">
              <p className="max-w-[160px] truncate text-sm font-medium">{user.displayName || 'Gamero listener'}</p>
              <p className="max-w-[160px] truncate text-xs text-[var(--gamero-muted)]">{user.email}</p>
            </div>
            <div className="h-10 w-10 overflow-hidden rounded-full border border-[var(--gamero-border)] bg-white/10">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User avatar'}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm font-semibold">
                  {(user.displayName || 'G').slice(0, 1).toUpperCase()}
                </div>
              )}
            </div>
            <Button variant="ghost" size="icon" onClick={logout} className="rounded-full">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button onClick={signIn} className="rounded-full px-5">
            Continue with Google
          </Button>
        )}
      </div>
    </header>
  );
};
