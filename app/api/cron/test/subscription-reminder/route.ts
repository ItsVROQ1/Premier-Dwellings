import { NextRequest, NextResponse } from 'next/server';
import { testSendReminderEmail } from '@/lib/cron';

/**
 * POST /api/cron/test/subscription-reminder
 * Test sending subscription reminder email
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    await testSendReminderEmail(userId);

    return NextResponse.json(
      {
        success: true,
        message: `Subscription reminder email sent to user ${userId}`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Test subscription reminder error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/cron/test/subscription-reminder
 * Test subscription reminder job
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

    await testSendReminderEmail(userId);

    return NextResponse.json(
      {
        success: true,
        message: `Subscription reminder email sent to user ${userId}`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Test subscription reminder error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
