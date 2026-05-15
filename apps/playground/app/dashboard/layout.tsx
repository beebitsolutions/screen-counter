/**
 * Fixture A.8 — Layout for /dashboard.
 * Expected: does NOT count (layouts never count).
 */
import type { ReactNode } from 'react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <section style={{ borderLeft: '4px solid #d1d5db', paddingLeft: '1rem' }}>
      <p style={{ color: '#6b7280', margin: 0 }}>(dashboard layout — not counted)</p>
      {children}
    </section>
  );
}
