import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { ConvexHttpClient } from 'convex/browser';

import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { resolveActiveSubscriptionId } from '@/lib/billing/resolve-subscription';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
  try {
    const { subscriptionId, stripeCustomerId, userId } = await req.json();

    const resolvedId = await resolveActiveSubscriptionId(stripe, {
      subscriptionId,
      stripeCustomerId,
    });

    if (!resolvedId) {
      return NextResponse.json(
        {
          error:
            'No active Stripe subscription found. Try refreshing your account or contact support.',
        },
        { status: 400 }
      );
    }

    const subscription = await stripe.subscriptions.update(resolvedId, {
      cancel_at_period_end: true,
    });

    if (userId) {
      try {
        await convex.mutation(api.users.ClearUserOrderId, {
          userId: userId as Id<'users'>,
        });
      } catch (convexError) {
        console.error('Error updating user orderId:', convexError);
      }
    }

    return NextResponse.json({
      success: true,
      subscription,
      message: 'Subscription will be canceled at the end of the current period',
    });
  } catch (error) {
    console.error('Error canceling subscription:', error);

    const message =
      error instanceof Stripe.errors.StripeError
        ? error.message
        : 'Failed to cancel subscription';

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
