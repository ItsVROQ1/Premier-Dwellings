import { ShellMain, ShellContainer } from '@/components/layout/shell';
import { Card, CardContent } from '@/components/ui/card';

export const metadata = {
  title: 'Privacy Policy | Premium Estate',
  description: 'Privacy Policy for Premium Estate',
};

export default function PrivacyPage() {
  return (
    <ShellMain>
      <ShellContainer className="py-16">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-6 text-4xl font-bold text-slate-900 dark:text-white">
            Privacy Policy
          </h1>
          <Card>
            <CardContent className="prose dark:prose-invert max-w-none pt-6">
              <p className="text-slate-600 dark:text-slate-400">
                Last updated: {new Date().toLocaleDateString()}
              </p>

              <h2 className="mt-8 text-2xl font-bold text-slate-900 dark:text-white">
                Information We Collect
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                We collect information you provide directly to us, such as when you create an
                account, list a property, or contact us for support.
              </p>

              <h2 className="mt-8 text-2xl font-bold text-slate-900 dark:text-white">
                How We Use Your Information
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                We use the information we collect to provide, maintain, and improve our services, to
                communicate with you, and to comply with legal obligations.
              </p>

              <h2 className="mt-8 text-2xl font-bold text-slate-900 dark:text-white">
                Data Security
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                We implement appropriate technical and organizational measures to protect your
                personal information against unauthorized access, alteration, disclosure, or
                destruction.
              </p>

              <h2 className="mt-8 text-2xl font-bold text-slate-900 dark:text-white">
                Contact Us
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                If you have questions about this Privacy Policy, please contact us at
                privacy@premiumestate.com
              </p>
            </CardContent>
          </Card>
        </div>
      </ShellContainer>
    </ShellMain>
  );
}
