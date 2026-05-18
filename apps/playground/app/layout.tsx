import './globals.css';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import AuthModalProvider from '@/components/AuthModalProvider';

export const metadata: Metadata = {
  title: 'ProjectHub — demo de panel de administración',
  description:
    'Panel de administración para gestión de proyectos. También sirve como banco de fixtures para @beebit/screen-counter.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <AuthModalProvider>{children}</AuthModalProvider>
      </body>
    </html>
  );
}
