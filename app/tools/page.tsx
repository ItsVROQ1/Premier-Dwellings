import { Metadata } from 'next';
import { ShellMain, ShellHeader, ShellContainer } from '@/components/layout/shell';
import { MortgageCalculator } from '@/components/calculators/mortgage-calculator';
import { PriceIndexDashboard } from '@/components/price-index/price-index-dashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const metadata: Metadata = {
  title: 'Real Estate Tools & Calculators | Property Tools',
  description: 'Use our suite of tools including mortgage calculator, valuation estimator, and market analysis',
};

export default function ToolsPage() {
  return (
    <ShellMain>
      <ShellContainer>
        <ShellHeader
          heading="Real Estate Tools"
          text="Calculate mortgages, analyze market trends, and estimate property values"
        />

        <Tabs defaultValue="mortgage" className="mt-8">
          <TabsList>
            <TabsTrigger value="mortgage">Mortgage Calculator</TabsTrigger>
            <TabsTrigger value="price-index">Price Index</TabsTrigger>
          </TabsList>
          
          <TabsContent value="mortgage" className="mt-6">
            <MortgageCalculator />
          </TabsContent>
          
          <TabsContent value="price-index" className="mt-6">
            <PriceIndexDashboard />
          </TabsContent>
        </Tabs>
      </ShellContainer>
    </ShellMain>
  );
}
