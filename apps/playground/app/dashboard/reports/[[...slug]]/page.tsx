/**
 * Fixture A.5 — Reports page (optional catch-all `[[...slug]]`).
 * Expected: counts as 1 route. Route: /dashboard/reports/[[...slug]].
 * - Matches both `/dashboard/reports` (no slug) and `/dashboard/reports/foo/bar`.
 */
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardTopBar } from '@/components/dashboard-top-bar';
import { mockReports } from '@/lib/mock-data';

type PageProps = {
  params: Promise<{ slug?: string[] }>;
};

export default async function ReportsPage({ params }: PageProps) {
  const { slug } = await params;

  if (!slug || slug.length === 0) {
    return (
      <>
        <DashboardTopBar
          title="Informes"
          description="Informes prediseñados sobre proyectos, miembros y actividad."
        />
        <div className="space-y-4 px-6 py-6">
          <section className="grid gap-4 md:grid-cols-2">
            {mockReports.map((report) => (
              <Card key={report.slug}>
                <CardHeader>
                  <CardTitle className="text-base">
                    <Link
                      href={`/dashboard/reports/${report.slug}`}
                      className="hover:underline"
                    >
                      {report.title}
                    </Link>
                  </CardTitle>
                  <CardDescription>{report.period}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{report.summary}</p>
                </CardContent>
              </Card>
            ))}
          </section>
        </div>
      </>
    );
  }

  const reportSlug = slug[0]!;
  const report = mockReports.find((r) => r.slug === reportSlug);
  if (!report) notFound();

  return (
    <>
      <DashboardTopBar title={report.title} description={report.period} />
      <div className="space-y-4 px-6 py-6">
        <div className="rounded-lg border bg-background p-6">
          <h2 className="text-base font-semibold text-foreground">Resumen</h2>
          <p className="mt-2 text-sm text-muted-foreground">{report.summary}</p>
          <p className="mt-6 text-xs text-muted-foreground">
            Ruta: <code className="rounded bg-muted px-1.5 py-0.5">/dashboard/reports/{slug.join('/')}</code>
          </p>
        </div>
        <Link href="/dashboard/reports" className="inline-block text-sm text-primary hover:underline">
          ← Volver a todos los informes
        </Link>
      </div>
    </>
  );
}
