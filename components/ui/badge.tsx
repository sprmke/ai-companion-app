import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary/10 text-primary hover:bg-primary/15',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground',
        outline: 'border-border/60 text-foreground',
        success:
          'border-transparent bg-chart-2/12 text-chart-2',
        pro: 'border-transparent bg-gradient-to-r from-primary/15 to-chart-4/15 text-primary',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
