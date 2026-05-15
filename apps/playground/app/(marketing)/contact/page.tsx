/**
 * Fixture A.7 — Second route inside the same `(marketing)` route group.
 * Expected: counts as 1 route. Route: /contact.
 */
export default function ContactPage() {
  return (
    <main>
      <h1>A.7 — /contact</h1>
      <p>Second route in the <code>(marketing)</code> group. Counts as 1.</p>
    </main>
  );
}
