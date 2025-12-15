'use server';

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, PlanTier } from '@prisma/client';
import { easypaisaService } from '@/lib/payments/easypaisa';
import { subscriptionManager } from '@/lib/subscription';
import { notificationService } from '@/lib/notifications/service';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const data: Record<string, string> = {};
    
    // Parse form-encoded or JSON body
    const contentType = request.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      Object.assign(data, JSON.parse(body));
    } else {
      const params = new URLSearchParams(body);
      params.forEach((value, key) => {
        data[key] = value;
      });
    }

    // Verify webhook signature
    if (!easypaisaService.verifyWebhook(data)) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const transactionId = data.transactionId;
    const status = data.transactionStatus === 'SUCCESS' ? 'COMPLETED' : 'FAILED';

    // Find payment in database
    const payment = await prisma.payment.findFirst({
      where: {
        easypaiaRefId: transactionId,
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
        transactionId,
        failureReason: status === 'FAILED' ? data.transactionFailureReason : null,
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
        reason: data.transactionFailureReason || 'Payment declined',
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[EASYPAISA WEBHOOK] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Easypaisa GET callback support
export async function GET(request: NextRequest) {
  const data: Record<string, string> = {};
  const searchParams = request.nextUrl.searchParams;
  searchParams.forEach((value, key) => {
    data[key] = value;
  });

  // Recreate request body for processing
  const mockRequest = new NextRequest(request, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'content-type': 'application/json' },
  });

  return POST(mockRequest as any);
}
