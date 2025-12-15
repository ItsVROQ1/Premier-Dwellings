'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SubscriptionCardProps {
  planName: string;
  planTier: string;
  isActive: boolean;
  startDate: Date;
  endDate: Date;
  features: string[];
  onUpgrade: () => void;
  onRenew: () => void;
  onManage: () => void;
}

export function SubscriptionCard({
  planName,
  planTier,
  isActive,
  startDate,
  endDate,
  features,
  onUpgrade,
  onRenew,
  onManage,
}: SubscriptionCardProps) {
  const daysRemaining = Math.ceil(
    (endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  const isExpiringSoon = daysRemaining <= 7;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-2xl">{planName}</CardTitle>
            <CardDescription>Current subscription plan</CardDescription>
          </div>
          <Badge variant={isActive ? 'default' : 'destructive'}>
            {isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Plan Details */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Started</p>
            <p className="font-semibold">{startDate.toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Expires</p>
            <p className="font-semibold">{endDate.toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Days Remaining</p>
            <p className={`font-semibold ${isExpiringSoon ? 'text-red-600' : ''}`}>
              {daysRemaining} days
            </p>
          </div>
        </div>

        {/* Features List */}
        <div>
          <h4 className="font-semibold mb-3">Included Features</h4>
          <ul className="space-y-2">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <span className="text-green-600 mt-1">✓</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={onManage} className="flex-1">
            Manage
          </Button>
          {isExpiringSoon && (
            <Button onClick={onRenew} className="flex-1">
              Renew Now
            </Button>
          )}
          <Button onClick={onUpgrade} className="flex-1">
            Upgrade Plan
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
