# Threat model

## Assets
Public source, published static artifacts, repository workflow permissions, deployment integrity, visitor privacy, and project metadata.

## Trust boundaries
GitHub contributors and pull requests; npm dependencies and registry; GitHub Actions runners; generated static JSON; browser-side admin/editor features; external links and optional form integrations.

## Principal risks and controls
- **Secret exposure:** never put secrets in `NEXT_PUBLIC_*`; use repository secrets only in CI steps that need them; heuristic scanning is not exhaustive.
- **Pull request workflow abuse:** PR workflows should use read-only permissions, avoid write tokens, and never deploy; deploy only from the protected `main` branch.
- **Dependency compromise:** use a committed lockfile and `npm ci`, audit dependencies, and review upgrades. Current project lacks a lockfile due registry access failure, so reproducible install remains blocked until one is generated.
- **Client-side admin bypass:** browser-only password gates are not authorization. Treat the editor as local-only; do not connect it to privileged APIs.
- **External content:** validate project links and avoid executing arbitrary user-provided code.

## Residual risk
This is a practical threat model, not a formal security audit. Action references currently use version tags rather than immutable SHAs; pinning them and maintaining automated updates is future hardening work.
