/**
 * Fixture E.2 — billing-history-dialog.tsx (kebab-case naming + shadcn
 * primitive re-export).
 * Expected: counts as 1 modal.
 * Signals: strong:reexport:components/ui/dialog.tsx (the consumer imports
 * `Dialog` from the local shadcn primitive at `@/components/ui/dialog`)
 * + weak:name-suffix:Dialog (last-word match on the kebab-case basename).
 * Real-world use: the projects table exposes a per-row "Ver historial de
 * facturación" action that opens this dialog.
 */
'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type Props = {
  projectName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const ENTRIES = [
  { id: 'inv-001', period: '2026-04', amount: '€ 1.250,00', status: 'Pagada' },
  { id: 'inv-002', period: '2026-03', amount: '€ 1.180,00', status: 'Pagada' },
  { id: 'inv-003', period: '2026-02', amount: '€ 1.180,00', status: 'Pendiente' },
];

export default function BillingHistoryDialog({ projectName, open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Historial de facturación</DialogTitle>
          <DialogDescription>
            Facturas emitidas para «{projectName}» en los últimos 12 meses.
          </DialogDescription>
        </DialogHeader>
        <ul className="mt-2 divide-y rounded-md border text-sm">
          {ENTRIES.map((entry) => (
            <li key={entry.id} className="flex items-center justify-between px-3 py-2">
              <div>
                <p className="font-medium text-foreground">{entry.period}</p>
                <p className="text-xs text-muted-foreground">{entry.id}</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-foreground">{entry.amount}</p>
                <p className="text-xs text-muted-foreground">{entry.status}</p>
              </div>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
