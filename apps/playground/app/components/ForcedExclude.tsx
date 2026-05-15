/**
 * Fixture D.2 — Radix Dialog opted out via `data-screen-counter="disable"`.
 * Expected: lands in `result.disabled` (NOT in `result.modals`) and does not
 * contribute to the screen count. The Radix import would normally fire a
 * strong signal, but the escape hatch wins with highest precedence.
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
};

export default function ForcedExclude() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog.Root data-screen-counter="disable" open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button type="button">Open Forced-Exclude Dialog</button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay style={overlayStyle} />
        <Dialog.Content style={contentStyle}>
          <Dialog.Title>Forced-exclude dialog</Dialog.Title>
          <Dialog.Description>
            Would normally count via the Radix import; the disable hatch sends it to `result.disabled`.
          </Dialog.Description>
          <Dialog.Close asChild>
            <button type="button">Close</button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
