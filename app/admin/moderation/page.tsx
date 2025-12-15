import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShellMain, ShellContainer } from '@/components/layout/shell';
import { Building2, CheckCircle, XCircle } from 'lucide-react';

export default function ModerationPage() {
  return (
    <ShellMain>
      <ShellContainer className="py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Listing Moderation Queue
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Review and moderate pending listings
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Pending Listings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-12 text-center">
              <div>
                <Building2 className="mx-auto h-12 w-12 text-slate-400" />
                <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
                  No pending listings
                </h3>
                <p className="mt-2 text-slate-600 dark:text-slate-400">
                  All listings have been reviewed
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </ShellContainer>
    </ShellMain>
  );
}
