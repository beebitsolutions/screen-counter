/**
 * Fixture B.5 — Vaul Drawer example.
 * Expected: counts as 1 modal. Signal: strong:import:vaul.
 */
'use client';

import { useState } from 'react';
import { Drawer } from 'vaul';

const overlayStyle = {
  position: 'fixed' as const,
  inset: 0,
  background: 'rgba(0, 0, 0, 0.45)',
};

const contentStyle = {
  position: 'fixed' as const,
  bottom: 0,
  left: 0,
  right: 0,
  background: 'white',
  padding: '1.5rem',
  borderTopLeftRadius: '12px',
  borderTopRightRadius: '12px',
};

export default function VaulDrawerExample() {
  const [open, setOpen] = useState(false);
  return (
    <Drawer.Root open={open} onOpenChange={setOpen}>
      <Drawer.Trigger asChild>
        <button type="button">Open Vaul Drawer</button>
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay style={overlayStyle} />
        <Drawer.Content style={contentStyle}>
          <Drawer.Title>Vaul Drawer</Drawer.Title>
          <Drawer.Description>Strong signal from vaul.</Drawer.Description>
          <button type="button" onClick={() => setOpen(false)}>
            Close
          </button>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
