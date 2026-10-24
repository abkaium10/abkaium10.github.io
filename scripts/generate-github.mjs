import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
// Build-time snapshot of the owner's public repositories -> public/data/github.json.
// It never fails the build. GITHUB_TOKEN (if present on the build machine) is only used for rate limits and is never written to the output.
export async function snapshot({ user, api = 'https://api.github.com', token = '', timeoutMs = 8000, fetchFn = fetch }) {
  const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const r = await fetchFn(`${api}/users/${encodeURIComponent(user)}/repos?sort=pushed&per_page=30&type=owner`, { signal: ctl.signal, headers: { Accept: 'application/vnd.github+json', ...(token ? { Authorization: 'Bearer ' + token } : {}) } });
    if (!r.ok) return { ok: false, reason: 'HTTP ' + r.status };
    const j = await r.json(); if (!Array.isArray(j)) return { ok: false, reason: 'unexpected response' };
    const repos = j.filter((x) => !x.fork && !x.archived).map((x) => ({ name: x.name, description: x.description || '', url: x.html_url, language: x.language || '', stars: x.stargazers_count ?? null, forks: x.forks_count ?? null, pushedAt: x.pushed_at || '', topics: x.topics || [], defaultBranch: x.default_branch || '' }))
      .sort((a, b) => (b.stars || 0) - (a.stars || 0) || String(b.pushedAt).localeCompare(String(a.pushedAt))).slice(0, 6);
    return { ok: true, user, generatedAt: new Date().toISOString(), repos };
  } catch (e) { return { ok: false, reason: e.name === 'AbortError' ? 'timeout' : 'network error' }; } finally { clearTimeout(t); }
}
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const tmp = path.join(os.tmpdir(), 'profile-' + Date.now() + '.mjs'); fs.writeFileSync(tmp, fs.readFileSync('lib/profile.js', 'utf8'));
  const { PROFILE } = await import(pathToFileURL(tmp).href);
  const user = ((PROFILE.github || '').match(/github\.com\/([^/?#]+)/) || [])[1];
  const out = user ? await snapshot({ user, api: process.env.GITHUB_API_BASE || 'https://api.github.com', token: process.env.GITHUB_TOKEN || '' }) : { ok: false, reason: 'no GitHub URL in lib/profile.js' };
  fs.mkdirSync('public/data', { recursive: true }); fs.writeFileSync('public/data/github.json', JSON.stringify(out));
  console.log(out.ok ? `GitHub snapshot: ${out.repos.length} public repo(s) for ${user}` : `GitHub snapshot skipped (${out.reason}); the site falls back to a live request in the browser.`);
}
