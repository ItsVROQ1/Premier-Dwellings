'use server';

import { PrismaClient } from '@prisma/client';
import { notificationService } from '@/lib/notifications/service';

const prisma = new PrismaClient();

/**
 * Get all pending security deposits
 */
export async function getPendingSecurityDeposits(adminId: string) {
  try {
    // Verify admin
    const admin = await prisma.user.findUnique({ where: { id: adminId } });
    if (!admin || admin.role !== 'ADMIN') {
      return { error: 'Unauthorized' };
    }

    const deposits = await prisma.securityDeposit.findMany({
      where: { status: 'PENDING' },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });

    return deposits.map((d) => ({
      id: d.id,
      userId: d.userId,
      userName: `${d.user.firstName} ${d.user.lastName}`,
      userEmail: d.user.email,
      amount: Number(d.amount),
      currency: d.currency,
      appliedAt: d.createdAt,
      transactionId: d.transactionId,
    }));
  } catch (error) {
    return { error: 'Failed to fetch deposits' };
  }
}

/**
 * Approve security deposit
 */
export async function approveSecurityDeposit(
  adminId: string,
  depositId: string
) {
  try {
    const admin = await prisma.user.findUnique({ where: { id: adminId } });
    if (!admin || admin.role !== 'ADMIN') {
      return { error: 'Unauthorized' };
    }

    const deposit = await prisma.securityDeposit.findUnique({
      where: { id: depositId },
      include: { user: true },
    });

    if (!deposit) {
      return { error: 'Deposit not found' };
    }

    // Update deposit
    await prisma.securityDeposit.update({
      where: { id: depositId },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
        approvedBy: adminId,
      },
    });

    // Update user
    await prisma.user.update({
      where: { id: deposit.userId },
      data: {
        isPremiumLicense: true,
        premiumTick: true,
      },
    });

    // Send notifications
    await notificationService.notifySecurityDepositApproval(deposit.userId, {
      amount: Number(deposit.amount),
      currency: deposit.currency,
    });

    await notificationService.notifyPremiumLicenseApproval(
      deposit.userId,
      deposit.user.firstName || 'Agent'
    );

    return { success: true, message: 'Deposit approved successfully' };
  } catch (error) {
    return { error: 'Failed to approve deposit' };
  }
}

/**
 * Reject security deposit
 */
export async function rejectSecurityDeposit(
  adminId: string,
  depositId: string,
  reason: string
) {
  try {
    const admin = await prisma.user.findUnique({ where: { id: adminId } });
    if (!admin || admin.role !== 'ADMIN') {
      return { error: 'Unauthorized' };
    }

    const deposit = await prisma.securityDeposit.findUnique({
      where: { id: depositId },
      include: { user: true },
    });

    if (!deposit) {
      return { error: 'Deposit not found' };
    }

    // Update deposit
    await prisma.securityDeposit.update({
      where: { id: depositId },
      data: {
        status: 'REJECTED',
        rejectionReason: reason,
        rejectedAt: new Date(),
      },
    });

    // Send notification
    await notificationService.notify({
      userId: deposit.userId,
      type: 'SECURITY_DEPOSIT_REJECTED',
      title: 'Security Deposit Rejected',
      message: `Your security deposit application has been rejected. Reason: ${reason}`,
      channels: [],
      metadata: { reason },
    });

    return { success: true, message: 'Deposit rejected successfully' };
  } catch (error) {
    return { error: 'Failed to reject deposit' };
  }
}

/**
 * Get all payments (for admin dashboard)
 */
export async function getAllPayments(
  adminId: string,
  limit: number = 50,
  offset: number = 0
) {
  try {
    const admin = await prisma.user.findUnique({ where: { id: adminId } });
    if (!admin || admin.role !== 'ADMIN') {
      return { error: 'Unauthorized' };
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        include: { user: { select: { email: true, firstName: true, lastName: true } } },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.payment.count(),
    ]);

    return {
      payments: payments.map((p) => ({
        id: p.id,
        userId: p.userId,
        userName: `${p.user.firstName} ${p.user.lastName}`,
        userEmail: p.user.email,
        amount: Number(p.amount),
        currency: p.currency,
        status: p.status,
        method: p.paymentMethod,
        transactionId: p.transactionId,
        invoiceNumber: p.invoiceNumber,
        createdAt: p.createdAt,
        processedAt: p.processedAt,
      })),
      total,
      limit,
      offset,
    };
  } catch (error) {
    return { error: 'Failed to fetch payments' };
  }
}

/**
 * Toggle premium tick (blue check) for an agent
 */
export async function togglePremiumTick(adminId: string, agentId: string) {
  try {
    const admin = await prisma.user.findUnique({ where: { id: adminId } });
    if (!admin || admin.role !== 'ADMIN') {
      return { error: 'Unauthorized' };
    }

    const agent = await prisma.user.findUnique({ where: { id: agentId } });
    if (!agent) {
      return { error: 'Agent not found' };
    }

    const updated = await prisma.user.update({
      where: { id: agentId },
      data: { premiumTick: !agent.premiumTick },
    });

    return {
      success: true,
      message: `Premium tick ${updated.premiumTick ? 'enabled' : 'disabled'}`,
      premiumTick: updated.premiumTick,
    };
  } catch (error) {
    return { error: 'Failed to toggle premium tick' };
  }
}

/**
 * Process refund
 */
export async function processRefund(
  adminId: string,
  paymentId: string,
  amount: number,
  reason: string
) {
  try {
    const admin = await prisma.user.findUnique({ where: { id: adminId } });
    if (!admin || admin.role !== 'ADMIN') {
      return { error: 'Unauthorized' };
    }

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { user: true },
    });

    if (!payment) {
      return { error: 'Payment not found' };
    }

    // Update payment status
    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'REFUNDED',
        failureReason: reason,
      },
    });

    // If this was a deposit, also update deposit
    const deposit = await prisma.securityDeposit.findFirst({
      where: { paymentId },
    });

    if (deposit) {
      await prisma.securityDeposit.update({
        where: { id: deposit.id },
        data: {
          status: 'REFUNDED',
          refundedAt: new Date(),
          refundAmount: BigInt(Math.round(amount * 100)),
          refundReason: reason,
        },
      });
    }

    // Send notification
    await notificationService.notifyPaymentSuccess(payment.userId, {
      amount,
      currency: payment.currency,
      transactionId: `REFUND-${paymentId}`,
      description: `Refund: ${reason}`,
    });

    return {
      success: true,
      message: 'Refund processed successfully',
    };
  } catch (error) {
    return { error: 'Failed to process refund' };
  }
}

/**
 * Get subscription statistics
 */
export async function getSubscriptionStats(adminId: string) {
  try {
    const admin = await prisma.user.findUnique({ where: { id: adminId } });
    if (!admin || admin.role !== 'ADMIN') {
      return { error: 'Unauthorized' };
    }

    const stats = await Promise.all([
      prisma.user.groupBy({
        by: ['currentPlan'],
        _count: true,
      }),
      prisma.subscription.aggregate({
        where: { isActive: true },
        _count: true,
      }),
      prisma.payment.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true },
      }),
    ]);

    return {
      usersByPlan: stats[0],
      activeSubscriptions: stats[1]._count,
      totalRevenue: stats[2]._sum.amount,
    };
  } catch (error) {
    return { error: 'Failed to fetch statistics' };
  }
}
