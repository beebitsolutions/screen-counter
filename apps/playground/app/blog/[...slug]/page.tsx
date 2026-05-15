/**
 * Fixture A.4 — Catch-all route.
 * Expected: counts as 1 route. Route: /blog/[...slug].
 */
interface PageProps {
  params: Promise<{ slug: string[] }>;
}

export default async function BlogPage({ params }: PageProps) {
  const { slug } = await params;
  return (
    <main>
      <h1>A.4 — /blog/[...slug]</h1>
      <p>Catch-all route. Counts as 1.</p>
      <p>Segments: <code>{slug.join(' / ')}</code></p>
    </main>
  );
}
