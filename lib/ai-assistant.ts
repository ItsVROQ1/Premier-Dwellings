import OpenAI from 'openai';
import { prisma } from '@/lib/prisma';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key',
});

export interface AIAssistantOptions {
  chatId: string;
  userId: string;
  message: string;
  listingId?: string;
}

export const processAIAssistant = async (options: AIAssistantOptions) => {
  const { chatId, userId, message, listingId } = options;

  const config = await prisma.aIAssistantConfig.findUnique({
    where: { userId },
  });

  if (!config || !config.enabled) {
    return null;
  }

  try {
    const chatHistory = await prisma.aIChatMessage.findMany({
      where: { chatId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const systemPrompt = `You are a helpful real estate assistant for a Pakistani real estate platform. 
You help buyers find properties and answer their questions about listings. 
Be professional, friendly, and concise. Always respond in English unless the user speaks in another language.
When suggesting properties, provide specific details like location, price range in PKR, and key features.`;

    const contextMessages = chatHistory
      .reverse()
      .map((msg) => ({
        role: msg.role.toLowerCase() as 'user' | 'assistant' | 'system',
        content: msg.content,
      }));

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...contextMessages,
        { role: 'user', content: message },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const aiResponse = completion.choices[0]?.message?.content || 'I apologize, I am unable to respond at this time.';

    const moderationFlags = await moderateContent(message);
    
    const aiMessage = await prisma.aIChatMessage.create({
      data: {
        chatId,
        role: 'ASSISTANT',
        content: aiResponse,
        isModerated: moderationFlags.length > 0,
        moderationFlags,
      },
    });

    if (config.suggestListings && listingId) {
      const suggestions = await getSimilarListings(listingId);
      if (suggestions.length > 0) {
        await prisma.aIChatMessage.create({
          data: {
            chatId,
            role: 'ASSISTANT',
            content: 'Based on your inquiry, you might also be interested in these similar properties:',
            metadata: JSON.stringify({ suggestedListings: suggestions }),
          },
        });
      }
    }

    return aiMessage;
  } catch (error) {
    console.error('AI Assistant error:', error);
    return null;
  }
};

export const generateGreeting = async (chatId: string, userId: string, listingId?: string) => {
  const config = await prisma.aIAssistantConfig.findUnique({
    where: { userId },
  });

  if (!config || !config.enabled || !config.autoGreet) {
    return null;
  }

  let greeting = config.customGreeting || `Hello! I'm your AI assistant. How can I help you today?`;

  if (listingId) {
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: { city: true },
    });

    if (listing) {
      greeting = `Hello! I see you're interested in "${listing.title}" in ${listing.city.name}. I'm here to help answer any questions you might have about this property or suggest similar options.`;
    }
  }

  return await prisma.aIChatMessage.create({
    data: {
      chatId,
      role: 'ASSISTANT',
      content: greeting,
    },
  });
};

export const moderateContent = async (content: string): Promise<string[]> => {
  try {
    const moderation = await openai.moderations.create({
      input: content,
    });

    const flags: string[] = [];
    const result = moderation.results[0];

    if (result.flagged) {
      if (result.categories.harassment) flags.push('harassment');
      if (result.categories.hate) flags.push('hate');
      if (result.categories.sexual) flags.push('sexual');
      if (result.categories.violence) flags.push('violence');
      if (result.categories['self-harm']) flags.push('self-harm');
    }

    return flags;
  } catch (error) {
    console.error('Moderation error:', error);
    return [];
  }
};

const getSimilarListings = async (listingId: string) => {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) return [];

    const similar = await prisma.listing.findMany({
      where: {
        id: { not: listingId },
        cityId: listing.cityId,
        propertyType: listing.propertyType,
        transactionType: listing.transactionType,
        status: 'ACTIVE',
        price: {
          gte: listing.price.mul(0.8).toNumber(),
          lte: listing.price.mul(1.2).toNumber(),
        },
      },
      take: 3,
      include: {
        city: true,
        images: { take: 1, where: { isMain: true } },
      },
    });

    return similar.map((l) => ({
      id: l.id,
      title: l.title,
      slug: l.slug,
      price: l.price.toString(),
      city: l.city.name,
      image: l.images[0]?.url,
    }));
  } catch (error) {
    console.error('Error fetching similar listings:', error);
    return [];
  }
};
