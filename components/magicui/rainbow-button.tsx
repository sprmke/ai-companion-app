import React from 'react';
import { cn } from '@/lib/utils';

export const RainbowButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ children, className, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        'group relative inline-flex h-12 animate-rainbow cursor-pointer items-center justify-center rounded-2xl border-0 bg-[length:200%] px-8 py-2 text-sm font-semibold text-primary-foreground shadow-soft transition-all [background-clip:padding-box,border-box,border-box] [background-origin:border-box] [border:calc(0.08*1rem)_solid_transparent] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
        'before:absolute before:bottom-[-20%] before:left-1/2 before:z-0 before:h-1/5 before:w-3/5 before:-translate-x-1/2 before:animate-rainbow before:bg-[linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))] before:[filter:blur(calc(0.8*1rem))]',
        'bg-[linear-gradient(hsl(var(--primary)),hsl(var(--primary))),linear-gradient(hsl(var(--primary))_50%,hsl(var(--primary)/0.6)_80%,transparent),linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))]',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});

RainbowButton.displayName = 'RainbowButton';
