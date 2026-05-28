'use client';

import React, { useContext, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { googleLogout } from '@react-oauth/google';

import Image from 'next/image';
import Link from 'next/link';

import { AuthContext } from '@/context/AuthContext';
import UserProfile from '../workspace/_components/UserProfile';
import { LogOut, UserCircle2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Logo } from '@/components/common/logo';
import { ThemeToggle } from '@/components/common/theme-toggle';
import { Badge } from '@/components/ui/badge';
import { useAppHome } from '@/hooks/use-app-home';
import { cn } from '@/lib/utils';

function Header() {
  const { user, setUser } = useContext(AuthContext);
  const { homeHref } = useAppHome();
  const pathname = usePathname();
  const router = useRouter();
  const [openUserProfile, setOpenUserProfile] = useState(false);

  const useHeaderContainer = pathname.startsWith('/assistants');

  const handleLogout = () => {
    googleLogout();
    setUser(null);
    localStorage.removeItem('user_token');
    router.replace('/sign-in');
  };

  return (
    <header className="fixed top-0 z-20 w-full border-b border-border/50 bg-background/80 shadow-sm backdrop-blur-xl">
      <div
        className={cn(
          'flex min-h-[73px] max-h-[73px] items-center justify-between py-2.5 sm:py-3',
          useHeaderContainer ? 'app-container' : 'px-6'
        )}
      >
        <Link
          href={user ? (homeHref === '/' ? '/assistants' : homeHref) : '/'}
          className="flex items-center gap-3"
        >
          <Logo size="sm" showIcon />
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          {user && (
            <Badge variant="pro" className="hidden sm:inline-flex">
              {user.orderId ? 'Pro' : 'Free'}
            </Badge>
          )}
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex cursor-pointer items-center gap-x-2 rounded-2xl px-2 py-1.5 transition-colors hover:bg-muted/60 sm:gap-x-3"
              >
                <p className="hidden max-w-[120px] truncate text-sm font-medium md:flex lg:max-w-none">
                  {user?.name}
                </p>
                {user?.picture && (
                  <Image
                    src={user.picture}
                    alt={user.name ?? 'User'}
                    width={36}
                    height={36}
                    className="rounded-full ring-2 ring-primary/20"
                  />
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[220px] rounded-2xl border-border/50 shadow-elevated-lg"
              align="end"
            >
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer rounded-xl"
                onClick={() => setOpenUserProfile(true)}
              >
                <UserCircle2 />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                className={cn(
                  'cursor-pointer rounded-xl text-destructive focus:text-destructive'
                )}
                onClick={handleLogout}
              >
                <LogOut />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <UserProfile
          openUserProfile={openUserProfile}
          setOpenUserProfile={setOpenUserProfile}
        />
      </div>
    </header>
  );
}

export default Header;
