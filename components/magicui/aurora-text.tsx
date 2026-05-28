import React, { memo } from 'react';
import { cn } from '@/lib/utils';

interface AuroraTextProps {
  children: React.ReactNode;
  className?: string;
}

export const AuroraText = memo(({ children, className }: AuroraTextProps) => {
  return (
    <span
      className={cn(
        'relative inline-block bg-gradient-to-r from-[hsl(var(--color-1))] via-[hsl(var(--color-4))] to-[hsl(var(--color-2))] bg-[length:200%_auto] bg-clip-text text-transparent animate-gradient',
        className
      )}
    >
      {children}
    </span>
  );
});

AuroraText.displayName = 'AuroraText';
