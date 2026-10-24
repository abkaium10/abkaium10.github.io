try { importScripts('sw-version.js'); } catch (e) { /* dev server: no generated version file */ }
const V = 'kaium-' + (self.__BUILD__ || 'dev'), OFFLINE = 'offline.html';
self.addEventListener('install', (e) => e.waitUntil(caches.open(V).then((c) => c.add(new Request(OFFLINE, { cache: 'reload' }))).then(() => self.skipWaiting())));
self.addEventListener('activate', (e) => e.waitUntil(caches.keys().then((k) => Promise.all(k.filter((x) => x !== V).map((x) => caches.delete(x)))).then(() => clients.claim())));
self.addEventListener('fetch', (e) => {
  const r = e.request; if (r.method !== 'GET' || !r.url.startsWith(self.location.origin)) return;
  e.respondWith(fetch(r).then((res) => { if (res.ok && res.type === 'basic') { const c = res.clone(); caches.open(V).then((x) => x.put(r, c)); } return res; })
    .catch(() => caches.match(r).then((m) => m || (r.mode === 'navigate' ? caches.match(OFFLINE) : Response.error()))));
});
