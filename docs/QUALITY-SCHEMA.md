# Engineering evidence data schemas

All files are version-controlled JSON under `public/data/`. Validate them with `npm run validate:evidence`. Missing optional project `evidence` arrays and an empty benchmark `results` array are supported; malformed required files fail with a file/field path.

## `quality.json` (`schemaVersion: 1`)
Top-level fields: `generatedAt` (ISO timestamp or null), `commitSha` (7–40 hex SHA or null), `summary` (string), and `checks` (array). Each check has unique `id`, `tool`, `status`, `timestamp`, `commitSha`, `summary`, and optional `report`. Allowed states: `pass`, `fail`, `skipped`, `stale`, `unavailable`. CI records workflow outcomes; an unrun check must remain unavailable or skipped, never pass. Report references should point to a report artifact or the GitHub Actions run.

## `benchmarks.json` (`schemaVersion: 1`)
Top-level `generatedAt`, `commitSha`, `environment` (`runtime`, `platform`, CPU/hardware notes), `methodology` (`clock`, warm-up policy, sample count, dataset size, limitations), and `results`. Each result has a unique `id`, human-readable label, implementation and scenario, dataset size, measurement unit, median/p95 when measured, sample/warm-up counts, measurement date and optionally memory/throughput. Only include measurements produced by the runner; never infer speedups. Empty `results` is valid before a run.

## `api-examples.json`
Array of unique examples with `id`, `title`, `method` (`GET`, `POST`, `PATCH`, `DELETE`), local `/api/` path, description, query/header objects, body object or null, and a mock identity. The browser uses controlled local handlers; these paths are labels, not real network endpoints.

## Optional project `evidence`
An array of unique references. Useful fields: `id`, `title`, `type`, `verification` (`automated`, `manual`, `unverified`, `illustrative`), `url`, `path`, `commitSha`, `method`, `verifiedAt`, and `description`. Existing project fields (`testing`, `deployment`, `limitations`, `results`, `lessons`, `docsUrl`, `adr`, `architecture`) remain supported. A JSON verification label is a claim, not proof; attach a report, commit, or artifact that a reader can inspect. Relative local paths must resolve under `public/`.
