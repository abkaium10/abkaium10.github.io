export * from './content';
export const base = process.env.NEXT_PUBLIC_BASE_PATH || '';
const KEY = 'portfolio_draft';
const norm = (a) => (Array.isArray(a) ? a.map((p) => ({ desc: '', tech: '', shots: [], live: '', repo: '', ...p })) : []);
export async function loadProjects(draft) {
  try { const l = localStorage.getItem(KEY); if (draft && l) return norm(JSON.parse(l)); } catch (e) {}
  try { return norm(await (await fetch(base + '/data/projects.json')).json()); } catch (e) { return []; }
}
export const saveProjects = (p) => localStorage.setItem(KEY, JSON.stringify(p));
export const resetDraft = () => localStorage.removeItem(KEY);
const PK = 'portfolio_posts_draft';
export async function loadPosts(draft) {
  try { const l = localStorage.getItem(PK); if (draft && l) return JSON.parse(l); } catch (e) {}
  try { const a = await (await fetch(base + '/data/posts.json')).json(); return draft ? a : a.filter((p) => !p.draft); } catch (e) { return []; }
}
export const savePosts = (p) => localStorage.setItem(PK, JSON.stringify(p));
export const resetPosts = () => localStorage.removeItem(PK);
const badUrl = (p, k) => p[k] && !/^https?:\/\//.test(p[k]);
function validateProjectsBase(j) {
  if (!Array.isArray(j)) return 'The file must contain a list of projects.';
  const ids = new Set(), slugs = new Set();
  for (const [i, p] of j.entries()) {
    if (!p || typeof p !== 'object') return `Item ${i + 1} is not an object.`;
    if (typeof p.title !== 'string' || !p.title.trim()) return `Item ${i + 1} has no title.`;
    if (typeof p.tech !== 'string') return `"${p.title}" needs a tech string (comma separated).`;
    if (p.shots !== undefined && !Array.isArray(p.shots)) return `"${p.title}": shots must be a list.`;
    if (ids.has(p.id)) return `Duplicate id ${p.id}.`; ids.add(p.id);
    if (p.slug && !/^[a-z0-9-]+$/.test(p.slug)) return `"${p.title}": slug may only contain a-z, 0-9 and dashes.`;
    const sl = slugOf(p); if (slugs.has(sl)) return `Duplicate slug "${sl}".`; slugs.add(sl);
    for (const k of ['live', 'repo']) if (badUrl(p, k)) return `"${p.title}": ${k} must start with http:// or https://.`;
  }
  return '';
}
function validatePostsBase(j) {
  if (!Array.isArray(j)) return 'The file must contain a list of posts.';
  const ids = new Set();
  for (const [i, p] of j.entries()) {
    if (!p || typeof p.title !== 'string' || typeof p.body !== 'string' || !p.title.trim()) return `Post ${i + 1} needs a title and a body.`;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(p.date || '')) return `"${p.title}": date must look like 2026-01-31.`;
    if (ids.has(p.id)) return `Duplicate id ${p.id}.`; ids.add(p.id);
  }
  return '';
}
export const slugOf = (p) => p.slug || String(p.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'p-' + p.id;
export const safeUrl = (u) => (/^https?:\/\//.test(u || '') ? u : '');
export const imgSrc = (s) => (String(s).startsWith('/') ? base + s : s);
export function validatePosts(j) {
  const er = validatePostsBase(j); if (er) return er;
  const s = new Set();
  for (const p of j) { if (p.slug && !/^[a-z0-9-]+$/.test(p.slug)) return `"${p.title}": slug may only contain a-z, 0-9 and dashes.`; const k = slugOf(p); if (s.has(k)) return `Duplicate slug "${k}".`; s.add(k); }
  return '';
}
export function validateProjects(j) {
  const er = validateProjectsBase(j); if (er) return er;
  for (const p of j) {
    if (p.docsUrl && !/^https?:\/\//.test(p.docsUrl)) return `"${p.title}": docsUrl must start with http:// or https://.`;
    if (p.adr !== undefined && !Array.isArray(p.adr)) return `"${p.title}": adr must be a list of ids.`;
    if (p.architecture !== undefined) { const a = p.architecture, ids = new Set(((a && a.nodes) || []).map((n) => n.id)); if (!a || !Array.isArray(a.nodes) || !a.nodes.length) return `"${p.title}": architecture.nodes must be a non-empty list.`; for (const e of a.edges || []) if (!ids.has(e.from) || !ids.has(e.to)) return `"${p.title}": every architecture edge must reference existing node ids.`; }
  }
  return '';
}
