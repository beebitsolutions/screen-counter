'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import { Filter, FileDown, FileUp, MoreHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import BillingHistoryDialog from '@/components/billing-history-dialog';
import DeleteProjectDialog from '@/components/DeleteProjectDialog';
import EditProjectDialog from '@/components/EditProjectDialog';
import FiltersDrawer, { type ProjectFilters } from '@/components/FiltersDrawer';
import ConfirmInExportDialog from '@/components/ConfirmInExportDialog';
import ImportDataModal from '@/components/import_data_modal';

// Chakra v2 explodes during React 19 hydration. Defer the import so Chakra
// only loads in the browser, after hydration, and only once an invite is
// triggered.
const InviteMemberModal = dynamic(() => import('@/components/InviteMemberModal'), {
  ssr: false,
});
import type { Project, ProjectStatus } from '@/lib/mock-data';
import { statusLabel } from '@/lib/mock-data';

const STATUS_VARIANT: Record<ProjectStatus, 'default' | 'secondary' | 'outline'> = {
  active: 'default',
  paused: 'secondary',
  archived: 'outline',
};

const DEFAULT_FILTERS: ProjectFilters = {
  active: true,
  paused: true,
  archived: true,
  ownedByMe: false,
};

type Props = {
  projects: Project[];
};

export function ProjectsTable({ projects }: Props) {
  const [filters, setFilters] = useState<ProjectFilters>(DEFAULT_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [deleteFor, setDeleteFor] = useState<Project | null>(null);
  const [editFor, setEditFor] = useState<Project | null>(null);
  const [inviteFor, setInviteFor] = useState<Project | null>(null);
  const [billingFor, setBillingFor] = useState<Project | null>(null);
  const [importOpen, setImportOpen] = useState(false);

  const visible = useMemo(() => {
    return projects.filter((p) => {
      if (p.status === 'active' && !filters.active) return false;
      if (p.status === 'paused' && !filters.paused) return false;
      if (p.status === 'archived' && !filters.archived) return false;
      if (filters.ownedByMe && p.owner !== 'Ana Lopez') return false;
      return true;
    });
  }, [projects, filters]);

  return (
    <section className="rounded-lg border bg-background">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Todos los proyectos</h2>
          <p className="text-xs text-muted-foreground">
            Mostrando {visible.length} de {projects.length}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setFiltersOpen(true)}>
            <Filter className="mr-1.5 size-4" />
            Filtros
          </Button>
          <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
            <FileUp className="mr-1.5 size-4" />
            Importar
          </Button>
          <Button variant="outline" size="sm" onClick={() => setExportOpen(true)}>
            <FileDown className="mr-1.5 size-4" />
            Exportar
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Responsable</TableHead>
            <TableHead>Actualizado</TableHead>
            <TableHead className="w-12 text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visible.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                Ningún proyecto coincide con los filtros aplicados.
              </TableCell>
            </TableRow>
          ) : (
            visible.map((project) => (
              <TableRow key={project.id}>
                <TableCell className="font-medium">
                  <Link
                    href={`/dashboard/projects/${project.id}`}
                    className="hover:underline"
                  >
                    {project.name}
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[project.status]}>{statusLabel[project.status]}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{project.owner}</TableCell>
                <TableCell className="text-muted-foreground">{project.updatedAt}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm" aria-label={`Acciones para ${project.name}`}>
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem onSelect={() => setEditFor(project)}>
                        Editar proyecto
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => setInviteFor(project)}>
                        Invitar miembro
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => setBillingFor(project)}>
                        Ver historial de facturación
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onSelect={() => setDeleteFor(project)}
                        className="text-destructive focus:text-destructive"
                      >
                        Eliminar proyecto
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <FiltersDrawer
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        value={filters}
        onChange={setFilters}
      />
      <ConfirmInExportDialog open={exportOpen} onOpenChange={setExportOpen} />
      <ImportDataModal open={importOpen} onOpenChange={setImportOpen} />
      <BillingHistoryDialog
        projectName={billingFor?.name ?? ''}
        open={billingFor !== null}
        onOpenChange={(o) => !o && setBillingFor(null)}
      />
      <DeleteProjectDialog
        projectName={deleteFor?.name ?? ''}
        open={deleteFor !== null}
        onOpenChange={(o) => !o && setDeleteFor(null)}
        onConfirm={() => {
          if (deleteFor) toast.success(`Proyecto «${deleteFor.name}» eliminado`);
        }}
      />
      <EditProjectDialog
        project={editFor}
        open={editFor !== null}
        onOpenChange={(o) => !o && setEditFor(null)}
        onSave={(next) => toast.success(`Cambios guardados en «${next.name}»`)}
      />
      {/* Mount InviteMemberModal ONLY when invite is active. Chakra v2 injects
          global CSS resets (button { background: transparent; padding: 0; })
          via emotion that win the cascade against Tailwind v4's @layer utilities.
          If we kept the component mounted with open=false, Chakra's globals
          would pollute every other dialog (Create / Edit / Delete / Filters)
          and strip their button/input styles. */}
      {inviteFor && (
        <InviteMemberModal
          projectName={inviteFor.name}
          open
          onOpenChange={(o) => !o && setInviteFor(null)}
          onInvite={(email) => toast.success(`Invitación enviada a ${email}`)}
        />
      )}
    </section>
  );
}
