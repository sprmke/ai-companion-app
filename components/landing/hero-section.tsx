'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play, Sparkles } from 'lucide-react';
import { AuthCtaButton } from '@/components/auth/auth-cta-button';
import { HeroFloatingAccents } from './hero-floating-accents';
import { WorkspacePreview } from './mockups/workspace-preview';
import { ScrollReveal } from './scroll-reveal';

export function HeroSection() {

  return (
    <section className="landing-hero relative overflow-x-hidden pt-28 pb-16 sm:pt-32 sm:pb-24 lg:pb-32">
      <div className="landing-mesh pointer-events-none absolute inset-0 -z-10" />
      <div className="landing-grid pointer-events-none absolute inset-0 -z-10 opacity-[0.35]" />

      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <ScrollReveal>
              <div className="landing-shimmer-badge mb-6 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-4 py-2 text-sm font-medium text-primary">
                <Sparkles className="h-4 w-4" />
                Personal + Customizable AI Companions
              </div>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl xl:text-[3.5rem] xl:leading-[1.08]">
                Your personal{' '}
                <span className="landing-gradient-text">AI companions</span>{' '}
                for every journey
              </h1>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
                Build a team of specialized AI assistants with unique
                personalities, custom instructions, and a beautiful workspace
                designed for deep focus.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={300}>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
                <AuthCtaButton
                  guestLabel="Get Started Free"
                  authLabel="Continue to Workspace"
                  className="group h-12 rounded-2xl px-8 text-base shadow-soft"
                  endAdornment={
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  }
                />
                <a href="#video">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 rounded-2xl border-border/60 px-8 text-base"
                  >
                    <Play className="mr-2 h-4 w-4 fill-primary text-primary" />
                    Watch Demo
                  </Button>
                </a>
              </div>
            </ScrollReveal>
          </div>

          <ScrollReveal delay={200} direction="left" className="relative">
            <div className="relative mx-auto w-full max-w-xl overflow-visible px-3 sm:px-5 lg:max-w-none">
              <div className="landing-orb landing-orb-1" />
              <div className="landing-orb landing-orb-2" />

              <div className="relative z-10 overflow-visible animate-float">
                <WorkspacePreview />
                <HeroFloatingAccents />
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
