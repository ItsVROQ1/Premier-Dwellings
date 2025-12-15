'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PaymentMethodSelector } from '@/components/payments/payment-method-selector';

interface SecurityDepositFormProps {
  agentName: string;
  onSubmit: (paymentMethod: string) => Promise<void>;
  loading?: boolean;
}

const DEPOSIT_AMOUNT = 2500000; // PKR 25 Lakh

export function SecurityDepositForm({
  agentName,
  onSubmit,
  loading = false,
}: SecurityDepositFormProps) {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const paymentMethods = [
    {
      id: 'JAZZCASH',
      name: 'JazzCash',
      description: 'Pakistani mobile payment',
      icon: '📱',
      available: true,
    },
    {
      id: 'EASYPAISA',
      name: 'Easypaisa',
      description: 'Pakistani mobile payment',
      icon: '📲',
      available: true,
    },
    {
      id: 'STRIPE',
      name: 'Credit/Debit Card',
      description: 'International payments',
      icon: '💳',
      available: true,
    },
    {
      id: 'BANK',
      name: 'Bank Transfer',
      description: 'Direct bank transfer',
      icon: '🏦',
      available: false,
    },
  ];

  const handleSubmit = async () => {
    if (!selectedMethod) return;

    try {
      setSubmitting(true);
      await onSubmit(selectedMethod);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Premium License Security Deposit</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Deposit Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Deposit Requirements</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>✓ One-time security deposit for premium license verification</li>
            <li>✓ Amount: PKR {(DEPOSIT_AMOUNT / 100000).toFixed(1)} Lakh</li>
            <li>✓ Refundable upon contract completion or license cancellation</li>
            <li>✓ Subject to admin approval</li>
          </ul>
        </div>

        {/* Deposit Amount */}
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-2">Security Deposit Amount</p>
          <p className="text-3xl font-bold text-gray-900">
            PKR {(DEPOSIT_AMOUNT / 100000).toFixed(1)}L
          </p>
        </div>

        {/* Payment Method Selection */}
        <PaymentMethodSelector
          methods={paymentMethods}
          selected={selectedMethod}
          onSelect={setSelectedMethod}
        />

        {/* Important Note */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <span className="font-semibold">Note:</span> After payment, your application will be
            reviewed by our team. You will receive notification once approved.
          </p>
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={!selectedMethod || submitting || loading}
          size="lg"
          className="w-full"
        >
          {submitting || loading ? 'Processing...' : 'Proceed to Payment'}
        </Button>
      </CardContent>
    </Card>
  );
}
