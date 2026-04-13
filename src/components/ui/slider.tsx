import * as React from 'react';
import { cn } from '@/lib/utils';

interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'defaultValue' | 'onChange'> {
  value?: number[];
  defaultValue?: number[];
  onValueChange?: (value: number[]) => void;
}

export function Slider({
  className,
  value,
  defaultValue,
  min = 0,
  max = 100,
  step = 1,
  onValueChange,
  ...props
}: SliderProps) {
  const resolvedValue = value?.[0] ?? defaultValue?.[0] ?? 0;

  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={resolvedValue}
      onChange={(event) => onValueChange?.([Number(event.target.value)])}
      className={cn('gamero-slider h-1.5 w-full cursor-pointer appearance-none bg-transparent', className)}
      {...props}
    />
  );
}
