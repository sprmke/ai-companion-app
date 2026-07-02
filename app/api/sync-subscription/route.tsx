import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { ConvexHttpClient } from 'convex/browser';

import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { resolveActiveSubscriptionId } from '@/lib/billing/resolve-subscription';
import { isStripeSubscriptionId } from '@/lib/billing/stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
  try {
    const { userId, stripeCustomerId, orderId } = await req.json();

    if (!userId || !stripeCustomerId) {
      return NextResponse.json(
        { error: 'User ID and Stripe customer ID are required' },
        { status: 400 }
      );
    }

    const subscriptionId = await resolveActiveSubscriptionId(stripe, {
      subscriptionId: orderId,
      stripeCustomerId,
    });

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'No active subscription found for this customer' },
        { status: 404 }
      );
    }

    if (!isStripeSubscriptionId(orderId) || orderId !== subscriptionId) {
      await convex.mutation(api.users.SetUserOrderId, {
        userId: userId as Id<'users'>,
        orderId: subscriptionId,
      });
    }

    return NextResponse.json({ orderId: subscriptionId });
  } catch (error) {
    console.error('Error syncing subscription:', error);
    return NextResponse.json(
      { error: 'Failed to sync subscription' },
      { status: 500 }
    );
  }
}
