import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/payment';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/payments/webhook/stripe
 * Handle Stripe webhook events
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as any;
        console.log('Payment Intent Succeeded:', paymentIntent.id);

        // Update payment record
        if (paymentIntent.metadata?.userId) {
          await prisma.payment.updateMany({
            where: {
              userId: paymentIntent.metadata.userId,
              transactionId: paymentIntent.id,
            },
            data: {
              status: 'COMPLETED',
              processedAt: new Date(),
            },
          });

          console.log(
            `Payment completed for user ${paymentIntent.metadata.userId}`
          );
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as any;
        console.log('Payment Intent Failed:', paymentIntent.id);

        // Update payment record
        if (paymentIntent.metadata?.userId) {
          await prisma.payment.updateMany({
            where: {
              userId: paymentIntent.metadata.userId,
              transactionId: paymentIntent.id,
            },
            data: {
              status: 'FAILED',
              failureReason: paymentIntent.last_payment_error?.message || 'Payment failed',
            },
          });

          console.log(
            `Payment failed for user ${paymentIntent.metadata.userId}`
          );
        }
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as any;
        console.log('Charge Refunded:', charge.id);

        // Update payment record
        const payment = await prisma.payment.findFirst({
          where: {
            transactionId: charge.payment_intent,
          },
        });

        if (payment) {
          await prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: 'REFUNDED',
              processedAt: new Date(),
            },
          });

          console.log(`Payment refunded: ${charge.id}`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json(
      { success: true, received: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
