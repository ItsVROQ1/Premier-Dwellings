'use server';

import { PrismaClient, PlanTier } from '@prisma/client';
import { subscriptionManager } from '@/lib/subscription';
import { notificationService } from '@/lib/notifications/service';

const prisma = new PrismaClient();

/**
 * Get user's subscription details
 */
export async function getSubscriptionDetails(userId: string) {
  try {
    const subscription = await subscriptionManager.getOrCreateSubscription(userId);
    const planConfig = await subscriptionManager.getPlanDetails(subscription.tier);

    if (!planConfig) {
      return { error: 'Plan not found' };
    }

    const activeListings = await prisma.listing.count({
      where: {
        agentId: userId,
        status: { in: ['ACTIVE', 'PENDING'] },
      },
    });

    const featuredListings = await prisma.listing.count({
      where: {
        agentId: userId,
        isFeatured: true,
        status: 'ACTIVE',
      },
    });

    return {
      subscription,
      plan: planConfig,
      usage: {
        activeListings,
        featuredListings,
        maxListings: planConfig.maxListings,
        maxFeaturedListings: planConfig.maxFeaturedListings,
      },
    };
  } catch (error) {
    return { error: 'Failed to fetch subscription details' };
  }
}

/**
 * Get all available plans
 */
export async function getAvailablePlans() {
  try {
    return await subscriptionManager.getAllPlans();
  } catch (error) {
    return { error: 'Failed to fetch plans' };
  }
}

/**
 * Check if user can publish listing
 */
export async function canPublishListing(userId: string, isFeatured: boolean = false) {
  try {
    const listingCheck = await subscriptionManager.canPublishListing(userId);
    if (!listingCheck.allowed) return listingCheck;

    if (isFeatured) {
      const featuredCheck = await subscriptionManager.canCreateFeaturedListing(userId);
      if (!featuredCheck.allowed) return featuredCheck;
    }

    return { allowed: true };
  } catch (error) {
    return {
      allowed: false,
      reason: 'Unable to verify plan limits',
    };
  }
}

/**
 * Get listing capacity for user
 */
export async function getListingCapacity(userId: string) {
  try {
    const subscription = await subscriptionManager.getOrCreateSubscription(userId);
    const planConfig = await subscriptionManager.getPlanDetails(subscription.tier);

    if (!planConfig) {
      return {
        total: 0,
        used: 0,
        remaining: 0,
        unlimited: false,
      };
    }

    const activeListings = await prisma.listing.count({
      where: {
        agentId: userId,
        status: { in: ['ACTIVE', 'PENDING'] },
      },
    });

    if (planConfig.maxListings === -1) {
      return {
        total: -1,
        used: activeListings,
        remaining: -1,
        unlimited: true,
      };
    }

    return {
      total: planConfig.maxListings,
      used: activeListings,
      remaining: Math.max(0, planConfig.maxListings - activeListings),
      unlimited: false,
    };
  } catch (error) {
    return {
      total: 0,
      used: 0,
      remaining: 0,
      unlimited: false,
      error: 'Failed to calculate capacity',
    };
  }
}

/**
 * Check security deposit status
 */
export async function getSecurityDepositStatus(userId: string) {
  try {
    const deposit = await prisma.securityDeposit.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (!deposit) {
      return { status: 'NOT_APPLIED' };
    }

    return {
      status: deposit.status,
      amount: deposit.amount,
      currency: deposit.currency,
      appliedAt: deposit.createdAt,
      approvedAt: deposit.approvedAt,
      rejectionReason: deposit.rejectionReason,
    };
  } catch (error) {
    return { error: 'Failed to fetch deposit status' };
  }
}

/**
 * Get user's payments and invoices
 */
export async function getUserPayments(userId: string, limit: number = 10) {
  try {
    const payments = await prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return payments.map((p) => ({
      id: p.id,
      amount: Number(p.amount),
      currency: p.currency,
      status: p.status,
      description: p.description,
      invoiceNumber: p.invoiceNumber,
      processedAt: p.processedAt,
      createdAt: p.createdAt,
    }));
  } catch (error) {
    return { error: 'Failed to fetch payments' };
  }
}

/**
 * Upgrade user subscription
 */
export async function upgradeSubscription(
  userId: string,
  newTier: PlanTier,
  billingPeriod: 'MONTHLY' | 'YEARLY'
) {
  try {
    const planConfig = await subscriptionManager.getPlanDetails(newTier);
    if (!planConfig) {
      return { error: 'Plan not found' };
    }

    // Get subscription details
    const subscription = await subscriptionManager.getOrCreateSubscription(userId);

    // Calculate proration if needed
    const daysRemaining = Math.max(
      0,
      Math.ceil((subscription.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    );

    return {
      success: true,
      newPlan: planConfig,
      daysRemaining,
      message: 'Ready to proceed to payment for plan upgrade',
    };
  } catch (error) {
    return { error: 'Failed to process upgrade' };
  }
}

/**
 * Downgrade user subscription
 */
export async function downgradeSubscription(
  userId: string,
  newTier: PlanTier,
  billingPeriod: 'MONTHLY' | 'YEARLY'
) {
  try {
    const subscription = await subscriptionManager.getOrCreateSubscription(userId);

    // Check if can downgrade (listings count shouldn't exceed new plan limit)
    const activeListings = await prisma.listing.count({
      where: {
        agentId: userId,
        status: { in: ['ACTIVE', 'PENDING'] },
      },
    });

    const newPlan = await subscriptionManager.getPlanDetails(newTier);
    if (!newPlan) {
      return { error: 'Plan not found' };
    }

    if (newPlan.maxListings !== -1 && activeListings > newPlan.maxListings) {
      return {
        error: `Cannot downgrade to ${newPlan.name} because you have ${activeListings} active listings, exceeding the limit of ${newPlan.maxListings}`,
      };
    }

    return {
      success: true,
      newPlan,
      message: 'Downgrade scheduled for next billing cycle',
    };
  } catch (error) {
    return { error: 'Failed to process downgrade' };
  }
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(userId: string, reason?: string) {
  try {
    const subscription = await subscriptionManager.getOrCreateSubscription(userId);

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        isActive: false,
        autoRenew: false,
      },
    });

    await notificationService.notify({
      userId,
      type: 'SUBSCRIPTION_RENEWED', // Reuse for cancellation notification
      title: 'Subscription Cancelled',
      message: 'Your subscription has been cancelled. Enjoy your free plan.',
      channels: [],
      metadata: { reason },
    });

    return { success: true, message: 'Subscription cancelled successfully' };
  } catch (error) {
    return { error: 'Failed to cancel subscription' };
  }
}

/**
 * Get expiring subscriptions (for reminders)
 */
export async function checkExpiringSubscriptions() {
  try {
    return await subscriptionManager.checkExpiringSubscriptions();
  } catch (error) {
    return { error: 'Failed to check expiring subscriptions' };
  }
}
