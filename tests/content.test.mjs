import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { validate, slugOf } from '../scripts/validate-content.mjs';
import { parseAdr, readAdrs } from '../lib/adr.mjs';
const P = (o = {}) => ({ id: 1, title: 'A', tech: 'Next.js', desc: 'd', ...o });
const run = (projects, posts = [], adrs = []) => validate({ projects, posts, adrs, exists: (f) => f !== '/img/missing.png' });
test('a minimal valid project passes', () => assert.deepEqual(run([P()]).errors, []));
test('duplicate ids and slugs are rejected', () => { const r = run([P(), P({ title: 'a' })]); assert.ok(r.errors.some((e) => e.includes('duplicate id'))); assert.ok(r.errors.some((e) => e.includes('duplicate slug'))); });
test('bad URLs, dates, slugs and missing images are reported with file and field', () => {
  const r = run([P({ live: 'javascript:alert(1)', date: '2026-13-40', slug: 'Bad Slug', shots: ['/img/missing.png'] })]);
  ['.live', '.date', '.slug', '.shots[0]'].forEach((f) => assert.ok(r.errors.some((e) => e.includes('projects.json[0]') && e.includes(f)), f));
});
test('architecture edges must reference existing nodes', () => {
  assert.deepEqual(run([P({ architecture: { nodes: [{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }], edges: [{ from: 'a', to: 'b' }] } })]).errors, []);
  assert.ok(run([P({ architecture: { nodes: [{ id: 'a', name: 'A' }], edges: [{ from: 'a', to: 'zzz' }] } })]).errors.some((e) => e.includes('edges[0]')));
});
test('posts need title, body and a full date; related projects must exist', () => {
  const r = run([P()], [{ id: 1, title: '', body: '', date: '2026-10' }, { id: 2, title: 'T', body: 'x', date: '2026-10-22', related: ['nope'] }]);
  assert.ok(r.errors.some((e) => e.includes('.title'))); assert.ok(r.errors.some((e) => e.includes('.date'))); assert.ok(r.errors.some((e) => e.includes('unknown project slug')));
});
test('ADR front matter is parsed and validated', () => {
  const a = parseAdr('---\nid: 0009\ntitle: T\ndate: 2026-10-22\nstatus: Accepted\n---\n## Context\nx', 'f.md');
  assert.equal(a.id, '0009'); assert.deepEqual(run([P()], [], [a]).errors, []);
  assert.ok(run([P()], [], [{ ...a, status: 'Maybe' }]).errors.some((e) => e.includes('status')));
  assert.ok(parseAdr('no front matter', 'x.md').error);
});
test('the content shipped in this repository is valid', () => {
  const { errors } = validate({ projects: JSON.parse(fs.readFileSync('public/data/projects.json', 'utf8')), posts: JSON.parse(fs.readFileSync('public/data/posts.json', 'utf8')), adrs: readAdrs(), exists: (f) => fs.existsSync('public' + f) });
  assert.deepEqual(errors, []);
});
test('slugOf is stable', () => { assert.equal(slugOf({ title: 'Shop Dashboard v2!', id: 1 }), 'shop-dashboard-v2'); assert.equal(slugOf({ title: '***', id: 7 }), 'p-7'); });
test('sitemap and feed use the root domain with no repository path', () => {
  execFileSync('node', ['scripts/generate-seo.mjs'], { env: { ...process.env, NEXT_PUBLIC_SITE_URL: 'https://kaiumab10.github.io' }, stdio: 'ignore' });
  const sm = fs.readFileSync('public/sitemap.xml', 'utf8');
  try {
    assert.ok(sm.includes('<loc>https://kaiumab10.github.io/</loc>')); assert.ok(sm.includes('https://kaiumab10.github.io/engineering/')); assert.ok(sm.includes('https://kaiumab10.github.io/projects/portfolio-website/'));
    assert.ok(!/kaiumab10\.github\.io\/kaiumab10/.test(sm)); assert.ok(fs.readFileSync('public/robots.txt', 'utf8').includes('Sitemap: https://kaiumab10.github.io/sitemap.xml'));
  } finally { for (const f of ['sitemap.xml', 'feed.xml', 'robots.txt']) fs.rmSync('public/' + f, { force: true }); }
});
