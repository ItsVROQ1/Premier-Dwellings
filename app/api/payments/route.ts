import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { processPayment, CreatePaymentSchema } from '@/lib/payment';

/**
 * POST /api/payments
 * Create a payment for subscription or listing fees
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = CreatePaymentSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid request body',
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const paymentInput = validationResult.data;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: paymentInput.userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        userId: paymentInput.userId,
        amount: paymentInput.amount,
        currency: paymentInput.currency,
        description: paymentInput.description,
        paymentMethod: paymentInput.paymentMethod,
        status: 'PENDING',
      },
    });

    // Process payment with selected gateway
    const result = await processPayment(paymentInput);

    if (!result.success) {
      // Update payment status to failed
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'FAILED',
          failureReason: result.message,
        },
      });

      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    // Update payment with transaction ID
    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        transactionId: result.transactionId,
        status: result.status,
      },
    });

    return NextResponse.json(
      {
        success: true,
        payment: updatedPayment,
        transactionId: result.transactionId,
        message: result.message,
        status: result.status,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/payments
 * List payments for a user (query parameter: userId)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId query parameter is required' },
        { status: 400 }
      );
    }

    const payments = await prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json(
      {
        success: true,
        payments,
        count: payments.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Payment fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
