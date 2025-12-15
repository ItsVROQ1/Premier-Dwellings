'use client';

import { useEffect, useState } from 'react';
import { ShellMain, ShellContainer } from '@/components/layout/shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Check, AlertCircle, Calendar, Users } from 'lucide-react';

interface PlanConfig {
  id: string;
  tier: string;
  name: string;
  price: number;
  maxListings: number;
  hasAnalytics: boolean;
  hasPromotion: boolean;
  hasPriority: boolean;
  features: string[];
}

interface Subscription {
  id: string;
  planTier: string;
  status: string;
  listingsUsed: number;
  listingsLimit: number;
  startDate: string;
  endDate: string;
}

export default function SubscriptionPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [planConfig, setPlanConfig] = useState<PlanConfig | null>(null);
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This would fetch the user's subscription in a real app
    // For now, we'll show a placeholder
    setLoading(false);
  }, []);

  const allPlans: PlanConfig[] = [
    {
      id: '1',
      tier: 'FREE',
      name: 'Free',
      price: 0,
      maxListings: 1,
      hasAnalytics: false,
      hasPromotion: false,
      hasPriority: false,
      features: ['Basic listing', 'Email support'],
    },
    {
      id: '2',
      tier: 'STARTER',
      name: 'Starter',
      price: 29.99,
      maxListings: 10,
      hasAnalytics: true,
      hasPromotion: false,
      hasPriority: false,
      features: ['Up to 10 listings', 'Basic analytics', 'Email & phone support'],
    },
    {
      id: '3',
      tier: 'PROFESSIONAL',
      name: 'Professional',
      price: 79.99,
      maxListings: 50,
      hasAnalytics: true,
      hasPromotion: true,
      hasPriority: false,
      features: ['Up to 50 listings', 'Advanced analytics', 'Promotion tools', 'Priority support'],
    },
    {
      id: '4',
      tier: 'PREMIUM',
      name: 'Premium',
      price: 199.99,
      maxListings: -1,
      hasAnalytics: true,
      hasPromotion: true,
      hasPriority: true,
      features: ['Unlimited listings', 'Advanced analytics', 'Full promotion suite', '24/7 priority support'],
    },
  ];

  return (
    <ShellMain>
      <ShellContainer className="py-8">
        <h1 className="mb-8 text-3xl font-bold text-slate-900 dark:text-white">
          Subscription Management
        </h1>

        {/* Current Subscription Status */}
        <Card className="mb-8 border-gold-200 bg-gold-50 dark:border-gold-900 dark:bg-gold-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-semibold">Your Current Plan</CardTitle>
            <Zap className="h-5 w-5 text-gold-600 dark:text-gold-400" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Plan Tier</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">Professional</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Status</p>
                <p className="flex items-center gap-2 text-2xl font-bold text-green-600">
                  <span className="inline-block h-3 w-3 rounded-full bg-green-600"></span>
                  Active
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg bg-white p-4 dark:bg-slate-800">
                <p className="text-sm text-slate-600 dark:text-slate-400">Listings Used</p>
                <p className="text-xl font-semibold text-slate-900 dark:text-white">
                  0 / 50
                </p>
              </div>
              <div className="rounded-lg bg-white p-4 dark:bg-slate-800">
                <p className="text-sm text-slate-600 dark:text-slate-400">Start Date</p>
                <p className="text-xl font-semibold text-slate-900 dark:text-white">
                  Dec 15, 2024
                </p>
              </div>
              <div className="rounded-lg bg-white p-4 dark:bg-slate-800">
                <p className="text-sm text-slate-600 dark:text-slate-400">Expires In</p>
                <p className="text-xl font-semibold text-slate-900 dark:text-white">
                  15 days
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button className="flex-1 rounded-lg bg-gold-600 px-4 py-2 font-semibold text-slate-900 transition-colors hover:bg-gold-700">
                Renew Subscription
              </button>
              <button className="flex-1 rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-900 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:text-white dark:hover:bg-slate-800">
                Downgrade Plan
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Plan Comparison */}
        <div className="mb-8">
          <h2 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">
            Choose Your Plan
          </h2>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {allPlans.map((plan) => (
              <Card
                key={plan.id}
                className={`flex flex-col ${
                  plan.tier === 'PROFESSIONAL'
                    ? 'border-gold-600 ring-2 ring-gold-200 dark:ring-gold-800'
                    : ''
                }`}
              >
                <CardHeader>
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-slate-900 dark:text-white">
                      ${plan.price}
                    </span>
                    <span className="text-sm text-slate-600 dark:text-slate-400">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-4">
                  <div className="text-sm">
                    <div className="mb-3 flex items-center gap-2">
                      <Users className="h-4 w-4 text-gold-600" />
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {plan.maxListings === -1
                          ? 'Unlimited Listings'
                          : `${plan.maxListings} Listings`}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-auto pt-4">
                    <button
                      className={`w-full rounded-lg px-4 py-2 font-semibold transition-colors ${
                        plan.tier === 'PROFESSIONAL'
                          ? 'bg-gold-600 text-slate-900 hover:bg-gold-700'
                          : 'border border-slate-300 text-slate-900 hover:bg-slate-50 dark:border-slate-600 dark:text-white dark:hover:bg-slate-800'
                      }`}
                    >
                      {plan.tier === 'PROFESSIONAL' ? 'Current Plan' : 'Upgrade'}
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Billing History */}
        <Card>
          <CardHeader>
            <CardTitle>Billing History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-700">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    Professional Plan (Monthly)
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Dec 15, 2024 - Jan 15, 2025
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-900 dark:text-white">$79.99</p>
                  <p className="text-sm text-green-600">Paid</p>
                </div>
              </div>

              <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Next billing date: January 15, 2025
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </ShellContainer>
    </ShellMain>
  );
}
