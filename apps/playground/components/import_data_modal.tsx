/**
 * Fixture E.3 — import_data_modal.tsx (snake_case naming + aria-modal="true").
 * Expected: counts as 1 modal.
 * Signals: strong:jsx-attr:aria-modal=true + weak:name-suffix:Modal
 * (snake_case normalisation — the analyzer's last-word matcher collapses
 * `import_data_modal` → `modal`).
 * Real-world use: the projects-table toolbar lets ops bulk-import projects
 * from a CSV. The modal itself is hand-rolled, hence the explicit
 * aria-modal attribute.
 */
'use client';

import { useId, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function ImportDataModal({ open, onOpenChange }: Props) {
  const labelId = useId();
  const fileId = useId();
  const [fileName, setFileName] = useState<string | null>(null);
  if (!open) return null;
  return (
    <div
      aria-modal="true"
      aria-labelledby={labelId}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
    >
      <div className="w-full max-w-md rounded-xl bg-popover p-6 shadow-xl ring-1 ring-foreground/10">
        <h2 id={labelId} className="text-lg font-semibold text-foreground">
          Importar proyectos
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Sube un archivo CSV con tus proyectos. El primer encabezado debe ser
          «nombre».
        </p>
        <div className="mt-4 space-y-2">
          <Label htmlFor={fileId}>Archivo CSV</Label>
          <Input
            id={fileId}
            type="file"
            accept=".csv"
            onChange={(event) => setFileName(event.target.files?.[0]?.name ?? null)}
          />
          {fileName ? (
            <p className="text-xs text-muted-foreground">Seleccionado: {fileName}</p>
          ) : null}
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button size="sm" disabled={!fileName} onClick={() => onOpenChange(false)}>
            Importar
          </Button>
        </div>
      </div>
    </div>
  );
}
