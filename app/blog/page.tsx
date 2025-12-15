import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShellMain, ShellContainer } from '@/components/layout/shell';
import { Calendar, User, FileText } from 'lucide-react';
import { prisma } from '@/lib/prisma';

async function getBlogPosts() {
  return await prisma.blogPost.findMany({
    where: {
      isPublished: true,
    },
    orderBy: {
      publishedAt: 'desc',
    },
    take: 12,
    include: {
      author: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  });
}

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <ShellMain>
      <ShellContainer className="py-16">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-slate-900 dark:text-white">Blog</h1>
          <p className="text-xl text-slate-600 dark:text-slate-400">
            Insights, tips, and updates from the real estate world
          </p>
        </div>

        {posts.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`}>
                <Card className="h-full transition-shadow hover:shadow-lg">
                  {post.featuredImage && (
                    <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                      <img
                        src={post.featuredImage}
                        alt={post.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="mb-2 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {post.publishedAt
                          ? new Date(post.publishedAt).toLocaleDateString()
                          : 'Draft'}
                      </span>
                    </div>
                    <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {post.excerpt && (
                      <p className="line-clamp-3 text-slate-600 dark:text-slate-400">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="mt-4 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <User className="h-4 w-4" />
                      <span>
                        {post.author.firstName} {post.author.lastName}
                      </span>
                    </div>
                    {post.tags.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {post.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <FileText className="mx-auto h-16 w-16 text-slate-400" />
            <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
              No blog posts yet
            </h3>
            <p className="mt-2 text-slate-600 dark:text-slate-400">Check back soon for updates</p>
          </div>
        )}
      </ShellContainer>
    </ShellMain>
  );
}
