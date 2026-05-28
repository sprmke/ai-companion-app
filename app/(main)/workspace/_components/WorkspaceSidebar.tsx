'use client';

import type { ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import type { WorkspaceSidebarSide } from '@/app/(main)/workspace/_components/use-sidebar-collapsed';
import { cn } from '@/lib/utils';

export const workspaceSidebarWidths = {
  left: {
    expanded: 'w-[17.5rem]',
    collapsed: 'w-[4.75rem]',
  },
  right: {
    expanded: 'w-[22rem] xl:w-[20rem]',
    collapsed: 'w-[4.75rem]',
  },
} as const satisfies Record<
  WorkspaceSidebarSide,
  { expanded: string; collapsed: string }
>;

type WorkspaceSidebarProps = {
  collapsed: boolean;
  onToggle: () => void;
  children: ReactNode;
  side?: WorkspaceSidebarSide;
  className?: string;
};

export function WorkspaceSidebar({
  collapsed,
  onToggle,
  children,
  side = 'left',
  className,
}: WorkspaceSidebarProps) {
  const isLeft = side === 'left';
  const widths = workspaceSidebarWidths[side];

  return (
    <aside
      className={cn(
        'relative flex h-full shrink-0 flex-col overflow-visible transition-[width] duration-300 ease-in-out',
        collapsed ? widths.collapsed : widths.expanded,
        className
      )}
    >
      <div
        className={cn(
          'panel-surface flex h-full min-h-0 flex-col overflow-hidden',
          collapsed
            ? 'px-2 py-3'
            : isLeft
              ? 'px-3 py-4'
              : 'p-0'
        )}
      >
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      </div>

      <button
        type="button"
        onClick={onToggle}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className={cn(
          'absolute top-1/2 z-20 flex h-10 w-7 -translate-y-1/2 items-center justify-center',
          isLeft ? 'left-full -translate-x-1/2' : 'right-full translate-x-1/2',
          'rounded-full border border-border/50 bg-card text-muted-foreground shadow-elevated-lg',
          'transition-all hover:scale-105 hover:border-primary/35 hover:bg-muted hover:text-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
        )}
      >
        {isLeft ? (
          collapsed ? (
            <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
          ) : (
            <ChevronLeft className="h-4 w-4" strokeWidth={2.5} />
          )
        ) : collapsed ? (
          <ChevronLeft className="h-4 w-4" strokeWidth={2.5} />
        ) : (
          <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
        )}
      </button>
    </aside>
  );
}
