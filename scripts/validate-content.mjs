import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { readAdrs } from '../lib/adr.mjs';
// Validates public/data/*.json and the ADR files. Exits with code 1 on any error. Warnings never fail the build.
export const slugOf = (p) => p.slug || String(p.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'p-' + p.id;
const isUrl = (u) => /^https?:\/\/[^\s]+$/.test(u);
const isDate = (d) => typeof d === 'string' && /^\d{4}-\d{2}(-\d{2})?$/.test(d) && !Number.isNaN(Date.parse(d.length === 7 ? d + '-01' : d));
export function validate({ projects, posts, adrs = [], exists = () => true }) {
  const errors = [], warnings = [], err = (w, m) => errors.push(`${w}: ${m}`);
  if (!Array.isArray(projects)) err('public/data/projects.json', 'must contain a JSON array');
  else {
    const ids = new Set(), slugs = new Set();
    projects.forEach((p, i) => {
      const w = `public/data/projects.json[${i}]${p && p.title ? ' ("' + p.title + '")' : ''}`;
      if (!p || typeof p !== 'object') return err(w, 'must be an object');
      if (!String(p.title || '').trim()) err(w + '.title', 'is required');
      if (typeof p.tech !== 'string') err(w + '.tech', 'must be a comma separated string');
      if (!String(p.desc || '').trim()) warnings.push(`${w}.desc: missing description (shown on the project card)`);
      if (ids.has(p.id)) err(w + '.id', `duplicate id ${p.id}`); ids.add(p.id);
      if (p.slug && !/^[a-z0-9-]+$/.test(p.slug)) err(w + '.slug', 'may only contain a-z, 0-9 and dashes');
      const s = slugOf(p); if (slugs.has(s)) err(w + '.slug', `duplicate slug "${s}"`); slugs.add(s);
      if (p.date && !isDate(p.date)) err(w + '.date', 'must look like 2026-10 or 2026-10-22');
      ['live', 'repo', 'docsUrl'].forEach((k) => { if (p[k] && !isUrl(p[k])) err(`${w}.${k}`, 'must be an http(s) URL'); });
      if (p.shots !== undefined) { if (!Array.isArray(p.shots)) err(w + '.shots', 'must be a list'); else p.shots.forEach((x, j) => { if (typeof x !== 'string') err(`${w}.shots[${j}]`, 'must be a string'); else if (x.startsWith('/') && !exists(x)) err(`${w}.shots[${j}]`, `file not found: public${x}`); }); }
      if (p.adr !== undefined) { if (!Array.isArray(p.adr)) err(w + '.adr', 'must be a list of ADR ids'); else p.adr.forEach((id) => { if (adrs.length && !adrs.some((a) => a.id === id)) err(w + '.adr', `unknown ADR id "${id}"`); }); }
      if (p.architecture !== undefined) {
        const a = p.architecture, ids2 = new Set();
        if (!a || !Array.isArray(a.nodes) || !a.nodes.length) err(w + '.architecture.nodes', 'must be a non-empty list');
        else {
          a.nodes.forEach((n, j) => { if (!n.id || !n.name) err(`${w}.architecture.nodes[${j}]`, 'needs id and name'); else if (ids2.has(n.id)) err(`${w}.architecture.nodes[${j}]`, `duplicate node id "${n.id}"`); ids2.add(n.id); });
          (a.edges || []).forEach((e, j) => { if (!ids2.has(e.from) || !ids2.has(e.to)) err(`${w}.architecture.edges[${j}]`, `from/to must reference existing node ids (got "${e.from}" -> "${e.to}")`); });
        }
      }
    });
  }
  if (!Array.isArray(posts)) err('public/data/posts.json', 'must contain a JSON array');
  else {
    const ids = new Set(), slugs = new Set();
    posts.forEach((p, i) => {
      const w = `public/data/posts.json[${i}]${p && p.title ? ' ("' + p.title + '")' : ''}`;
      if (!p || typeof p !== 'object') return err(w, 'must be an object');
      if (!String(p.title || '').trim()) err(w + '.title', 'is required');
      if (!String(p.body || '').trim()) err(w + '.body', 'is required');
      if (!isDate(p.date) || p.date.length !== 10) err(w + '.date', 'must look like 2026-10-22');
      if (p.tags !== undefined && !Array.isArray(p.tags)) err(w + '.tags', 'must be a list');
      if (ids.has(p.id)) err(w + '.id', `duplicate id ${p.id}`); ids.add(p.id);
      const s = slugOf(p); if (slugs.has(s)) err(w + '.slug', `duplicate slug "${s}"`); slugs.add(s);
      if (p.related !== undefined) (Array.isArray(p.related) ? p.related : []).forEach((r) => { if (!(projects || []).some((q) => q && slugOf(q) === r)) err(w + '.related', `unknown project slug "${r}"`); });
    });
  }
  const aids = new Set();
  adrs.forEach((a) => {
    if (a.error) return err(a.file, a.error.replace(/^[^:]*: /, ''));
    ['id', 'title', 'date', 'status'].forEach((k) => { if (!a[k]) err(`${a.file}.${k}`, 'is required in the front matter'); });
    if (a.status && !['Proposed', 'Accepted', 'Deprecated', 'Superseded', 'Illustrative'].includes(a.status)) err(a.file + '.status', `unsupported status "${a.status}"`);
    if (aids.has(a.id)) err(a.file + '.id', `duplicate ADR id ${a.id}`); aids.add(a.id);
  });
  return { errors, warnings };
}
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const read = (f) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { return `${f}: ${e.message}`; } };
  const projects = read('public/data/projects.json'), posts = read('public/data/posts.json');
  if (typeof projects === 'string' || typeof posts === 'string') { console.error('Content validation failed:\n - ' + [projects, posts].filter((x) => typeof x === 'string').join('\n - ')); process.exit(1); }
  const { errors, warnings } = validate({ projects, posts, adrs: readAdrs(), exists: (f) => fs.existsSync(path.join('public', f)) });
  warnings.forEach((w) => console.warn('warning: ' + w));
  if (errors.length) { console.error('Content validation failed:\n - ' + errors.join('\n - ')); process.exit(1); }
  console.log(`Content OK: ${projects.length} project(s), ${posts.length} post(s), ${readAdrs().length} decision record(s).`);
}
