/**
 * Fixture A.6 — Route inside a route group `(marketing)`.
 * Expected: counts as 1 route. Route: /landing (group is stripped from URL).
 */
export default function LandingPage() {
  return (
    <main>
      <h1>A.6 — /landing</h1>
      <p>
        Inside the <code>(marketing)</code> route group. The group is dropped
        from the URL but the <code>page.tsx</code> still counts.
      </p>
    </main>
  );
}
