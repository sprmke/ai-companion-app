'use client';

import { useContext, useEffect, useState } from 'react';

import { useConvex, type ConvexReactClient } from 'convex/react';

import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';

import { AuthContext } from '@/context/AuthContext';

export type AppHomeHref = '/' | '/workspace' | '/assistants';

const homeHrefCache = new Map<string, AppHomeHref>();

export async function resolveAppHomeHref(
  convex: ConvexReactClient,
  userId: Id<'users'>
): Promise<'/workspace' | '/assistants'> {
  const cached = homeHrefCache.get(userId);
  if (cached && cached !== '/') {
    return cached;
  }

  const assistants = await convex.query(
    api.userAiAssistants.getAllUserAssistants,
    { userId }
  );

  const href = assistants.length > 0 ? '/workspace' : '/assistants';
  homeHrefCache.set(userId, href);
  return href;
}

export function setAppHomeHrefCache(
  userId: Id<'users'>,
  href: '/workspace' | '/assistants'
) {
  homeHrefCache.set(userId, href);
}

export function useAppHome() {
  const convex = useConvex();
  const { user, isAuthReady } = useContext(AuthContext);
  const [homeHref, setHomeHref] = useState<AppHomeHref>(
    user?._id ? homeHrefCache.get(user._id) ?? '/assistants' : '/'
  );
  const [isResolving, setIsResolving] = useState(false);

  useEffect(() => {
    if (!isAuthReady || !user?._id) {
      setHomeHref('/');
      return;
    }

    const cached = homeHrefCache.get(user._id);
    if (cached && cached !== '/') {
      setHomeHref(cached);
      return;
    }

    let cancelled = false;
    setIsResolving(true);

    resolveAppHomeHref(convex, user._id)
      .then((href) => {
        if (!cancelled) {
          setHomeHref(href);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsResolving(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [convex, isAuthReady, user?._id]);

  return {
    homeHref,
    isResolving: isResolving && !!user,
  };
}
