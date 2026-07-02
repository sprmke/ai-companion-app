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
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      );
    }

    if (session.mode !== 'payment' || session.metadata?.type !== 'token_topup') {
      return NextResponse.json(
        { error: 'Invalid session type' },
        { status: 400 }
      );
    }

    const userId = session.metadata.userId as Id<'users'>;
    const amount = Number.parseInt(session.metadata.tokenAmount ?? '0', 10);

    if (!userId || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid session metadata' },
        { status: 400 }
      );
    }

    const result = await convex.mutation(api.users.ApplyTokenTopup, {
      userId,
      sessionId,
      amount,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error confirming top-up:', error);
    return NextResponse.json(
      { error: 'Failed to confirm top-up' },
      { status: 500 }
    );
  }
}
