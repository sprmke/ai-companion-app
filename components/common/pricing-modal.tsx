'use client';

import { Check, Crown, Sparkles, WalletCardsIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  type DialogLayer,
} from '@/components/ui/dialog';
import { useUpgradeCheckout } from '@/hooks/use-upgrade-checkout';

const proFeatures = [
  'Switch between AI models per companion',
  '10,000 tokens per month',
  'Priority model access',
  'Everything in Free',
  'Cancel anytime',
];

type PricingModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  /** Renders above other open dialogs (e.g. Edit companion). */
  layer?: DialogLayer;
};

export function PricingModal({
  open,
  onOpenChange,
  title = 'Upgrade to Pro',
  description = 'Model selection and priority access are included with Pro. Upgrade to choose different AI providers for each companion.',
  layer = 'elevated',
}: PricingModalProps) {
  const { isPro, isLoading, startCheckout } = useUpgradeCheckout();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent layer={layer} className="max-w-md rounded-3xl">
        <DialogHeader className="space-y-1.5">
          <DialogTitle className="text-xl">{title}</DialogTitle>
          <DialogDescription className="text-sm leading-snug">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="relative overflow-hidden rounded-3xl border border-primary/40 bg-gradient-to-br from-primary/10 via-card to-card p-5 shadow-elevated ring-1 ring-primary/25">
          <div className="flex items-center justify-between gap-4 border-b border-primary/15 pb-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-soft">
                <Crown className="h-5 w-5" strokeWidth={2.25} />
              </div>
              <div className="min-w-0">
                <p className="text-lg font-bold leading-tight text-foreground">
                  Pro Plan
                </p>
                <p className="text-xs text-muted-foreground">
                  Unlock models &amp; priority access
                </p>
              </div>
            </div>
            <div className="shrink-0 text-right leading-none">
              <span className="text-3xl font-extrabold tracking-tight">
                $10
              </span>
              <span className="ml-0.5 text-sm font-medium text-muted-foreground">
                /mo
              </span>
            </div>
          </div>

          <ul className="mt-4">
            {proFeatures.map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-sm">
                <span className="icon-well-sm shrink-0 bg-chart-2/12 text-chart-2">
                  <Check className="h-3.5 w-3.5" />
                </span>
                <span className="text-muted-foreground">{feature}</span>
              </li>
            ))}
          </ul>

          <Button
            className="mt-5 w-full rounded-2xl shadow-soft"
            disabled={isPro}
            loading={isLoading}
            loadingText="Redirecting…"
            onClick={startCheckout}
          >
            {isPro ? (
              'You are on Pro'
            ) : (
              <>
                <WalletCardsIcon />
                Upgrade to Pro
                <Sparkles className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Free plan includes Gemini 2.0 Flash for all companions.
        </p>
      </DialogContent>
    </Dialog>
  );
}
