import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const city = searchParams.get('city');
  const propertyType = searchParams.get('propertyType');
  const months = parseInt(searchParams.get('months') || '12');

  try {
    const currentDate = new Date();
    const startMonth = currentDate.getMonth() - months + 1;
    const startYear = currentDate.getFullYear();

    const where: any = {};
    if (city) where.city = city;
    if (propertyType) where.propertyType = propertyType;

    const priceData = await prisma.areaPriceIndex.findMany({
      where,
      orderBy: [
        { year: 'desc' },
        { month: 'desc' },
      ],
      take: months,
    });

    const trendingAreas = await prisma.areaPriceIndex.groupBy({
      by: ['city', 'area'],
      where: {
        trend3Month: { gte: 5 },
      },
      _avg: {
        trend3Month: true,
        avgPricePerSqft: true,
      },
      orderBy: {
        _avg: {
          trend3Month: 'desc',
        },
      },
      take: 10,
    });

    const investmentInsights = await generateInsights(priceData);

    return NextResponse.json({
      priceData,
      trendingAreas,
      investmentInsights,
    });
  } catch (error) {
    console.error('Error fetching price index:', error);
    return NextResponse.json({ error: 'Failed to fetch price index' }, { status: 500 });
  }
}

function generateInsights(data: any[]) {
  const insights = [];

  if (data.length > 0) {
    const latest = data[0];
    
    if (latest.trend3Month && latest.trend3Month.toNumber() > 5) {
      insights.push({
        type: 'growth',
        title: 'Strong Market Growth',
        description: `${latest.city} ${latest.area} showing ${latest.trend3Month.toNumber().toFixed(1)}% growth over 3 months`,
        impact: 'positive',
      });
    }

    if (latest.trend6Month && latest.trend6Month.toNumber() > 10) {
      insights.push({
        type: 'investment',
        title: 'Investment Opportunity',
        description: `Significant 6-month growth of ${latest.trend6Month.toNumber().toFixed(1)}% indicates strong market demand`,
        impact: 'positive',
      });
    }

    if (latest.sampleSize < 5) {
      insights.push({
        type: 'data',
        title: 'Limited Data',
        description: 'Price estimates based on limited sample size. Use with caution.',
        impact: 'neutral',
      });
    }
  }

  return insights;
}
