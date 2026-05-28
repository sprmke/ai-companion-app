import { cn } from '@/lib/utils';
import { ComponentPropsWithoutRef, ReactNode } from 'react';

export interface AnimatedGradientTextProps
  extends ComponentPropsWithoutRef<'div'> {
  children: ReactNode;
}

export function AnimatedGradientText({
  children,
  className,
  ...props
}: AnimatedGradientTextProps) {
  return (
    <div
      className={cn(
        'group relative mx-auto flex max-w-fit flex-row items-center justify-center rounded-2xl bg-muted/40 px-4 py-1.5 text-sm font-medium shadow-elevated backdrop-blur-sm transition-shadow hover:shadow-elevated-lg',
        className
      )}
      {...props}
    >
      <span
        className="absolute inset-0 block h-full w-full animate-gradient rounded-[inherit] bg-gradient-to-r from-[hsl(var(--color-1))]/40 via-[hsl(var(--color-4))]/40 to-[hsl(var(--color-2))]/40 bg-[length:300%_100%] p-[1px]"
        style={{
          WebkitMask:
            'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'destination-out',
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          maskComposite: 'subtract',
        }}
      />
      <span className="bg-gradient-to-r from-[hsl(var(--color-1))] via-[hsl(var(--color-4))] to-[hsl(var(--color-2))] bg-clip-text text-transparent">
        {children}
      </span>
    </div>
  );
}
