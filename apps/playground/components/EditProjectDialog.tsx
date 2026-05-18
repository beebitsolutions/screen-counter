/**
 * Fixture B.2 — EditProjectDialog (formerly HeadlessUIDialogExample).
 * Expected: counts as 1 modal.
 * Signals: strong:import:@headlessui/react (Dialog) + weak:name-suffix:Dialog.
 * Real-world use: form to edit project name, description, and status.
 */
'use client';

import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Project, ProjectStatus } from '@/lib/mock-data';

type Props = {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (next: Project) => void;
};

export default function EditProjectDialog({ project, open, onOpenChange, onSave }: Props) {
  const [name, setName] = useState(project?.name ?? '');
  const [description, setDescription] = useState(project?.description ?? '');
  const [status, setStatus] = useState<ProjectStatus>(project?.status ?? 'active');

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!project) return;
    onSave({ ...project, name, description, status });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onClose={() => onOpenChange(false)} className="relative z-50">
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-md rounded-xl bg-popover p-6 shadow-xl ring-1 ring-foreground/10">
          <DialogTitle className="text-lg font-semibold text-foreground">Editar proyecto</DialogTitle>
          <form onSubmit={submit} className="mt-4 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit-name">Nombre</Label>
              <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-desc">Descripción</Label>
              <Textarea
                id="edit-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-status">Estado</Label>
              <select
                id="edit-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="active">Activo</option>
                <option value="paused">En pausa</option>
                <option value="archived">Archivado</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" size="sm">
                Guardar cambios
              </Button>
            </div>
          </form>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
