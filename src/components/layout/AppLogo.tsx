import React from 'react';
import logoImage from '@/assets/images/Gamero Logo.jpg';
import { cn } from '@/lib/utils';

interface AppLogoProps {
  className?: string;
  imageClassName?: string;
}

export const AppLogo: React.FC<AppLogoProps> = ({ className, imageClassName }) => {
  return (
    <div
      className={cn(
        'flex items-center justify-center overflow-hidden rounded-[22px] border border-[var(--gamero-border)] bg-white/8 shadow-[0_14px_40px_rgba(167,139,250,0.18)]',
        className,
      )}
    >
      <img
        src={logoImage}
        alt="Gamero logo"
        className={cn('h-full w-full object-contain', imageClassName)}
      />
    </div>
  );
};
