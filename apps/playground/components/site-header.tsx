import Link from 'next/link';
import { Button } from '@/components/ui/button';

const NAV: Array<{ href: string; label: string }> = [
  { href: '/', label: 'Inicio' },
  { href: '/about', label: 'Sobre nosotros' },
  { href: '/pricing', label: 'Precios' },
  { href: '/contact', label: 'Contacto' },
];

export function SiteHeader() {
  return (
    <header className="border-b bg-background">
      {/* pr-48 keeps the rightmost nav item clear of the screen-counter badge
          (fixed top-right) so e2e clicks on the badge's close button don't hit
          the "Open dashboard" link sitting underneath it. */}
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 pr-48">
        <Link href="/" className="flex items-center gap-2 text-base font-semibold text-foreground">
          <span className="inline-flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            P
          </span>
          ProjectHub
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="rounded-md px-3 py-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              {n.label}
            </Link>
          ))}
          <Button asChild size="sm" className="ml-2">
            <Link href="/dashboard">Abrir panel</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
