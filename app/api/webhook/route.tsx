import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const PRO_PLAN_CREDITS = 10000;

// GET endpoint for testing webhook accessibility
export async function GET() {
  return NextResponse.json({
    message: 'Webhook endpoint is accessible',
    timestamp: new Date().toISOString(),
    hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
    hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
    hasConvexUrl: !!process.env.NEXT_PUBLIC_CONVEX_URL,
  });
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature') as string;

  console.log('Webhook received:', {
    bodyLength: body.length,
    hasSignature: !!signature,
    webhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
  });

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    console.log('Webhook signature verified successfully');
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  console.log('Processing webhook event:', event.type);

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('Checkout session completed:', {
          sessionId: session.id,
          paymentStatus: session.payment_status,
          customerId: session.customer,
          customerEmail: session.customer_details?.email,
          subscription: session.subscription,
        });

        if (session.payment_status === 'paid' && session.customer) {
          const customerId = session.customer as string;

          // Try to find user by Stripe customer ID first
          let user = await convex.query(api.users.GetUserByStripeCustomerId, {
            stripeCustomerId: customerId,
          });
          console.log('User lookup by Stripe customer ID:', {
            customerId,
            userFound: !!user,
          });

          // Fallback to email lookup if not found by customer ID
          if (!user && session.customer_details?.email) {
            user = await convex.query(api.users.GetUser, {
              email: session.customer_details.email,
            });
            console.log('User lookup by email:', {
              email: session.customer_details.email,
              userFound: !!user,
            });
          }

          if (user) {
            const isTokenTopUp =
              session.mode === 'payment' &&
              session.metadata?.type === 'token_topup';
            const topupAmount = Number.parseInt(
              session.metadata?.tokenAmount ?? '0',
              10
            );

            if (isTokenTopUp && topupAmount > 0) {
              console.log('Adding top-up tokens:', {
                userId: user._id,
                currentCredits: user.credits,
                topupAmount,
              });

              await convex.mutation(api.users.ApplyTokenTopup, {
                userId: user._id,
                sessionId: session.id,
                amount: topupAmount,
              });

              console.log(
                `Added ${topupAmount} top-up tokens for user ${user.email}`
              );
            } else if (session.subscription) {
              console.log('Updating user credits:', {
                userId: user._id,
                currentCredits: user.credits,
                newCredits: PRO_PLAN_CREDITS,
                subscription: session.subscription,
              });

              // Set (not add) the Pro allowance. The first payment fires both
              // `checkout.session.completed` and `invoice.payment_succeeded`, so
              // setting keeps the grant idempotent and the usage meter accurate.
              await convex.mutation(api.users.UpdateUserTokens, {
                userId: user._id,
                credits: PRO_PLAN_CREDITS,
                orderId: session.subscription as string,
              });

              console.log(
                `Updated credits for user ${user.email} after successful payment`
              );
            }
          } else {
            console.error('No user found for customer:', customerId);
          }
        } else {
          console.log('Session not paid or no customer:', {
            paymentStatus: session.payment_status,
            hasCustomer: !!session.customer,
          });
        }
        break;

      case 'invoice.payment_succeeded':
        const invoice = event.data.object as Stripe.Invoice;
        console.log('Invoice payment succeeded:', {
          invoiceId: invoice.id,
          customerId: invoice.customer,
          subscription: invoice.subscription,
        });

        if (invoice.customer && invoice.subscription) {
          const customerId = invoice.customer as string;

          // Try to find user by Stripe customer ID first
          let user = await convex.query(api.users.GetUserByStripeCustomerId, {
            stripeCustomerId: customerId,
          });
          console.log('User lookup by Stripe customer ID (invoice):', {
            customerId,
            userFound: !!user,
          });

          // Fallback to email lookup if not found by customer ID
          if (!user) {
            const customer = (await stripe.customers.retrieve(
              customerId
            )) as Stripe.Customer;
            if (customer.email) {
              user = await convex.query(api.users.GetUser, {
                email: customer.email,
              });
              console.log('User lookup by email (invoice):', {
                email: customer.email,
                userFound: !!user,
              });
            }
          }

          if (user) {
            console.log('Updating user credits (invoice):', {
              userId: user._id,
              currentCredits: user.credits,
              newCredits: PRO_PLAN_CREDITS,
              subscription: invoice.subscription,
            });

            // Each billing cycle resets the balance to the monthly Pro allowance.
            await convex.mutation(api.users.UpdateUserTokens, {
              userId: user._id,
              credits: PRO_PLAN_CREDITS,
              orderId: invoice.subscription as string,
            });

            console.log(
              `Updated credits for user ${user.email} after recurring payment`
            );
          } else {
            console.error('No user found for customer (invoice):', customerId);
          }
        }
        break;

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription;
        console.log('Subscription deleted:', {
          subscriptionId: deletedSubscription.id,
          customerId: deletedSubscription.customer,
        });

        if (deletedSubscription.customer) {
          const customerId = deletedSubscription.customer as string;

          // Try to find user by Stripe customer ID first
          let user = await convex.query(api.users.GetUserByStripeCustomerId, {
            stripeCustomerId: customerId,
          });
          console.log('User lookup by Stripe customer ID (deletion):', {
            customerId,
            userFound: !!user,
          });

          // Fallback to email lookup if not found by customer ID
          if (!user) {
            const customer = (await stripe.customers.retrieve(
              customerId
            )) as Stripe.Customer;
            if (customer.email) {
              user = await convex.query(api.users.GetUser, {
                email: customer.email,
              });
              console.log('User lookup by email (deletion):', {
                email: customer.email,
                userFound: !!user,
              });
            }
          }

          if (user) {
            console.log('Clearing user orderId after subscription deletion:', {
              userId: user._id,
              email: user.email,
            });

            await convex.mutation(api.users.ClearUserOrderId, {
              userId: user._id,
            });

            console.log(
              `Cleared orderId for user ${user.email} after subscription deletion`
            );
          } else {
            console.error('No user found for customer (deletion):', customerId);
          }
        }
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
