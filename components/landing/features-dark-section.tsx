'use client';

import { Layers, Users, Wand2 } from 'lucide-react';
import { ScrollReveal } from './scroll-reveal';

const pillars = [
  {
    icon: Users,
    title: 'Personal, not generic',
    description:
      'Each companion has a name, avatar, and specialty. Switch contexts without losing your flow.',
  },
  {
    icon: Wand2,
    title: 'Custom by design',
    description:
      'Tailor instructions, pick models, and shape personalities that match how you actually work.',
  },
  {
    icon: Layers,
    title: 'One workspace, many minds',
    description:
      'Sidebar, chat, and settings in harmony — no tab juggling, no context switching fatigue.',
  },
];

export function FeaturesDarkSection() {
  return (
    <section className="landing-dark-section relative overflow-hidden py-24 sm:py-32">
      <div className="landing-dark-mesh pointer-events-none absolute inset-0" />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-chart-2">
            Built Different
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            AI that feels like a team, not a tool
          </h2>
          <p className="mt-5 text-lg text-white/70">
            We designed every pixel around the idea that your AI assistants
            should have identity, purpose, and a home.
          </p>
        </ScrollReveal>

        <div className="mt-16 grid gap-5 md:grid-cols-3">
          {pillars.map((pillar, i) => (
            <ScrollReveal key={pillar.title} delay={i * 100}>
              <div className="h-full rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-white/10">
                <div className="icon-well-lg mb-6 bg-primary/20 text-primary">
                  <pillar.icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-white">{pillar.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/65">
                  {pillar.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PhilosophySection() {
  return (
    <section
      id="philosophy"
      className="landing-philosophy-pattern scroll-mt-24 py-24 sm:py-32"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <ScrollReveal>
            <p className="section-eyebrow">Our Philosophy</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Intelligence with personality
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              Most AI apps feel like talking to the same bot in different skins.
              AI Companion gives each assistant a distinct voice, visual identity,
              and purpose — so you always know who you&apos;re working with.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              From onboarding to daily chat, every interaction is crafted to
              feel personal, premium, and delightfully fast.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={150} direction="left">
            <div className="surface-card p-8 sm:p-10">
              <blockquote className="text-xl font-medium leading-relaxed text-foreground sm:text-2xl">
                &ldquo;The best AI experience isn&apos;t the smartest model —
                it&apos;s the one that understands{' '}
                <span className="landing-gradient-text">your context</span> and
                feels like it was built for you.&rdquo;
              </blockquote>
              <p className="mt-6 text-sm font-semibold text-muted-foreground">
                — The AI Companion team
              </p>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
