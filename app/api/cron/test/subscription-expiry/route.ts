import { NextRequest, NextResponse } from 'next/server';
import { testSubscriptionReminderJob } from '@/lib/cron';

/**
 * GET /api/cron/test/subscription-expiry
 * Test subscription expiry check job
 */
export async function GET(request: NextRequest) {
  try {
    const expiringSubscriptions = await testSubscriptionReminderJob();

    return NextResponse.json(
      {
        success: true,
        message: `Found ${expiringSubscriptions.length} subscriptions expiring in 7 days`,
        count: expiringSubscriptions.length,
        subscriptions: expiringSubscriptions.map((sub) => ({
          id: sub.id,
          userId: sub.userId,
          planTier: sub.planTier,
          status: sub.status,
          endDate: sub.endDate,
          userEmail: sub.user?.email,
          userName: sub.user?.firstName,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Test subscription expiry error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cron/test/subscription-expiry
 * Manually trigger subscription expiry check
 */
export async function POST(request: NextRequest) {
  try {
    const expiringSubscriptions = await testSubscriptionReminderJob();

    return NextResponse.json(
      {
        success: true,
        message: `Found ${expiringSubscriptions.length} subscriptions expiring in 7 days`,
        count: expiringSubscriptions.length,
        subscriptions: expiringSubscriptions.map((sub) => ({
          id: sub.id,
          userId: sub.userId,
          planTier: sub.planTier,
          status: sub.status,
          endDate: sub.endDate,
          userEmail: sub.user?.email,
          userName: sub.user?.firstName,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Test subscription expiry error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
