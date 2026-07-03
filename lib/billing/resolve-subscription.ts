import type Stripe from 'stripe';

import { isStripeSubscriptionId } from '@/lib/billing/stripe';

const ACTIVE_STATUSES: Stripe.Subscription.Status[] = [
  'active',
  'trialing',
  'past_due',
];

/** Resolve a cancellable Stripe subscription ID from stored id and/or customer id. */
export async function resolveActiveSubscriptionId(
  stripe: Stripe,
  opts: {
    subscriptionId?: string | null;
    stripeCustomerId?: string | null;
  }
): Promise<string | null> {
  if (isStripeSubscriptionId(opts.subscriptionId)) {
    return opts.subscriptionId;
  }

  if (!opts.stripeCustomerId) {
    return null;
  }

  for (const status of ACTIVE_STATUSES) {
    const { data } = await stripe.subscriptions.list({
      customer: opts.stripeCustomerId,
      status,
      limit: 1,
    });

    if (data[0]?.id) {
      return data[0].id;
    }
  }

  return null;
}
