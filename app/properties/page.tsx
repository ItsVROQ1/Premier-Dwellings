import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { ShellMain, ShellContainer } from '@/components/layout/shell';
import { Building2, MapPin, Bed, Bath, Maximize, Search, CheckCircle } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { formatCurrency, formatArea } from '@/lib/format';

async function getProperties(searchParams: {
  city?: string;
  propertyType?: string;
  minPrice?: string;
  maxPrice?: string;
  bedrooms?: string;
  transactionType?: string;
  search?: string;
}) {
  try {
    const where: any = {
      status: 'ACTIVE',
      moderationStatus: 'approved',
    };

    if (searchParams.city) {
      where.cityId = searchParams.city;
    }

    if (searchParams.propertyType) {
      where.propertyType = searchParams.propertyType;
    }

    if (searchParams.transactionType) {
      where.transactionType = searchParams.transactionType;
    }

    if (searchParams.bedrooms) {
      where.bedrooms = parseInt(searchParams.bedrooms);
    }

    if (searchParams.minPrice || searchParams.maxPrice) {
      where.price = {};
      if (searchParams.minPrice) {
        where.price.gte = parseFloat(searchParams.minPrice);
      }
      if (searchParams.maxPrice) {
        where.price.lte = parseFloat(searchParams.maxPrice);
      }
    }

    if (searchParams.search) {
      where.OR = [
        { title: { contains: searchParams.search, mode: 'insensitive' } },
        { description: { contains: searchParams.search, mode: 'insensitive' } },
        { plotNumber: { contains: searchParams.search, mode: 'insensitive' } },
      ];
    }

    const listings = await prisma.listing.findMany({
      where,
      take: 24,
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
  } catch (error) {
    console.error('Error fetching properties:', error);
    return [];
  }
}

async function getCities() {
  try {
    return await prisma.city.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  } catch (error) {
    console.error('Error fetching cities:', error);
    return [];
  }
}

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const params = {
    city: typeof searchParams.city === 'string' ? searchParams.city : undefined,
    propertyType: typeof searchParams.propertyType === 'string' ? searchParams.propertyType : undefined,
    minPrice: typeof searchParams.minPrice === 'string' ? searchParams.minPrice : undefined,
    maxPrice: typeof searchParams.maxPrice === 'string' ? searchParams.maxPrice : undefined,
    bedrooms: typeof searchParams.bedrooms === 'string' ? searchParams.bedrooms : undefined,
    transactionType: typeof searchParams.transactionType === 'string' ? searchParams.transactionType : undefined,
    search: typeof searchParams.search === 'string' ? searchParams.search : undefined,
  };

  const [listings, cities] = await Promise.all([getProperties(params), getCities()]);

  return (
    <ShellMain>
      <ShellContainer className="py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
            Find Your Perfect Property
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Browse {listings.length} properties matching your criteria
          </p>
        </div>

        {/* Search and Filter */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <form method="get" className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    name="search"
                    placeholder="Search by title, plot number..."
                    className="pl-10"
                    defaultValue={params.search}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">City</label>
                <Select name="city" defaultValue={params.city}>
                  <option value="">All Cities</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Type</label>
                <Select name="propertyType" defaultValue={params.propertyType}>
                  <option value="">All Types</option>
                  <option value="HOUSE">House</option>
                  <option value="APARTMENT">Apartment</option>
                  <option value="VILLA">Villa</option>
                  <option value="LAND">Land</option>
                  <option value="COMMERCIAL">Commercial</option>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  For
                </label>
                <Select name="transactionType" defaultValue={params.transactionType}>
                  <option value="">Sale & Rent</option>
                  <option value="SALE">Sale</option>
                  <option value="RENTAL">Rent</option>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Bedrooms
                </label>
                <Select name="bedrooms" defaultValue={params.bedrooms}>
                  <option value="">Any</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                  <option value="5">5+</option>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Min Price (PKR)
                </label>
                <Input
                  type="number"
                  name="minPrice"
                  placeholder="e.g., 5000000"
                  defaultValue={params.minPrice}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Max Price (PKR)
                </label>
                <Input
                  type="number"
                  name="maxPrice"
                  placeholder="e.g., 50000000"
                  defaultValue={params.maxPrice}
                />
              </div>

              <div className="flex items-end space-x-2">
                <Button type="submit" className="w-full">
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => {
            const mainImage = listing.images[0];
            return (
              <Link key={listing.id} href={`/properties/${listing.slug}`}>
                <Card className="group h-full overflow-hidden transition-shadow hover:shadow-lg">
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
                        <span>{listing.bedrooms}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Bath className="h-4 w-4" />
                        <span>{Number(listing.bathrooms)}</span>
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

        {listings.length === 0 && (
          <div className="py-12 text-center">
            <Building2 className="mx-auto h-16 w-16 text-slate-400" />
            <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
              No properties found
            </h3>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              Try adjusting your search criteria
            </p>
          </div>
        )}
      </ShellContainer>
    </ShellMain>
  );
}
