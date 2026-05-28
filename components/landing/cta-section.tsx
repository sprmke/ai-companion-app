'use client';

import { ArrowRight } from 'lucide-react';
import { AuthCtaButton } from '@/components/auth/auth-cta-button';
import { ScrollReveal } from './scroll-reveal';

export function CtaSection() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <ScrollReveal>
          <div className="landing-cta-banner relative isolate overflow-hidden rounded-[2rem] px-8 py-20 sm:px-16 sm:py-24">
            <div className="landing-cta-orbs pointer-events-none absolute inset-0" />
            <div className="relative mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl lg:text-5xl">
                Ready to meet your AI team?
              </h2>
              <p className="mx-auto mt-6 max-w-lg text-lg text-primary-foreground/85">
                Start free with curated companions, or build your own from
                scratch. Your workspace awaits.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <AuthCtaButton
                  guestLabel="Get Started Free"
                  variant="secondary"
                  className="group h-12 rounded-2xl px-8 text-base shadow-lg"
                  endAdornment={
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  }
                />
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
