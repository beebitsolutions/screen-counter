/**
 * Fixture C.5 — ConfirmInExportDialog (formerly NestedModal).
 * Expected: counts as 1 modal (counting is per definition; nesting does NOT double-count).
 * Signals: strong:import:@radix-ui/react-dialog + weak:name-suffix:Dialog.
 * Real-world use: the outer dialog kicks off an export; if a previous export exists,
 * an inner dialog asks for confirmation before overwriting it.
 */
'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function ConfirmInExportDialog({ open, onOpenChange }: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-popover p-6 shadow-xl ring-1 ring-foreground/10">
          <Dialog.Title className="text-lg font-semibold text-foreground">Exportar datos del proyecto</Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-muted-foreground">
            Generaremos un CSV con todas las filas actuales. La descarga empieza
            en cuanto confirmes.
          </Dialog.Description>
          <div className="mt-6 flex justify-end gap-2">
            <Dialog.Close asChild>
              <Button variant="outline" size="sm">
                Cancelar
              </Button>
            </Dialog.Close>
            <Button size="sm" onClick={() => setConfirmOpen(true)}>
              Empezar exportación
            </Button>
          </div>

          <Dialog.Root open={confirmOpen} onOpenChange={setConfirmOpen}>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/50" />
              <Dialog.Content className="fixed top-1/2 left-1/2 z-[60] w-[90vw] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl bg-popover p-5 shadow-xl ring-1 ring-foreground/10">
                <Dialog.Title className="text-base font-semibold text-foreground">
                  ¿Sobrescribir la exportación anterior?
                </Dialog.Title>
                <Dialog.Description className="mt-2 text-sm text-muted-foreground">
                  ¿Seguro que quieres sobrescribir la exportación anterior? El archivo
                  antiguo se eliminará.
                </Dialog.Description>
                <div className="mt-4 flex justify-end gap-2">
                  <Dialog.Close asChild>
                    <Button variant="outline" size="sm">
                      Conservar los dos
                    </Button>
                  </Dialog.Close>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setConfirmOpen(false);
                      onOpenChange(false);
                    }}
                  >
                    Sí, sobrescribir
                  </Button>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
