'use client';

import { useContext } from 'react';

import { AuthContext } from '@/context/AuthContext';
import { useAppHome } from '@/hooks/use-app-home';

export function useAuthCta() {
  const { user, isAuthReady } = useContext(AuthContext);
  const { homeHref } = useAppHome();

  const authenticatedHome =
    homeHref === '/' ? ('/assistants' as const) : homeHref;

  return {
    isAuthLoading: !isAuthReady,
    isAuthenticated: isAuthReady && !!user,
    workspaceHref: authenticatedHome,
    signInHref: '/sign-in' as const,
    primaryHref: user ? authenticatedHome : ('/sign-in' as const),
    primaryLabel: user ? 'Open Workspace' : 'Get Started',
    secondaryLabel: user ? 'Workspace' : 'Sign In',
    secondaryHref: user ? authenticatedHome : ('/sign-in' as const),
  };
}
