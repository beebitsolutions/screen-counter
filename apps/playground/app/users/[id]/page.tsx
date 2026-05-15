/**
 * Fixture A.3 — Dynamic route.
 * Expected: counts as 1 route. Route: /users/[id].
 */
interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function UserPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <main>
      <h1>A.3 — /users/[id]</h1>
      <p>
        Dynamic route. Counts as 1 regardless of how many <code>id</code> values
        are visited. Current id: <code>{id}</code>.
      </p>
    </main>
  );
}
