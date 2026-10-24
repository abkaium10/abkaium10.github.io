# Admin password setup (GitHub Pages)

1. Open the GitHub repository for this portfolio.
2. Go to **Settings → Secrets and variables → Actions → Secrets → New repository secret**.
3. Set the secret name to `ADMIN_PASSWORD` and use a long, unique password (preferably 20+ random characters).
4. Save the secret, then go to **Actions** and rerun the deployment workflow (or push a commit) so the static site rebuilds.
5. Open `/admin/` on the deployed site and enter that password.

## Important security limitation

GitHub Pages serves static files. A password check implemented in browser JavaScript cannot be truly secret: the expected password is compiled into the public JavaScript bundle, even when its source value came from a GitHub Actions secret. This is only a convenience gate to discourage casual access. Do not store sensitive data or rely on this gate for real security. For genuine protection, use server-side authentication and authorization (for example, Supabase Auth with server-enforced RLS) on a backend that can enforce access controls.

The password is not stored in the repository source, and the workflow does not print it in logs. Changing the secret requires a new deployment. The gate remembers unlock only for the current browser tab session; use **Lock / sign out** to clear it.
