# Roadmap and status (honest)
**Done and covered by `npm test` / `npm run validate`:** content validation (errors name the file and field), root-domain URL generation (sitemap, robots), ADR parsing, project case-study fields, architecture data checks.
**Done, not covered by automated browser tests:** architecture explorer UI, engineering page, terminal `blog` and `visit` commands, recorded-audits card, admin editor fields.
**Also done in the second engineering phase (covered by tests):** build-time GitHub snapshot (never fails the build, token never written), export HTML checker, external link validator (optional, never part of the build), service-worker cache versioning per deployment.
**Done, not covered by automated browser tests:** technology graph UI, admin noindex layout.
**Not done yet:** Playwright smoke tests, axe accessibility run, Lighthouse CI, API explorer, safe code playground (optional), `package-lock.json` (needs network: create with `npm install`), screenshots. The dependency audit runs informationally in CI.
**Baseline:** the old workflow forced the base path to `/<repo>`, which breaks a user site; fixed. No lockfile (documented). `next build` has not been run in the authoring environment (no network).
