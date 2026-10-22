// Hearth Log — offline app-shell cache.
// Everything the app needs (index.html itself) is cached on first load,
// so it opens fine with no connection after that. Your actual data
// (plans, chores, streak) lives in localStorage, not in this cache —
// this only caches the app's code/shell, not your logged data.
const CACHE_NAME = 'rcs1-ops-v3';
const ASSETS = ['./', './index.html', './rcs1-manifest.json', './rcs1-icon-192.png', './rcs1-icon-512.png', './rcs1-icon-maskable.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (event.request.method === 'GET' && networkResponse.ok) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse.clone()));
          }
          return networkResponse;
        })
        .catch(() => cached); // offline: fall back to cache
      return cached || fetchPromise;
    })
  );
});
