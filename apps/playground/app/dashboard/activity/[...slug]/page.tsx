/**
 * Fixture A.4 — Activity log page (catch-all segment `[...slug]`).
 * Expected: counts as 1 route. Route: /dashboard/activity/[...slug].
 * The slug filter lets us point the sidebar at /dashboard/activity/all by default.
 */
import { Badge } from '@/components/ui/badge';
import { DashboardTopBar } from '@/components/dashboard-top-bar';
import { activityTypeLabel, mockActivity, mockProjects } from '@/lib/mock-data';

type PageProps = {
  params: Promise<{ slug: string[] }>;
};

const TYPE_VARIANT: Record<string, 'default' | 'secondary' | 'outline'> = {
  created: 'default',
  updated: 'secondary',
  archived: 'outline',
  invited: 'secondary',
  commented: 'outline',
};

export default async function ActivityPage({ params }: PageProps) {
  const { slug } = await params;
  const filter = slug.join(' / ');
  const isAll = slug[0] === 'all' && slug.length === 1;

  const events = isAll
    ? mockActivity
    : mockActivity.filter(
        (a) =>
          a.projectId.includes(slug[0] ?? '') ||
          a.type === slug[0] ||
          a.actor.toLowerCase().includes((slug[0] ?? '').toLowerCase()),
      );

  const projectName = (id: string) => mockProjects.find((p) => p.id === id)?.name ?? id;

  return (
    <>
      <DashboardTopBar
        title="Actividad"
        description={
          isAll
            ? 'Toda la actividad reciente de tus espacios.'
            : `Filtrado por: ${filter}`
        }
      />
      <div className="space-y-4 px-6 py-6">
        <div className="rounded-lg border bg-background">
          <ul className="divide-y">
            {events.length === 0 ? (
              <li className="px-4 py-6 text-sm text-muted-foreground">
                Ninguna actividad coincide con <code className="rounded bg-muted px-1.5 py-0.5">{filter}</code>.
              </li>
            ) : (
              events.map((event) => (
                <li key={event.id} className="flex items-start justify-between px-4 py-3 text-sm">
                  <div>
                    <p className="text-foreground">
                      <span className="font-medium">{event.actor}</span> {event.summary} en{' '}
                      <span className="font-medium">{projectName(event.projectId)}</span>
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{event.when}</p>
                  </div>
                  <Badge variant={TYPE_VARIANT[event.type] ?? 'outline'}>
                    {activityTypeLabel[event.type]}
                  </Badge>
                </li>
              ))
            )}
          </ul>
        </div>
        <p className="text-xs text-muted-foreground">
          Segmento(s) de la ruta: <code className="rounded bg-muted px-1.5 py-0.5">{slug.join('/')}</code>
        </p>
      </div>
    </>
  );
}
