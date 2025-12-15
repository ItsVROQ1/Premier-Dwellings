import { ShellMain, ShellContainer } from '@/components/layout/shell';
import { Card, CardContent } from '@/components/ui/card';

export const metadata = {
  title: 'Terms of Service | Premium Estate',
  description: 'Terms of Service for Premium Estate',
};

export default function TermsPage() {
  return (
    <ShellMain>
      <ShellContainer className="py-16">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-6 text-4xl font-bold text-slate-900 dark:text-white">
            Terms of Service
          </h1>
          <Card>
            <CardContent className="prose dark:prose-invert max-w-none pt-6">
              <p className="text-slate-600 dark:text-slate-400">
                Last updated: {new Date().toLocaleDateString()}
              </p>

              <h2 className="mt-8 text-2xl font-bold text-slate-900 dark:text-white">
                Acceptance of Terms
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                By accessing and using Premium Estate, you accept and agree to be bound by the terms
                and provision of this agreement.
              </p>

              <h2 className="mt-8 text-2xl font-bold text-slate-900 dark:text-white">
                User Responsibilities
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Users are responsible for maintaining the confidentiality of their account
                information and for all activities that occur under their account.
              </p>

              <h2 className="mt-8 text-2xl font-bold text-slate-900 dark:text-white">
                Listing Guidelines
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                All property listings must be accurate, complete, and comply with applicable laws and
                regulations. False or misleading information is prohibited.
              </p>

              <h2 className="mt-8 text-2xl font-bold text-slate-900 dark:text-white">
                Limitation of Liability
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Premium Estate shall not be liable for any indirect, incidental, special,
                consequential or punitive damages resulting from your use of the service.
              </p>
            </CardContent>
          </Card>
        </div>
      </ShellContainer>
    </ShellMain>
  );
}
