# Existing project audit

Audit performed against the supplied ZIP before adding the current phase changes. This is a source inspection, not a substitute for a dependency-installed build or live-site test.

## Existing architecture and features
- Next.js 14 App Router, React 18, JavaScript (no TypeScript), `output: 'export'`, unoptimized Next images and trailing-slash routes.
- Existing portfolio home, project/blog content data, admin/local editor, theme/cursor behavior, service worker/offline page, metadata/sitemap generation, project evidence validation and static hosting workflow.
- Existing engineering routes: architecture decision records, Quality Center, Benchmark Lab, API Playground and System Design Simulator. Existing Technology Graph/Architecture Explorer, deterministic local API mock, Node tests, Playwright tests and axe integration were retained.
- Dependencies already declared: Next/React/React DOM; Playwright and axe Playwright as dev dependencies. No package lock was present in the supplied ZIP.

## Risks and gaps found
- **Reproducibility:** missing `package-lock.json`; `npm ci` and clean-install claims cannot be verified. A lockfile generation attempt was blocked by npm registry DNS (`EAI_AGAIN`).
- **Build:** production build cannot run in this environment because dependencies are not installed (`next: not found`).
- **Configuration:** `lib/profile.js` uses GitHub owner `abkaium10`, while the requested repository is `kaiumab10/kaiumab10.github.io`. The code now warns and does not guess which profile is intended.
- **Evidence:** initial quality report correctly marks checks unavailable; no prior CI history existed. Benchmark outputs are host-specific measurements.
- **Security:** static client code cannot protect secrets or make a browser-only admin gate secure. Workflow actions use mutable version tags; this is recorded as a review item. Dedicated secret scan, SBOM and license inventory are not yet configured.
- **Browser verification:** Playwright and axe tests exist but could not run without dependencies/browser binaries. Visual baseline screenshots were not generated because intended UI has not been reviewed in a browser here.
- **Performance:** no Lighthouse result was present. Configuration and workflow are added, but metrics are not claimed until that workflow runs.

## Duplicate-feature risk
The project already had a Quality Dashboard, benchmark runner/chart/table, API mock playground, system design simulator, ADR pages, content/evidence validators, Playwright and axe coverage. Those were extended rather than replaced with parallel dashboards or duplicate mocks.

## Additions in this revision
- Measured Map setup cost and approximate break-even estimate in benchmark JSON/UI.
- OpenAPI 3.1 JSON contract and dependency-free structural validator; downloadable contract links.
- Quality history schema, generator and comparison utility, with explicit no-history state.
- Security heuristic report, threat model, security documentation, Lighthouse CI configuration/workflow, and desktop/tablet/mobile visual test configuration.
- CI hooks for OpenAPI validation, security heuristics and quality history.

## Remaining acceptance work
Generate/commit the real lockfile on a network-enabled environment, resolve the username conflict after verifying ownership, run clean install/build/export, execute Playwright/axe/visual snapshots and Lighthouse CI, run npm audit plus dedicated secret/SBOM/license tools, and verify the published GitHub Pages URL.
