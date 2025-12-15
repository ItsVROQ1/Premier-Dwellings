import { PropertyType, TransactionType } from '@/lib/generated/prisma';
import { prisma } from '@/lib/prisma';
import { Loader } from '@googlemaps/js-api-loader';

export interface ValuationInput {
  propertyType: PropertyType;
  transactionType: TransactionType;
  city: string;
  area?: string;
  totalArea: number;
  bedrooms?: number;
  bathrooms?: number;
  latitude?: number;
  longitude?: number;
  address?: string;
}

export interface ValuationResult {
  estimatedPrice: {
    min: number;
    max: number;
    median: number;
  };
  pricePerSqft: {
    min: number;
    max: number;
    avg: number;
  };
  confidence: number;
  factors: {
    name: string;
    impact: 'positive' | 'negative' | 'neutral';
    description: string;
  }[];
  comparables: number;
  currency: string;
}

export const generateValuation = async (input: ValuationInput): Promise<ValuationResult> => {
  let area = input.area || '';
  
  if (!area && input.address) {
    const geocodeResult = await geocodeAddress(input.address);
    if (geocodeResult) {
      area = geocodeResult.area;
      if (!input.latitude) input.latitude = geocodeResult.lat;
      if (!input.longitude) input.longitude = geocodeResult.lng;
    }
  }

  const priceIndex = await prisma.areaPriceIndex.findFirst({
    where: {
      city: input.city,
      area: area || undefined,
      propertyType: input.propertyType,
    },
    orderBy: [
      { year: 'desc' },
      { month: 'desc' },
    ],
  });

  const samples = await prisma.valuationSample.findMany({
    where: {
      city: input.city,
      area: area || undefined,
      propertyType: input.propertyType,
      transactionType: input.transactionType,
      ...(input.bedrooms && { bedrooms: input.bedrooms }),
    },
    take: 50,
    orderBy: { createdAt: 'desc' },
  });

  let avgPricePerSqft = priceIndex?.avgPricePerSqft.toNumber() || 0;
  let minPricePerSqft = priceIndex?.minPrice.toNumber() || 0;
  let maxPricePerSqft = priceIndex?.maxPrice.toNumber() || 0;

  if (samples.length > 0) {
    const pricesPerSqft = samples.map((s) => s.pricePerSqft.toNumber());
    avgPricePerSqft = pricesPerSqft.reduce((a, b) => a + b, 0) / pricesPerSqft.length;
    minPricePerSqft = Math.min(...pricesPerSqft);
    maxPricePerSqft = Math.max(...pricesPerSqft);
  }

  if (avgPricePerSqft === 0) {
    avgPricePerSqft = getDefaultPricePerSqft(input.city, input.propertyType);
    minPricePerSqft = avgPricePerSqft * 0.7;
    maxPricePerSqft = avgPricePerSqft * 1.3;
  }

  const factors: ValuationResult['factors'] = [];
  let adjustmentFactor = 1.0;

  if (priceIndex?.trend3Month && priceIndex.trend3Month.toNumber() > 5) {
    factors.push({
      name: 'Market Trend',
      impact: 'positive',
      description: `Property prices in this area have increased by ${priceIndex.trend3Month.toNumber().toFixed(1)}% in the last 3 months`,
    });
    adjustmentFactor *= 1.05;
  } else if (priceIndex?.trend3Month && priceIndex.trend3Month.toNumber() < -5) {
    factors.push({
      name: 'Market Trend',
      impact: 'negative',
      description: `Property prices in this area have decreased by ${Math.abs(priceIndex.trend3Month.toNumber()).toFixed(1)}% in the last 3 months`,
    });
    adjustmentFactor *= 0.95;
  }

  if (input.propertyType === 'APARTMENT' && input.totalArea > 2000) {
    factors.push({
      name: 'Large Size',
      impact: 'positive',
      description: 'Larger than average apartment size for the area',
    });
    adjustmentFactor *= 1.08;
  }

  if (input.bedrooms && input.bedrooms >= 4) {
    factors.push({
      name: 'Multiple Bedrooms',
      impact: 'positive',
      description: 'High bedroom count increases property value',
    });
    adjustmentFactor *= 1.05;
  }

  const estimatedMedian = avgPricePerSqft * input.totalArea * adjustmentFactor;
  const estimatedMin = minPricePerSqft * input.totalArea * adjustmentFactor * 0.9;
  const estimatedMax = maxPricePerSqft * input.totalArea * adjustmentFactor * 1.1;

  const confidence = calculateConfidence(samples.length, priceIndex !== null);

  return {
    estimatedPrice: {
      min: Math.round(estimatedMin),
      max: Math.round(estimatedMax),
      median: Math.round(estimatedMedian),
    },
    pricePerSqft: {
      min: Math.round(minPricePerSqft),
      max: Math.round(maxPricePerSqft),
      avg: Math.round(avgPricePerSqft),
    },
    confidence,
    factors,
    comparables: samples.length,
    currency: 'PKR',
  };
};

