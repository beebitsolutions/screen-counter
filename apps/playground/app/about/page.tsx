/**
 * Fixture A.2 — About page.
 * Expected: counts as 1 route. Route: /about.
 */
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PublicShell } from '@/components/public-shell';

export default function AboutPage() {
  return (
    <PublicShell>
      <article className="prose prose-slate mx-auto max-w-3xl">
        <h1 className="text-4xl font-semibold tracking-tight text-foreground">
          Sobre ProjectHub
        </h1>
        <p className="mt-4 text-base text-muted-foreground">
          ProjectHub es un pequeño panel de administración construido para demostrar
          que una app Next.js puede ser agradable de usar y fácil de auditar a la vez.
          Simula la gestión de proyectos, actividad e informes de un equipo ficticio.
        </p>
        <h2 className="mt-10 text-xl font-semibold text-foreground">Nuestra promesa</h2>
        <p className="mt-2 text-base text-muted-foreground">
          Todo lo que ves aquí son datos mock deterministas. No hay backend: esta app
          existe para ejercitar el descubrimiento de rutas, la detección de modales y
          el plugin del badge que ofrece <code>@beebit/screen-counter</code>.
        </p>
        <h2 className="mt-10 text-xl font-semibold text-foreground">Para quién es</h2>
        <p className="mt-2 text-base text-muted-foreground">
          Para personas de ingeniería y product managers que quieren presupuestar
          cuántas pantallas distintas envían y detectar automáticamente cualquier
          nueva que aparezca al mergear código.
        </p>
        <div className="mt-10 flex gap-3">
          <Button asChild>
            <Link href="/contact">Hablemos</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard">Probar el panel</Link>
          </Button>
        </div>
      </article>
    </PublicShell>
  );
}
