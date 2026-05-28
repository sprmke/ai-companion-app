'use client';

import { useContext, useEffect, Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { AuthContext } from '@/context/AuthContext';
import { toast } from 'sonner';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { SuccessPageSkeleton } from '@/components/common/skeleton-loaders';

function SuccessPageContent() {
  const router = useRouter();
  const { user, setUser } = useContext(AuthContext);
  const updateUserTokens = useMutation(api.users.UpdateUserTokens);
  const [isChecking, setIsChecking] = useState(true);

  const currentUser = useQuery(api.users.GetUser, { email: user?.email || '' });

  useEffect(() => {
    const checkAndUpdateCredits = async () => {
      if (!user || !currentUser) return;

      const creditsWereUpdated = currentUser.credits > user.credits;

      if (!creditsWereUpdated) {
        try {
          await updateUserTokens({
            userId: user._id,
            credits: user.credits + 10000,
            orderId: currentUser.orderId || 'manual_update',
          });

          setUser({
            ...user,
            credits: user.credits + 10000,
            orderId: currentUser.orderId || 'manual_update',
          });

          toast.success('Payment successful! Your credits have been updated.');
        } catch (error) {
          console.error('Error updating credits manually:', error);
          toast.error(
            'Payment successful, but there was an issue updating credits. Please contact support.'
          );
        }
      } else {
        toast.success('Payment successful! Your credits have been updated.');
      }

      setIsChecking(false);
    };

    const timer = setTimeout(checkAndUpdateCredits, 2000);
    return () => clearTimeout(timer);
  }, [user, currentUser, updateUserTokens, setUser]);

  useEffect(() => {
    if (!isChecking) {
      const timer = setTimeout(() => {
        router.push('/workspace');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isChecking, router]);

  return (
    <div className="app-shell flex min-h-[calc(100vh-60px)] items-center justify-center px-5">
      <div className="surface-card max-w-md p-10 text-center">
        <div className="icon-well-lg mx-auto mb-6 bg-chart-2/12 text-chart-2">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold">Payment Successful!</h1>
        <p className="mt-3 text-muted-foreground">
          Thank you for upgrading. Your Pro credits are being applied.
        </p>
        {isChecking && (
          <div className="mx-auto mt-6 max-w-xs space-y-2">
            <Skeleton className="mx-auto h-4 w-40" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
          </div>
        )}
        {!isChecking && (
          <Link href="/workspace" className="mt-8 inline-block">
            <Button className="rounded-2xl shadow-soft">
              Back to Workspace
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}

function LoadingFallback() {
  return <SuccessPageSkeleton />;
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SuccessPageContent />
    </Suspense>
  );
}
