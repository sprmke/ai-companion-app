import { createContext } from 'react';
import { Id } from '@/convex/_generated/dataModel';

type ThreadContextType = {
  currentThreadId: Id<'chatThreads'> | null;
  setCurrentThreadId: (id: Id<'chatThreads'> | null) => void;
  isThreadSheetOpen: boolean;
  setIsThreadSheetOpen: (open: boolean) => void;
  pendingChatMessage: string | null;
  startNewChatWithMessage: (message: string) => void;
  clearPendingChatMessage: () => void;
};

export const ThreadContext = createContext<ThreadContextType>({
  currentThreadId: null,
  setCurrentThreadId: () => {},
  isThreadSheetOpen: false,
  setIsThreadSheetOpen: () => {},
  pendingChatMessage: null,
  startNewChatWithMessage: () => {},
  clearPendingChatMessage: () => {},
});
