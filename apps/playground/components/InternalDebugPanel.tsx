/**
 * Fixture D.2 — InternalDebugPanel (formerly ForcedExclude).
 * Expected: lands in `result.disabled` (NOT in `result.modals`).
 * Reason: a Radix dialog (strong:import:@radix-ui/react-dialog) whose JSX root
 * has `data-screen-counter="disable"`. The disable escape hatch beats every
 * other signal (the precedence is: disable → exclude-suffix → forced → heuristic).
 *
 * Runtime: only renders if `NEXT_PUBLIC_DEBUG_PANEL` is set, so it stays out of
 * the way during normal use.
 */
'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function InternalDebugPanel() {
  const [open, setOpen] = useState(false);

  if (!process.env.NEXT_PUBLIC_DEBUG_PANEL) return null;

  return (
    <Dialog.Root open={open} onOpenChange={setOpen} data-screen-counter="disable">
      <Dialog.Trigger asChild>
        <Button variant="outline" size="sm">
          Abrir panel interno de depuración
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-popover p-6 shadow-xl ring-1 ring-foreground/10">
          <Dialog.Title className="text-lg font-semibold text-foreground">Depuración interna</Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-muted-foreground">
            Reservado para ingeniería. Excluido del conteo de pantallas mediante
            <code> data-screen-counter=&quot;disable&quot;</code>.
          </Dialog.Description>
          <pre className="mt-4 max-h-64 overflow-auto rounded bg-muted p-3 text-xs text-foreground">
            {JSON.stringify({ feature_flags: [], cache_size: 0, build: 'dev' }, null, 2)}
          </pre>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
