import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'screen-counter playground',
  description: 'Fixtures for testing @beebit/screen-counter',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: 'system-ui, -apple-system, sans-serif',
          margin: 0,
          padding: '2rem',
        }}
      >
        {children}
      </body>
    </html>
  );
}
