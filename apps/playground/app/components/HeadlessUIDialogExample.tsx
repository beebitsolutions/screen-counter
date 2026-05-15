/**
 * Fixture B.2 — Headless UI Dialog example.
 * Expected: counts as 1 modal. Signal: strong:import:@headlessui/react (Dialog specifier).
 */
'use client';

import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { useState } from 'react';

const panelStyle = {
  background: 'white',
  padding: '1.5rem',
  borderRadius: '8px',
  minWidth: '320px',
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
};

const overlayStyle = {
  position: 'fixed' as const,
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(0, 0, 0, 0.45)',
};

export default function HeadlessUIDialogExample() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open Headless UI Dialog
      </button>
      <Dialog open={open} onClose={setOpen} style={overlayStyle}>
        <DialogPanel style={panelStyle}>
          <DialogTitle>Headless UI Dialog</DialogTitle>
          <p>Strong signal from @headlessui/react.</p>
          <button type="button" onClick={() => setOpen(false)}>
            Close
          </button>
        </DialogPanel>
      </Dialog>
    </>
  );
}
