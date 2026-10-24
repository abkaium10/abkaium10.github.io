# Deployment (GitHub Pages user site)
Repository: `kaiumab10/kaiumab10.github.io`. Production URL: https://kaiumab10.github.io/

1. Repo Settings > Pages > Source: **GitHub Actions**.
2. Run `npm install` locally once and commit the generated `package-lock.json`. The workflow then uses `npm ci`. (Without a lockfile it falls back to `npm install` and prints a warning.)
3. Push to `main`. The workflow computes the URL and base path: for a repository named `<owner>.github.io` the base path is empty and `NEXT_PUBLIC_SITE_URL` is `https://<owner>.github.io`; for any other repository the base path is `/<repo>`.
4. Pull requests run validation, tests and the build but never deploy.
5. Optional repository variables: `FORM_ENDPOINT` (contact form provider), `PLAUSIBLE_DOMAIN` (analytics).

Rollback: revert the bad commit on `main` (or re-run the workflow on a previous commit). Pages publishes the artifact of the latest successful run.
Troubleshooting: if CSS or JS return 404, check that `NEXT_PUBLIC_BASE_PATH` is empty in the build environment for a user site.
