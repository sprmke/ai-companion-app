'use client';

import { useContext, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { AuthContext } from '@/context/AuthContext';
import { toast } from 'sonner';
import { CheckCircle2, MessageSquare } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PRO_PLAN_TOKENS } from '@/hooks/use-token-usage';
import { isStripeSubscriptionId } from '@/lib/billing/stripe';

async function confirmTopup(sessionId: string) {
  const response = await fetch('/api/confirm-topup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId }),
  });

  if (!response.ok) return null;
  return response.json() as Promise<{
    credits: number;
    topupCredits: number;
  }>;
}

async function reconcileTopups(userId: string, stripeCustomerId: string) {
  const response = await fetch('/api/reconcile-topups', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, stripeCustomerId }),
  });

  if (!response.ok) return null;
  return response.json() as Promise<{
    credits: number;
    topupCredits: number;
    applied: number;
  }>;
}

export function PaymentSuccessModal() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const paymentType = searchParams.get('payment');
  const sessionId = searchParams.get('session_id');
  const isTopup = paymentType === 'topup';

  const [open, setOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(true);
  const syncedRef = useRef(false);

  const { user, setUser } = useContext(AuthContext);
  const currentUser = useQuery(
    api.users.GetUser,
    user?.email ? { email: user.email } : 'skip'
  );

  useEffect(() => {
    if (paymentType) setOpen(true);
  }, [paymentType]);

  useEffect(() => {
    if (!paymentType || !user || !currentUser || syncedRef.current) return;

    syncedRef.current = true;

    const sync = async () => {
      try {
        if (isTopup) {
          let result = sessionId != null ? await confirmTopup(sessionId) : null;

          if (!result && user.stripeCustomerId) {
            result = await reconcileTopups(user._id, user.stripeCustomerId);
          }

          if (result) {
            setUser((current) =>
              current
                ? {
                    ...current,
                    credits: result.credits,
                    topupCredits: result.topupCredits,
                    orderId: currentUser.orderId,
                  }
                : current
            );
            setIsSyncing(false);
            return;
          }

          const topupApplied = currentUser.credits > (user.credits ?? 0);
          if (topupApplied || (currentUser.topupCredits ?? 0) > 0) {
            setUser((current) =>
              current
                ? {
                    ...current,
                    credits: currentUser.credits,
                    topupCredits: currentUser.topupCredits,
                    orderId: currentUser.orderId,
                  }
                : current
            );
          } else {
            toast.error(
              'Payment received, but tokens could not be applied. Please refresh or contact support.'
            );
          }
        } else {
          setUser((current) =>
            current
              ? {
                  ...current,
                  credits: currentUser.credits || PRO_PLAN_TOKENS,
                  topupCredits: currentUser.topupCredits,
                  ...(isStripeSubscriptionId(currentUser.orderId) && {
                    orderId: currentUser.orderId,
                  }),
                }
              : current
          );
        }
      } catch (error) {
        console.error('Error syncing after payment:', error);
        toast.error('There was an issue applying your payment.');
      }

      setIsSyncing(false);
    };

    void sync();
  }, [paymentType, sessionId, isTopup, user, currentUser, setUser]);

  const dismiss = () => {
    setOpen(false);
    router.replace('/workspace', { scroll: false });
  };

  const handleOpenChange = (value: boolean) => {
    if (value) return;
    dismiss();
  };

  if (!paymentType) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[22rem] gap-0 overflow-hidden rounded-3xl border-border/50 p-0 text-center sm:max-w-[22rem]">
        <div className="flex flex-col items-center px-8 pb-8 pt-10">
          <DialogHeader className="w-full space-y-4 text-center sm:text-center">
            <div className="icon-well-lg mx-auto bg-chart-2/15 text-chart-2 ring-4 ring-chart-2/10">
              <CheckCircle2 className="h-9 w-9" strokeWidth={2} />
            </div>

            <div className="space-y-2">
              <DialogTitle className="text-center text-2xl font-bold tracking-tight">
                Payment Successful!
              </DialogTitle>
              <DialogDescription className="mx-auto max-w-[16rem] text-center text-sm leading-relaxed text-muted-foreground">
                {isSyncing
                  ? isTopup
                    ? 'Applying your token top-up…'
                    : 'Activating your Pro plan…'
                  : isTopup
                    ? 'Your tokens are ready. Pick up the conversation where you left off.'
                    : 'Welcome to Pro! More tokens and model access are now unlocked.'}
              </DialogDescription>
            </div>
          </DialogHeader>

          {isSyncing ? (
            <div className="mt-6 flex w-full flex-col items-center gap-2">
              <Skeleton className="h-11 w-full rounded-2xl" />
            </div>
          ) : (
            <Button
              className="mt-6 h-11 w-full rounded-2xl text-base font-semibold shadow-soft"
              onClick={dismiss}
            >
              <MessageSquare className="h-4 w-4" />
              Continue chatting
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
