import { ShellMain, ShellContainer } from '@/components/layout/shell';
import { Card, CardContent } from '@/components/ui/card';

export const metadata = {
  title: 'About Us | Premium Estate',
  description: 'Learn more about Premium Estate and our mission to revolutionize real estate',
};

export default function AboutPage() {
  return (
    <ShellMain>
      <ShellContainer className="py-16">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-6 text-4xl font-bold text-slate-900 dark:text-white">About Us</h1>

          <Card>
            <CardContent className="prose dark:prose-invert max-w-none pt-6">
              <p className="text-lg text-slate-600 dark:text-slate-400">
                Welcome to Premium Estate, Pakistan's leading real estate platform connecting buyers,
                sellers, and agents across the country.
              </p>

              <h2 className="mt-8 text-2xl font-bold text-slate-900 dark:text-white">Our Mission</h2>
              <p className="text-slate-600 dark:text-slate-400">
                We strive to make property transactions transparent, efficient, and accessible to
                everyone. Our platform combines cutting-edge technology with deep market expertise to
                deliver exceptional results.
              </p>

              <h2 className="mt-8 text-2xl font-bold text-slate-900 dark:text-white">Why Choose Us</h2>
              <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                <li>✓ Verified listings from trusted agents</li>
                <li>✓ Advanced search and filtering options</li>
                <li>✓ Comprehensive property information</li>
                <li>✓ Direct communication with sellers and agents</li>
                <li>✓ Market insights and analytics</li>
              </ul>

              <h2 className="mt-8 text-2xl font-bold text-slate-900 dark:text-white">Get in Touch</h2>
              <p className="text-slate-600 dark:text-slate-400">
                Have questions or feedback? We'd love to hear from you. Visit our{' '}
                <a href="/contact" className="text-gold-600 hover:underline">
                  contact page
                </a>{' '}
                to get in touch.
              </p>
            </CardContent>
          </Card>
        </div>
      </ShellContainer>
    </ShellMain>
  );
}
