'use client';

import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthCta } from '@/hooks/use-auth-cta';
import { cn } from '@/lib/utils';

type AuthNavActionsProps = {
  className?: string;
  buttonClassName?: string;
  layout?: 'inline' | 'stacked';
  onNavigate?: () => void;
};

/** Stable skeleton placeholders — same markup on server and client until auth hydrates. */
function AuthNavActionsSkeleton({
  layout,
  className,
}: {
  layout: 'inline' | 'stacked';
  className?: string;
}) {
  return (
    <div
      className={cn(
        layout === 'stacked' ? 'flex w-full flex-col gap-3' : 'flex items-center gap-2',
        className
      )}
      aria-busy="true"
      aria-label="Loading account"
    >
      <Skeleton
        className={cn(
          'rounded-xl',
          layout === 'stacked' ? 'h-10 w-full' : 'h-9 w-[4.5rem]'
        )}
      />
      <Skeleton
        className={cn(
          'rounded-xl',
          layout === 'stacked' ? 'h-10 w-full' : 'h-9 w-[7.75rem]'
        )}
      />
    </div>
  );
}

export function AuthNavActions({
  className,
  buttonClassName,
  layout = 'inline',
  onNavigate,
}: AuthNavActionsProps) {
  const {
    isAuthLoading,
    isAuthenticated,
    primaryHref,
    primaryLabel,
    secondaryHref,
    secondaryLabel,
  } = useAuthCta();

  if (isAuthLoading) {
    return <AuthNavActionsSkeleton layout={layout} className={className} />;
  }

  return (
    <div
      className={cn(
        layout === 'stacked' ? 'flex w-full flex-col gap-3' : 'flex items-center gap-2',
        className
      )}
    >
      {!isAuthenticated && (
        <Link href={secondaryHref} onClick={onNavigate}>
          <Button
            variant={layout === 'stacked' ? 'outline' : 'ghost'}
            size="sm"
            className={cn(
              'rounded-xl',
              layout === 'stacked' && 'w-full',
              buttonClassName
            )}
          >
            {secondaryLabel}
          </Button>
        </Link>
      )}
      <Link href={primaryHref} onClick={onNavigate}>
        <Button
          size="sm"
          className={cn(
            'rounded-xl shadow-soft',
            layout === 'stacked' ? 'w-full' : 'px-5',
            buttonClassName
          )}
        >
          {primaryLabel}
        </Button>
      </Link>
    </div>
  );
}
