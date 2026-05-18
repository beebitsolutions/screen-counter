'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import CreateProjectDialog from '@/components/CreateProjectDialog';
import { toast } from 'sonner';

type Props = {
  title: string;
  description?: string;
};

export function DashboardTopBar({ title, description }: Props) {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <>
      <header className="flex items-center justify-between border-b bg-background px-6 py-3">
        <div>
          <h1 className="text-lg font-semibold text-foreground">{title}</h1>
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        <div className="flex items-center gap-3">
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-1.5 size-4" />
            Nuevo proyecto
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="rounded-full ring-1 ring-border transition hover:ring-foreground/30"
                aria-label="Menú de cuenta"
              >
                <Avatar className="size-8">
                  <AvatarFallback>AL</AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem>Ajustes</DropdownMenuItem>
              <DropdownMenuItem>Facturación</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Cerrar sesión</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <CreateProjectDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreate={(input) => toast.success(`Proyecto «${input.name}» creado`)}
      />
    </>
  );
}
