/**
 * Fixture B.5 — FiltersDrawer (formerly VaulDrawerExample).
 * Expected: counts as 1 modal.
 * Signals: strong:import:vaul + weak:name-suffix:Drawer.
 * Real-world use: side drawer with status / owner / date filters for the projects table.
 */
'use client';

import { Drawer } from 'vaul';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export type ProjectFilters = {
  active: boolean;
  paused: boolean;
  archived: boolean;
  ownedByMe: boolean;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: ProjectFilters;
  onChange: (next: ProjectFilters) => void;
};

export default function FiltersDrawer({ open, onOpenChange, value, onChange }: Props) {
  function toggle(key: keyof ProjectFilters) {
    onChange({ ...value, [key]: !value[key] });
  }

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange} direction="right">
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Drawer.Content className="fixed top-0 right-0 z-50 flex h-full w-full max-w-sm flex-col gap-4 bg-popover p-6 shadow-xl ring-1 ring-foreground/10">
          <Drawer.Title className="text-lg font-semibold text-foreground">Filtros</Drawer.Title>
          <Drawer.Description className="text-sm text-muted-foreground">
            Afina la tabla de proyectos.
          </Drawer.Description>
          <div className="mt-2 space-y-3">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Estado</p>
            {(
              [
                { key: 'active', label: 'Activo' },
                { key: 'paused', label: 'En pausa' },
                { key: 'archived', label: 'Archivado' },
              ] as const
            ).map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={value[key]}
                  onChange={() => toggle(key)}
                  className="size-4 rounded border-input"
                />
                <span>{label}</span>
              </label>
            ))}
            <p className="mt-4 text-xs font-medium tracking-wide text-muted-foreground uppercase">Propiedad</p>
            <Label className="flex items-center gap-2 text-sm font-normal">
              <input
                type="checkbox"
                checked={value.ownedByMe}
                onChange={() => toggle('ownedByMe')}
                className="size-4 rounded border-input"
              />
              Solo proyectos de los que soy responsable
            </Label>
          </div>
          <div className="mt-auto flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cerrar
            </Button>
            <Button
              size="sm"
              onClick={() =>
                onChange({ active: true, paused: true, archived: false, ownedByMe: false })
              }
            >
              Restablecer
            </Button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
