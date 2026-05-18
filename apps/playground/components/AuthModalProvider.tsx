/**
 * Fixture C.3 — AuthModalProvider (formerly LoginModalProvider).
 * Expected: does NOT count.
 * Reason: file basename ends in `Provider`, which sits in DEFAULT_EXCLUDE_SUFFIXES
 * (`['Provider', 'Context', 'Wrapper']`). The suffix is final — it blocks counting
 * even when modal-library imports or createPortal usage would otherwise trigger
 * the heuristic.
 *
 * NOTE FOR FIXTURES: do NOT rename this file to drop the `Provider` suffix. The
 * exclusion is the whole point of this fixture. It intentionally uses both
 * `createPortal` (weak signal) and the word `Modal` in its identifiers so that,
 * absent the exclusion, it would score as a modal.
 */
'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';

type AuthModalContextValue = {
  isOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
};

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

export function useAuthModal(): AuthModalContextValue {
  const value = useContext(AuthModalContext);
  if (!value) throw new Error('useAuthModal must be used inside <AuthModalProvider>');
  return value;
}

type Props = { children: ReactNode };

export default function AuthModalProvider({ children }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const openLoginModal = useCallback(() => setIsOpen(true), []);
  const closeLoginModal = useCallback(() => setIsOpen(false), []);
  const value = useMemo(
    () => ({ isOpen, openLoginModal, closeLoginModal }),
    [isOpen, openLoginModal, closeLoginModal],
  );

  return (
    <AuthModalContext.Provider value={value}>
      {children}
      {mounted && isOpen
        ? createPortal(
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
              <div className="w-full max-w-sm rounded-xl bg-popover p-6 shadow-xl ring-1 ring-foreground/10">
                <h3 className="text-base font-semibold text-foreground">Inicia sesión en ProjectHub</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Solo es una demo: no hay autenticación real conectada.
                </p>
                <button
                  type="button"
                  onClick={closeLoginModal}
                  className="mt-4 text-sm font-medium text-primary"
                >
                  Cerrar
                </button>
              </div>
            </div>,
            document.body,
          )
        : null}
    </AuthModalContext.Provider>
  );
}
