/**
 * Fixture C.4 — WorkspaceContext (formerly AppContext).
 * Expected: does NOT count.
 * Reason: file basename ends in `Context`, which is in DEFAULT_EXCLUDE_SUFFIXES.
 * The exclusion fires even though this file has zero modal signals; that is
 * intentional — it demonstrates the suffix-driven exclusion on its own.
 */
'use client';

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

type Workspace = {
  id: string;
  name: string;
  plan: 'free' | 'pro' | 'enterprise';
};

type WorkspaceContextValue = {
  current: Workspace;
  switchTo: (id: string) => void;
  workspaces: Workspace[];
};

const WORKSPACES: Workspace[] = [
  { id: 'w-001', name: 'ProjectHub Demo', plan: 'pro' },
  { id: 'w-002', name: 'Personal sandbox', plan: 'free' },
];

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function useWorkspace(): WorkspaceContextValue {
  const value = useContext(WorkspaceContext);
  if (!value) throw new Error('useWorkspace must be used inside <WorkspaceProvider>');
  return value;
}

type Props = { children: ReactNode };

export function WorkspaceProvider({ children }: Props) {
  const [currentId, setCurrentId] = useState(WORKSPACES[0]!.id);
  const value = useMemo<WorkspaceContextValue>(
    () => ({
      current: WORKSPACES.find((w) => w.id === currentId) ?? WORKSPACES[0]!,
      switchTo: (id) => setCurrentId(id),
      workspaces: WORKSPACES,
    }),
    [currentId],
  );
  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export default WorkspaceProvider;
