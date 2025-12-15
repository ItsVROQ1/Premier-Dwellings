import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

const Shell = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex min-h-screen flex-col', className)} {...props} />
  ),
);

Shell.displayName = 'Shell';

const ShellHeader = forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(
  ({ className, ...props }, ref) => (
    <header
      ref={ref}
      className={cn(
        'border-b border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900',
        className,
      )}
      {...props}
    />
  ),
);

ShellHeader.displayName = 'ShellHeader';

const ShellMain = forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(
  ({ className, ...props }, ref) => (
    <main ref={ref} className={cn('flex-1 overflow-auto', className)} {...props} />
  ),
);

ShellMain.displayName = 'ShellMain';

const ShellFooter = forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(
  ({ className, ...props }, ref) => (
    <footer
      ref={ref}
      className={cn(
        'border-t border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900',
        className,
      )}
      {...props}
    />
  ),
);

ShellFooter.displayName = 'ShellFooter';

const ShellContainer = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8', className)}
      {...props}
    />
  ),
);

ShellContainer.displayName = 'ShellContainer';

export { Shell, ShellHeader, ShellMain, ShellFooter, ShellContainer };
