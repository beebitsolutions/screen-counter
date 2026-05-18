/**
 * Fixture D.1 — KeyboardShortcutsCheatsheet (formerly ForcedInclude).
 * Expected: counts as 1 modal via escape hatch (kind: "forced").
 * Signals: strong:escape-hatch:screen.
 *
 * NO modal library is imported, the file basename does NOT end in a modal suffix
 * (Cheatsheet is not in the suffix list), and there is no role/aria-modal. The
 * ONLY thing that makes this count is the literal `data-screen-counter="screen"`
 * on the JSX root — keep it exactly that way.
 *
 * Real-world use: shortcuts cheat sheet opened with the `?` key in the dashboard.
 */
'use client';

import { useEffect, useState } from 'react';

const SHORTCUTS: Array<{ keys: string; description: string }> = [
  { keys: '?', description: 'Abrir esta chuleta' },
  { keys: 'g d', description: 'Ir al panel' },
  { keys: 'g a', description: 'Ir a actividad' },
  { keys: 'g r', description: 'Ir a informes' },
  { keys: 'n', description: 'Nuevo proyecto' },
  { keys: 'f', description: 'Abrir filtros' },
  { keys: 'esc', description: 'Cerrar esta capa' },
];

export default function KeyboardShortcutsCheatsheet() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handler(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
      if (target?.isContentEditable) return;
      if (event.key === '?') {
        event.preventDefault();
        setOpen((v) => !v);
      } else if (event.key === 'Escape') {
        setOpen(false);
      }
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  if (!open) return null;

  return (
    <div
      data-screen-counter="screen"
      className="fixed inset-x-0 bottom-4 z-40 mx-auto w-[min(90vw,28rem)] rounded-xl border bg-popover p-5 shadow-xl ring-1 ring-foreground/10"
    >
      <div className="flex items-start justify-between">
        <h3 className="text-base font-semibold text-foreground">Atajos de teclado</h3>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Cerrar
        </button>
      </div>
      <ul className="mt-3 space-y-1.5 text-sm">
        {SHORTCUTS.map((s) => (
          <li key={s.keys} className="flex items-center justify-between">
            <span className="text-muted-foreground">{s.description}</span>
            <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-xs">{s.keys}</kbd>
          </li>
        ))}
      </ul>
    </div>
  );
}
