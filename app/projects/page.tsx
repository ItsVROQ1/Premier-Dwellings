import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShellMain, ShellContainer } from '@/components/layout/shell';
import { Building2, MapPin } from 'lucide-react';

export default function ProjectsPage() {
  return (
    <ShellMain>
      <ShellContainer className="py-16">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-slate-900 dark:text-white">
            New Projects
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400">
            Discover upcoming residential and commercial developments
          </p>
        </div>

        <div className="py-12 text-center">
          <Building2 className="mx-auto h-16 w-16 text-slate-400" />
          <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
            Coming Soon
          </h3>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            New projects will be listed here
          </p>
        </div>
      </ShellContainer>
    </ShellMain>
  );
}
