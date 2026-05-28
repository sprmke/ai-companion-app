import { cn } from '@/lib/utils';
import {
  AssistantsPageSkeleton,
  PageSkeleton,
} from '@/components/common/skeleton-loaders';
import { WorkspaceLoadingView } from '@/components/common/workspace-loading-view';

export type LoadingScreenVariant = 'page' | 'workspace' | 'assistants';

interface LoadingScreenProps {
  className?: string;
  fullScreen?: boolean;
  variant?: LoadingScreenVariant;
}

export function LoadingScreen({
  className,
  fullScreen = true,
  variant = 'page',
}: LoadingScreenProps) {
  if (variant === 'workspace') {
    return <WorkspaceLoadingView className={className} />;
  }

  if (variant === 'assistants') {
    return <AssistantsPageSkeleton className={className} />;
  }

  return (
    <PageSkeleton
      className={cn(!fullScreen && 'min-h-0', className)}
      variant="centered"
    />
  );
}

export function getRouteLoadingVariant(pathname: string): LoadingScreenVariant {
  if (pathname.startsWith('/workspace')) {
    return 'workspace';
  }

  if (pathname.startsWith('/assistants')) {
    return 'assistants';
  }

  return 'page';
}
