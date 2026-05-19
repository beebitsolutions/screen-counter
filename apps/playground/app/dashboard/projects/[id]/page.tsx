/**
 * Fixture A.3 — Project detail page (dynamic segment `[id]`).
 * Expected: counts as 1 route. Route: /dashboard/projects/[id].
 */
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardTopBar } from '@/components/dashboard-top-bar';
import { ProjectDetailActions } from '@/components/project-detail-actions';
import ModalizeImage from '@/components/modalize-image';
import { mockActivity, mockMembers, mockProjects, roleLabel, statusLabel } from '@/lib/mock-data';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProjectDetailPage({ params }: PageProps) {
  const { id } = await params;
  const project = mockProjects.find((p) => p.id === id);
  if (!project) notFound();

  const projectActivity = mockActivity.filter((a) => a.projectId === project.id);

  return (
    <>
      <DashboardTopBar title={project.name} description={project.description} />
      <div className="space-y-6 px-6 py-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard">Proyectos</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{project.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Badge variant="outline">{statusLabel[project.status]}</Badge>
            <span className="text-sm text-muted-foreground">
              Responsable: <span className="text-foreground">{project.owner}</span>
            </span>
            <span className="text-sm text-muted-foreground">
              Actualizado el <span className="text-foreground">{project.updatedAt}</span>
            </span>
          </div>
          <ProjectDetailActions project={project} />
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="members">Miembros</TabsTrigger>
            <TabsTrigger value="activity">Actividad</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="mt-4 rounded-lg border bg-background p-4">
            <div className="mb-4 max-w-xs">
              <ModalizeImage
                src={`https://picsum.photos/seed/${project.id}/320/200`}
                alt={`Portada de ${project.name}`}
              />
            </div>
            <h3 className="text-sm font-semibold text-foreground">Descripción del proyecto</h3>
            <p className="mt-2 text-sm text-muted-foreground">{project.description}</p>
            <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Responsable</dt>
                <dd className="mt-1 text-foreground">{project.owner}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Estado</dt>
                <dd className="mt-1 text-foreground">{statusLabel[project.status]}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">ID del proyecto</dt>
                <dd className="mt-1 font-mono text-foreground">{project.id}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Actualizado</dt>
                <dd className="mt-1 text-foreground">{project.updatedAt}</dd>
              </div>
            </dl>
          </TabsContent>
          <TabsContent value="members" className="mt-4 rounded-lg border bg-background p-4">
            <ul className="divide-y">
              {mockMembers.map((m) => (
                <li key={m.id} className="flex items-center justify-between py-3 text-sm">
                  <div>
                    <p className="font-medium text-foreground">{m.name}</p>
                    <p className="text-muted-foreground">{m.email}</p>
                  </div>
                  <Badge variant="outline">{roleLabel[m.role]}</Badge>
                </li>
              ))}
            </ul>
          </TabsContent>
          <TabsContent value="activity" className="mt-4 rounded-lg border bg-background p-4">
            {projectActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aún no hay actividad.</p>
            ) : (
              <ul className="divide-y">
                {projectActivity.map((a) => (
                  <li key={a.id} className="py-3 text-sm">
                    <p className="text-foreground">
                      <span className="font-medium">{a.actor}</span> {a.summary}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{a.when}</p>
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
