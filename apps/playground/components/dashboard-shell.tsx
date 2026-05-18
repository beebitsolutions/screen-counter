'use client';

import type { ReactNode } from 'react';
import { WorkspaceProvider } from '@/components/WorkspaceContext';
import { DashboardSidebar } from '@/components/dashboard-sidebar';
import WelcomeTourModal from '@/components/WelcomeTourModal';
import KeyboardShortcutsCheatsheet from '@/components/KeyboardShortcutsCheatsheet';

type Props = { children: ReactNode };

// NOTE: ChakraProvider is intentionally NOT mounted here. Chakra v2 (the
// installed major) crashes during React 19 hydration with
// "Cannot read properties of undefined (reading 'duration')" when it sits in
// a hydrated tree. The Chakra `<Modal>` we use lives inside
// `InviteMemberModal.tsx`, which carries its own `<ChakraProvider>` and is
// dynamically imported with `ssr: false` by its callers — so Chakra only
// initializes after the user opens the invite flow, on the client.
export function DashboardShell({ children }: Props) {
  return (
    <WorkspaceProvider>
      <div className="flex min-h-screen bg-muted/20">
        <DashboardSidebar />
        <div className="flex flex-1 flex-col">{children}</div>
      </div>
      <WelcomeTourModal />
      <KeyboardShortcutsCheatsheet />
    </WorkspaceProvider>
  );
}
