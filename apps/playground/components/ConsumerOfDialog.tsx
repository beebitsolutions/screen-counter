/**
 * Fixture E.4 — ConsumerOfDialog.tsx (PascalCase basename without modal
 * suffix + relative import of the shadcn primitive).
 * Expected: counts as 1 modal.
 * Signals: strong:reexport:components/ui/dialog.tsx
 * (the consumer imports `Dialog` from `./ui/dialog` — relative path
 * resolution, not the alias). The PascalCase basename "ConsumerOfDialog"
 * does NOT end in a modal suffix (last word is "dialog" though, so naming
 * will also fire weak:name-suffix:Dialog — but the strong reexport alone
 * already crosses the threshold).
 * Real-world use: the project detail page exposes a "Pedir aprobación"
 * action that opens this dialog.
 */
'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';

type Props = {
  projectName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function ConsumerOfDialog({ projectName, open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Solicitar aprobación</DialogTitle>
          <DialogDescription>
            Vamos a notificar al manager del proyecto «{projectName}» para que
            revise los cambios pendientes.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button size="sm" onClick={() => onOpenChange(false)}>
            Enviar solicitud
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
