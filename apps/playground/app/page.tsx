import { VERSION } from '@beebit/screen-counter';

export default function HomePage() {
  return (
    <main>
      <h1>screen-counter playground</h1>
      <p>
        Linked against <code>@beebit/screen-counter</code> v{VERSION}.
      </p>
      <p>Fixtures (routes, modals, edge cases) will live under this directory.</p>
    </main>
  );
}
