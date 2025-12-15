'use server';

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, PaymentMethod } from '@prisma/client';
import { jazzcashService } from '@/lib/payments/jazzcash';
import { easypaisaService } from '@/lib/payments/easypaisa';
import { stripeService } from '@/lib/payments/stripe';
import { notificationService } from '@/lib/notifications/service';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      amount,
      currency = 'PKR',
      description,
      paymentMethod,
      planTier,
      billingPeriod,
      invoiceNumber,
    } = body;

    if (!userId || !amount || !paymentMethod) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create payment record in database
    const payment = await prisma.payment.create({
      data: {
        userId,
        amount: BigInt(Math.round(amount * 100)) / BigInt(100),
        currency,
        status: 'PENDING',
        description,
        paymentMethod: paymentMethod as PaymentMethod,
        invoiceNumber: invoiceNumber || `INV-${Date.now()}`,
      },
    });

    let response;
    const paymentRequest = {
      userId,
      amount,
      currency,
      description,
      gateway: paymentMethod,
      invoiceNumber: payment.invoiceNumber,
      metadata: {
        planTier,
        billingPeriod,
        paymentId: payment.id,
      },
    };

    // Route to appropriate payment gateway
    if (paymentMethod === 'JAZZCASH') {
      response = await jazzcashService.createPayment(paymentRequest);
      if (response.success) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: { jazzcashRefId: response.transactionId },
        });
      }
    } else if (paymentMethod === 'EASYPAISA') {
      response = await easypaisaService.createPayment(paymentRequest);
      if (response.success) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: { easypaiaRefId: response.transactionId },
        });
      }
    } else if (paymentMethod === 'STRIPE') {
      response = await stripeService.createPayment(paymentRequest);
      if (response.success) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: { stripePaymentId: response.transactionId },
        });
      }
    } else {
      return NextResponse.json(
        { error: 'Unsupported payment method' },
        { status: 400 }
      );
    }

    if (!response.success) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'FAILED',
          failureReason: response.error,
        },
      });

      return NextResponse.json(
        { error: response.error || 'Payment creation failed' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      transactionId: response.transactionId,
      redirectUrl: response.redirectUrl,
    });
  } catch (error) {
    console.error('[PAYMENT API] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
