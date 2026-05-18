'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function DashboardError({ error, reset }: Props) {
  useEffect(() => {
    console.error('[dashboard]', error);
  }, [error]);

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="max-w-md text-center">
        <h2 className="text-2xl font-semibold text-foreground">Algo ha ido mal</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          El panel se ha encontrado con un error inesperado. Puedes reintentar sin
          recargar la página.
        </p>
        <Button className="mt-6" onClick={reset}>
          Reintentar
        </Button>
      </div>
    </div>
  );
}
