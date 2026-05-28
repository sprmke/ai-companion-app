'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ScrollReveal } from './scroll-reveal';
import {
  ChatPreview,
  CompanionsPreview,
  WorkspacePreview,
} from './mockups/workspace-preview';

const tabs = [
  {
    id: 'workspace',
    label: 'Workspace',
    description: 'Three-panel layout with companions, chat, and settings.',
    component: WorkspacePreview,
  },
  {
    id: 'companions',
    label: 'Companions',
    description: 'Pick from curated personas or build your own from scratch.',
    component: CompanionsPreview,
  },
  {
    id: 'chat',
    label: 'Chat',
    description: 'Natural conversations with markdown and smart suggestions.',
    component: ChatPreview,
  },
] as const;

export function AppShowcase() {
  const [active, setActive] =
    useState<(typeof tabs)[number]['id']>('companions');
  const ActivePreview = tabs.find((t) => t.id === active)!.component;
  const activeTab = tabs.find((t) => t.id === active)!;

  return (
    <section id="showcase" className="scroll-mt-24 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <p className="section-eyebrow">Product Tour</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            See AI Companion in action
          </h2>
          <p className="mt-5 text-lg text-muted-foreground">
            Browse real app screens and see how your team of AI assistants comes
            together in one beautiful workspace.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={150} className="mt-12">
          <div className="flex flex-wrap justify-center gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActive(tab.id)}
                className={cn(
                  'rounded-2xl px-5 py-2.5 text-sm font-semibold transition-all duration-300',
                  active === tab.id
                    ? 'bg-primary text-primary-foreground shadow-soft'
                    : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            {activeTab.description}
          </p>
        </ScrollReveal>

        <ScrollReveal delay={250} className="mt-10">
          <div
            className={cn(
              'relative mx-auto transition-all duration-500',
              active === 'companions' ? 'max-w-4xl' : 'max-w-5xl'
            )}
          >
            <div className="landing-showcase-glow absolute -inset-4 -z-10 rounded-[2rem] opacity-60" />
            <div key={active} className="landing-tab-enter">
              <ActivePreview />
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
