'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, Info } from 'lucide-react';
import { formatCurrency } from '@/lib/format';

interface PriceData {
  city: string;
  area: string;
  propertyType: string;
  avgPricePerSqft: string;
  trend3Month: string | null;
  trend6Month: string | null;
  trend12Month: string | null;
  month: number;
  year: number;
}

interface TrendingArea {
  city: string;
  area: string;
  _avg: {
    trend3Month: number;
    avgPricePerSqft: number;
  };
}

interface Insight {
  type: string;
  title: string;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
}

export function PriceIndexDashboard() {
  const [priceData, setPriceData] = useState<PriceData[]>([]);
  const [trendingAreas, setTrendingAreas] = useState<TrendingArea[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/price-index?months=12');
      const data = await response.json();
      setPriceData(data.priceData || []);
      setTrendingAreas(data.trendingAreas || []);
      setInsights(data.investmentInsights || []);
    } catch (error) {
      console.error('Error fetching price index:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">3-Month Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {priceData.length > 0 && priceData[0].trend3Month ? (
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold">
                  {parseFloat(priceData[0].trend3Month).toFixed(1)}%
                </span>
                {parseFloat(priceData[0].trend3Month) > 0 ? (
                  <TrendingUp className="h-6 w-6 text-success" />
                ) : (
                  <TrendingDown className="h-6 w-6 text-danger" />
                )}
              </div>
            ) : (
              <span className="text-muted-foreground">No data available</span>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">6-Month Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {priceData.length > 0 && priceData[0].trend6Month ? (
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold">
                  {parseFloat(priceData[0].trend6Month).toFixed(1)}%
                </span>
                {parseFloat(priceData[0].trend6Month) > 0 ? (
                  <TrendingUp className="h-6 w-6 text-success" />
                ) : (
                  <TrendingDown className="h-6 w-6 text-danger" />
                )}
              </div>
            ) : (
              <span className="text-muted-foreground">No data available</span>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">12-Month Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {priceData.length > 0 && priceData[0].trend12Month ? (
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold">
                  {parseFloat(priceData[0].trend12Month).toFixed(1)}%
                </span>
                {parseFloat(priceData[0].trend12Month) > 0 ? (
                  <TrendingUp className="h-6 w-6 text-success" />
                ) : (
                  <TrendingDown className="h-6 w-6 text-danger" />
                )}
              </div>
            ) : (
              <span className="text-muted-foreground">No data available</span>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Trending Areas</CardTitle>
          <CardDescription>Top performing areas with highest growth</CardDescription>
        </CardHeader>
        <CardContent>
          {trendingAreas.length > 0 ? (
            <div className="space-y-3">
              {trendingAreas.map((area, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <div className="font-semibold">{area.city} - {area.area}</div>
                    <div className="text-sm text-muted-foreground">
                      Avg: PKR {Math.round(area._avg.avgPricePerSqft).toLocaleString()}/sqft
                    </div>
                  </div>
                  <Badge variant="success">
                    +{area._avg.trend3Month.toFixed(1)}%
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              No trending data available yet
            </div>
          )}
        </CardContent>
      </Card>

      {insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Investment Insights</CardTitle>
            <CardDescription>AI-powered market analysis and recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.map((insight, idx) => (
                <div key={idx} className="flex gap-3 p-3 bg-muted rounded-lg">
                  <Info className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                    insight.impact === 'positive' ? 'text-success' :
                    insight.impact === 'negative' ? 'text-danger' : 'text-muted-foreground'
                  }`} />
                  <div>
                    <div className="font-semibold">{insight.title}</div>
                    <div className="text-sm text-muted-foreground">{insight.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {priceData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Price Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {priceData.slice(0, 5).map((data, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded-lg text-sm">
                  <div>
                    <div className="font-medium">{data.city} - {data.area}</div>
                    <div className="text-xs text-muted-foreground">
                      {data.propertyType} • {data.month}/{data.year}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      PKR {parseFloat(data.avgPricePerSqft).toLocaleString()}/sqft
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
