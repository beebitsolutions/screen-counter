/**
 * Fixture A.5 — Optional catch-all route.
 * Expected: counts as 1 route. Route: /docs/[[...slug]].
 */
interface PageProps {
  params: Promise<{ slug?: string[] }>;
}

export default async function DocsPage({ params }: PageProps) {
  const { slug } = await params;
  return (
    <main>
      <h1>A.5 — /docs/[[...slug]]</h1>
      <p>Optional catch-all. Counts as 1.</p>
      <p>Segments: <code>{slug?.join(' / ') ?? '(none — root)'}</code></p>
    </main>
  );
}
