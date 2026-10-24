# Recording performance audits
The site never invents numbers. To publish a lab result:
1. Run Lighthouse on the deployed site (Chrome DevTools > Lighthouse, or `npx lighthouse https://kaiumab10.github.io/ --preset=desktop`).
2. Add an entry to `public/data/perf.json`: `{ "date": "2026-10-22", "tool": "Lighthouse 12", "profile": "desktop, Chrome, simulated throttling", "performance": 0, "lcp": "0.0 s", "cls": "0.00", "notes": "optional" }` using the real values.
3. Commit and push. It appears under "Recorded audits" in Under the hood.
Lab audits are not real-user field data; the live numbers in the same section are measured in the visitor's own browser for that visit.
