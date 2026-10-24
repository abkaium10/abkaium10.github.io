import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
// Optional external link check: npm run check-links (add --strict to exit 1 on definitely broken links). Never part of the build.
export async function checkUrls(urls, { fetchFn = fetch, timeoutMs = 8000 } = {}) {
  const one = async (url) => {
    const go = async (method) => { const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), timeoutMs); try { return await fetchFn(url, { method, redirect: 'follow', signal: ctl.signal }); } finally { clearTimeout(t); } };
    try {
      let r = await go('HEAD'); if (r.status === 405 || r.status === 403) r = await go('GET');
      if (r.ok) return { url, status: 'ok', detail: String(r.status) };
      return { url, status: r.status === 404 || r.status === 410 ? 'broken' : 'warning', detail: 'HTTP ' + r.status };
    } catch (e) { return { url, status: 'unreachable', detail: e.name === 'AbortError' ? 'timeout' : 'network error (not necessarily broken)' }; }
  };
  return Promise.all([...new Set(urls)].map(one));
}
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const tmp = path.join(os.tmpdir(), 'profile-' + Date.now() + '.mjs'); fs.writeFileSync(tmp, fs.readFileSync('lib/profile.js', 'utf8'));
  const { PROFILE } = await import(pathToFileURL(tmp).href), projects = JSON.parse(fs.readFileSync('public/data/projects.json', 'utf8'));
  const urls = [PROFILE.github, PROFILE.linkedin, ...projects.flatMap((p) => [p.live, p.repo, p.docsUrl])].filter((u) => /^https?:\/\//.test(u || ''));
  const res = await checkUrls(urls); res.forEach((r) => console.log(`${r.status.padEnd(11)} ${r.url} (${r.detail})`));
  const broken = res.filter((r) => r.status === 'broken'); console.log(`${res.length} link(s) checked, ${broken.length} broken.`);
  if (broken.length && process.argv.includes('--strict')) process.exit(1);
}
