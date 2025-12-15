import { PrismaClient } from '@prisma/client';
import { notificationService } from '../notifications/service';

const prisma = new PrismaClient();

/**
 * Check for expiring subscriptions and send reminders
 * Should be called daily via cron job
 */
export async function sendSubscriptionExpiryReminders() {
  try {
    const expiringSubscriptions = await subscriptionManager.checkExpiringSubscriptions();

    if (!Array.isArray(expiringSubscriptions)) {
      console.log('[CRON] No expiring subscriptions found');
      return { processed: 0 };
    }

    let count = 0;

    for (const subscription of expiringSubscriptions) {
      const daysRemaining = Math.ceil(
        (subscription.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );

      try {
        await notificationService.notifyPlanExpiry(subscription.userId, {
          planName: subscription.tier,
          daysRemaining,
        });
        count++;
      } catch (error) {
        console.error(`[CRON] Failed to notify user ${subscription.userId}:`, error);
      }
    }

    console.log(`[CRON] Sent ${count} subscription expiry reminders`);
    return { processed: count };
  } catch (error) {
    console.error('[CRON] Error sending subscription reminders:', error);
    return { error: 'Failed to send reminders', processed: 0 };
  }
}

/**
 * Process auto-renewal for subscriptions
 * Should be called daily at midnight via cron job
 */
export async function processAutoRenewals() {
  try {
    const subscriptionManager = require('../subscription').default;

    const expiringToday = await prisma.subscription.findMany({
      where: {
        isActive: true,
        autoRenew: true,
        endDate: {
          lte: new Date(Date.now() + 24 * 60 * 60 * 1000), // Within 24 hours
          gte: new Date(), // Not already expired
        },
      },
      include: { user: true },
    });

    let count = 0;
    let failed = 0;

    for (const subscription of expiringToday) {
      try {
        // Attempt to charge for renewal
        // This would integrate with payment gateways
        // For now, we just auto-extend the subscription

        const newEndDate =
          subscription.billingPeriod === 'YEARLY'
            ? new Date(subscription.endDate.getTime() + 365 * 24 * 60 * 60 * 1000)
            : new Date(subscription.endDate.getTime() + 30 * 24 * 60 * 60 * 1000);

        await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            endDate: newEndDate,
            renewalDate: newEndDate,
          },
        });

        // Send renewal notification
        await notificationService.notifySubscriptionRenewal(subscription.userId, {
          planName: subscription.tier,
          endDate: newEndDate,
        });

        count++;
      } catch (error) {
        console.error(
          `[CRON] Failed to renew subscription for user ${subscription.userId}:`,
          error
        );
        failed++;
      }
    }

    console.log(`[CRON] Processed ${count} auto-renewals, ${failed} failed`);
    return { processed: count, failed };
  } catch (error) {
    console.error('[CRON] Error processing auto-renewals:', error);
    return { error: 'Failed to process renewals', processed: 0, failed: 0 };
  }
}

/**
 * Deactivate expired subscriptions
 * Should be called daily via cron job
 */
export async function deactivateExpiredSubscriptions() {
  try {
    const result = await prisma.subscription.updateMany({
      where: {
        isActive: true,
        endDate: {
          lt: new Date(),
        },
        autoRenew: false,
      },
      data: {
        isActive: false,
      },
    });

    console.log(`[CRON] Deactivated ${result.count} expired subscriptions`);
    return { processed: result.count };
  } catch (error) {
    console.error('[CRON] Error deactivating expired subscriptions:', error);
    return { error: 'Failed to deactivate subscriptions', processed: 0 };
  }
}
