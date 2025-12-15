import { subscriptionManager } from './subscription';

/**
 * Check if an agent can publish a listing
 * Enforces plan usage limits
 */
export async function checkListingPublishAllowed(
  userId: string,
  isFeatured: boolean = false
) {
  try {
    // Check basic listing publish permission
    const listingCheck = await subscriptionManager.canPublishListing(userId);
    if (!listingCheck.allowed) {
      return listingCheck;
    }

    // Check featured listing permission if needed
    if (isFeatured) {
      const featuredCheck = await subscriptionManager.canCreateFeaturedListing(userId);
      if (!featuredCheck.allowed) {
        return featuredCheck;
      }
    }

    return { allowed: true };
  } catch (error) {
    console.error('[LISTING PUBLISH CHECK] Error:', error);
    return {
      allowed: false,
      reason: 'Unable to verify plan limits. Please try again.',
    };
  }
}

/**
 * Get user's remaining listing capacity
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
      };
    }

    if (planConfig.maxListings === -1) {
      return {
        total: -1, // Unlimited
        used: 0,
        remaining: -1,
      };
    }

    const activeListings = await (async () => {
      const prisma = require('./prisma').default;
      return prisma.listing.count({
        where: {
          agentId: userId,
          status: { in: ['ACTIVE', 'PENDING'] },
        },
      });
    })();

    return {
      total: planConfig.maxListings,
      used: activeListings,
      remaining: Math.max(0, planConfig.maxListings - activeListings),
    };
  } catch (error) {
    console.error('[LISTING CAPACITY CHECK] Error:', error);
    return {
      total: 0,
      used: 0,
      remaining: 0,
    };
  }
}
