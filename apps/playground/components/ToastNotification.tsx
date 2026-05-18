/**
 * Fixture C.2 — ToastNotification (formerly SoloPortalToast).
 * Expected: does NOT count.
 * Reason: only 1 weak signal (`react-dom:createPortal`); threshold is 2 weak.
 *
 * NOTE FOR FIXTURES: keep this component free of any modal-library import, of
 * any modal name suffix (the basename "ToastNotification" ends in "Notification",
 * which is NOT in the modal-suffix list), and of any role="dialog"/aria-modal
 * attribute on the JSX root. Adding any of those would push it over the
 * scoring threshold and inflate the count from 17 to 18.
 */
'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

type Props = {
  message: string;
  durationMs?: number;
};

export function ToastNotification({ message, durationMs = 3000 }: Props) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setMounted(true);
    const id = window.setTimeout(() => setVisible(false), durationMs);
    return () => window.clearTimeout(id);
  }, [durationMs]);

  if (!mounted || !visible) return null;

  return createPortal(
    <div className="fixed top-4 right-4 z-50 rounded-md bg-foreground px-3 py-2 text-sm text-background shadow-lg">
      {message}
    </div>,
    document.body,
  );
}

export default ToastNotification;
