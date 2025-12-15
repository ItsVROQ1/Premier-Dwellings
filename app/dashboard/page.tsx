import { ShellMain, ShellContainer } from '@/components/layout/shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Eye, Heart, MessageSquare, Zap, AlertCircle } from 'lucide-react';

export default function DashboardPage() {
  return (
    <ShellMain>
      <ShellContainer className="py-8">
        <h1 className="mb-8 text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>

        <Card className="mb-6 border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subscription Status</CardTitle>
            <Zap className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">Professional Plan</div>
            <p className="text-xs text-yellow-700 dark:text-yellow-200">Expires in 15 days • <a href="/dashboard/subscription" className="underline hover:no-underline">Renew Now</a></p>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
              <Building2 className="h-4 w-4 text-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-slate-600">Active properties</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-slate-600">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Favorites</CardTitle>
              <Heart className="h-4 w-4 text-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-slate-600">Total favorites</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inquiries</CardTitle>
              <MessageSquare className="h-4 w-4 text-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-slate-600">Pending responses</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <a
                href="/dashboard/listings/new"
                className="flex flex-col items-center justify-center rounded-lg border border-slate-200 p-6 text-center transition-colors hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                <Building2 className="mb-2 h-8 w-8 text-gold-600" />
                <h3 className="font-semibold text-slate-900 dark:text-white">Create Listing</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  List a new property
                </p>
              </a>
              <a
                href="/dashboard/listings"
                className="flex flex-col items-center justify-center rounded-lg border border-slate-200 p-6 text-center transition-colors hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                <Eye className="mb-2 h-8 w-8 text-gold-600" />
                <h3 className="font-semibold text-slate-900 dark:text-white">View Listings</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Manage your properties
                </p>
              </a>
              <a
                href="/dashboard/inquiries"
                className="flex flex-col items-center justify-center rounded-lg border border-slate-200 p-6 text-center transition-colors hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                <MessageSquare className="mb-2 h-8 w-8 text-gold-600" />
                <h3 className="font-semibold text-slate-900 dark:text-white">Inquiries</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Respond to messages
                </p>
              </a>
              <a
                href="/dashboard/subscription"
                className="flex flex-col items-center justify-center rounded-lg border border-slate-200 p-6 text-center transition-colors hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                <Zap className="mb-2 h-8 w-8 text-gold-600" />
                <h3 className="font-semibold text-slate-900 dark:text-white">Subscription</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Manage your plan
                </p>
              </a>
            </div>
          </CardContent>
        </Card>
      </ShellContainer>
    </ShellMain>
  );
}