const geocodeAddress = async (address: string): Promise<{ area: string; lat: number; lng: number } | null> => {
  try {
    const loader = new Loader({
      apiKey: process.env.GOOGLE_MAPS_API_KEY || '',
      version: 'weekly',
    });

    const google = await loader.load();
    const geocoder = new google.maps.Geocoder();

    return new Promise((resolve) => {
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location;
          const addressComponents = results[0].address_components;
          
          let area = '';
          for (const component of addressComponents) {
            if (component.types.includes('sublocality') || component.types.includes('neighborhood')) {
              area = component.long_name;
              break;
            }
          }

          resolve({
            area,
            lat: location.lat(),
            lng: location.lng(),
          });
        } else {
          resolve(null);
        }
      });
    });
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};

const getDefaultPricePerSqft = (city: string, propertyType: PropertyType): number => {
  const defaults: Record<string, Record<PropertyType, number>> = {
    'Karachi': {
      APARTMENT: 8000,
      HOUSE: 10000,
      CONDO: 9000,
      TOWNHOUSE: 11000,
      VILLA: 15000,
      LAND: 5000,
      COMMERCIAL: 12000,
      INDUSTRIAL: 6000,
    },
    'Lahore': {
      APARTMENT: 7500,
      HOUSE: 9500,
      CONDO: 8500,
      TOWNHOUSE: 10500,
      VILLA: 14000,
      LAND: 4500,
      COMMERCIAL: 11000,
      INDUSTRIAL: 5500,
    },
    'Islamabad': {
      APARTMENT: 9000,
      HOUSE: 12000,
      CONDO: 10000,
      TOWNHOUSE: 13000,
      VILLA: 18000,
      LAND: 6000,
      COMMERCIAL: 14000,
      INDUSTRIAL: 7000,
    },
  };

  return defaults[city]?.[propertyType] || 8000;
};

const calculateConfidence = (sampleSize: number, hasPriceIndex: boolean): number => {
  let confidence = 50;

  if (sampleSize >= 30) {
    confidence = 90;
  } else if (sampleSize >= 20) {
    confidence = 80;
  } else if (sampleSize >= 10) {
    confidence = 70;
  } else if (sampleSize >= 5) {
    confidence = 60;
  }

  if (hasPriceIndex) {
    confidence = Math.min(95, confidence + 10);
  }

  return confidence;
};

export const recordValuationSample = async (listingId: string) => {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: { city: true },
  });

  if (!listing || listing.status !== 'SOLD') return;

  const pricePerSqft = listing.price.div(listing.totalArea);

  await prisma.valuationSample.create({
    data: {
      listingId: listing.id,
      city: listing.city.name,
      area: listing.sector || listing.phase || '',
      propertyType: listing.propertyType,
      transactionType: listing.transactionType,
      price: listing.price,
      pricePerSqft,
      totalArea: listing.totalArea,
      bedrooms: listing.bedrooms,
      bathrooms: listing.bathrooms,
      latitude: listing.latitude,
      longitude: listing.longitude,
      soldDate: listing.soldAt,
      listedDate: listing.publishedAt || listing.createdAt,
    },
  });
};
