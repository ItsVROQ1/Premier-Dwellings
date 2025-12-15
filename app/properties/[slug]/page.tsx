import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShellMain, ShellContainer } from '@/components/layout/shell';
import { ValuationWidget } from '@/components/valuation/valuation-widget';
import {
  MapPin,
  Bed,
  Bath,
  Maximize,
  CheckCircle,
  Share2,
  Heart,
  Phone,
  Mail,
  Calendar,
  TrendingUp,
} from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { formatCurrency, formatArea } from '@/lib/format';

async function getPropertyBySlug(slug: string) {
  const listing = await prisma.listing.findUnique({
    where: { slug },
    include: {
      city: true,
      images: {
        orderBy: { order: 'asc' },
      },
      amenities: true,
      agent: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          avatar: true,
          isVerified: true,
          company: true,
        },
      },
    },
  });

  if (!listing || listing.status !== 'ACTIVE' || listing.moderationStatus !== 'approved') {
    return null;
  }

  await prisma.listing.update({
    where: { id: listing.id },
    data: { viewCount: { increment: 1 } },
  });

  return listing;
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const listing = await getPropertyBySlug(params.slug);

  if (!listing) {
    return {
      title: 'Property Not Found',
    };
  }

  const mainImage = listing.images.find((img) => img.isMain) || listing.images[0];

  return {
    title: `${listing.title} | Premium Estate`,
    description: listing.description.substring(0, 160),
    openGraph: {
      title: listing.title,
      description: listing.description.substring(0, 160),
      images: mainImage ? [mainImage.url] : [],
      type: 'website',
    },
  };
}

export default async function PropertyDetailPage({ params }: { params: { slug: string } }) {
  const listing = await getPropertyBySlug(params.slug);

  if (!listing) {
    notFound();
  }

  const mainImage = listing.images.find((img) => img.isMain) || listing.images[0];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: listing.title,
    description: listing.description,
    url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/properties/${listing.slug}`,
    image: mainImage?.url,
    price: listing.price.toString(),
    priceCurrency: listing.currency,
    address: {
      '@type': 'PostalAddress',
      addressLocality: listing.city.name,
      addressRegion: listing.city.state,
      addressCountry: listing.city.country,
    },
    numberOfRooms: listing.bedrooms,
    floorSize: {
      '@type': 'QuantitativeValue',
      value: listing.totalArea.toString(),
      unitCode: listing.areaUnit,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ShellMain>
        <ShellContainer className="py-8">
          {/* Image Gallery */}
          <div className="mb-8">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="relative aspect-video overflow-hidden rounded-lg bg-slate-200 md:col-span-2">
                {mainImage ? (
                  <img
                    src={mainImage.url}
                    alt={mainImage.alt || listing.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <span className="text-slate-400">No image available</span>
                  </div>
                )}
              </div>
              {listing.images.slice(1, 5).map((image) => (
                <div
                  key={image.id}
                  className="relative aspect-video overflow-hidden rounded-lg bg-slate-200"
                >
                  <img
                    src={image.url}
                    alt={image.alt || listing.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="mb-6">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="bg-gold-500">
                      {listing.transactionType}
                    </Badge>
                    <Badge variant="secondary">{listing.propertyType.replace('_', ' ')}</Badge>
                    {listing.agent.isVerified && (
                      <Badge variant="success" className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Verified Agent
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon">
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <h1 className="mb-2 text-3xl font-bold text-slate-900 dark:text-white">
                  {listing.title}
                </h1>
                <div className="flex items-center text-slate-600 dark:text-slate-400">
                  <MapPin className="mr-2 h-5 w-5" />
                  <span>
                    {listing.streetAddress}, {listing.city.name}
                  </span>
                </div>
                <div className="mt-4 text-4xl font-bold text-gold-600">
                  {formatCurrency(Number(listing.price), listing.currency)}
                </div>
              </div>

              {/* Key Features */}
              <Card className="mb-6">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-100">
                        <Bed className="h-6 w-6 text-gold-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">
                          {listing.bedrooms}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">Bedrooms</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-100">
                        <Bath className="h-6 w-6 text-gold-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">
                          {Number(listing.bathrooms)}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">Bathrooms</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-100">
                        <Maximize className="h-6 w-6 text-gold-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">
                          {formatArea(Number(listing.totalArea), listing.areaUnit)}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">Area</div>
                      </div>
                    </div>
                    {listing.yearBuilt && (
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-100">
                          <Calendar className="h-6 w-6 text-gold-600" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-slate-900 dark:text-white">
                            {listing.yearBuilt}
                          </div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">Built</div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Description */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-slate-600 dark:text-slate-400">
                    {listing.description}
                  </p>
                </CardContent>
              </Card>

              {/* Amenities */}
              {listing.amenities.length > 0 && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Amenities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                      {listing.amenities.map((amenity) => (
                        <div key={amenity.id} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-success-600" />
                          <span className="text-sm text-slate-700 dark:text-slate-300">
                            {amenity.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* AI Valuation Widget */}
              <div className="mb-6">
                <ValuationWidget
                  listingId={listing.id}
                  propertyType={listing.propertyType}
                  transactionType={listing.transactionType}
                  city={listing.city.name}
                  area={listing.sector || listing.phase}
                  totalArea={Number(listing.totalArea)}
                  bedrooms={listing.bedrooms}
                  bathrooms={Number(listing.bathrooms)}
                  latitude={listing.latitude ?? undefined}
                  longitude={listing.longitude ?? undefined}
                  address={`${listing.streetAddress}, ${listing.city.name}`}
                />
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Agent Card */}
              <Card className="sticky top-20 mb-6">
                <CardHeader>
                  <CardTitle>Contact Agent</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    {listing.agent.avatar ? (
                      <img
                        src={listing.agent.avatar}
                        alt={`${listing.agent.firstName} ${listing.agent.lastName}`}
                        className="h-12 w-12 rounded-full"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-500 text-white">
                        {listing.agent.firstName?.[0]}
                        {listing.agent.lastName?.[0]}
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {listing.agent.firstName} {listing.agent.lastName}
                      </div>
                      {listing.agent.company && (
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          {listing.agent.company}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {listing.contactPhone || listing.agent.phone && (
                      <Button variant="outline" className="w-full justify-start" asChild>
                        <a href={`tel:${listing.contactPhone || listing.agent.phone}`}>
                          <Phone className="mr-2 h-4 w-4" />
                          {listing.contactPhone || listing.agent.phone}
                        </a>
                      </Button>
                    )}
                    {listing.contactEmail || listing.agent.email && (
                      <Button variant="outline" className="w-full justify-start" asChild>
                        <a href={`mailto:${listing.contactEmail || listing.agent.email}`}>
                          <Mail className="mr-2 h-4 w-4" />
                          {listing.contactEmail || listing.agent.email}
                        </a>
                      </Button>
                    )}
                  </div>

                  <Button className="w-full" asChild>
                    <Link href={`/inquiries/new?listingId=${listing.id}`}>Send Inquiry</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Map Placeholder */}
              {listing.latitude && listing.longitude && (
                <Card>
                  <CardHeader>
                    <CardTitle>Location</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video rounded-lg bg-slate-200">
                      <div className="flex h-full items-center justify-center text-slate-600">
                        <MapPin className="h-8 w-8" />
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                      {listing.streetAddress}, {listing.city.name}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </ShellContainer>
      </ShellMain>
    </>
  );
}
