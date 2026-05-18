'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, BarChart3, FolderKanban, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const ITEMS = [
  { href: '/dashboard', label: 'Proyectos', icon: FolderKanban, match: (p: string) => p === '/dashboard' || p.startsWith('/dashboard/projects') },
  { href: '/dashboard/activity/all', label: 'Actividad', icon: Activity, match: (p: string) => p.startsWith('/dashboard/activity') },
  { href: '/dashboard/reports', label: 'Informes', icon: BarChart3, match: (p: string) => p.startsWith('/dashboard/reports') },
] as const;

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 border-r bg-sidebar md:flex md:flex-col">
      <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
        <span className="inline-flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
          P
        </span>
        <span className="text-sm font-semibold text-sidebar-foreground">ProjectHub</span>
      </div>
      <nav className="flex-1 space-y-1 px-2 py-3">
        {ITEMS.map((item) => {
          const isActive = item.match(pathname ?? '');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2 rounded-md px-3 py-2 text-sm text-sidebar-foreground/80 transition hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                isActive && 'bg-sidebar-accent text-sidebar-accent-foreground',
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-sidebar-border px-2 py-3">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-sidebar-foreground/80 transition hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <Settings className="size-4" />
          Ajustes
        </Link>
      </div>
    </aside>
  );
}
