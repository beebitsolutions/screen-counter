/**
 * Fixture C.3 — Provider helper that orchestrates a modal.
 * Expected: does NOT count.
 * Signals: weak:name-suffix:Modal + weak:react-dom:createPortal (would otherwise
 * count as a modal). But the file basename and component name both end with
 * `Provider`, which is in the default `excludeSuffixes` list — exclusion wins
 * over scoring and over `data-screen-counter="screen"`.
 */
'use client';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export default function LoginModalProvider({ children }: { children?: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div>
      {children}
      {mounted
        ? createPortal(
            <span style={{ display: 'none' }} aria-hidden="true">
              login-modal-portal-root
            </span>,
            document.body,
          )
        : null}
    </div>
  );
}
