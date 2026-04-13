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
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/8 bg-black/85 px-3 py-2 backdrop-blur-xl md:hidden">
      <div className="grid grid-cols-4 gap-1">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-1 rounded-2xl py-2 text-[11px] text-zinc-500 transition-colors',
                isActive && 'text-gamero-lime',
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
