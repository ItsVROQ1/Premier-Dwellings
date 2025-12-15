import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

  const listings = await prisma.listing.findMany({
    where: {
      status: 'ACTIVE',
      moderationStatus: 'approved',
    },
    select: {
      slug: true,
      updatedAt: true,
    },
  });

  const blogPosts = await prisma.blogPost.findMany({
    where: {
      isPublished: true,
    },
    select: {
      slug: true,
      updatedAt: true,
    },
  });

  const staticPages = [
    '',
    '/properties',
    '/projects',
    '/blog',
    '/about',
    '/contact',
    '/how-it-works',
    '/faq',
    '/privacy',
    '/terms',
  ];

  return [
    ...staticPages.map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: route === '' ? 1 : 0.8,
    })),
    ...listings.map((listing) => ({
      url: `${baseUrl}/properties/${listing.slug}`,
      lastModified: listing.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...blogPosts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ];
}
