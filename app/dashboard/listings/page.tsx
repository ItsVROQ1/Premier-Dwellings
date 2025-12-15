import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShellMain, ShellContainer } from '@/components/layout/shell';
import { Building2, Plus, Edit, Archive } from 'lucide-react';

export default function ListingsPage() {
  return (
    <ShellMain>
      <ShellContainer className="py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">My Listings</h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              Manage your property listings
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/listings/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Listing
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Listings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-center py-12 text-center">
                <div>
                  <Building2 className="mx-auto h-12 w-12 text-slate-400" />
                  <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
                    No listings yet
                  </h3>
                  <p className="mt-2 text-slate-600 dark:text-slate-400">
                    Get started by creating your first listing
                  </p>
                  <Button className="mt-4" asChild>
                    <Link href="/dashboard/listings/new">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Listing
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </ShellContainer>
    </ShellMain>
  );
}
