/**
 * Fixture C.4 — Plain React context.
 * Expected: does NOT count.
 * The component name and file basename end with `Context`, which is in the
 * default `excludeSuffixes` list. The file has no modal signals anyway, so
 * exclusion is doubly safe.
 */
'use client';

import type { ReactNode } from 'react';
import { createContext, useContext } from 'react';

interface AppContextValue {
  appName: string;
}

const Context = createContext<AppContextValue>({ appName: 'playground' });

export function useAppContext(): AppContextValue {
  return useContext(Context);
}

export default function AppContext({ children }: { children: ReactNode }) {
  return <Context.Provider value={{ appName: 'playground' }}>{children}</Context.Provider>;
}
