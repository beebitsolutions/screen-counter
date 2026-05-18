/**
 * Fixture C.1 — WelcomeTourModal (formerly HomemadeModal).
 * Expected: counts as 1 modal.
 * Signals: strong:jsx-attr:role=dialog + weak:name-suffix:Modal + weak:react-dom:createPortal.
 *
 * Real-world use: greets first-time dashboard visitors. Uses localStorage so it shows once.
 *
 * NOTE FOR FIXTURES: the analyzer reads the JSX *root* of the default export. To
 * expose `role="dialog"` to it, this component returns a literal
 * `<div role="dialog">` wrapper at the top level; the visible overlay is
 * rendered inside that wrapper via `createPortal`. Do NOT collapse this into
 * `return createPortal(...)` — that hides the role attribute from the
 * analyzer (the static walker doesn't peek inside CallExpressions).
 */
'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';

const STORAGE_KEY = 'projecthub:welcome-shown';

export default function WelcomeTourModal() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      if (window.localStorage.getItem(STORAGE_KEY) !== '1') {
        setOpen(true);
      }
    } catch {
      setOpen(true);
    }
  }, []);

  function close() {
    setOpen(false);
    try {
      window.localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // ignore — private mode etc.
    }
  }

  return (
    <div role="dialog" aria-labelledby="welcome-tour-title">
      {mounted && open
        ? createPortal(
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
              <div className="w-full max-w-md rounded-xl bg-popover p-6 shadow-xl ring-1 ring-foreground/10">
                <h2 id="welcome-tour-title" className="text-lg font-semibold text-foreground">
                  Bienvenido a ProjectHub
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Este es tu panel de proyectos. Crea un proyecto nuevo desde la barra superior,
                  abre cualquier fila para ver el detalle y usa la barra lateral para saltar a
                  actividad o informes.
                </p>
                <ul className="mt-4 space-y-1 text-sm text-muted-foreground">
                  <li>
                    – Pulsa <kbd className="rounded border px-1 text-xs">?</kbd> para ver los atajos de teclado.
                  </li>
                  <li>
                    – Haz clic en <span className="font-medium">+ Nuevo proyecto</span> para empezar uno ya.
                  </li>
                  <li>
                    – Abre <span className="font-medium">Filtros</span> para acotar la tabla.
                  </li>
                </ul>
                <div className="mt-6 flex justify-end">
                  <Button size="sm" onClick={close}>
                    Entendido
                  </Button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
