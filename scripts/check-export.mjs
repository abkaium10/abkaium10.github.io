import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
// Static checks on the exported HTML in out/ (title, lang, description, one h1, image alt, skip-link target, canonical URL).
export function checkInternalPaths(file, html, { outDir = 'out', basePath = '' } = {}) {
  const errs = [], attrs = [...html.matchAll(/\b(?:href|src)=[\"']([^\"']+)[\"']/gi)].map(m => m[1]);
  for (const raw of attrs) { if (!raw.startsWith('/') || raw.startsWith('//')) continue; const pathname = raw.split(/[?#]/)[0]; let p = pathname; if (basePath && (p === basePath || p.startsWith(basePath + '/'))) p = p.slice(basePath.length) || '/'; else if (basePath) { errs.push(`${file}: internal path does not respect basePath ${basePath}: ${raw}`); continue; } let target = path.resolve(outDir, '.' + p); if (fs.existsSync(target) && fs.statSync(target).isDirectory()) target = path.join(target, 'index.html'); if (!fs.existsSync(target) && fs.existsSync(target + '.html')) target += '.html'; if (!fs.existsSync(target) || !fs.statSync(target).isFile()) errs.push(`${file}: internal asset/page not found for ${raw}`); }
  return errs;
}
export function checkHtml(file, html, { site = '' } = {}) {
  const errs = [], need = (c, m) => { if (!c) errs.push(`${file}: ${m}`); };
  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1]; need(title && title.trim(), 'missing <title>');
  need(/<html[^>]*\slang="[^"]+"/.test(html), '<html> has no lang attribute');
  need(/<meta[^>]+name="description"[^>]+content="[^"]+"/.test(html) || /<meta[^>]+content="[^"]+"[^>]+name="description"/.test(html), 'missing meta description');
  const h1 = (html.match(/<h1[\s>]/g) || []).length; need(h1 === 1, `expected exactly one <h1>, found ${h1}`);
  (html.match(/<img\b[^>]*>/g) || []).forEach((t) => { if (!/\salt=/.test(t)) errs.push(`${file}: <img> without alt: ${t.slice(0, 80)}`); });
  need(/id="main"/.test(html), 'missing id="main" (target of the skip link)');
  if (site) { const c = (html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/) || [])[1]; need(c && c.startsWith(site + '/'), `canonical must start with ${site}/ (got ${c || 'none'})`); }
  return errs;
}
const walk = (d, out = []) => { for (const f of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, f.name); if (f.isDirectory()) walk(p, out); else if (f.name.endsWith('.html')) out.push(p); } return out; };
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (!fs.existsSync('out')) { console.error('out/ not found. Run npm run build first.'); process.exit(1); }
  const site = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, ''), basePath = process.env.NEXT_PUBLIC_BASE_PATH || '', errors = [];
  const files = walk('out').filter((f) => !/[\\/](admin|404\.html|offline\.html)/.test(f.replace(/^out[\\/]?/, '/')) && !/out[\\/](404|offline)\.html$/.test(f));
  files.forEach((f) => { const html = fs.readFileSync(f, 'utf8'); errors.push(...checkHtml(path.relative('out', f), html, { site })); errors.push(...checkInternalPaths(path.relative('out', f), html, { outDir: 'out', basePath })); });
  if (errors.length) { console.error('Export check failed:\n - ' + errors.join('\n - ')); process.exit(1); }
  console.log(`Export OK: ${files.length} page(s) checked (admin, 404 and offline pages are skipped).`);
}
