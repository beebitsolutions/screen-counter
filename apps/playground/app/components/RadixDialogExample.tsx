/**
 * Fixture B.1 — Radix UI Dialog example.
 * Expected: counts as 1 modal. Signal: strong:import:@radix-ui/react-dialog.
 */
'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { useState } from 'react';

const overlayStyle = {
  position: 'fixed' as const,
  inset: 0,
  background: 'rgba(0, 0, 0, 0.45)',
};

const contentStyle = {
  position: 'fixed' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  background: 'white',
  padding: '1.5rem',
  borderRadius: '8px',
  minWidth: '320px',
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
};

export default function RadixDialogExample() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button type="button">Open Radix Dialog</button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay style={overlayStyle} />
        <Dialog.Content style={contentStyle}>
          <Dialog.Title>Radix Dialog</Dialog.Title>
          <Dialog.Description>Strong signal from @radix-ui/react-dialog.</Dialog.Description>
          <Dialog.Close asChild>
            <button type="button">Close</button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
