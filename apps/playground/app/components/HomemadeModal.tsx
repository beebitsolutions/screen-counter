/**
 * Fixture C.1 — Hand-rolled modal (no modal library).
 * Expected: counts as 1 modal.
 * Signals: strong:jsx-attr:role=dialog + weak:name-suffix:Modal + weak:react-dom:createPortal.
 * The strong signal alone is enough; the weak signals are extra corroboration.
 */
'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const overlayStyle = {
  position: 'fixed' as const,
  inset: 0,
  background: 'rgba(0, 0, 0, 0.45)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const contentStyle = {
  background: 'white',
  padding: '1.5rem',
  borderRadius: '8px',
  minWidth: '320px',
};

export default function HomemadeModal() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div role="dialog" aria-label="Homemade modal demo">
      <button type="button" onClick={() => setOpen(true)}>
        Open Homemade Modal
      </button>
      {mounted && open
        ? createPortal(
            <div style={overlayStyle} onClick={() => setOpen(false)}>
              <div style={contentStyle} onClick={(e) => e.stopPropagation()}>
                <h3>Homemade Modal</h3>
                <p>Built without any modal library — portal + role=dialog.</p>
                <button type="button" onClick={() => setOpen(false)}>
                  Close
                </button>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
