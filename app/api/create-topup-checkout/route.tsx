import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

import {
  TOKEN_TOPUP_PRICE_CENTS,
  TOKEN_TOPUP_TOKENS,
} from '@/lib/billing/constants';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(req: NextRequest) {
  try {
    const { customerId, userId, successUrl, cancelUrl } = await req.json();

    if (!customerId || !userId) {
      return NextResponse.json(
        { error: 'Customer ID and user ID are required' },
        { status: 400 }
      );
    }

    const topupPriceId = process.env.NEXT_PUBLIC_STRIPE_TOPUP_PRICE_ID;

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
      topupPriceId
        ? [{ price: topupPriceId, quantity: 1 }]
        : [
            {
              price_data: {
                currency: 'usd',
                unit_amount: TOKEN_TOPUP_PRICE_CENTS,
                product_data: {
                  name: 'Token Top-Up',
                  description: `${TOKEN_TOPUP_TOKENS.toLocaleString()} additional chat tokens`,
                },
              },
              quantity: 1,
            },
          ];

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        type: 'token_topup',
        userId,
        tokenAmount: String(TOKEN_TOPUP_TOKENS),
      },
    });

    return NextResponse.json(session);
  } catch (error) {
    console.error('Error creating top-up checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create top-up checkout session' },
      { status: 500 }
    );
  }
}
