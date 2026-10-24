import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const tmp = path.join(process.cwd(), `.profile-check-${process.pid}.mjs`);
try {
  fs.writeFileSync(tmp, fs.readFileSync('lib/profile.js', 'utf8'));
  const { PROFILE } = await import(pathToFileURL(tmp).href + `?t=${Date.now()}`);
  const projects = JSON.parse(fs.readFileSync('public/data/projects.json', 'utf8'));
  const issues = [];
  const ghOwner = (u) => (String(u || '').match(/^https:\/\/github\.com\/([^/?#]+)/i) || [])[1] || '';
  const profileOwner = ghOwner(PROFILE.github);
  const repoOwners = [...new Set(projects.map(p => ghOwner(p.repo)).filter(Boolean))];
  const repoNames = [...new Set(projects.map(p => { const m=String(p.repo||'').match(/^https:\/\/github\.com\/([^/]+)\/([^/?#]+)/i); return m ? `${m[1]}/${m[2]}` : ''; }).filter(Boolean))];
  if (profileOwner && repoOwners.some(o => o.toLowerCase() !== profileOwner.toLowerCase())) issues.push(`GitHub owner conflict: lib/profile.js points to ${profileOwner}; project repo(s) use ${repoOwners.join(', ')}. Confirm intended account; no value was auto-corrected.`);
  const site = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '');
  for (const p of projects) {
    if (p.live && site && new URL(p.live).origin !== new URL(site).origin) issues.push(`Project ${p.slug}.live origin ${new URL(p.live).origin} differs from configured canonical origin ${new URL(site).origin}; confirm intended public URL.`);
    if (p.repo && !/^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/?$/.test(p.repo)) issues.push(`Project ${p.slug}.repo is not a standard GitHub repository URL.`);
  }
  if (!site) console.log('INFO: NEXT_PUBLIC_SITE_URL is not configured; canonical/sitemap generation will be skipped.');
  for (const r of repoNames) console.log(`Project repository: ${r}`);
  if (issues.length) { console.warn('Configuration review required:\n - ' + [...new Set(issues)].join('\n - ')); if (process.argv.includes('--strict')) process.exitCode = 1; }
  else console.log('Configuration consistency check passed.');
} finally { fs.rmSync(tmp, { force: true }); }
