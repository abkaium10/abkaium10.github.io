import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import vm from 'node:vm';
import { snapshot } from '../scripts/generate-github.mjs';
import { checkHtml } from '../scripts/check-export.mjs';
import { checkUrls } from '../scripts/validate-links.mjs';
const serve = (h) => new Promise((res) => { const s = http.createServer(h); s.listen(0, '127.0.0.1', () => res({ s, url: `http://127.0.0.1:${s.address().port}` })); });
const stop = (s) => { s.closeAllConnections && s.closeAllConnections(); s.close(); };
const repo = (n, o = {}) => ({ name: n, description: 'd', html_url: 'https://github.com/u/' + n, language: 'JS', stargazers_count: 0, forks_count: 0, pushed_at: '2026-01-01T00:00:00Z', fork: false, archived: false, ...o });

test('github snapshot: keeps own active repos, sorts by stars, limits to 6 and never stores the token', async () => {
  let auth = ''; const data = [repo('a', { stargazers_count: 5 }), repo('b', { fork: true, stargazers_count: 99 }), repo('c', { archived: true }), ...'defghij'.split('').map((n) => repo(n)), repo('z', { stargazers_count: 9 })];
  const { s, url } = await serve((q, r) => { auth = q.headers.authorization || ''; r.setHeader('content-type', 'application/json'); r.end(JSON.stringify(data)); });
  const r = await snapshot({ user: 'u', api: url, token: 'SECRET-TOKEN' }); stop(s);
  assert.equal(r.ok, true); assert.equal(r.repos.length, 6); assert.deepEqual(r.repos.slice(0, 2).map((x) => x.name), ['z', 'a']);
  assert.ok(!r.repos.some((x) => ['b', 'c'].includes(x.name))); assert.equal(auth, 'Bearer SECRET-TOKEN'); assert.ok(!JSON.stringify(r).includes('SECRET-TOKEN'));
  assert.equal(r.repos[0].stars, 9); assert.ok(r.generatedAt);
});
test('github snapshot: rate limit, timeout and unreachable server return ok:false and never throw', async () => {
  const a = await serve((q, r) => { r.statusCode = 403; r.end('{}'); }); const r1 = await snapshot({ user: 'u', api: a.url }); stop(a.s);
  const b = await serve(() => {}); const r2 = await snapshot({ user: 'u', api: b.url, timeoutMs: 150 }); stop(b.s);
  const r3 = await snapshot({ user: 'u', api: 'http://127.0.0.1:1', timeoutMs: 500 });
  assert.deepEqual([r1.ok, r1.reason], [false, 'HTTP 403']); assert.deepEqual([r2.ok, r2.reason], [false, 'timeout']); assert.equal(r3.ok, false);
});
const GOOD = '<html lang="en"><head><title>T</title><meta name="description" content="d"><link rel="canonical" href="https://kaiumab10.github.io/x/"></head><body><main id="main"><h1>H</h1><img src="a.png" alt="x"></main></body></html>';
test('export checker accepts a good page and names every problem in a bad one', () => {
  assert.deepEqual(checkHtml('x/index.html', GOOD, { site: 'https://kaiumab10.github.io' }), []);
  const bad = checkHtml('y/index.html', '<html><head></head><body><h1>a</h1><h1>b</h1><img src="a.png"></body></html>', { site: 'https://kaiumab10.github.io' }).join('\n');
  ['missing <title>', 'no lang', 'meta description', 'exactly one <h1>, found 2', 'without alt', 'id="main"', 'canonical'].forEach((m) => assert.ok(bad.includes(m), m));
  assert.ok(checkHtml('z', GOOD.replace('https://kaiumab10.github.io/x/', 'https://kaiumab10.github.io/kaiumab10.github.io/x/'), { site: 'https://other.example' }).some((e) => e.includes('canonical')));
});
test('link checker separates ok, broken, warning and unreachable (and falls back from HEAD to GET)', async () => {
  const { s, url } = await serve((q, r) => { if (q.url === '/ok') r.end('ok'); else if (q.url === '/gone') { r.statusCode = 404; r.end(); } else if (q.url === '/head405') { if (q.method === 'HEAD') { r.statusCode = 405; r.end(); } else r.end('ok'); } else if (q.url === '/err') { r.statusCode = 500; r.end(); } });
  const res = await checkUrls([url + '/ok', url + '/gone', url + '/head405', url + '/err', 'http://127.0.0.1:1/x'], { timeoutMs: 800 }); stop(s);
  const st = Object.fromEntries(res.map((r) => [r.url.replace(url, '').replace('http://127.0.0.1:1', 'closed'), r.status]));
  assert.deepEqual(st, { '/ok': 'ok', '/gone': 'broken', '/head405': 'ok', '/err': 'warning', 'closed/x': 'unreachable' });
});
function boot(build, store) {
  const handlers = {}, sb = { self: { addEventListener: (k, f) => { handlers[k] = f; }, location: { origin: 'https://kaiumab10.github.io' }, registration: { scope: 'https://kaiumab10.github.io/' }, skipWaiting: () => Promise.resolve() }, importScripts: () => { if (build === null) throw new Error('404'); sb.self.__BUILD__ = build; }, Request: class { constructor(u) { this.url = 'https://kaiumab10.github.io/' + u; } }, Response: { error: () => 'ERR' }, clients: { claim: () => Promise.resolve() }, fetch: async () => { throw new Error('offline'); } };
  sb.caches = { keys: async () => [...store.keys()], delete: async (k) => store.delete(k), open: async (k) => { if (!store.has(k)) store.set(k, new Map()); const m = store.get(k); return { add: async (r) => { m.set(r.url, { page: 'offline', clone() { return this; } }); }, put: async (r, v) => { m.set(r.url, v); } }; },
    match: async (r) => { const key = typeof r === 'string' ? r : r.url; for (const m of store.values()) for (const [u, v] of m) if (u === key || u.endsWith('/' + key)) return v; } };
  vm.runInNewContext(fs.readFileSync('public/sw.js', 'utf8'), sb);
  const ev = (extra = {}) => { const p = []; return { p, waitUntil: (x) => p.push(x), ...extra }; };
  return { sb, install: async () => { const e = ev(); handlers.install(e); await Promise.all(e.p); }, activate: async () => { const e = ev(); handlers.activate(e); await Promise.all(e.p); },
    fetch: async (request) => { let out; const e = ev({ request, respondWith: (x) => { out = x; } }); handlers.fetch(e); return out ? await out : undefined; } };
}
test('service worker: a new deployment gets its own cache and the previous one is removed', async () => {
  const store = new Map(); store.set('kaium-ancient', new Map());
  const v1 = boot('abc1234', store); await v1.install(); await v1.activate();
  assert.deepEqual([...store.keys()], ['kaium-abc1234']);
  const v2 = boot('def5678', store); await v2.install(); await v2.activate();
  assert.deepEqual([...store.keys()], ['kaium-def5678']);
  const dev = boot(null, new Map()); await dev.install();
});
test('service worker: network first, cached copy and offline page as fallbacks, ignores other methods and origins', async () => {
  const store = new Map(), sw = boot('abc1234', store); await sw.install();
  const page = { url: 'https://kaiumab10.github.io/projects/portfolio-website/', method: 'GET', mode: 'navigate' };
  sw.sb.fetch = async () => ({ ok: true, type: 'basic', clone() { return this; }, body: 'fresh' });
  assert.equal((await sw.fetch(page)).body, 'fresh');
  sw.sb.fetch = async () => { throw new Error('offline'); };
  assert.equal((await sw.fetch(page)).body, 'fresh');
  assert.equal((await sw.fetch({ ...page, url: 'https://kaiumab10.github.io/never-visited/' })).page, 'offline');
  assert.equal(await sw.fetch({ ...page, method: 'POST' }), undefined); assert.equal(await sw.fetch({ ...page, url: 'https://example.com/x' }), undefined);
  sw.sb.fetch = async () => ({ ok: false, type: 'basic', clone() { return this; }, body: 'err' }); await sw.fetch({ ...page, url: 'https://kaiumab10.github.io/broken/' });
  assert.equal([...store.get('kaium-abc1234').keys()].includes('https://kaiumab10.github.io/broken/'), false);
});
