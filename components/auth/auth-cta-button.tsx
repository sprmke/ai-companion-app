'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthCta } from '@/hooks/use-auth-cta';
import { cn } from '@/lib/utils';

type AuthCtaButtonProps = {
  guestLabel: string;
  authLabel?: string;
  className?: string;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: React.ComponentProps<typeof Button>['variant'];
  endAdornment?: ReactNode;
};

export function AuthCtaButton({
  guestLabel,
  authLabel,
  className,
  size = 'lg',
  variant = 'default',
  endAdornment,
}: AuthCtaButtonProps) {
  const { isAuthLoading, isAuthenticated, primaryHref, primaryLabel } =
    useAuthCta();

  if (isAuthLoading) {
    return (
      <Skeleton
        className={cn(
          'min-w-[12rem] rounded-2xl',
          size === 'lg' ? 'h-12' : 'h-9',
          className
        )}
        aria-hidden
      />
    );
  }

  const label = isAuthenticated
    ? (authLabel ?? primaryLabel)
    : guestLabel;

  return (
    <Link href={primaryHref} className="inline-flex">
      <Button size={size} variant={variant} className={className}>
        {label}
        {endAdornment}
      </Button>
    </Link>
  );
}
