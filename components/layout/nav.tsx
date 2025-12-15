'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Home, Building2, Users, FileText, Settings, LayoutDashboard } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/listings', label: 'My Listings', icon: Building2 },
  { href: '/properties', label: 'Properties', icon: Building2 },
  { href: '/projects', label: 'New Projects', icon: Building2 },
  { href: '/blog', label: 'Blog', icon: FileText },
  { href: '/about', label: 'About', icon: Users },
];

const adminNavItems = [
  { href: '/admin/moderation', label: 'Moderation', icon: Users },
];

export function MainNav({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();

  return (
    <nav className="flex items-center space-x-6">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center space-x-2 text-sm font-medium transition-colors hover:text-gold-600',
              isActive ? 'text-gold-600' : 'text-slate-600 dark:text-slate-400',
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{item.label}</span>
          </Link>
        );
      })}
      {isAdmin &&
        adminNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center space-x-2 text-sm font-medium transition-colors hover:text-gold-600',
                isActive ? 'text-gold-600' : 'text-slate-600 dark:text-slate-400',
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
    </nav>
  );
}

export function DashboardNav() {
  const pathname = usePathname();

  const dashboardItems = [
    { href: '/dashboard', label: 'Overview', exact: true },
    { href: '/dashboard/listings', label: 'Listings' },
    { href: '/dashboard/listings/new', label: 'Create Listing' },
    { href: '/dashboard/inquiries', label: 'Inquiries' },
    { href: '/dashboard/favorites', label: 'Favorites' },
    { href: '/dashboard/settings', label: 'Settings' },
  ];

  return (
    <nav className="space-y-1">
      {dashboardItems.map((item) => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname?.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'block rounded-md px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-gold-500 text-white'
                : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
