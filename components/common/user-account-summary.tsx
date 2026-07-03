'use client';

import { Crown, Zap } from 'lucide-react';

import { TokenUsageMeter } from '@/components/common/token-usage-meter';
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
  const { used, maxTokens, usagePercent, planLabel, isMaxedOut } =
    useTokenUsage();

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
          'mx-auto flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-border/40 bg-muted/40 text-primary transition-all hover:border-primary/30 hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          className
        )}
      >
        <Zap className="h-5 w-5" strokeWidth={2.25} aria-hidden />
        <span className="sr-only">Account and token usage</span>
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
      <TokenUsageMeter
        used={used}
        maxTokens={maxTokens}
        usagePercent={usagePercent}
        isMaxedOut={isMaxedOut}
      />

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
