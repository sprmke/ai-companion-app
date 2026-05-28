'use client';

import React, { useContext, useEffect } from 'react';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { useGoogleLogin } from '@react-oauth/google';

import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

import { AuthContext } from '@/context/AuthContext';
import { GetAuthUserData } from '@/services/GlobalApi';
import { resolveAppHomeHref, setAppHomeHrefCache } from '@/hooks/use-app-home';

import { Button } from '@/components/ui/button';
import { Logo } from '@/components/common/logo';

import { ThemeToggle } from '@/components/common/theme-toggle';
import { User } from '@/app/(main)/types';
import { useConvex } from 'convex/react';

function SignIn() {
  const CreateUser = useMutation(api.users.CreateUser);
  const { user, setUser } = useContext(AuthContext);
  const convex = useConvex();

  const router = useRouter();

  useEffect(() => {
    if (!user?._id) return;

    let cancelled = false;

    resolveAppHomeHref(convex, user._id).then((href) => {
      if (!cancelled) {
        router.replace(href);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [convex, router, user?._id]);

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('user_token', tokenResponse.access_token);
      }

      const { name, email, picture } = await GetAuthUserData(
        tokenResponse.access_token
      );

      const newUser = await CreateUser({
        name,
        email,
        picture,
      });

      setUser(newUser as User);
      setAppHomeHrefCache(newUser._id, '/assistants');
      router.replace('/assistants');
    },
    onError: (errorResponse) => console.error(errorResponse),
  });

  return (
    <div className="app-shell relative flex min-h-screen flex-col items-center justify-center px-5">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="landing-mesh pointer-events-none absolute inset-0 -z-10" />
      <div className="landing-grid pointer-events-none absolute inset-0 -z-10 opacity-30" />

      <div className="surface-card w-full max-w-md p-10 text-center">
        <div className="mx-auto mb-6 flex justify-center">
          <Logo size="lg" showIcon gradient />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to access your AI companions and workspace.
        </p>

        <Button
          onClick={() => googleLogin()}
          size="lg"
          variant="outline"
          className="mt-8 w-full rounded-2xl"
        >
          <Image src="/google.png" alt="Google" width={20} height={20} />
          Continue with Google
        </Button>
      </div>
    </div>
  );
}

export default SignIn;
