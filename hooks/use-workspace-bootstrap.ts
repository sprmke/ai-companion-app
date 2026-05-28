'use client';

import { useContext, useEffect } from 'react';

import { useConvex } from 'convex/react';
import { useRouter } from 'next/navigation';

import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

import { AuthContext } from '@/context/AuthContext';
import { AssistantContext } from '@/context/AssistantContext';
import { setAppHomeHrefCache } from '@/hooks/use-app-home';

export function useWorkspaceBootstrap() {
  const convex = useConvex();
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const { assistant, setAssistant, setWorkspaceLoading } =
    useContext(AssistantContext);

  useEffect(() => {
    const userId = user?._id;
    if (!userId || assistant) return;

    let cancelled = false;

    async function bootstrap(resolvedUserId: Id<'users'>) {
      try {
        const loadedAssistants = await convex.query(
          api.userAiAssistants.getAllUserAssistants,
          {
            userId: resolvedUserId,
          }
        );

        if (cancelled) return;

        if (!loadedAssistants.length) {
          setAppHomeHrefCache(resolvedUserId, '/assistants');
          router.replace('/assistants');
          return;
        }

        setAppHomeHrefCache(resolvedUserId, '/workspace');
        setWorkspaceLoading(true);
        setAssistant(loadedAssistants[0]);
      } catch (error) {
        console.error('Workspace bootstrap error:', error);
        router.replace('/assistants');
      } finally {
        if (!cancelled) {
          setWorkspaceLoading(false);
        }
      }
    }

    bootstrap(userId);

    return () => {
      cancelled = true;
    };
  }, [assistant, convex, router, setAssistant, setWorkspaceLoading, user?._id]);
}
