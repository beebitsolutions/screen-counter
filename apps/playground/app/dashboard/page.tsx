/**
 * Fixture A.8 — Dashboard home.
 * Expected: counts as 1 route. Route: /dashboard.
 */
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { DashboardTopBar } from '@/components/dashboard-top-bar';
import { ProjectsTable } from '@/components/projects-table';
import InternalDebugPanel from '@/components/InternalDebugPanel';
import { mockProjects, projectStats } from '@/lib/mock-data';

const STATS = [
  { label: 'Proyectos totales', value: projectStats.total, hint: 'en todos los espacios' },
  { label: 'Activos', value: projectStats.active, hint: 'actualmente en curso' },
  { label: 'Archivados', value: projectStats.archived, hint: 'finalizados o pausados indefinidamente' },
  { label: 'Miembros', value: projectStats.members, hint: 'en este espacio' },
];

export default function DashboardPage() {
  return (
    <>
      <DashboardTopBar
        title="Proyectos"
        description="Planifica, sigue y entrega cada iniciativa desde un único sitio."
      />
      <div className="space-y-6 px-6 py-6">
        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {STATS.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="pt-6">
                <CardTitle className="text-3xl font-semibold tabular-nums">
                  {stat.value}
                </CardTitle>
                <CardDescription className="mt-1 text-xs uppercase tracking-wide">
                  {stat.label}
                </CardDescription>
                <p className="mt-2 text-xs text-muted-foreground">{stat.hint}</p>
              </CardContent>
            </Card>
          ))}
        </section>
        <ProjectsTable projects={mockProjects} />
        <InternalDebugPanel />
      </div>
    </>
  );
}
