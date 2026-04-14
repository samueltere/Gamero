import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        'h-12 w-full rounded-2xl border border-[var(--gamero-border)] bg-white/8 px-4 text-[var(--gamero-text)] placeholder:text-[var(--gamero-muted)] focus:border-[var(--gamero-accent)]/60 focus:outline-none',
        className,
      )}
      {...props}
    />
  );
});

Input.displayName = 'Input';
