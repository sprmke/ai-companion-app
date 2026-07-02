import React, { useContext, useEffect, useRef, useState } from 'react';

import Image from 'next/image';

import axios from 'axios';

import { Crown, WalletCardsIcon } from 'lucide-react';

import { toast } from 'sonner';
import { useUpgradeCheckout } from '@/hooks/use-upgrade-checkout';
import { useTokenTopup } from '@/hooks/use-token-topup';
import { PRO_PLAN_TOKENS, useTokenUsage } from '@/hooks/use-token-usage';
import { isStripeSubscriptionId } from '@/lib/billing/stripe';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { TokenTopupSection } from '@/components/common/token-topup-section';
import { TokenUsageMeter } from '@/components/common/token-usage-meter';

import { AuthContext } from '@/context/AuthContext';

function UserProfile({
  openUserProfile,
  setOpenUserProfile,
}: {
  openUserProfile: boolean;
  setOpenUserProfile: (open: boolean) => void;
}) {
  const { user, setUser } = useContext(AuthContext);
  const {
    used,
    maxTokens,
    usagePercent,
    planLabel,
    isPro,
    isMaxedOut,
    planAllowance,
  } = useTokenUsage();

  const { isLoading, startCheckout } = useUpgradeCheckout();
  const { isLoading: isTopupLoading, startTopup } = useTokenTopup();
  const [isCanceling, setIsCanceling] = useState(false);
  const reconciledRef = useRef(false);
  const subscriptionSyncedRef = useRef(false);

  const hasStripeSubscription = isStripeSubscriptionId(user?.orderId);

  useEffect(() => {
    if (!openUserProfile) {
      subscriptionSyncedRef.current = false;
    }
  }, [openUserProfile]);

  // Link a real Stripe subscription id when Pro but orderId is missing/invalid (e.g. manual_update)
  useEffect(() => {
    if (!openUserProfile || !isPro || !user?.stripeCustomerId) return;
    if (hasStripeSubscription) return;
    if (subscriptionSyncedRef.current) return;
    subscriptionSyncedRef.current = true;

    void fetch('/api/sync-subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user._id,
        stripeCustomerId: user.stripeCustomerId,
        orderId: user.orderId,
      }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data?.orderId) return;
        setUser((current) =>
          current ? { ...current, orderId: data.orderId } : current
        );
      })
      .catch(() => {});
  }, [
    openUserProfile,
    isPro,
    hasStripeSubscription,
    user?._id,
    user?.stripeCustomerId,
    user?.orderId,
    setUser,
  ]);

  useEffect(() => {
    if (!openUserProfile || !isMaxedOut || !isPro || !user?.stripeCustomerId) {
      return;
    }
    if (reconciledRef.current) return;
    reconciledRef.current = true;

    void fetch('/api/reconcile-topups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user._id,
        stripeCustomerId: user.stripeCustomerId,
      }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data || data.applied === 0) return;
        setUser((current) =>
          current
            ? {
                ...current,
                credits: data.credits,
                topupCredits: data.topupCredits,
              }
            : current
        );
      })
      .catch(() => {});
  }, [openUserProfile, isMaxedOut, isPro, user, setUser]);

  const cancelSubscription = async () => {
    if (!user) return;

    if (!user.stripeCustomerId && !hasStripeSubscription) {
      toast.error(
        'No billing account found. Try refreshing the page or contact support.'
      );
      return;
    }

    setIsCanceling(true);
    try {
      const response = await axios.post('/api/cancel-subscription', {
        subscriptionId: user.orderId,
        stripeCustomerId: user.stripeCustomerId,
        userId: user._id,
      });

      if (response.data.success) {
        setUser({
          ...user,
          orderId: undefined,
        });

        toast.success(
          response.data.message ||
            'Subscription will be canceled at the end of the current period'
        );
      } else {
        toast.error('Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.error as string | undefined)
        : undefined;
      toast.error(message ?? 'Failed to cancel subscription');
    } finally {
      setIsCanceling(false);
    }
  };

  return (
    <Dialog open={openUserProfile} onOpenChange={setOpenUserProfile}>
      <DialogContent className="max-h-[90dvh] max-w-md gap-0 overflow-y-auto overscroll-contain p-0 sm:max-w-md">
        <DialogHeader className="hidden">
          <DialogTitle>Profile</DialogTitle>
          <DialogDescription>Account settings</DialogDescription>
        </DialogHeader>

        <div className="sticky top-0 z-10 border-b border-border/40 bg-card px-6 pb-4 pt-6 pr-12">
          <div className="flex items-center gap-4">
            <Image
              src={user?.picture ?? ''}
              alt="user"
              width={64}
              height={64}
              className="h-16 w-16 rounded-2xl ring-2 ring-primary/20"
            />
            <div className="min-w-0">
              <div className="truncate text-lg font-bold">{user?.name}</div>
              <div className="truncate text-sm text-muted-foreground">
                {user?.email}
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-5">
          <div className="space-y-4">
            <TokenUsageMeter
              used={used}
              maxTokens={maxTokens}
              usagePercent={usagePercent}
              isMaxedOut={isMaxedOut}
              labelClassName="text-xs"
              valueClassName="mt-1 text-2xl"
              maxClassName="text-base"
              barClassName="mt-3 h-2"
            />

            <div className="flex items-center justify-between rounded-2xl border border-border/50 bg-muted/30 p-4">
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-chart-5" />
                <div>
                  <p className="font-semibold">Current Plan</p>
                  {isPro && (
                    <p className="text-xs text-muted-foreground">
                      Billed monthly · {PRO_PLAN_TOKENS.toLocaleString()} tokens
                    </p>
                  )}
                </div>
              </div>
              <span className="rounded-xl bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                {planLabel}
              </span>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {isMaxedOut ? (
              <TokenTopupSection
                variant="urgent"
                isPro={isPro}
                planAllowance={planAllowance}
                isLoading={isTopupLoading}
                onTopup={startTopup}
                onUpgrade={!isPro ? startCheckout : undefined}
                isUpgradeLoading={isLoading}
              />
            ) : isPro ? (
              <TokenTopupSection
                variant="optional"
                isPro={isPro}
                planAllowance={planAllowance}
                isLoading={isTopupLoading}
                onTopup={startTopup}
              />
            ) : (
              <div className="surface-card p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-lg font-bold">Pro Plan</p>
                    <p className="text-sm text-muted-foreground">
                      {PRO_PLAN_TOKENS.toLocaleString()} tokens / month
                    </p>
                  </div>
                  <p className="text-xl font-bold">$10/mo</p>
                </div>
                <Button
                  className="mt-4 w-full rounded-2xl shadow-soft"
                  loading={isLoading}
                  loadingText="Redirecting…"
                  onClick={startCheckout}
                >
                  <WalletCardsIcon />
                  Upgrade to Pro
                </Button>
              </div>
            )}

            {isPro && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    className="w-full rounded-2xl"
                    variant={isMaxedOut ? 'ghost' : 'secondary'}
                    loading={isCanceling}
                    loadingText="Canceling…"
                  >
                    Cancel Subscription
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-3xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure? You&apos;ll keep Pro access until the end of
                      your billing period, then revert to the Free plan.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-xl">
                      Keep Subscription
                    </AlertDialogCancel>
                    <AlertDialogAction
                      className="rounded-xl"
                      onClick={cancelSubscription}
                    >
                      Cancel Subscription
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default UserProfile;
