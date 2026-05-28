'use client';

import Link from 'next/link';
import { Logo } from '@/components/common/logo';
import { ArrowRight } from 'lucide-react';

import { AuthCtaButton } from '@/components/auth/auth-cta-button';
import { useAuthCta } from '@/hooks/use-auth-cta';

const navigateLinks = [
  { href: '#features', label: 'Features' },
  { href: '#showcase', label: 'Product' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#philosophy', label: 'Why Us' },
  { href: '#testimonials', label: 'Reviews' },
];

export function LandingFooter() {
  const { isAuthLoading, isAuthenticated, workspaceHref } = useAuthCta();

  return (
    <footer className="border-t border-border/50 bg-muted/20">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-start lg:gap-12">
          <div className="lg:col-span-5">
            <Link
              href={
                isAuthLoading || !isAuthenticated ? '/' : workspaceHref
              }
            >
              <Logo size="lg" showIcon gradient />
            </Link>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
              Your personal team of AI companions. Custom personalities,
              beautiful workspace, and multi-model intelligence in one app.
            </p>
            <div className="mt-6">
              <AuthCtaButton
                guestLabel="Get Started"
                className="group rounded-2xl shadow-soft"
                endAdornment={
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                }
              />
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:col-span-4 lg:col-start-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Navigate
              </p>
              <ul className="mt-4 flex flex-col gap-2.5">
                {navigateLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Account
              </p>
              <ul className="mt-4 flex flex-col gap-2.5">
                {isAuthenticated ? (
                  <>
                    <li>
                      <Link
                        href={workspaceHref}
                        className="text-sm text-muted-foreground transition-colors hover:text-primary"
                      >
                        Open Workspace
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/assistants"
                        className="text-sm text-muted-foreground transition-colors hover:text-primary"
                      >
                        Choose Companions
                      </Link>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <Link
                        href="/sign-in"
                        className="text-sm text-muted-foreground transition-colors hover:text-primary"
                      >
                        Sign In
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/assistants"
                        className="text-sm text-muted-foreground transition-colors hover:text-primary"
                      >
                        Choose Companions
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-border/40 pt-8">
          <p className="text-center text-sm text-muted-foreground sm:text-left">
            &copy; {new Date().getFullYear()} AI Companion. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
