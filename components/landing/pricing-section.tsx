'use client';

import Link from 'next/link';
import { Check, Crown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthCta } from '@/hooks/use-auth-cta';
import { ScrollReveal } from './scroll-reveal';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for exploring your first companions.',
    badge: 'Starter',
    features: [
      '5,000 tokens included',
      'Curated AI companions',
      'Custom companion creation',
      'Multi-model support',
    ],
    ctaGuest: 'Get Started',
    ctaAuth: 'Open Workspace',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$10',
    period: '/month',
    description: 'For power users who chat daily with their AI team.',
    badge: 'Most Popular',
    features: [
      '10,000 tokens / month',
      'Everything in Free',
      'Priority model access',
      'Stripe-managed billing',
      'Cancel anytime',
    ],
    ctaGuest: 'Start Pro Trial',
    ctaAuth: 'Open Workspace',
    highlighted: true,
  },
];

export function PricingSection() {
  const { isAuthLoading, isAuthenticated, primaryHref } = useAuthCta();

  return (
    <section id="pricing" className="scroll-mt-24 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <p className="section-eyebrow">Pricing</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Simple plans, serious AI power
          </h2>
          <p className="mt-5 text-lg text-muted-foreground">
            Start free and upgrade when you need more tokens. No hidden fees.
          </p>
        </ScrollReveal>

        <div className="mt-16 grid gap-6 md:grid-cols-2 md:gap-8 lg:mx-auto lg:max-w-4xl">
          {plans.map((plan, i) => (
            <ScrollReveal key={plan.name} delay={i * 100}>
              <div
                className={`relative flex h-full flex-col rounded-3xl border p-8 shadow-elevated transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated-lg ${
                  plan.highlighted
                    ? 'border-primary/40 bg-gradient-to-b from-primary/5 to-card ring-1 ring-primary/20'
                    : 'border-border/50 bg-card'
                }`}
              >
                {plan.highlighted && (
                  <Badge variant="pro" className="absolute -top-3 left-6 px-3 py-1">
                    <Crown className="mr-1 h-3 w-3" />
                    {plan.badge}
                  </Badge>
                )}
                {!plan.highlighted && (
                  <Badge className="absolute -top-3 left-6 px-3 py-1">
                    {plan.badge}
                  </Badge>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {plan.description}
                  </p>
                  <div className="mt-5 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold tracking-tight">
                      {plan.price}
                    </span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                </div>

                <ul className="mb-8 flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm">
                      <span className="icon-well-sm mt-0.5 bg-chart-2/12 text-chart-2">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>

                {isAuthLoading ? (
                  <Skeleton className="h-11 w-full rounded-2xl" />
                ) : (
                  <Link href={primaryHref}>
                    <Button
                      size="lg"
                      variant={plan.highlighted ? 'default' : 'outline'}
                      className="w-full rounded-2xl"
                    >
                      {plan.highlighted && <Sparkles className="h-4 w-4" />}
                      {isAuthenticated ? plan.ctaAuth : plan.ctaGuest}
                    </Button>
                  </Link>
                )}
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
