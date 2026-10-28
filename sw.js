// Caches the game so it opens offline from the home screen. Bump VERSION when shipping an update.
const VERSION = 'hch-v1.11';
const FILES = ['./', './index.html', './three.module.min.js', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  // the Oculus Beta (and the old beta links) are always fetched fresh so updates show up without a version bump
  if (/\/(oculus|shaders|beta)\//.test(url.pathname)) return;
  // AI models and libraries from other sites are cached by the page itself, not here
  if (url.origin !== self.location.origin && !url.hostname.includes('fonts.g')) return;
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
    if (res.ok && (e.request.url.startsWith(self.location.origin) || e.request.url.includes('fonts.g'))) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); }
    return res;
  }).catch(() => hit)));
});
