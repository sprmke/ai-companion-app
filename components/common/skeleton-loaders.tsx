import { cn } from '@/lib/utils';
import { workspaceSidebarWidths } from '@/app/(main)/workspace/_components/WorkspaceSidebar';
import { Skeleton } from '@/components/ui/skeleton';

export function SkeletonText({
  className,
  lines = 1,
}: {
  className?: string;
  lines?: number;
}) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn('h-3.5', i === lines - 1 && lines > 1 ? 'w-4/5' : 'w-full')}
        />
      ))}
    </div>
  );
}

export function CompanionListItemSkeleton({
  collapsed = false,
}: {
  collapsed?: boolean;
}) {
  if (collapsed) {
    return <Skeleton className="mx-auto h-10 w-10 rounded-xl" />;
  }

  return (
    <div className="flex min-h-[68px] items-center gap-3.5 px-3 py-3">
      <Skeleton className="h-12 w-12 shrink-0 rounded-xl" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3.5 w-1/2" />
      </div>
    </div>
  );
}

export function CompanionListSkeleton({
  count = 4,
  collapsed = false,
}: {
  count?: number;
  collapsed?: boolean;
}) {
  return (
    <div className={cn('space-y-2', collapsed && 'space-y-1.5')}>
      {Array.from({ length: count }).map((_, i) => (
        <CompanionListItemSkeleton key={i} collapsed={collapsed} />
      ))}
    </div>
  );
}

export function UserChipSkeleton({ collapsed = false }: { collapsed?: boolean }) {
  if (collapsed) {
    return <Skeleton className="mx-auto h-9 w-9 rounded-full" />;
  }

  return (
    <div className="flex w-full items-center gap-3 px-3 py-3">
      <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  );
}

export function UserAccountSummarySkeleton({
  collapsed = false,
  className,
}: {
  collapsed?: boolean;
  className?: string;
}) {
  if (collapsed) {
    return (
      <div
        className={cn(
          'relative mx-auto h-11 w-11 shrink-0',
          className
        )}
      >
        <Skeleton className="h-9 w-9 rounded-full" />
        <Skeleton className="absolute bottom-0.5 left-0.5 h-[18px] w-[18px] rounded-full" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'mt-auto w-full space-y-2 rounded-2xl border border-border/40 bg-background/60 p-2.5',
        className
      )}
    >
      <div className="space-y-1.5">
        <Skeleton className="h-2 w-16" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-1.5 w-full rounded-full" />
      </div>
      <Skeleton className="h-8 w-full rounded-lg" />
    </div>
  );
}

export function CompanionCardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-card shadow-elevated">
      <Skeleton className="absolute left-3 top-3 z-10 h-5 w-5 rounded-md" />
      <Skeleton className="h-[180px] w-full rounded-none md:h-[200px]" />
      <div className="space-y-2 p-4">
        <Skeleton className="mx-auto h-5 w-2/3 max-w-[8rem]" />
        <Skeleton className="mx-auto h-4 w-1/2 max-w-[6rem]" />
      </div>
    </div>
  );
}

export function CompanionGridSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 xl:gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <CompanionCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function AssistantsPageSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'app-shell relative top-[60px] min-h-[calc(100vh-60px)] py-10',
        className
      )}
    >
      <div className="app-container">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="mt-2 h-9 w-full max-w-lg md:h-10" />
            <Skeleton className="mt-3 h-5 w-full max-w-xl" />
            <Skeleton className="mt-2 h-5 w-full max-w-md" />
          </div>
          <Skeleton className="h-12 w-full shrink-0 rounded-2xl sm:w-28" />
        </div>
        <div className="mt-12">
          <CompanionGridSkeleton count={10} />
        </div>
      </div>
    </div>
  );
}

export function SettingsPanelSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex h-full min-w-0 flex-col justify-between overflow-hidden p-5',
        className
      )}
    >
      <div className="flex min-w-0 flex-col">
        <div className="surface-muted mt-2 flex min-w-0 gap-4 p-4">
          <Skeleton className="h-20 w-20 shrink-0 rounded-2xl" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-2.5 w-24 max-w-full" />
            <Skeleton className="h-5 w-4/5 max-w-full" />
            <Skeleton className="h-4 w-3/5 max-w-full" />
          </div>
        </div>

        <div className="mt-6 min-w-0">
          <Skeleton className="mb-2 h-3 w-12" />
          <Skeleton className="h-11 w-full rounded-2xl" />
        </div>

        <div className="mt-6 min-w-0">
          <Skeleton className="mb-2 h-3 w-20" />
          <Skeleton className="h-[180px] w-full rounded-2xl" />
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-3">
        <Skeleton className="h-10 w-[5.75rem] rounded-xl bg-muted/50" />
        <Skeleton className="h-10 w-[5.25rem] rounded-xl bg-primary/25" />
      </div>
    </div>
  );
}

