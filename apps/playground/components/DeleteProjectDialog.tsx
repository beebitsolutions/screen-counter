/**
 * Fixture B.1 — DeleteProjectDialog (formerly RadixDialogExample).
 * Expected: counts as 1 modal.
 * Signals: strong:import:@radix-ui/react-dialog + weak:name-suffix:Dialog.
 * Real-world use: confirmation when deleting a project from the dashboard table.
 */
'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { Button } from '@/components/ui/button';

type Props = {
  projectName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

export default function DeleteProjectDialog({ projectName, open, onOpenChange, onConfirm }: Props) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-popover p-6 shadow-xl ring-1 ring-foreground/10">
          <Dialog.Title className="text-lg font-semibold text-foreground">
            Eliminar proyecto
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-muted-foreground">
            Esto eliminará de forma permanente <span className="font-medium text-foreground">{projectName}</span>{' '}
            y toda su actividad. Esta acción no se puede deshacer.
          </Dialog.Description>
          <div className="mt-6 flex justify-end gap-2">
            <Dialog.Close asChild>
              <Button variant="outline" size="sm">
                Cancelar
              </Button>
            </Dialog.Close>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                onConfirm();
                onOpenChange(false);
              }}
            >
              Eliminar proyecto
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
