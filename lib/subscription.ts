import { PrismaClient, PlanTier } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Subscription management utilities
 */
export class SubscriptionManager {
  /**
   * Get user's current subscription or create a free one
   */
  static async getOrCreateSubscription(userId: string) {
    let subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      subscription = await prisma.subscription.create({
        data: {
          userId,
          tier: PlanTier.FREE,
          billingPeriod: 'MONTHLY',
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          isActive: true,
        },
      });
    }

    return subscription;
  }

  /**
   * Check if user is within their listing limit
   */
  static async canPublishListing(userId: string): Promise<{ allowed: boolean; reason?: string }> {
    const subscription = await this.getOrCreateSubscription(userId);

    if (!subscription.isActive) {
      return { allowed: false, reason: 'Subscription is not active' };
    }

    if (subscription.endDate < new Date()) {
      return { allowed: false, reason: 'Subscription has expired' };
    }

    const planConfig = await prisma.planTierConfig.findUnique({
      where: { tier: subscription.tier },
    });

    if (!planConfig) {
      return { allowed: false, reason: 'Plan configuration not found' };
    }

    // Unlimited listings
    if (planConfig.maxListings === -1) {
      return { allowed: true };
    }

    // Check limit
    const activeListings = await prisma.listing.count({
      where: {
        agentId: userId,
        status: { in: ['ACTIVE', 'PENDING'] },
      },
    });

    if (activeListings >= planConfig.maxListings) {
      return {
        allowed: false,
        reason: `You have reached your listing limit of ${planConfig.maxListings}. Please upgrade your plan.`,
      };
    }

    return { allowed: true };
  }

  /**
   * Check if user can create a featured listing
   */
  static async canCreateFeaturedListing(userId: string): Promise<{ allowed: boolean; reason?: string }> {
    const subscription = await this.getOrCreateSubscription(userId);

    if (!subscription.isActive || subscription.endDate < new Date()) {
      return { allowed: false, reason: 'Active subscription required for featured listings' };
    }

    const planConfig = await prisma.planTierConfig.findUnique({
      where: { tier: subscription.tier },
    });

    if (!planConfig || !planConfig.hasPromotion) {
      return { allowed: false, reason: 'Your plan does not support featured listings' };
    }

    // Unlimited featured listings
    if (planConfig.maxFeaturedListings === -1) {
      return { allowed: true };
    }

    // Check limit
    const featuredListings = await prisma.listing.count({
      where: {
        agentId: userId,
        isFeatured: true,
        status: 'ACTIVE',
      },
    });

    if (featuredListings >= planConfig.maxFeaturedListings) {
      return {
        allowed: false,
        reason: `You have reached your featured listings limit of ${planConfig.maxFeaturedListings}`,
      };
    }

    return { allowed: true };
  }

  /**
   * Update subscription after successful payment
   */
  static async activateSubscription(
    userId: string,
    tier: PlanTier,
    billingPeriod: 'MONTHLY' | 'YEARLY'
  ) {
    const startDate = new Date();
    const endDate =
      billingPeriod === 'YEARLY'
        ? new Date(startDate.getTime() + 365 * 24 * 60 * 60 * 1000)
        : new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);

    const subscription = await prisma.subscription.upsert({
      where: { userId },
      update: {
        tier,
        billingPeriod,
        startDate,
        endDate,
        isActive: true,
        renewalDate: endDate,
      },
      create: {
        userId,
        tier,
        billingPeriod,
        startDate,
        endDate,
        isActive: true,
      },
    });

    // Update user's current plan
    await prisma.user.update({
      where: { id: userId },
      data: {
        currentPlan: tier,
        planStartDate: startDate,
        planEndDate: endDate,
      },
    });

    return subscription;
  }

  /**
   * Get subscription plan details
   */
  static async getPlanDetails(tier: PlanTier) {
    return prisma.planTierConfig.findUnique({
      where: { tier },
    });
  }

  /**
   * Get all active plans
   */
  static async getAllPlans() {
    return prisma.planTierConfig.findMany({
      where: { isActive: true },
      orderBy: { monthlyPrice: 'asc' },
    });
  }

  /**
   * Check if subscription is expiring soon (within 7 days)
   */
  static async checkExpiringSubscriptions() {
    const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    return prisma.subscription.findMany({
      where: {
        isActive: true,
        endDate: {
          lte: sevenDaysFromNow,
          gt: new Date(),
        },
        autoRenew: false, // Don't remind auto-renewing subscriptions
      },
      include: { user: true },
    });
  }
}

export const subscriptionManager = SubscriptionManager;
