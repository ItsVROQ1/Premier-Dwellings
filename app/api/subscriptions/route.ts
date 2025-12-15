import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PlanTier } from '@/lib/generated/prisma/enums';

/**
 * POST /api/subscriptions
 * Create or upgrade a subscription
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, planTier } = body;

    if (!userId || !planTier) {
      return NextResponse.json(
        { error: 'userId and planTier are required' },
        { status: 400 }
      );
    }

    // Validate planTier
    const validTiers = Object.values(PlanTier);
    if (!validTiers.includes(planTier)) {
      return NextResponse.json(
        { error: 'Invalid plan tier' },
        { status: 400 }
      );
    }

    // Get plan configuration
    const planConfig = await prisma.planTierConfig.findUnique({
      where: { tier: planTier },
    });

    if (!planConfig) {
      return NextResponse.json(
        { error: 'Plan tier not found' },
        { status: 404 }
      );
    }

    // Calculate subscription dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + planConfig.billingPeriod);

    // Check if user already has a subscription
    const existingSubscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    let subscription;

    if (existingSubscription) {
      // Update existing subscription
      subscription = await prisma.subscription.update({
        where: { userId },
        data: {
          planTier,
          status: 'active',
          startDate,
          endDate,
          listingsUsed: 0,
          listingsLimit: planConfig.maxListings === -1 ? 999999 : planConfig.maxListings,
        },
      });
    } else {
      // Create new subscription
      subscription = await prisma.subscription.create({
        data: {
          userId,
          planTier,
          status: 'active',
          startDate,
          endDate,
          listingsUsed: 0,
          listingsLimit: planConfig.maxListings === -1 ? 999999 : planConfig.maxListings,
        },
      });
    }

    // Update user's current plan
    await prisma.user.update({
      where: { id: userId },
      data: {
        currentPlan: planTier,
        planStartDate: startDate,
        planEndDate: endDate,
      },
    });

    return NextResponse.json(
      {
        success: true,
        subscription,
        planConfig,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Subscription creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/subscriptions
 * Get subscription details for a user
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

    const subscription = await prisma.subscription.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            currentPlan: true,
          },
        },
      },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    // Get plan config
    const planConfig = await prisma.planTierConfig.findUnique({
      where: { tier: subscription.planTier },
    });

    // Calculate days remaining
    const daysRemaining = Math.ceil(
      (subscription.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    return NextResponse.json(
      {
        success: true,
        subscription,
        planConfig,
        daysRemaining: Math.max(0, daysRemaining),
        isExpiring: daysRemaining <= 7 && daysRemaining > 0,
        isExpired: daysRemaining <= 0,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Subscription fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
