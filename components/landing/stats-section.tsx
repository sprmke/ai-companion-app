'use client';

import type { LucideIcon } from 'lucide-react';
import { Bot, MessageSquare, Users, Zap } from 'lucide-react';

import { ScrollReveal } from './scroll-reveal';
import { cn } from '@/lib/utils';

type Stat = {
  value: string;
  label: string;
  icon: LucideIcon;
  valueClassName?: string;
};

const stats: Stat[] = [
  { value: '12+', label: 'Curated companions', icon: Bot },
  { value: '4', label: 'AI models supported', icon: Zap },
  { value: '3', label: 'Panel workspace', icon: MessageSquare },
  {
    value: 'Unli',
    label: 'Custom personas',
    icon: Users,
    valueClassName: 'text-xl sm:text-2xl',
  },
];

export function StatsSection() {
  return (
    <section className="border-y border-border/40 bg-muted/20 py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-10">
          {stats.map((stat, i) => (
            <ScrollReveal key={stat.label} delay={i * 60}>
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="icon-well-md shrink-0 bg-primary/10 text-primary">
                  <stat.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p
                    className={cn(
                      'min-h-[1.75rem] text-2xl font-extrabold leading-none tabular-nums tracking-tight sm:min-h-[2rem] sm:text-3xl',
                      stat.valueClassName
                    )}
                  >
                    {stat.value}
                  </p>
                  <p className="mt-1.5 text-sm leading-snug text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
