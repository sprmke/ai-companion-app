'use client';

import { useContext, useEffect } from 'react';

import { useConvex, useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

import { User } from '@/app/(main)/types';
import { AuthContext } from '@/context/AuthContext';
import { GetAuthUserData } from '@/services/GlobalApi';

/**
 * Restores the Convex user from localStorage on any route (including /sign-in).
 */
export function AuthSessionSync({ children }: { children: React.ReactNode }) {
  const convex = useConvex();
  const { user, setUser, isAuthReady, setAuthReady } = useContext(AuthContext);

  const liveUser = useQuery(
    api.users.GetUser,
    user?.email ? { email: user.email } : 'skip'
  );
  const syncTopupCredits = useMutation(api.users.EnsureTopupCreditsSynced);

  useEffect(() => {
    if (!liveUser?._id || (liveUser.topupCredits ?? 0) > 0) return;
    void syncTopupCredits({ userId: liveUser._id });
  }, [liveUser?._id, liveUser?.topupCredits, syncTopupCredits]);

  // Keep auth state in sync with Convex so token usage updates everywhere.
  useEffect(() => {
    if (!liveUser) return;

    setUser((current) => {
      if (!current || current._id !== liveUser._id) {
        return liveUser as User;
      }

      const credits =
        liveUser.orderId !== current.orderId
          ? liveUser.credits
          : liveUser.credits >= current.credits
            ? liveUser.credits
            : current.credits;

      if (
        current.credits === credits &&
        current.orderId === liveUser.orderId &&
        current.topupCredits === liveUser.topupCredits &&
        current.name === liveUser.name &&
        current.email === liveUser.email &&
        current.picture === liveUser.picture
      ) {
        return current;
      }

      return {
        ...current,
        credits,
        orderId: liveUser.orderId,
        topupCredits: liveUser.topupCredits,
        name: liveUser.name,
        email: liveUser.email,
        picture: liveUser.picture,
      };
    });
  }, [liveUser, setUser]);

  useEffect(() => {
    if (isAuthReady) return;

    if (user) {
      setAuthReady(true);
      return;
    }

    const token = localStorage.getItem('user_token');
    if (!token) {
      setAuthReady(true);
      return;
    }

    let cancelled = false;

    const restoreSession = async () => {
      try {
        const authUser = await GetAuthUserData(token);
        if (!authUser?.email) {
          localStorage.removeItem('user_token');
          return;
        }

        const result = await convex.query(api.users.GetUser, {
          email: authUser.email,
        });

        if (!cancelled && result) {
          setUser(result);
        }
      } catch (error) {
        console.error('AuthSessionSync error:', error);
      } finally {
        if (!cancelled) {
          setAuthReady(true);
        }
      }
    };

    void restoreSession();

    return () => {
      cancelled = true;
    };
  }, [convex, isAuthReady, setAuthReady, setUser, user]);

  return <>{children}</>;
}
