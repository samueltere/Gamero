import * as React from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'link';
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'border border-white/10 bg-[var(--gamero-gradient)] text-white shadow-[0_18px_40px_rgba(167,139,250,0.28)] hover:scale-[1.01] hover:shadow-[0_20px_50px_rgba(167,139,250,0.34)]',
  secondary: 'border border-[var(--gamero-border)] bg-white/8 text-[var(--gamero-text)] hover:bg-white/14',
  ghost: 'bg-transparent text-[var(--gamero-muted)] hover:bg-white/8 hover:text-[var(--gamero-text)]',
  outline: 'border border-[var(--gamero-border)] bg-transparent text-[var(--gamero-text)] hover:bg-white/8',
  link: 'bg-transparent text-[var(--gamero-muted)] underline-offset-4 hover:text-[var(--gamero-text)] hover:underline',
};

const sizeClasses: Record<ButtonSize, string> = {
  default: 'h-10 px-4 py-2',
  sm: 'h-9 px-3 text-sm',
  lg: 'h-12 px-6',
  icon: 'h-10 w-10',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'default', type = 'button', ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = 'Button';
