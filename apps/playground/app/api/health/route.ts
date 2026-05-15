/**
 * Fixture A.13 — API route handler.
 * Expected: does NOT count (route.ts under app/ is a request handler, not a screen).
 */
export function GET() {
  return Response.json({ status: 'ok' });
}
