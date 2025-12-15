'use server';

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, PlanTier } from '@prisma/client';
import { jazzcashService } from '@/lib/payments/jazzcash';
import { subscriptionManager } from '@/lib/subscription';
import { notificationService } from '@/lib/notifications/service';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Verify webhook signature
    if (!jazzcashService.verifyWebhook(data)) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const transactionId = data.pp_merchant_ref;
    const status = data.pp_status === '1' ? 'COMPLETED' : 'FAILED';

    // Find payment in database
    const payment = await prisma.payment.findFirst({
      where: {
        jazzcashRefId: transactionId,
      },
      include: { user: true },
    });

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Update payment status
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status,
        processedAt: new Date(),
        transactionId: data.pp_transaction_id || transactionId,
        failureReason: status === 'FAILED' ? data.pp_status_description : null,
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
    } else {
      // Send failure notification
      await notificationService.notifyPaymentFailure(payment.userId, {
        amount: Number(payment.amount),
        currency: payment.currency,
        reason: data.pp_status_description || 'Payment declined',
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[JAZZCASH WEBHOOK] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// JazzCash GET callback support
export async function GET(request: NextRequest) {
  return POST(request as any);
}
