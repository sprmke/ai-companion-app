'use client';

import HeroVideoDialog from '@/components/magicui/hero-video-dialog';
import { WorkspacePreview } from '@/components/landing/mockups/workspace-preview';
import { ScrollReveal } from './scroll-reveal';

export function VideoSection() {
  return (
    <section id="video" className="scroll-mt-24 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <p className="section-eyebrow">Watch</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            See it in motion
          </h2>
          <p className="mt-5 text-lg text-muted-foreground">
            Explore the live workspace UI, then watch a short walkthrough of
            companions, chat, and customization in action.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={150} className="relative mx-auto mt-12 max-w-5xl">
          <div className="landing-showcase-glow absolute -inset-6 -z-10 rounded-[2.5rem] opacity-70" />
          <HeroVideoDialog
            animationStyle="from-center"
            videoSrc="https://www.youtube-nocookie.com/embed/yPYZpwSpKmA"
            thumbnail={<WorkspacePreview glow={false} />}
          />
        </ScrollReveal>
      </div>
    </section>
  );
}
