import { NextRequest, NextResponse } from 'next/server';
import { processAIAssistant, generateGreeting } from '@/lib/ai-assistant';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, chatId, userId, message, listingId } = body;

    if (action === 'greet') {
      const greeting = await generateGreeting(chatId, userId, listingId);
      return NextResponse.json({ greeting });
    }

    if (action === 'process') {
      const response = await processAIAssistant({
        chatId,
        userId,
        message,
        listingId,
      });
      return NextResponse.json({ response });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('AI Assistant error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID required' }, { status: 400 });
  }

  try {
    let config = await prisma.aIAssistantConfig.findUnique({
      where: { userId },
    });

    if (!config) {
      config = await prisma.aIAssistantConfig.create({
        data: {
          userId,
          enabled: true,
          autoGreet: true,
          suggestListings: true,
          moderateContent: true,
        },
      });
    }

    return NextResponse.json(config);
  } catch (error) {
    console.error('Error fetching AI config:', error);
    return NextResponse.json({ error: 'Failed to fetch config' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, ...updates } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const config = await prisma.aIAssistantConfig.upsert({
      where: { userId },
      update: updates,
      create: {
        userId,
        ...updates,
      },
    });

    return NextResponse.json(config);
  } catch (error) {
    console.error('Error updating AI config:', error);
    return NextResponse.json({ error: 'Failed to update config' }, { status: 500 });
  }
}
