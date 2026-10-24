import fs from 'node:fs';
import path from 'node:path';
// Architecture decision records: Markdown files with a small front matter block (id, title, date, status).
export function parseAdr(src, file = '') {
  const m = String(src).replace(/\r\n/g, '\n').match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { file, error: `${file}: missing front matter (--- ... ---)` };
  const meta = {}; m[1].split('\n').forEach((l) => { const i = l.indexOf(':'); if (i > 0) meta[l.slice(0, i).trim()] = l.slice(i + 1).trim(); });
  return { id: meta.id, title: meta.title, date: meta.date, status: meta.status, body: m[2].trim(), file };
}
export function readAdrs(dir = 'content/engineering/adr') {
  try { return fs.readdirSync(dir).filter((f) => f.endsWith('.md')).sort().map((f) => parseAdr(fs.readFileSync(path.join(dir, f), 'utf8'), path.join(dir, f))); } catch (e) { return []; }
}
