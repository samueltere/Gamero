import React from 'react';
import { Home, Library, Search, Sparkles } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

const items = [
  { label: 'Home', path: '/', icon: Home },
  { label: 'Search', path: '/search', icon: Search },
  { label: 'Library', path: '/library', icon: Library },
  { label: 'Studio', path: '/studio', icon: Sparkles },
];

export const MobileNav: React.FC = () => {
  return (
    <nav className="fixed inset-x-3 bottom-3 z-40 rounded-[28px] border border-[var(--gamero-border)] bg-[color-mix(in_srgb,var(--gamero-bg)_70%,transparent)] px-3 py-2 shadow-[0_20px_50px_rgba(15,16,32,0.28)] backdrop-blur-xl md:hidden">
      <div className="grid grid-cols-4 gap-1">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-1 rounded-[20px] py-2 text-[11px] text-[var(--gamero-muted)] transition-all',
                isActive && 'bg-white/10 text-[var(--gamero-accent)]',
              )
            }
          >
            <item.icon className="h-4 w-4" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
