import { ShellMain, ShellContainer } from '@/components/layout/shell';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Search, Building2, CheckCircle, Users } from 'lucide-react';

export const metadata = {
  title: 'How It Works | Premium Estate',
  description: 'Learn how Premium Estate works',
};

const steps = [
  {
    icon: Users,
    title: 'Create Your Account',
    description:
      'Sign up for free and choose the plan that fits your needs. Whether you are a buyer, seller, or agent, we have options for everyone.',
  },
  {
    icon: Building2,
    title: 'List or Search Properties',
    description:
      'Agents can list properties with detailed information and images. Buyers can search through our extensive database using advanced filters.',
  },
  {
    icon: CheckCircle,
    title: 'Verification & Moderation',
    description:
      'Our team reviews all listings to ensure quality and accuracy. Verified agents get special badges to build trust with buyers.',
  },
  {
    icon: Search,
    title: 'Connect & Close Deals',
    description:
      'Buyers and sellers connect directly through our platform. Complete transactions with confidence using our secure system.',
  },
];

export default function HowItWorksPage() {
  return (
    <ShellMain>
      <ShellContainer className="py-16">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-4xl font-bold text-slate-900 dark:text-white">
              How It Works
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              Finding or listing your property is easy with Premium Estate
            </p>
          </div>

          <div className="space-y-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <Card key={index}>
                  <CardContent className="flex gap-6 pt-6">
                    <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-gold-100">
                      <Icon className="h-8 w-8 text-gold-600" />
                    </div>
                    <div>
                      <h3 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">
                        {index + 1}. {step.title}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400">{step.description}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card className="mt-12 border-gold-500 bg-gradient-to-br from-gold-50 to-gold-100 dark:from-gold-950 dark:to-gold-900">
            <CardContent className="pt-6 text-center">
              <h3 className="mb-4 text-2xl font-bold text-slate-900 dark:text-white">
                Ready to Get Started?
              </h3>
              <p className="mb-6 text-slate-600 dark:text-slate-400">
                Join thousands of users finding their perfect properties
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button size="lg" asChild>
                  <Link href="/auth/signup">Create Account</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/properties">Browse Properties</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </ShellContainer>
    </ShellMain>
  );
}
