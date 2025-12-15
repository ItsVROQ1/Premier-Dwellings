import { Metadata } from 'next';
import { ShellMain, ShellHeader, ShellContainer } from '@/components/layout/shell';
import dynamic from 'next/dynamic';

const PlotFinderMap = dynamic(
  () => import('@/components/plot-finder/plot-finder-map').then((mod) => mod.PlotFinderMap),
  { ssr: false }
);

export const metadata: Metadata = {
  title: 'Interactive Plot Finder | Find Your Perfect Plot',
  description: 'Use our interactive map to explore available plots across different societies and housing schemes',
};

export default function PlotFinderPage() {
  return (
    <ShellMain>
      <ShellContainer>
        <ShellHeader
          heading="Interactive Plot Finder"
          text="Explore available plots with interactive maps and society overlays"
        />
        
        <div className="mt-8">
          <PlotFinderMap />
        </div>
      </ShellContainer>
    </ShellMain>
  );
}
