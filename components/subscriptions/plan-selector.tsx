'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlanTier } from '@prisma/client';

interface PlanConfig {
  tier: PlanTier;
  name: string;
  monthlyPrice: number;
  yearlyPrice?: number;
  features: string[];
  maxListings: number;
}

interface PlanSelectorProps {
  plans: PlanConfig[];
  currentPlan?: PlanTier;
  onSelectPlan: (tier: PlanTier, billingPeriod: 'MONTHLY' | 'YEARLY') => void;
  loading?: boolean;
}

export function PlanSelector({
  plans,
  currentPlan,
  onSelectPlan,
  loading = false,
}: PlanSelectorProps) {
  const [selectedBilling, setSelectedBilling] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');

  return (
    <div className="space-y-6">
      {/* Billing Period Selector */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => setSelectedBilling('MONTHLY')}
          className={`px-6 py-2 rounded-lg font-semibold transition-all ${
            selectedBilling === 'MONTHLY'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          }`}
        >
          Monthly
        </button>
        <button
          onClick={() => setSelectedBilling('YEARLY')}
          className={`px-6 py-2 rounded-lg font-semibold transition-all ${
            selectedBilling === 'YEARLY'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          }`}
        >
          Yearly
          <Badge variant="success" className="ml-2 text-xs">
            Save 20%
          </Badge>
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => {
          const price =
            selectedBilling === 'YEARLY' && plan.yearlyPrice
              ? plan.yearlyPrice
              : plan.monthlyPrice;
          const isCurrentPlan = currentPlan === plan.tier;

          return (
            <Card
              key={plan.tier}
              className={`flex flex-col transition-all ${isCurrentPlan ? 'ring-2 ring-blue-600' : ''}`}
            >
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                {isCurrentPlan && (
                  <Badge className="mt-2 w-fit">Current Plan</Badge>
                )}
              </CardHeader>

              <CardContent className="flex-1 space-y-4">
                {/* Price */}
                <div>
                  <p className="text-3xl font-bold">
                    PKR {price.toLocaleString('ur-PK')}
                  </p>
                  <p className="text-sm text-gray-600">
                    per {selectedBilling === 'MONTHLY' ? 'month' : 'year'}
                  </p>
                </div>

                {/* Features */}
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-700">
                    Up to {plan.maxListings === -1 ? 'Unlimited' : plan.maxListings} Listings
                  </p>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <span className="text-green-600 mt-0.5">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Button */}
                <Button
                  onClick={() => onSelectPlan(plan.tier, selectedBilling)}
                  disabled={isCurrentPlan || loading}
                  variant={isCurrentPlan ? 'outline' : 'default'}
                  className="w-full mt-4"
                >
                  {isCurrentPlan ? 'Current Plan' : 'Select Plan'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
