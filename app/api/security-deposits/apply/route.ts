'use server';

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, PaymentMethod, SecurityDepositStatus } from '@prisma/client';
import { jazzcashService } from '@/lib/payments/jazzcash';
import { easypaisaService } from '@/lib/payments/easypaisa';
import { stripeService } from '@/lib/payments/stripe';

const prisma = new PrismaClient();

const SECURITY_DEPOSIT_AMOUNT = 2500000; // PKR 25 Lakh

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, paymentMethod } = body;

    if (!userId || !paymentMethod) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already has pending/approved deposit
    const existingDeposit = await prisma.securityDeposit.findFirst({
      where: {
        userId,
        status: { in: ['PENDING', 'APPROVED'] },
      },
    });

    if (existingDeposit) {
      return NextResponse.json(
        {
          error:
            existingDeposit.status === 'APPROVED'
              ? 'You already have an approved security deposit'
              : 'You already have a pending security deposit application',
        },
        { status: 400 }
      );
    }

    // Create security deposit record
    const deposit = await prisma.securityDeposit.create({
      data: {
        userId,
        amount: BigInt(SECURITY_DEPOSIT_AMOUNT),
        currency: 'PKR',
        status: 'PENDING',
      },
    });

    // Create associated payment
    const payment = await prisma.payment.create({
      data: {
        userId,
        amount: BigInt(SECURITY_DEPOSIT_AMOUNT) / BigInt(100),
        currency: 'PKR',
        status: 'PENDING',
        description: 'Security Deposit for Premium License',
        paymentMethod: paymentMethod as PaymentMethod,
        metadata: JSON.stringify({
          depositId: deposit.id,
          type: 'SECURITY_DEPOSIT',
        }),
      },
    });

    // Process payment
    let response;
    const paymentRequest = {
      userId,
      amount: SECURITY_DEPOSIT_AMOUNT / 100,
      currency: 'PKR',
      description: 'Security Deposit for Premium License',
      gateway: paymentMethod,
      metadata: {
        depositId: deposit.id,
        type: 'SECURITY_DEPOSIT',
        paymentId: payment.id,
      },
    };

    if (paymentMethod === 'JAZZCASH') {
      response = await jazzcashService.createPayment(paymentRequest);
      if (response.success) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: { jazzcashRefId: response.transactionId },
        });
        await prisma.securityDeposit.update({
          where: { id: deposit.id },
          data: { transactionId: response.transactionId },
        });
      }
    } else if (paymentMethod === 'EASYPAISA') {
      response = await easypaisaService.createPayment(paymentRequest);
      if (response.success) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: { easypaiaRefId: response.transactionId },
        });
        await prisma.securityDeposit.update({
          where: { id: deposit.id },
          data: { transactionId: response.transactionId },
        });
      }
    } else if (paymentMethod === 'STRIPE') {
      response = await stripeService.createPayment(paymentRequest);
      if (response.success) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: { stripePaymentId: response.transactionId },
        });
        await prisma.securityDeposit.update({
          where: { id: deposit.id },
          data: { transactionId: response.transactionId },
        });
      }
    } else {
      return NextResponse.json(
        { error: 'Unsupported payment method' },
        { status: 400 }
      );
    }

    if (!response.success) {
      await prisma.securityDeposit.update({
        where: { id: deposit.id },
        data: { status: 'REJECTED' },
      });

      return NextResponse.json(
        { error: response.error || 'Payment creation failed' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      depositId: deposit.id,
      paymentId: payment.id,
      redirectUrl: response.redirectUrl,
    });
  } catch (error) {
    console.error('[SECURITY DEPOSIT API] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
