'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { Pencil, Trash, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DeleteProjectDialog from '@/components/DeleteProjectDialog';
import EditProjectDialog from '@/components/EditProjectDialog';
import { toast } from 'sonner';
import type { Project } from '@/lib/mock-data';

// See projects-table.tsx — Chakra v2 hydration workaround.
const InviteMemberModal = dynamic(() => import('@/components/InviteMemberModal'), {
  ssr: false,
});

type Props = {
  project: Project;
};

export function ProjectDetailActions({ project }: Props) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={() => setInviteOpen(true)}>
          <UserPlus className="mr-1.5 size-4" />
          Invitar
        </Button>
        <Button size="sm" variant="outline" onClick={() => setEditOpen(true)}>
          <Pencil className="mr-1.5 size-4" />
          Editar
        </Button>
        <Button size="sm" variant="destructive" onClick={() => setDeleteOpen(true)}>
          <Trash className="mr-1.5 size-4" />
          Eliminar
        </Button>
      </div>
      {/* See projects-table.tsx: only mount when active, otherwise Chakra's
          global emotion resets break the styles of every other dialog. */}
      {inviteOpen && (
        <InviteMemberModal
          projectName={project.name}
          open
          onOpenChange={setInviteOpen}
          onInvite={(email) => toast.success(`Invitación enviada a ${email}`)}
        />
      )}
      <EditProjectDialog
        project={project}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSave={(next) => toast.success(`Cambios guardados en «${next.name}»`)}
      />
      <DeleteProjectDialog
        projectName={project.name}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={() => toast.success(`Proyecto «${project.name}» eliminado`)}
      />
    </>
  );
}
