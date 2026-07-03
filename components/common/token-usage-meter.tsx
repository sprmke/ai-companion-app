'use client';

import { useEffect, useRef, useState } from 'react';

import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

const TOKEN_USAGE_ANIMATION_MS = 2800;

function useAnimatedTokenUsage(
  used: number,
  usagePercent: number,
  durationMs = TOKEN_USAGE_ANIMATION_MS
) {
  const [display, setDisplay] = useState({ used, percent: usagePercent });
  const frameRef = useRef<number | undefined>(undefined);
  const displayRef = useRef({ used, percent: usagePercent });

  useEffect(() => {
    const start = displayRef.current;
    if (start.used === used && start.percent === usagePercent) return;

    const startTime = performance.now();

    const tick = (now: number) => {
      const t = Math.min(1, (now - startTime) / durationMs);
      const eased = 1 - (1 - t) ** 3;

      const next = {
        used: start.used + (used - start.used) * eased,
        percent: start.percent + (usagePercent - start.percent) * eased,
      };

      displayRef.current = next;
      setDisplay(next);

      if (t < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        displayRef.current = { used, percent: usagePercent };
        setDisplay({ used, percent: usagePercent });
      }
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [used, usagePercent, durationMs]);

  return display;
}

type TokenUsageMeterProps = {
  used: number;
  maxTokens: number;
  usagePercent: number;
  isMaxedOut?: boolean;
  className?: string;
  labelClassName?: string;
  valueClassName?: string;
  maxClassName?: string;
  barClassName?: string;
};

export function TokenUsageMeter({
  used,
  maxTokens,
  usagePercent,
  isMaxedOut = false,
  className,
  labelClassName,
  valueClassName,
  maxClassName,
  barClassName,
}: TokenUsageMeterProps) {
  const { used: animatedUsed, percent: animatedPercent } = useAnimatedTokenUsage(
    used,
    usagePercent
  );

  return (
    <div className={className}>
      <p
        className={cn(
          'text-[9px] font-semibold uppercase tracking-wider text-muted-foreground',
          labelClassName
        )}
      >
        Token Usage
      </p>
      <p
        className={cn(
          'mt-0.5 text-base font-bold tabular-nums leading-none',
          valueClassName
        )}
      >
        {Math.round(animatedUsed).toLocaleString()}
        <span
          className={cn(
            'text-xs font-normal text-muted-foreground',
            maxClassName
          )}
        >
          {' '}
          / {maxTokens.toLocaleString()}
        </span>
      </p>
      <Progress
        value={animatedPercent}
        durationMs={TOKEN_USAGE_ANIMATION_MS}
        className={cn(
          'mt-1.5 h-1.5',
          isMaxedOut && '[&>div]:from-destructive [&>div]:via-destructive/80 [&>div]:to-destructive/60',
          barClassName
        )}
      />
    </div>
  );
}

export { TOKEN_USAGE_ANIMATION_MS };
