'use client';

import React, { useContext, useEffect, useState } from 'react';

import { usePathname, useRouter } from 'next/navigation';

import { GetAuthUserData } from '@/services/GlobalApi';

import Header from '@/app/(main)/_components/Header';
import { LoadingScreen, getRouteLoadingVariant } from '@/components/common/loading-screen';
import { useConvex } from 'convex/react';
import { api } from '@/convex/_generated/api';

import { AuthContext } from '@/context/AuthContext';
import { AssistantContext } from '@/context/AssistantContext';

import type { AiAssistant } from '@/app/(main)/types';

const PUBLIC_PATHS = ['/'];

function Provider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();
  const convex = useConvex();
  const { setUser, setAuthReady } = useContext(AuthContext);
  const [assistant, setAssistant] = useState<AiAssistant | null>(null);
  const [isWorkspaceLoading, setWorkspaceLoading] = useState(false);
  const [assistantsRefreshKey, setAssistantsRefreshKey] = useState(0);
  const [authChecked, setAuthChecked] = useState(false);

  const requestAssistantsRefresh = () => {
    setAssistantsRefreshKey((key) => key + 1);
  };

  const isPublicRoute = PUBLIC_PATHS.includes(pathname);

  useEffect(() => {
    setAuthChecked(false);
    CheckUseAuth();
  }, [pathname]);

  const CheckUseAuth = async () => {
    const publicRoute = PUBLIC_PATHS.includes(pathname);
    const token = localStorage.getItem('user_token');
    const authUser = token ? await GetAuthUserData(token) : null;

    if (!authUser?.email) {
      setUser(null);
      setAuthChecked(true);
      if (!publicRoute) {
        router.replace('/sign-in');
      }
      return;
    }

    try {
      const result = await convex.query(api.users.GetUser, {
        email: authUser.email,
      });

      if (result) {
        setUser(result);
      } else if (!publicRoute) {
        router.replace('/sign-in');
      }
    } catch (error) {
      console.error('CheckUseAuth error::', error);
      if (!publicRoute) {
        router.replace('/sign-in');
      }
    } finally {
      setAuthChecked(true);
      setAuthReady(true);
    }
  };

  const showAppHeader = !isPublicRoute && authChecked;
  const showLoading = !isPublicRoute && !authChecked;

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
      {showAppHeader && <Header />}
      {children}
    </AssistantContext.Provider>
  );
}

export default Provider;
