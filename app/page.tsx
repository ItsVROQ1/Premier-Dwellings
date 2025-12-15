import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ShellMain, ShellContainer } from '@/components/layout/shell';

export default function Home() {
  return (
    <ShellMain>
      <ShellContainer className="py-12">
        <div className="space-y-12">
          {/* Header */}
          <section className="space-y-4">
            <div className="space-y-2">
              <h1 className="text-5xl font-bold tracking-tight text-foreground">
                Premium Real Estate Platform
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-400">
                Your one-stop marketplace for buying, selling, and renting properties
              </p>
            </div>
          </section>

          {/* Button Showcase */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Buttons</h2>
            <div className="flex flex-wrap gap-4">
              <Button variant="default">Primary Button</Button>
              <Button variant="secondary">Secondary Button</Button>
              <Button variant="outline">Outline Button</Button>
              <Button variant="ghost">Ghost Button</Button>
              <Button variant="destructive">Destructive Button</Button>
              <Button variant="success">Success Button</Button>
              <Button variant="default" size="sm">
                Small
              </Button>
              <Button variant="default" size="lg">
                Large
              </Button>
              <Button variant="default" size="icon">
                +
              </Button>
              <Button disabled>Disabled</Button>
            </div>
          </section>

          {/* Cards Showcase */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Cards</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Card Title</CardTitle>
                  <CardDescription>
                    This is a card description that explains the purpose
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 dark:text-slate-400">
                    Card content goes here. You can add any content you need.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Feature Card</CardTitle>
                  <CardDescription>Premium features and benefits</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-foreground">Benefits:</h4>
                    <ul className="list-inside space-y-1 text-sm text-slate-600 dark:text-slate-400">
                      <li>✓ Fast and reliable</li>
                      <li>✓ Secure transactions</li>
                      <li>✓ Expert support</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Inputs Showcase */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Inputs</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input placeholder="Standard input" />
              <Input placeholder="Disabled input" disabled />
              <Input type="email" placeholder="Email input" />
              <Input type="password" placeholder="Password input" />
            </div>
          </section>

          {/* Skeletons Showcase */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Loading Skeletons</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-64 w-full" />
              </div>
            </div>
          </section>

          {/* Color Palette */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Color Palette</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
              {[
                { name: 'Gold 500', color: 'bg-gold-500' },
                { name: 'Gold 600', color: 'bg-gold-600' },
                { name: 'Slate 900', color: 'bg-slate-900' },
                { name: 'Success', color: 'bg-success-600' },
                { name: 'Danger', color: 'bg-danger-600' },
                { name: 'Warning', color: 'bg-warning-500' },
              ].map((item) => (
                <div key={item.name} className="space-y-2">
                  <div className={`${item.color} h-20 rounded-lg`} />
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    {item.name}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Getting Started */}
          <section className="space-y-4 border-t border-slate-200 pt-8 dark:border-slate-700">
            <h2 className="text-2xl font-bold text-foreground">Getting Started</h2>
            <Card>
              <CardHeader>
                <CardTitle>Next Steps</CardTitle>
                <CardDescription>Your application is ready for development</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground">Database Setup:</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Run{' '}
                    <code className="rounded bg-slate-100 px-2 py-1 text-xs dark:bg-slate-800">
                      pnpm prisma migrate dev
                    </code>{' '}
                    to set up your database
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground">Seed Data:</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Run{' '}
                    <code className="rounded bg-slate-100 px-2 py-1 text-xs dark:bg-slate-800">
                      pnpm prisma db seed
                    </code>{' '}
                    to populate initial data
                  </p>
                </div>
                <Button className="mt-4">Learn More</Button>
              </CardContent>
            </Card>
          </section>
        </div>
      </ShellContainer>
    </ShellMain>
  );
}
