'use server';

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, PlanTier } from '@prisma/client';
import { stripeService } from '@/lib/payments/stripe';
import { subscriptionManager } from '@/lib/subscription';
import { notificationService } from '@/lib/notifications/service';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    if (!stripeService.verifyWebhookSignature(body, signature)) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const event = JSON.parse(body);
    const processedEvent = stripeService.processWebhookEvent(event);

    if (!processedEvent) {
      // Event type not relevant, but valid
      return NextResponse.json({ received: true });
    }

    const { transactionId, status } = processedEvent;

    // Find payment in database
    const payment = await prisma.payment.findFirst({
      where: {
        stripePaymentId: transactionId,
      },
      include: { user: true },
    });

    if (!payment) {
      console.log(`[STRIPE WEBHOOK] Payment not found for transaction ${transactionId}`);
      return NextResponse.json({ received: true });
    }

    // Update payment status
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: status as any,
        processedAt: new Date(),
        transactionId,
        failureReason: processedEvent.error || null,
      },
    });

    if (status === 'COMPLETED') {
      // Handle successful payment
      const metadata = payment.metadata ? JSON.parse(payment.metadata) : {};
      
      if (metadata.planTier) {
        // Activate subscription
        await subscriptionManager.activateSubscription(
          payment.userId,
          metadata.planTier as PlanTier,
          metadata.billingPeriod || 'MONTHLY'
        );
      }

      // Send success notification
      await notificationService.notifyPaymentSuccess(payment.userId, {
        amount: Number(payment.amount),
        currency: payment.currency,
        transactionId,
        description: payment.description || 'Payment',
      });
    } else if (status === 'FAILED') {
      // Send failure notification
      await notificationService.notifyPaymentFailure(payment.userId, {
        amount: Number(payment.amount),
        currency: payment.currency,
        reason: processedEvent.error || 'Payment declined',
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[STRIPE WEBHOOK] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
