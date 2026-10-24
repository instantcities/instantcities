// Keeps a copy of a city's game in the browser, so it starts without a network. Each city's folder
// has a little sw.js that runs this one (tools/pages.mjs writes it), so the copy looks after that
// folder: self.location is the city's sw.js, not this file.
// The game's own files come from the network when it is there (so a new version shows up straight
// away) and from the copy when it is not. Three.js and the fonts never change at their address, so
// they come from the copy first.

const CACHE = 'ghent3d-v1';
const CDN = ['https://cdn.jsdelivr.net/', 'https://fonts.googleapis.com/', 'https://fonts.gstatic.com/'];

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil((async () => {
  for (const key of await caches.keys()) if (key !== CACHE) await caches.delete(key);
  await self.clients.claim();
})()));

// The first visit is not yet seen by this worker: the page sends over what it loaded, to keep.
self.addEventListener('message', e => {
  if (e.data?.type !== 'keep') return;
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    for (const url of e.data.urls) {
      if (await cache.match(url)) continue;
      try {
        const res = await fetch(url, { mode: url.startsWith(self.location.origin) ? 'same-origin' : 'cors' });
        if (res.ok) await cache.put(url, res);
      } catch { /* gone or offline: it is kept on the next visit */ }
    }
  })());
});

const keep = async (req, res) => {
  if (res.ok || res.type === 'opaque') await (await caches.open(CACHE)).put(req, res.clone());
  return res;
};

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (CDN.some(c => req.url.startsWith(c))) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => keep(req, res))));
  } else if (req.url.startsWith(self.location.origin)) {
    e.respondWith(fetch(req).then(res => keep(req, res)).catch(async () =>
      (await caches.match(req, { ignoreSearch: true })) ||
      (req.mode === 'navigate' && await caches.match(new URL('./', self.location).href)) ||
      Response.error()));
  }
});
