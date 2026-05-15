/**
 * Fixture C.5 — Modal that renders another modal inside it.
 * Expected: counts as 1 modal (the analyzer counts by component definition, not
 * by usage — even though two Radix dialogs are rendered, the file defines one).
 * Signals: strong:import:@radix-ui/react-dialog + weak:name-suffix:Modal.
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

export default function NestedModal() {
  const [outer, setOuter] = useState(false);
  const [inner, setInner] = useState(false);

  return (
    <Dialog.Root open={outer} onOpenChange={setOuter}>
      <Dialog.Trigger asChild>
        <button type="button">Open Nested Modal</button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay style={overlayStyle} />
        <Dialog.Content style={contentStyle}>
          <Dialog.Title>Outer modal</Dialog.Title>
          <Dialog.Description>
            Click below to open another modal inside this one.
          </Dialog.Description>
          <Dialog.Root open={inner} onOpenChange={setInner}>
            <Dialog.Trigger asChild>
              <button type="button">Open inner</button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay style={overlayStyle} />
              <Dialog.Content style={contentStyle}>
                <Dialog.Title>Inner modal</Dialog.Title>
                <Dialog.Description>Same file — still counts once.</Dialog.Description>
                <Dialog.Close asChild>
                  <button type="button">Close inner</button>
                </Dialog.Close>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
          <Dialog.Close asChild>
            <button type="button">Close outer</button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
