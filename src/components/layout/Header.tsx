import React, { useState } from 'react';
import { Bell, CheckCheck, ChevronLeft, ChevronRight, LogOut, Search as SearchIcon } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useMusic } from '@/contexts/MusicContext';

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
    <header className="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-white/8 bg-gamero-bg/80 px-4 backdrop-blur-xl md:px-8">
      <div className="flex min-w-0 items-center gap-4">
        <div className="hidden items-center gap-2 sm:flex">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full border border-white/8 bg-black/20"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(1)}
            className="rounded-full border border-white/8 bg-black/20"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">{page.title}</p>
          <h2 className="truncate font-display text-xl font-semibold md:text-2xl">{page.subtitle}</h2>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/search')}
          className="rounded-full border border-white/8 bg-black/20"
        >
          <SearchIcon className="h-4 w-4" />
        </Button>
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsNotificationsOpen((current) => !current)}
            className="relative rounded-full border border-white/8 bg-black/20"
          >
            <Bell className="h-4 w-4" />
            {unreadNotifications > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-gamero-lime px-1 text-[10px] font-semibold text-black">
                {Math.min(unreadNotifications, 9)}
              </span>
            )}
          </Button>

          {isNotificationsOpen && (
            <div className="absolute right-0 top-14 z-50 w-[min(26rem,calc(100vw-2rem))] rounded-[28px] border border-white/10 bg-[#09111f]/95 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">Notifications</p>
                  <h3 className="mt-2 font-display text-2xl font-semibold text-white">What&apos;s new</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => void markAllNotificationsRead()}
                  className="rounded-full px-4 text-xs uppercase tracking-[0.22em] text-zinc-300"
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
                      className="flex w-full items-start gap-3 rounded-[22px] border border-white/6 bg-white/[0.03] p-4 text-left transition-colors hover:bg-white/[0.06]"
                    >
                      <span className={`mt-1 h-2.5 w-2.5 rounded-full ${notification.isRead ? 'bg-zinc-600' : 'bg-gamero-lime'}`} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <p className="truncate text-sm font-semibold text-white">{notification.title}</p>
                          <span className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">{notification.kind}</span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-zinc-400">{notification.body}</p>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="rounded-[22px] border border-dashed border-white/10 p-5 text-sm leading-7 text-zinc-500">
                    Follow artists, save tracks, and build playlists to start getting useful updates here.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {user ? (
          <div className="flex items-center gap-3 rounded-full border border-white/10 bg-black/35 p-1 pl-3">
            <div className="hidden text-right sm:block">
              <p className="max-w-[160px] truncate text-sm font-medium text-white">{user.displayName || 'Gamero listener'}</p>
              <p className="max-w-[160px] truncate text-xs text-zinc-400">{user.email}</p>
            </div>
            <div className="h-10 w-10 overflow-hidden rounded-full border border-white/10 bg-white/10">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User avatar'}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-white">
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
