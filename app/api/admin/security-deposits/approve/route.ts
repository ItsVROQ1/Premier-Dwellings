'use server';

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { notificationService } from '@/lib/notifications/service';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Verify admin role - you would add proper auth middleware
    const body = await request.json();
    const { depositId, adminId, approved = true, rejectionReason } = body;

    if (!depositId || !adminId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify admin user
    const adminUser = await prisma.user.findUnique({
      where: { id: adminId },
    });

    if (!adminUser || adminUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Find deposit
    const deposit = await prisma.securityDeposit.findUnique({
      where: { id: depositId },
      include: { user: true },
    });

    if (!deposit) {
      return NextResponse.json(
        { error: 'Deposit not found' },
        { status: 404 }
      );
    }

    if (approved) {
      // Approve deposit
      await prisma.securityDeposit.update({
        where: { id: depositId },
        data: {
          status: 'APPROVED',
          approvedAt: new Date(),
          approvedBy: adminId,
        },
      });

      // Update user to premium license
      await prisma.user.update({
        where: { id: deposit.userId },
        data: {
          isPremiumLicense: true,
          premiumTick: true,
        },
      });

      // Send notification
      await notificationService.notifySecurityDepositApproval(deposit.userId, {
        amount: Number(deposit.amount),
        currency: deposit.currency,
      });

      await notificationService.notifyPremiumLicenseApproval(
        deposit.userId,
        deposit.user.firstName || 'Agent'
      );
    } else {
      // Reject deposit
      await prisma.securityDeposit.update({
        where: { id: depositId },
        data: {
          status: 'REJECTED',
          rejectedAt: new Date(),
          rejectionReason,
        },
      });

      // Send notification about rejection
      await notificationService.notify({
        userId: deposit.userId,
        type: 'SECURITY_DEPOSIT_REJECTED',
        title: 'Security Deposit Rejected',
        message: rejectionReason || 'Your security deposit application has been rejected',
        channels: [],
        metadata: { reason: rejectionReason },
      });
    }

    return NextResponse.json({
      success: true,
      message: approved ? 'Deposit approved successfully' : 'Deposit rejected',
    });
  } catch (error) {
    console.error('[ADMIN SECURITY DEPOSIT API] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
