/**
 * Fixture A.1 — Home page.
 * Expected: counts as 1 route. Route: /.
 */
import Link from 'next/link';
import { ArrowRight, BarChart3, Layers, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PublicShell } from '@/components/public-shell';

const FEATURES = [
  {
    icon: Layers,
    title: 'Proyectos, no caos',
    description:
      'Sigue cada proyecto desde un único panel: estado, responsables y actividad.',
  },
  {
    icon: Users,
    title: 'Suma al equipo',
    description:
      'Invita a tus compañeros como administradores, editores o lectores y mantén el avance.',
  },
  {
    icon: BarChart3,
    title: 'Informes a tu medida',
    description:
      'Vistas semanales, mensuales y de utilización pensadas para equipos de producto.',
  },
];

export default function HomePage() {
  return (
    <PublicShell>
      <section className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-sm font-medium tracking-wide text-primary uppercase">
            ProjectHub
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Gestiona tus proyectos con claridad.
          </h1>
          <p className="mt-5 max-w-prose text-base text-muted-foreground">
            Un panel de administración pensado para equipos que entregan. Planifica el
            trabajo, sigue la actividad y mantén informados a las partes interesadas
            sin hojas de cálculo.
          </p>
          <div className="mt-8 flex gap-3">
            <Button asChild size="lg">
              <Link href="/dashboard">
                Abrir panel <ArrowRight className="ml-1.5 size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/pricing">Ver precios</Link>
            </Button>
          </div>
        </div>
        <div className="rounded-2xl border bg-muted/30 p-6">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Proyecto reciente
          </p>
          <p className="mt-2 text-lg font-semibold text-foreground">Rediseño de la web</p>
          <p className="text-sm text-muted-foreground">
            Responsable: Ana López &middot; activo &middot; actualizado el 2026-04-22
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            <li className="flex items-center justify-between">
              <span className="text-muted-foreground">Hitos abiertos</span>
              <span className="font-medium text-foreground">3</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-muted-foreground">Miembros</span>
              <span className="font-medium text-foreground">5</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-muted-foreground">Última actividad</span>
              <span className="font-medium text-foreground">hace 9 horas</span>
            </li>
          </ul>
        </div>
      </section>

      <section className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <Card key={f.title}>
            <CardHeader>
              <f.icon className="size-5 text-primary" />
              <CardTitle className="mt-3 text-lg">{f.title}</CardTitle>
              <CardDescription>{f.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>
    </PublicShell>
  );
}
