import type { ReactNode } from 'react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

type Props = { children: ReactNode };

export function PublicShell({ children }: Props) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-12">{children}</main>
      <SiteFooter />
    </div>
  );
}
