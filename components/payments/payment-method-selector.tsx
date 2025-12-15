'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: string;
  available: boolean;
}

interface PaymentMethodSelectorProps {
  methods: PaymentMethod[];
  selected: string | null;
  onSelect: (methodId: string) => void;
}

export function PaymentMethodSelector({
  methods,
  selected,
  onSelect,
}: PaymentMethodSelectorProps) {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold">Select Payment Method</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {methods.map((method) => (
          <button
            key={method.id}
            onClick={() => method.available && onSelect(method.id)}
            disabled={!method.available}
            className={`p-4 border-2 rounded-lg text-left transition-all ${
              selected === method.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            } ${!method.available ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="font-semibold">{method.name}</p>
                <p className="text-sm text-gray-600">{method.description}</p>
              </div>
              {!method.available && (
                <Badge variant="outline" className="ml-2">
                  Coming Soon
                </Badge>
              )}
              {selected === method.id && (
                <div className="ml-2 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-white">✓</span>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
