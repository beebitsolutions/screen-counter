/**
 * Fixture A.11 — Error boundary for /dashboard.
 * Expected: does NOT count (error.tsx is a special file).
 */
'use client';

interface ErrorProps {
  error: Error;
  reset: () => void;
}

export default function DashboardError({ error, reset }: ErrorProps) {
  return (
    <div>
      <p>Something broke: {error.message}</p>
      <button type="button" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
