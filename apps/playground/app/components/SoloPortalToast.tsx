/**
 * Fixture C.2 — Toast that only uses createPortal, no other modal indicators.
 * Expected: does NOT count.
 * Signals: weak:react-dom:createPortal only (1 weak signal < threshold of 2).
 * No name-suffix match ("Toast" is not in the default suffix list) and no
 * role="dialog" on the JSX root.
 */
'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const toastStyle = {
  position: 'fixed' as const,
  bottom: '1rem',
  right: '1rem',
  background: '#1f2937',
  color: 'white',
  padding: '0.75rem 1rem',
  borderRadius: '6px',
};

export default function SoloPortalToast() {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <span>
      <button type="button" onClick={() => setVisible((v) => !v)}>
        Toggle Solo Portal Toast
      </button>
      {mounted && visible
        ? createPortal(<div style={toastStyle}>Saved.</div>, document.body)
        : null}
    </span>
  );
}
