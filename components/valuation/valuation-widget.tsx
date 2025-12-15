'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Loader2, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/format';

interface ValuationData {
  estimatedPrice: {
    min: number;
    max: number;
    median: number;
  };
  pricePerSqft: {
    min: number;
    max: number;
    avg: number;
  };
  confidence: number;
  factors: {
    name: string;
    impact: 'positive' | 'negative' | 'neutral';
    description: string;
  }[];
  comparables: number;
  currency: string;
}

interface ValuationWidgetProps {
  listingId?: string;
  propertyType: string;
  transactionType: string;
  city: string;
  area?: string;
  totalArea: number;
  bedrooms?: number;
  bathrooms?: number;
  latitude?: number;
  longitude?: number;
  address?: string;
}

export function ValuationWidget(props: ValuationWidgetProps) {
  const [valuation, setValuation] = useState<ValuationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateValuation = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/valuation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(props),
      });

      if (!response.ok) {
        throw new Error('Failed to generate valuation');
      }

      const data = await response.json();
      setValuation(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          AI Property Valuation
        </CardTitle>
        <CardDescription>
          Get an AI-powered estimate based on market data and property attributes
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!valuation && !loading && (
          <Button onClick={generateValuation} className="w-full">
            Generate Valuation
          </Button>
        )}

        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {error && (
          <div className="text-danger text-sm bg-danger/10 p-4 rounded-lg">
            {error}
          </div>
        )}

        {valuation && (
          <div className="space-y-4">
            <div className="bg-primary/10 p-4 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Estimated Value</div>
              <div className="text-3xl font-bold text-primary">
                {formatCurrency(valuation.estimatedPrice.median)}
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                Range: {formatCurrency(valuation.estimatedPrice.min)} -{' '}
                {formatCurrency(valuation.estimatedPrice.max)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Price per sqft</div>
                <div className="text-xl font-semibold">
                  PKR {valuation.pricePerSqft.avg.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Confidence</div>
                <div className="flex items-center gap-2">
                  <Badge variant={valuation.confidence >= 70 ? 'success' : 'default'}>
                    {valuation.confidence}%
                  </Badge>
                </div>
              </div>
            </div>

            {valuation.factors.length > 0 && (
              <div>
                <div className="text-sm font-semibold mb-2">Price Factors</div>
                <div className="space-y-2">
                  {valuation.factors.map((factor, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm">
                      {factor.impact === 'positive' ? (
                        <TrendingUp className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                      ) : factor.impact === 'negative' ? (
                        <TrendingDown className="h-4 w-4 text-danger flex-shrink-0 mt-0.5" />
                      ) : (
                        <div className="h-4 w-4 flex-shrink-0" />
                      )}
                      <div>
                        <div className="font-medium">{factor.name}</div>
                        <div className="text-muted-foreground">{factor.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="text-xs text-muted-foreground">
              Based on {valuation.comparables} comparable properties in the area
            </div>

            <Button onClick={generateValuation} variant="outline" className="w-full">
              Refresh Valuation
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
