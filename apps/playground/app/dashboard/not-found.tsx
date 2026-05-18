import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function DashboardNotFound() {
  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="max-w-md text-center">
        <h2 className="text-2xl font-semibold text-foreground">Proyecto no encontrado</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          El proyecto que buscas no existe o ha sido archivado.
        </p>
        <Button asChild className="mt-6">
          <Link href="/dashboard">Volver a proyectos</Link>
        </Button>
      </div>
    </div>
  );
}
