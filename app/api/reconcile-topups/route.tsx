import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { ConvexHttpClient } from 'convex/browser';

import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
  try {
    const { userId, stripeCustomerId } = await req.json();

    if (!userId || !stripeCustomerId) {
      return NextResponse.json(
        { error: 'User ID and Stripe customer ID are required' },
        { status: 400 }
      );
    }

    const sessions = await stripe.checkout.sessions.list({
      customer: stripeCustomerId,
      limit: 20,
    });

    let credits = 0;
    let topupCredits = 0;
    let applied = 0;

    for (const session of sessions.data) {
      if (
        session.payment_status !== 'paid' ||
        session.mode !== 'payment' ||
        session.metadata?.type !== 'token_topup'
      ) {
        continue;
      }

      const amount = Number.parseInt(session.metadata.tokenAmount ?? '0', 10);
      if (amount <= 0) continue;

      const result = await convex.mutation(api.users.ApplyTokenTopup, {
        userId: userId as Id<'users'>,
        sessionId: session.id,
        amount,
      });

      credits = result.credits;
      topupCredits = result.topupCredits;
      if (!result.alreadyProcessed) applied += 1;
    }

    return NextResponse.json({ credits, topupCredits, applied });
  } catch (error) {
    console.error('Error reconciling top-ups:', error);
    return NextResponse.json(
      { error: 'Failed to reconcile top-ups' },
      { status: 500 }
    );
  }
}