export function ChatTypingSkeleton({ assistantImage }: { assistantImage?: string }) {
  return (
    <div className="mb-4 flex justify-start">
      <div className="flex max-w-[85%] gap-3">
        {assistantImage ? (
          <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />
        ) : null}
        <div className="min-w-[12rem] space-y-2 rounded-2xl rounded-bl-md border border-border/40 bg-muted/50 px-4 py-3">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </div>
    </div>
  );
}

export function ChatEmptySkeleton() {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-4 sm:px-6">
      <div className="flex w-full max-w-lg flex-col items-center">
        <Skeleton className="mb-6 h-14 w-14 shrink-0 rounded-2xl" />
        <Skeleton className="h-10 w-full max-w-xs rounded-xl" />
        <Skeleton className="mt-3 h-4 w-full max-w-md rounded-md" />
        <div className="mt-8 w-full space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[3.25rem] w-full rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ChatPanelSkeleton() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <ChatEmptySkeleton />
      <div className="flex shrink-0 gap-3 border-t border-border/40 bg-card/60 p-5">
        <Skeleton className="h-11 min-w-0 flex-1 rounded-2xl" />
        <Skeleton className="h-11 w-11 shrink-0 rounded-2xl" />
      </div>
    </div>
  );
}

export function WorkspaceSidebarSkeleton() {
  return (
    <aside
      className={cn(
        'flex h-full shrink-0 flex-col',
        workspaceSidebarWidths.left.expanded
      )}
    >
      <div className="panel-surface flex min-h-0 flex-1 flex-col gap-3 overflow-hidden px-3 py-4">
        <Skeleton className="h-11 w-full shrink-0 rounded-2xl" />
        <Skeleton className="h-11 w-full shrink-0 rounded-2xl" />
        <div className="min-h-0 flex-1 overflow-hidden">
          <CompanionListSkeleton count={4} />
        </div>
        <UserAccountSummarySkeleton />
      </div>
    </aside>
  );
}

export function SettingsSidebarSkeleton() {
  return (
    <aside
      className={cn(
        'flex h-full shrink-0 flex-col',
        workspaceSidebarWidths.right.expanded
      )}
    >
      <div className="panel-surface flex min-h-0 flex-1 flex-col overflow-hidden">
        <SettingsPanelSkeleton />
      </div>
    </aside>
  );
}

export function WorkspaceAuthSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('workspace-shell hidden h-full lg:grid', className)}>
      <WorkspaceSidebarSkeleton />
      <div className="panel-surface chat-panel-surface min-h-0 min-w-0 overflow-hidden">
        <ChatPanelSkeleton />
      </div>
      <SettingsSidebarSkeleton />
    </div>
  );
}

export function PageSkeleton({
  className,
  variant = 'centered',
}: {
  className?: string;
  variant?: 'centered' | 'full';
}) {
  if (variant === 'full') {
    return <WorkspaceAuthSkeleton />;
  }

  return (
    <div
      className={cn(
        'app-shell flex min-h-screen flex-col items-center justify-center gap-6 px-6',
        className
      )}
    >
      <div className="w-full max-w-sm space-y-4 text-center">
        <Skeleton className="mx-auto h-14 w-14 rounded-2xl" />
        <Skeleton className="mx-auto h-6 w-48" />
        <Skeleton className="mx-auto h-4 w-64" />
        <div className="space-y-2 pt-2">
          <Skeleton className="h-10 w-full rounded-2xl" />
          <Skeleton className="h-10 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

export function SuccessPageSkeleton() {
  return (
    <div className="app-shell flex min-h-[calc(100vh-60px)] items-center justify-center px-5">
      <div className="surface-card w-full max-w-md space-y-4 p-10 text-center">
        <Skeleton className="mx-auto h-16 w-16 rounded-2xl" />
        <Skeleton className="mx-auto h-8 w-56" />
        <Skeleton className="mx-auto h-4 w-full max-w-xs" />
        <Skeleton className="mx-auto mt-4 h-4 w-40" />
        <Skeleton className="mx-auto mt-6 h-11 w-44 rounded-2xl" />
      </div>
    </div>
  );
}

export function ProfilePlanSkeleton() {
  return (
    <div className="surface-card space-y-4 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 w-36" />
        </div>
        <Skeleton className="h-6 w-16" />
      </div>
      <Skeleton className="h-11 w-full rounded-2xl" />
    </div>
  );
}
