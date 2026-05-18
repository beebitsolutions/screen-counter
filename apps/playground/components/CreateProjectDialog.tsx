/**
 * Fixture B.3 — CreateProjectDialog (formerly MUIDialogExample).
 * Expected: counts as 1 modal.
 * Signals: strong:import:@mui/material (Dialog) + weak:name-suffix:Dialog.
 * Real-world use: form to create a new project from the dashboard top bar.
 */
'use client';

import { Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (input: { name: string; description: string }) => void;
};

export default function CreateProjectDialog({ open, onOpenChange, onCreate }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    onCreate({ name: name.trim(), description: description.trim() });
    setName('');
    setDescription('');
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onClose={() => onOpenChange(false)} maxWidth="sm" fullWidth>
      <DialogTitle>Crear un nuevo proyecto</DialogTitle>
      <DialogContent>
        <form id="create-project-form" onSubmit={submit} className="mt-2 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="create-name">Nombre del proyecto</Label>
            <Input
              id="create-name"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="p. ej. Web de marketing Q3"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="create-desc">Descripción</Label>
            <Textarea
              id="create-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="¿De qué trata este proyecto?"
              rows={3}
            />
          </div>
        </form>
      </DialogContent>
      <DialogActions>
        <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
          Cancelar
        </Button>
        <Button form="create-project-form" type="submit" size="sm">
          Crear proyecto
        </Button>
      </DialogActions>
    </Dialog>
  );
}
