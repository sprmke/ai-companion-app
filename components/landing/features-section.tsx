'use client';

import {
  Bot,
  Brain,
  MessageSquare,
  Palette,
  Shield,
  Sparkles,
} from 'lucide-react';
import { ScrollReveal } from './scroll-reveal';

const features = [
  {
    icon: Bot,
    title: 'Specialized Companions',
    description:
      'Pre-built personas for coding, writing, tutoring, fitness, and more — ready to help instantly.',
    accent: 'bg-primary/12 text-primary',
  },
  {
    icon: Palette,
    title: 'Fully Customizable',
    description:
      'Create companions with custom avatars, names, titles, and instructions tailored to your workflow.',
    accent: 'bg-chart-4/12 text-chart-4',
  },
  {
    icon: Brain,
    title: 'Multi-Model AI',
    description:
      'Switch between Gemini, GPT, Claude, and Mistral — pick the best model for each task.',
    accent: 'bg-chart-2/12 text-chart-2',
  },
  {
    icon: MessageSquare,
    title: 'Rich Chat Experience',
    description:
      'Markdown support, suggestion chips, and a distraction-free workspace built for conversation.',
    accent: 'bg-chart-5/15 text-chart-5',
  },
  {
    icon: Sparkles,
    title: 'Smart Suggestions',
    description:
      'Each companion comes with curated starter prompts so you never face a blank screen.',
    accent: 'bg-chart-3/12 text-chart-3',
  },
  {
    icon: Shield,
    title: 'Secure Sign-In',
    description:
      'Google OAuth authentication with token-based usage tracking and optional Pro upgrades.',
    accent: 'bg-primary/12 text-primary',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="scroll-mt-24 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <p className="section-eyebrow">Features</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Everything you need in one workspace
          </h2>
          <p className="mt-5 text-lg text-muted-foreground">
            Not a generic chatbot — a personal team of AI companions with
            distinct personalities, all in a polished interface.
          </p>
        </ScrollReveal>

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <ScrollReveal key={feature.title} delay={i * 80}>
              <div className="group h-full rounded-3xl border border-border/50 bg-card p-8 shadow-elevated transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated-lg">
                <div
                  className={`icon-well-lg mb-6 ${feature.accent} transition-transform duration-300 group-hover:scale-105`}
                >
                  <feature.icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold">{feature.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
