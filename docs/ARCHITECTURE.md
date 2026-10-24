# Architecture
Static Next.js 14 export (`output: 'export'`), React 18, three runtime dependencies (next, react, react-dom).
- `app/`: routes. Home (client component), `projects/[slug]`, `blog/[slug]`, `engineering/`, local editors under `admin/`.
- `lib/`: `profile.js` (your data), `content.js` (site copy and translations), `data.js` (loaders and validators), `md.js` (safe Markdown), `adr.mjs` (decision records), `enhance.js` (command palette, terminal, charts, language switch), `snake.js` / `spider.js` (cursor effects).
- `content/engineering/adr/`: decision records. `public/data/`: projects, posts, perf audits.
- `scripts/`: `validate-content.mjs`, `generate-seo.mjs` (sitemap, robots, feed), `generate-facts.mjs` (build facts). They run in `prebuild`.
- `components/engineering/`: architecture explorer (its styles live in `app/globals.css`).
Limits of static hosting: no server, no secure login, no writes to the repository from the browser. The admin pages are local editors that export JSON.
