# Merge notes

- Base: latest uploaded portfolio source, preserving its existing homepage, global styling, admin tools, and project structure.
- Added advanced engineering routes, components, evidence/quality/benchmark/OpenAPI assets, scripts, tests, documentation, and CI workflows from the advanced upgrade archive.
- Restored earlier personalized footer, hero code card, contact form, known profile links, `CSE @ BUET`, skill levels, experience, estimator, and testimonial content.
- Restored the eight writing entries described by the user.
- CV status: no uploaded PDF/CV attachment was found in the supplied ZIPs or mounted attachments. The terminal `cv` command reports this and opens the generated printable CV as a fallback.
- Contact delivery: FormSubmit is configured for `kaiumabd10@gmail.com`; the inbox activation step and live email delivery still require a real first submission and confirmation.
- A package lockfile was not fabricated. Run `npm install` in a network-enabled environment to create and commit `package-lock.json` before relying on `npm ci` in GitHub Actions.
