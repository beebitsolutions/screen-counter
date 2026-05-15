/**
 * Fixture D.1 — Trivial component opted in via `data-screen-counter="screen"`.
 * Expected: counts as 1 forced modal.
 * Signals: escape-hatch:screen (no organic modal signals — the badge would not
 * normally classify this as a modal, but the escape hatch forces inclusion).
 */
export default function ForcedInclude() {
  return (
    <section data-screen-counter="screen">
      <p>This component would not match any heuristic on its own.</p>
      <p>It counts because of the <code>data-screen-counter=&quot;screen&quot;</code> attribute.</p>
    </section>
  );
}
