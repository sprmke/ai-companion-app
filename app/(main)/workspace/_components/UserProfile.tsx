import React, { useContext, useState } from 'react';

import Image from 'next/image';

import axios from 'axios';

import { Crown, LogOut, WalletCardsIcon } from 'lucide-react';

import { toast } from 'sonner';
import { useUpgradeCheckout } from '@/hooks/use-upgrade-checkout';
import { useTokenUsage } from '@/hooks/use-token-usage';

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
import { Progress } from '@/components/ui/progress';

import { AuthContext } from '@/context/AuthContext';
import { googleLogout } from '@react-oauth/google';
import { useRouter } from 'next/navigation';

function UserProfile({
  openUserProfile,
  setOpenUserProfile,
}: {
  openUserProfile: boolean;
  setOpenUserProfile: (open: boolean) => void;
}) {
  const router = useRouter();
  const { user, setUser } = useContext(AuthContext);
  const { used, maxTokens, usagePercent, planLabel, isPro } = useTokenUsage();

  const { isLoading, startCheckout } = useUpgradeCheckout();
  const [isCanceling, setIsCanceling] = useState(false);

  const handleLogout = () => {
    googleLogout();
    setUser(null);
    localStorage.removeItem('user_token');
    setOpenUserProfile(false);
    router.replace('/sign-in');
  };

  const cancelSubscription = async () => {
    if (!user) return;

    setIsCanceling(true);
    try {
      const response = await axios.post('/api/cancel-subscription', {
        subscriptionId: user.orderId,
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
      toast.error('Failed to cancel subscription');
    } finally {
      setIsCanceling(false);
    }
  };

  return (
    <Dialog open={openUserProfile} onOpenChange={setOpenUserProfile}>
      <DialogContent className="max-w-md">
        <DialogHeader className="hidden">
          <DialogTitle>Profile</DialogTitle>
          <DialogDescription>Account settings</DialogDescription>
        </DialogHeader>
        <div>
          <div className="flex items-center gap-4">
            <Image
              src={user?.picture ?? ''}
              alt="user"
              width={64}
              height={64}
              className="h-16 w-16 rounded-2xl ring-2 ring-primary/20"
            />
            <div>
              <div className="text-lg font-bold">{user?.name}</div>
              <div className="text-sm text-muted-foreground">{user?.email}</div>
            </div>
          </div>

          <div className="my-6 h-px bg-border/60" />

          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Token Usage
              </p>
              <p className="mt-1 text-2xl font-bold tabular-nums">
                {used.toLocaleString()}
                <span className="text-base font-normal text-muted-foreground">
                  {' '}
                  / {maxTokens.toLocaleString()}
                </span>
              </p>
              <Progress value={usagePercent} className="mt-3 h-2" />
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-border/50 bg-muted/30 p-4">
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-chart-5" />
                <p className="font-semibold">Current Plan</p>
              </div>
              <span className="rounded-xl bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                {planLabel}
              </span>
            </div>
          </div>

          <div className="mt-6">
            {!isPro ? (
              <div className="surface-card p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-lg font-bold">Pro Plan</p>
                    <p className="text-sm text-muted-foreground">
                      10,000 tokens / month
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
            ) : (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    className="w-full rounded-2xl"
                    variant="secondary"
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

          <Button
            variant="ghost"
            className="mt-4 w-full rounded-2xl text-muted-foreground hover:text-foreground"
            onClick={handleLogout}
          >
            <LogOut />
            Log out
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default UserProfile;
