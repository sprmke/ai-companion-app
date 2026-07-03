'use client';

import { Crown, Zap } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  PRO_PLAN_TOKENS,
  TOKEN_TOPUP_PRICE_CENTS,
  TOKEN_TOPUP_TOKENS,
} from '@/hooks/use-token-usage';
import { cn } from '@/lib/utils';

const TOPUP_PRICE_LABEL = `$${TOKEN_TOPUP_PRICE_CENTS / 100}`;

type TokenTopupSectionProps = {
  variant: 'urgent' | 'optional';
  isPro: boolean;
  planAllowance?: number;
  isLoading?: boolean;
  onTopup: () => void;
  onUpgrade?: () => void;
  isUpgradeLoading?: boolean;
  className?: string;
};

export function TokenTopupSection({
  variant,
  isPro,
  planAllowance = PRO_PLAN_TOKENS,
  isLoading = false,
  onTopup,
  onUpgrade,
  isUpgradeLoading = false,
  className,
}: TokenTopupSectionProps) {
  const isUrgent = variant === 'urgent';

  const title = isUrgent
    ? isPro
      ? 'Monthly limit reached'
      : "You're out of tokens"
    : 'Need more tokens?';

  const description = isUrgent
    ? isPro
      ? `You've used your ${planAllowance.toLocaleString()} monthly Pro tokens. Buy a one-time top-up to keep chatting, or wait until your subscription renews.`
      : `Buy a ${TOKEN_TOPUP_TOKENS.toLocaleString()}-token pack to keep chatting now, or upgrade to Pro for ${PRO_PLAN_TOKENS.toLocaleString()} tokens every month.`
    : `You can buy a one-time ${TOKEN_TOPUP_TOKENS.toLocaleString()}-token top-up anytime before your monthly reset.`;

  return (
    <div
      className={cn(
        'rounded-2xl border p-5 text-center',
        isUrgent
          ? 'border-destructive/30 bg-destructive/5'
          : 'border-border/50 bg-muted/20',
        className
      )}
    >
      <div
        className={cn(
          'mx-auto flex h-11 w-11 items-center justify-center rounded-xl',
          isUrgent
            ? 'bg-destructive/10 text-destructive'
            : 'bg-primary/10 text-primary'
        )}
      >
        <Zap className="h-5 w-5" />
      </div>

      <p className="mt-3 text-base font-semibold">{title}</p>
      <p className="mx-auto mt-1.5 max-w-[18rem] text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>

      <Button
        className="mt-4 w-full rounded-2xl shadow-soft"
        loading={isLoading}
        loadingText="Redirecting…"
        onClick={onTopup}
      >
        <Zap className="h-4 w-4" />
        Buy {TOKEN_TOPUP_TOKENS.toLocaleString()} tokens — {TOPUP_PRICE_LABEL}
      </Button>

      <p className="mt-2 text-xs text-muted-foreground">
        One-time purchase · added instantly
      </p>

      {isUrgent && !isPro && onUpgrade && (
        <>
          <div className="my-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-border/60" />
            <span className="text-xs font-medium text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border/60" />
          </div>

          <div className="rounded-xl border border-border/50 bg-muted/30 p-4 text-center">
            <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-chart-5/15 text-chart-5">
              <Crown className="h-4 w-4" />
            </div>
            <p className="mt-2 font-semibold">Upgrade to Pro</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {PRO_PLAN_TOKENS.toLocaleString()} tokens / month · $10/mo
            </p>
            <Button
              className="mt-3 w-full rounded-2xl"
              variant="outline"
              loading={isUpgradeLoading}
              loadingText="Redirecting…"
              onClick={onUpgrade}
            >
              Upgrade to Pro
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
