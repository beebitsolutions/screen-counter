/**
 * Fixture E.1 — feature-flags-modal.tsx (kebab-case naming + role="dialog").
 * Expected: counts as 1 modal.
 * Signals: strong:jsx-attr:role=dialog + weak:name-suffix:Modal (kebab-case
 * normalisation — the analyzer's last-word matcher collapses
 * `feature-flags-modal` → `modal`).
 * Real-world use: a Beebit-style admin lets ops toggle preview flags from
 * the top bar; the modal is a hand-rolled wrapper (no library) so the
 * `role="dialog"` attribute is what makes the analyzer notice it.
 */
'use client';

import { useId } from 'react';
import { Button } from '@/components/ui/button';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function FeatureFlagsModal({ open, onOpenChange }: Props) {
  const titleId = useId();
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
    >
      <div className="w-full max-w-md rounded-xl bg-popover p-6 shadow-xl ring-1 ring-foreground/10">
        <h2 id={titleId} className="text-lg font-semibold text-foreground">
          Feature flags
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Activa o desactiva funcionalidades en preview para tu workspace.
        </p>
        <ul className="mt-4 space-y-2 text-sm">
          <li className="flex items-center justify-between rounded-md border px-3 py-2">
            <span>Vista compacta de proyectos</span>
            <Button size="sm" variant="outline">
              Activar
            </Button>
          </li>
          <li className="flex items-center justify-between rounded-md border px-3 py-2">
            <span>Notificaciones por Slack</span>
            <Button size="sm" variant="outline">
              Activar
            </Button>
          </li>
        </ul>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
}
