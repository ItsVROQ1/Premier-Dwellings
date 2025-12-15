import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShellMain, ShellContainer } from '@/components/layout/shell';
import { Building2, MapPin, Bed, Bath, Maximize, CheckCircle } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { formatCurrency, formatArea } from '@/lib/format';

async function getFeaturedListings() {
  const listings = await prisma.listing.findMany({
    where: {
      status: 'ACTIVE',
      moderationStatus: 'approved',
      isFeatured: true,
    },
    take: 6,
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      city: true,
      images: {
        where: { isMain: true },
        take: 1,
      },
      agent: {
        select: {
          firstName: true,
          lastName: true,
          isVerified: true,
        },
      },
    },
  });

  return listings;
}

export default async function Home() {
  const featuredListings = await getFeaturedListings();

  return (
    <ShellMain>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <ShellContainer className="py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-5xl font-bold tracking-tight text-white md:text-6xl">
              Find Your Dream Property in Pakistan
            </h1>
            <p className="mb-8 text-xl text-slate-300">
              Discover premium homes, apartments, and commercial spaces across major cities
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/properties">Explore Properties</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" asChild>
                <Link href="/dashboard/listings/new">List Your Property</Link>
              </Button>
            </div>
          </div>
        </ShellContainer>
      </section>

      {/* Featured Properties */}
      <section className="py-16">
        <ShellContainer>
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Featured Properties</h2>
              <p className="mt-2 text-slate-600 dark:text-slate-400">
                Premium listings handpicked for you
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/properties">View All</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredListings.map((listing) => {
              const mainImage = listing.images[0];
              return (
                <Link key={listing.id} href={`/properties/${listing.slug}`}>
                  <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
                    <div className="relative aspect-video w-full overflow-hidden bg-slate-200">
                      {mainImage ? (
                        <img
                          src={mainImage.url}
                          alt={mainImage.alt || listing.title}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Building2 className="h-16 w-16 text-slate-400" />
                        </div>
                      )}
                      <div className="absolute right-2 top-2">
                        <Badge variant="default" className="bg-gold-500">
                          {listing.transactionType}
                        </Badge>
                      </div>
                      {listing.agent.isVerified && (
                        <div className="absolute left-2 top-2">
                          <Badge variant="success" className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Verified
                          </Badge>
                        </div>
                      )}
                    </div>
                    <CardHeader>
                      <div className="mb-2 flex items-center text-sm text-slate-600 dark:text-slate-400">
                        <MapPin className="mr-1 h-4 w-4" />
                        {listing.city.name}
                      </div>
                      <CardTitle className="line-clamp-2">{listing.title}</CardTitle>
                      <div className="mt-2 text-2xl font-bold text-gold-600">
                        {formatCurrency(Number(listing.price), listing.currency)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-1">
                          <Bed className="h-4 w-4" />
                          <span>{listing.bedrooms} Beds</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Bath className="h-4 w-4" />
                          <span>{Number(listing.bathrooms)} Baths</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Maximize className="h-4 w-4" />
                          <span>{formatArea(Number(listing.totalArea), listing.areaUnit)}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="border-t border-slate-200 dark:border-slate-700">
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {listing.propertyType.replace('_', ' ')}
                      </p>
                    </CardFooter>
                  </Card>
                </Link>
              );
            })}
          </div>

          {featuredListings.length === 0 && (
            <div className="py-12 text-center">
              <Building2 className="mx-auto h-16 w-16 text-slate-400" />
              <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
                No properties available
              </h3>
              <p className="mt-2 text-slate-600 dark:text-slate-400">
                Check back soon for new listings
              </p>
            </div>
          )}
        </ShellContainer>
      </section>

      {/* CTA Section */}
      <section className="bg-gold-500 py-16">
        <ShellContainer>
          <div className="text-center">
            <h2 className="mb-4 text-3xl font-bold text-white">Ready to Get Started?</h2>
            <p className="mb-8 text-lg text-white/90">
              Join thousands of users finding their perfect properties
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/auth/signup">Create Free Account</Link>
            </Button>
          </div>
        </ShellContainer>
      </section>
    </ShellMain>
  );
}
