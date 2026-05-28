'use client';

import { Star } from 'lucide-react';
import { ScrollReveal } from './scroll-reveal';

const testimonials = [
  {
    quote:
      'Having separate companions for coding and writing changed how I work. Each one stays in character and remembers its role.',
    author: 'Sarah K.',
    role: 'Software Engineer',
    rating: 5,
  },
  {
    quote:
      'The onboarding flow is gorgeous. I picked three companions in under a minute and was chatting immediately.',
    author: 'Marcus T.',
    role: 'Content Creator',
    rating: 5,
  },
  {
    quote:
      'Finally an AI app that doesn\'t feel like a generic chat window. The workspace layout is exactly what I needed.',
    author: 'Elena R.',
    role: 'Product Designer',
    rating: 5,
  },
];

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="scroll-mt-24 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <p className="section-eyebrow">Reviews</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Loved by builders and creators
          </h2>
          <p className="mt-5 text-lg text-muted-foreground">
            See why people choose AI Companion for their daily AI workflow.
          </p>
        </ScrollReveal>

        <div className="mt-16 grid gap-5 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <ScrollReveal key={t.author} delay={i * 100}>
              <div className="flex h-full flex-col rounded-3xl border border-border/50 bg-card p-8 shadow-elevated">
                <div className="mb-4 flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star
                      key={j}
                      className="h-4 w-4 fill-chart-5 text-chart-5"
                    />
                  ))}
                </div>
                <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="mt-6 border-t border-border/40 pt-4">
                  <p className="font-bold">{t.author}</p>
                  <p className="text-sm text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
