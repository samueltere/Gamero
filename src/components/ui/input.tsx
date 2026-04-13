import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        'h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-white placeholder:text-zinc-500 focus:border-gamero-lime/60 focus:outline-none',
        className,
      )}
      {...props}
    />
  );
});

Input.displayName = 'Input';
