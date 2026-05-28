import { WorkspaceAuthSkeleton } from '@/components/common/skeleton-loaders';
import { cn } from '@/lib/utils';

export function WorkspaceLoadingView({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative top-[60px] h-[calc(100vh-60px)] w-full overflow-hidden bg-background',
        className
      )}
    >
      <WorkspaceAuthSkeleton />
    </div>
  );
}
