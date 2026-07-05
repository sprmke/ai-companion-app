'use client';

import React, { useContext, useEffect, useState } from 'react';

import { usePathname, useRouter } from 'next/navigation';

import Header from '@/app/(main)/_components/Header';
import { LoadingScreen, getRouteLoadingVariant } from '@/components/common/loading-screen';

import { AuthContext } from '@/context/AuthContext';
import { AssistantContext } from '@/context/AssistantContext';
import { ThreadContext } from '@/context/ThreadContext';

import type { AiAssistant } from '@/app/(main)/types';
import { Id } from '@/convex/_generated/dataModel';

const PUBLIC_PATHS = ['/'];

function Provider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthReady } = useContext(AuthContext);
  const [assistant, setAssistant] = useState<AiAssistant | null>(null);
  const [isWorkspaceLoading, setWorkspaceLoading] = useState(false);
  const [assistantsRefreshKey, setAssistantsRefreshKey] = useState(0);
  const [currentThreadId, setCurrentThreadId] =
    useState<Id<'chatThreads'> | null>(null);
  const [isThreadSheetOpen, setIsThreadSheetOpen] = useState(false);
  const [pendingChatMessage, setPendingChatMessage] = useState<string | null>(
    null
  );

  const startNewChatWithMessage = (message: string) => {
    const trimmed = message.trim();
    if (!trimmed) return;
    setCurrentThreadId(null);
    setPendingChatMessage(trimmed);
  };

  const clearPendingChatMessage = () => {
    setPendingChatMessage(null);
  };

  const requestAssistantsRefresh = () => {
    setAssistantsRefreshKey((key) => key + 1);
  };

  const isPublicRoute = PUBLIC_PATHS.includes(pathname);

  useEffect(() => {
    if (isPublicRoute || !isAuthReady) return;

    const token = localStorage.getItem('user_token');
    if (!user && !token) {
      router.replace('/sign-in');
    }
  }, [isAuthReady, isPublicRoute, pathname, router, user]);

  const showAppHeader = !isPublicRoute && isAuthReady;
  const showLoading = !isPublicRoute && !isAuthReady;

  if (showLoading) {
    return <LoadingScreen variant={getRouteLoadingVariant(pathname)} />;
  }

  return (
    <AssistantContext.Provider
      value={{
        assistant,
        setAssistant,
        isWorkspaceLoading,
        setWorkspaceLoading,
        assistantsRefreshKey,
        requestAssistantsRefresh,
      }}
    >
      <ThreadContext.Provider
        value={{
          currentThreadId,
          setCurrentThreadId,
          isThreadSheetOpen,
          setIsThreadSheetOpen,
          pendingChatMessage,
          startNewChatWithMessage,
          clearPendingChatMessage,
        }}
      >
        {showAppHeader && <Header />}
        {children}
      </ThreadContext.Provider>
    </AssistantContext.Provider>
  );
}

export default Provider;
