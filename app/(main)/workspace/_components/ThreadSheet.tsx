'use client';

import React, { useContext, useState } from 'react';

import { Loader2, MessageSquarePlus, Trash2, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';

import { AuthContext } from '@/context/AuthContext';
import { AssistantContext } from '@/context/AssistantContext';
import { ThreadContext } from '@/context/ThreadContext';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ChatThread = {
  _id: Id<'chatThreads'>;
  title: string;
  messages: { role: 'user' | 'assistant'; content: string; createdAt: number }[];
  updatedAt: number;
  assistantId: Id<'userAiAssistants'>;
  userId: Id<'users'>;
  _creationTime: number;
};

function groupThreadsByDate(threads: ChatThread[]) {
  const now = Date.now();
  const oneDay = 86_400_000;
  const sevenDays = 7 * oneDay;
  const thirtyDays = 30 * oneDay;

  const groups: { label: string; items: ChatThread[] }[] = [
    { label: 'Today', items: [] },
    { label: 'Yesterday', items: [] },
    { label: 'Past 7 days', items: [] },
    { label: 'Past 30 days', items: [] },
    { label: 'Older', items: [] },
  ];

  for (const thread of threads) {
    const age = now - thread.updatedAt;
    if (age < oneDay) groups[0].items.push(thread);
    else if (age < 2 * oneDay) groups[1].items.push(thread);
    else if (age < sevenDays) groups[2].items.push(thread);
    else if (age < thirtyDays) groups[3].items.push(thread);
    else groups[4].items.push(thread);
  }

  return groups.filter((g) => g.items.length > 0);
}

interface ThreadSheetProps {
  onNewChat: () => void;
}

export function ThreadSheet({ onNewChat }: ThreadSheetProps) {
  const { user } = useContext(AuthContext);
  const { assistant } = useContext(AssistantContext);
  const { currentThreadId, setCurrentThreadId, isThreadSheetOpen, setIsThreadSheetOpen } =
    useContext(ThreadContext);

  const [deletingId, setDeletingId] = useState<Id<'chatThreads'> | null>(null);
  const [threadToDelete, setThreadToDelete] = useState<ChatThread | null>(null);

  const threads = useQuery(
    api.chatThreads.getThreadsByAssistant,
    user?._id && assistant?._id
      ? { userId: user._id, assistantId: assistant._id }
      : 'skip'
  );

  const deleteThread = useMutation(api.chatThreads.deleteThread);

  const handleSelectThread = (threadId: Id<'chatThreads'>) => {
    setCurrentThreadId(threadId);
    setIsThreadSheetOpen(false);
  };

  const handleDeleteClick = (
    e: React.MouseEvent,
    thread: ChatThread
  ) => {
    e.stopPropagation();
    setThreadToDelete(thread);
  };

  const confirmDelete = async () => {
    if (!threadToDelete) return;

    const threadId = threadToDelete._id;
    setDeletingId(threadId);
    setThreadToDelete(null);

    try {
      await deleteThread({ threadId });
      if (currentThreadId === threadId) {
        setCurrentThreadId(null);
      }
      toast.success('Chat deleted');
    } catch {
      toast.error('Failed to delete chat');
    } finally {
      setDeletingId(null);
    }
  };

  const handleNewChat = () => {
    onNewChat();
    setIsThreadSheetOpen(false);
  };

  const groups = groupThreadsByDate((threads ?? []) as ChatThread[]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'absolute inset-0 z-30 bg-background/60 backdrop-blur-sm transition-opacity duration-300',
          isThreadSheetOpen
            ? 'pointer-events-auto opacity-100'
            : 'pointer-events-none opacity-0'
        )}
        onClick={() => setIsThreadSheetOpen(false)}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className={cn(
          'absolute inset-y-0 left-0 z-40 flex w-[22rem] max-w-[calc(100%-2rem)] flex-col',
          'border-r border-border/50 bg-card/95 shadow-elevated-lg backdrop-blur-md',
          'transition-transform duration-300 ease-in-out',
          isThreadSheetOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-border/40 px-5 py-4">
          <div>
            <h2 className="text-[15px] font-bold">Chat History</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {assistant?.name}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsThreadSheetOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Close history"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="shrink-0 px-4 py-3">
          <Button
            onClick={handleNewChat}
            className="w-full rounded-2xl shadow-soft"
          >
            <MessageSquarePlus className="h-4 w-4" />
            New Chat
          </Button>
        </div>

        {/* Thread List */}
        <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-4 scrollbar-hide">
          {threads === undefined ? (
            <ThreadListSkeleton />
          ) : groups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="icon-well-md mb-3 bg-muted text-muted-foreground">
                <MessageSquarePlus className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium">No chats yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Start a conversation to see it here.
              </p>
            </div>
          ) : (
            groups.map((group) => (
              <div key={group.label} className="mb-2">
                <p className="px-3 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {group.label}
                </p>
                {group.items.map((thread) => (
                  <ThreadItem
                    key={thread._id}
                    thread={thread}
                    isActive={thread._id === currentThreadId}
                    isDeleting={deletingId === thread._id}
                    onSelect={handleSelectThread}
                    onDeleteClick={handleDeleteClick}
                  />
                ))}
              </div>
            ))
          )}
        </div>
      </div>

      <AlertDialog
        open={threadToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setThreadToDelete(null);
        }}
      >
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this chat?</AlertDialogTitle>
            <AlertDialogDescription>
              {threadToDelete ? (
                <>
                  <span className="font-medium text-foreground">
                    &ldquo;{threadToDelete.title}&rdquo;
                  </span>{' '}
                  will be permanently removed. This cannot be undone.
                </>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={confirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function ThreadItem({
  thread,
  isActive,
  isDeleting,
  onSelect,
  onDeleteClick,
}: {
  thread: ChatThread;
  isActive: boolean;
  isDeleting: boolean;
  onSelect: (id: Id<'chatThreads'>) => void;
  onDeleteClick: (e: React.MouseEvent, thread: ChatThread) => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(thread._id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(thread._id);
        }
      }}
      className={cn(
        'group flex cursor-pointer items-center gap-2 rounded-2xl px-3 py-2.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        isActive ? 'bg-primary/10' : 'hover:bg-muted/60'
      )}
    >
      <p
        className={cn(
          'line-clamp-1 min-w-0 flex-1 text-[13px] font-medium leading-snug',
          isActive ? 'text-primary' : 'text-foreground'
        )}
      >
        {thread.title}
      </p>

      <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground/70">
        {formatDistanceToNow(thread.updatedAt, { addSuffix: false })}
      </span>

      <button
        type="button"
        onClick={(e) => onDeleteClick(e, thread)}
        disabled={isDeleting}
        aria-label="Delete chat"
        title="Delete chat"
        className={cn(
          'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors',
          'text-muted-foreground/40 hover:bg-destructive/10 hover:text-destructive',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/50',
          'disabled:cursor-not-allowed',
          isDeleting && 'text-destructive'
        )}
      >
        {isDeleting ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Trash2 className="h-3.5 w-3.5" />
        )}
      </button>
    </div>
  );
}

function ThreadListSkeleton() {
  return (
    <div className="space-y-1 px-2 pt-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between gap-2 rounded-2xl px-3 py-2.5"
        >
          <div
            className="h-3.5 animate-pulse rounded-full bg-muted"
            style={{ width: `${55 + (i % 3) * 15}%` }}
          />
          <div className="h-2.5 w-8 shrink-0 animate-pulse rounded-full bg-muted/60" />
        </div>
      ))}
    </div>
  );
}
