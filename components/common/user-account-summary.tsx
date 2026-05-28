'use client';

import Image from 'next/image';
import { Crown, Zap } from 'lucide-react';

import { Progress } from '@/components/ui/progress';
import { UserAccountSummarySkeleton } from '@/components/common/skeleton-loaders';
import { useTokenUsage } from '@/hooks/use-token-usage';
import { cn } from '@/lib/utils';

type UserAccountSummaryProps = {
  collapsed?: boolean;
  onClick: () => void;
  user?: {
    name: string;
    picture: string;
  } | null;
  className?: string;
};

export function UserAccountSummary({
  collapsed = false,
  onClick,
  user,
  className,
}: UserAccountSummaryProps) {
  const { used, maxTokens, usagePercent, planLabel } = useTokenUsage();

  if (!user) {
    return (
      <UserAccountSummarySkeleton
        collapsed={collapsed}
        className={className}
      />
    );
  }

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={onClick}
        title={`${user.name} — ${used.toLocaleString()} / ${maxTokens.toLocaleString()} tokens — ${planLabel} plan`}
        className={cn(
          'relative mx-auto flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-2xl border border-border/40 bg-background/60 transition-all hover:bg-muted/60',
          className
        )}
      >
        <Image
          src={user.picture}
          alt={user.name}
          width={36}
          height={36}
          className="h-9 w-9 rounded-full ring-2 ring-primary/20"
        />
        <span
          className="absolute bottom-0.5 left-0.5 flex h-[18px] w-[18px] items-center justify-center rounded-full border border-border/50 bg-card shadow-sm"
          aria-hidden
        >
          <Zap
            className="h-2.5 w-2.5 fill-foreground text-foreground"
            strokeWidth={2.25}
          />
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      title="View account and billing"
      className={cn(
        'mt-auto flex w-full shrink-0 cursor-pointer flex-col gap-2 rounded-2xl border border-border/40 bg-background/60 p-2.5 text-left transition-all hover:bg-muted/60',
        className
      )}
    >
      <div>
        <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
          Token Usage
        </p>
        <p className="mt-0.5 text-base font-bold tabular-nums leading-none">
          {used.toLocaleString()}
          <span className="text-xs font-normal text-muted-foreground">
            {' '}
            / {maxTokens.toLocaleString()}
          </span>
        </p>
        <Progress value={usagePercent} className="mt-1.5 h-1.5" />
      </div>

      <div className="flex items-center justify-between rounded-lg border border-border/40 bg-muted/20 px-2.5 py-1.5">
        <div className="flex items-center gap-1.5">
          <Crown className="h-3.5 w-3.5 text-chart-5" />
          <span className="text-xs font-semibold">Current Plan</span>
        </div>
        <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
          {planLabel}
        </span>
      </div>
    </button>
  );
}
