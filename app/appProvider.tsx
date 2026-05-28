'use client';
import React, { useState } from 'react';

import { GoogleOAuthProvider } from '@react-oauth/google';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { ConvexProvider } from 'convex/react';

import { AuthContext } from '@/context/AuthContext';
import { convexClient } from '@/lib/convex-client';
import { AuthSessionSync } from '@/components/auth/auth-session-sync';
import { User } from '@/app/(main)/types';

function Provider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setAuthReady] = useState(false);

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
      <ConvexProvider client={convexClient}>
        <AuthContext.Provider
          value={{ user, setUser, isAuthReady, setAuthReady }}
        >
          <AuthSessionSync>
            <NextThemesProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem={false}
              disableTransitionOnChange
            >
              {children}
            </NextThemesProvider>
          </AuthSessionSync>
        </AuthContext.Provider>
      </ConvexProvider>
    </GoogleOAuthProvider>
  );
}

export default Provider;
