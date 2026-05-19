---
'@beebit/screen-counter': minor
---

Add Pages Router discovery. Set `pagesRouter: true` (programmatically or
in `screen-counter.config.{mjs,cjs,js}`) to make the analyzer count
every `pages/**/*.{tsx,jsx,ts,js}` (and `src/pages/**/*`) as a screen.
`_app`, `_document`, `_error` at the Pages Router root and anything
under `api/` are excluded silently. Dynamic, catch-all and optional
catch-all segments pass through verbatim.

Routes that collide with App Router routes (same canonical URL) surface
as warnings; both entries remain in the report so paths stay truthful.

The redundant top-level `pagesRouter` option on `withScreenCounter()`
has been removed in favour of `analyzer.pagesRouter`. The flag is
off by default, so existing analyses keep their counts.
