'use client';

import { useContext, useEffect } from 'react';

import { useConvex } from 'convex/react';
import { api } from '@/convex/_generated/api';

import { AuthContext } from '@/context/AuthContext';
import { GetAuthUserData } from '@/services/GlobalApi';

/**
 * Restores the Convex user from localStorage on any route (including /sign-in).
 */
export function AuthSessionSync({ children }: { children: React.ReactNode }) {
  const convex = useConvex();
  const { user, setUser, isAuthReady, setAuthReady } = useContext(AuthContext);

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
