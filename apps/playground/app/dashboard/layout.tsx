import type { ReactNode } from 'react';
import { DashboardShell } from '@/components/dashboard-shell';
import { Toaster } from '@/components/ui/sonner';

// The dashboard mixes client-only state (Chakra theme, localStorage tour gate,
// keyboard shortcut overlay). Skip prerendering for every dashboard route.
export const dynamic = 'force-dynamic';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <DashboardShell>{children}</DashboardShell>
      {/* bottom-left so it doesn't overlap the screen-counter badge (top-right). */}
      <Toaster position="bottom-left" />
    </>
  );
}
