/**
 * Fixture E.6 — onboarding-modal-provider.tsx (kebab-case with the
 * `provider` exclusion suffix).
 * Expected: NOT counted (excluded suffix wins, even if other signals fire).
 * The basename's last word is "provider", which is in the default
 * excludeSuffixes list. The exclusion check now normalises kebab/snake
 * casings, so the analyzer correctly drops this file even though it
 * imports a Radix dialog and would otherwise score as a modal.
 * Real-world use: app-wide provider that shows the welcome modal once.
 */
'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

type OnboardingContextValue = {
  show: () => void;
  hide: () => void;
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function useOnboarding(): OnboardingContextValue {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used inside OnboardingModalProvider');
  return ctx;
}

export default function OnboardingModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const value = useMemo<OnboardingContextValue>(
    () => ({ show: () => setOpen(true), hide: () => setOpen(false) }),
    [],
  );
  return (
    <OnboardingContext.Provider value={value}>
      {children}
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-black/30" />
          <Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-popover p-6 shadow-xl ring-1 ring-foreground/10">
            <Dialog.Title className="text-lg font-semibold text-foreground">
              Te damos la bienvenida
            </Dialog.Title>
            <Dialog.Description className="mt-1 text-sm text-muted-foreground">
              Conoce las claves para sacar partido a tu nuevo workspace en minutos.
            </Dialog.Description>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-4 inline-flex items-center rounded-md border px-3 py-1.5 text-sm"
            >
              Empezar
            </button>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </OnboardingContext.Provider>
  );
}
