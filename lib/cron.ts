import cron from 'node-cron';
import { prisma } from '@/lib/prisma';
import { sendSubscriptionReminderEmail } from '@/lib/email';

// ============================================================================
// SUBSCRIPTION RENEWAL REMINDER JOB
// ============================================================================

/**
 * Check for subscriptions expiring in 7 days and send renewal reminders
 * Runs daily at 9:00 AM UTC
 */
export function startSubscriptionReminderJob() {
  // Schedule job to run every day at 9:00 AM UTC
  const job = cron.schedule('0 9 * * *', async () => {
    console.log('[CRON] Running subscription reminder job...');
    try {
      // Get the date 7 days from now
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

      // Get the date for today (to check expiring subscriptions)
      const today = new Date();

      // Find subscriptions expiring in 7 days
      const expiringSubscriptions = await prisma.subscription.findMany({
        where: {
          status: 'active',
          endDate: {
            gte: new Date(today.setHours(0, 0, 0, 0)),
            lte: new Date(sevenDaysFromNow.setHours(23, 59, 59, 999)),
          },
        },
        include: {
          user: true,
        },
      });

      console.log(
        `[CRON] Found ${expiringSubscriptions.length} subscriptions expiring in 7 days`
      );

      // Send reminder emails
      for (const subscription of expiringSubscriptions) {
        try {
          const daysUntilExpiry = Math.ceil(
            (subscription.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          );

          console.log(
            `[CRON] Sending reminder email to ${subscription.user.email} (expires in ${daysUntilExpiry} days)`
          );

          await sendSubscriptionReminderEmail({
            userEmail: subscription.user.email,
            userName: subscription.user.firstName || 'Agent',
            planTier: subscription.planTier,
            expiryDate: subscription.endDate,
            daysRemaining: daysUntilExpiry,
          });

          console.log(
            `[CRON] Reminder email sent to ${subscription.user.email}`
          );
        } catch (error) {
          console.error(
            `[CRON] Failed to send reminder email to ${subscription.user.email}:`,
            error
          );
        }
      }

      console.log('[CRON] Subscription reminder job completed');
    } catch (error) {
      console.error('[CRON] Error in subscription reminder job:', error);
    }
  });

  return job;
}

// ============================================================================
// SUBSCRIPTION EXPIRY CHECK JOB
// ============================================================================

/**
 * Check for expired subscriptions and update their status
 * Runs daily at 12:00 AM UTC
 */
export function startSubscriptionExpiryJob() {
  const job = cron.schedule('0 0 * * *', async () => {
    console.log('[CRON] Running subscription expiry check job...');
    try {
      const now = new Date();

      // Find expired subscriptions
      const expiredSubscriptions = await prisma.subscription.updateMany({
        where: {
          status: 'active',
          endDate: {
            lte: now,
          },
        },
        data: {
          status: 'expired',
        },
      });

      console.log(
        `[CRON] Marked ${expiredSubscriptions.count} subscriptions as expired`
      );

      // Update user plan tier to FREE
      const expiredSubsForUpdate = await prisma.subscription.findMany({
        where: {
          status: 'expired',
          endDate: {
            lte: now,
          },
        },
      });

      for (const sub of expiredSubsForUpdate) {
        await prisma.user.update({
          where: { id: sub.userId },
          data: {
            currentPlan: 'FREE',
          },
        });
      }

      console.log('[CRON] Subscription expiry job completed');
    } catch (error) {
      console.error('[CRON] Error in subscription expiry job:', error);
    }
  });

  return job;
}

// ============================================================================
// START ALL CRON JOBS
// ============================================================================

let subscriptionReminderJob: ReturnType<typeof cron.schedule> | null = null;
let subscriptionExpiryJob: ReturnType<typeof cron.schedule> | null = null;

export function startAllCronJobs() {
  if (process.env.NODE_ENV === 'production') {
    console.log('[CRON] Starting cron jobs...');

    subscriptionReminderJob = startSubscriptionReminderJob();
    subscriptionExpiryJob = startSubscriptionExpiryJob();

    console.log('[CRON] All cron jobs started');
  } else {
    console.log('[CRON] Cron jobs disabled in development (set NODE_ENV=production to enable)');
  }
}

export function stopAllCronJobs() {
  if (subscriptionReminderJob) {
    subscriptionReminderJob.stop();
    console.log('[CRON] Subscription reminder job stopped');
  }

  if (subscriptionExpiryJob) {
    subscriptionExpiryJob.stop();
    console.log('[CRON] Subscription expiry job stopped');
  }
}

// ============================================================================
// TEST FUNCTIONS (for development/testing)
// ============================================================================

export async function testSubscriptionReminderJob() {
  console.log('[TEST] Running subscription reminder job test...');
  try {
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const today = new Date();

    const expiringSubscriptions = await prisma.subscription.findMany({
      where: {
        status: 'active',
        endDate: {
          gte: new Date(today.setHours(0, 0, 0, 0)),
          lte: new Date(sevenDaysFromNow.setHours(23, 59, 59, 999)),
        },
      },
      include: {
        user: true,
      },
    });

    console.log('[TEST] Found subscriptions:', expiringSubscriptions);
    return expiringSubscriptions;
  } catch (error) {
    console.error('[TEST] Error:', error);
    throw error;
  }
}

export async function testSendReminderEmail(userId: string) {
  console.log(`[TEST] Sending test reminder email to user ${userId}...`);
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    const daysUntilExpiry = Math.ceil(
      (subscription.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    await sendSubscriptionReminderEmail({
      userEmail: subscription.user.email,
      userName: subscription.user.firstName || 'Agent',
      planTier: subscription.planTier,
      expiryDate: subscription.endDate,
      daysRemaining: daysUntilExpiry,
    });

    console.log('[TEST] Reminder email sent successfully');
  } catch (error) {
    console.error('[TEST] Error sending email:', error);
    throw error;
  }
}
