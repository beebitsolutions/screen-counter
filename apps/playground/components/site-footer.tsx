import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="border-t bg-background">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center">
        <p>
          &copy; {new Date().getFullYear()} demo de ProjectHub &middot; construido como fixture para
          <code className="ml-1 rounded bg-muted px-1.5 py-0.5 text-xs">@beebit/screen-counter</code>
        </p>
        <div className="flex gap-3">
          <Link href="/about" className="hover:text-foreground">
            Sobre nosotros
          </Link>
          <Link href="/contact" className="hover:text-foreground">
            Contacto
          </Link>
        </div>
      </div>
    </footer>
  );
}
