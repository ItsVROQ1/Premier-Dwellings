import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const cityId = searchParams.get('cityId');

  try {
    const where = cityId ? { cityId, isActive: true } : { isActive: true };

    const overlays = await prisma.societyOverlay.findMany({
      where,
      include: {
        city: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(overlays);
  } catch (error) {
    console.error('Error fetching society overlays:', error);
    return NextResponse.json({ error: 'Failed to fetch overlays' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { cityId, name, geoJsonData, metadata } = body;

    if (!cityId || !name || !geoJsonData) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const overlay = await prisma.societyOverlay.create({
      data: {
        cityId,
        name,
        geoJsonData,
        metadata,
      },
    });

    return NextResponse.json(overlay, { status: 201 });
  } catch (error) {
    console.error('Error creating society overlay:', error);
    return NextResponse.json({ error: 'Failed to create overlay' }, { status: 500 });
  }
}
