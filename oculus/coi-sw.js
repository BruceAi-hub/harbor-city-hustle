// Oculus Beta: makes the page cross-origin isolated so the talk AI can use several CPU cores
// (multi-threaded WebAssembly needs SharedArrayBuffer). GitHub Pages cannot send the
// COOP/COEP headers itself, so this worker adds them to the page as it loads.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  if (e.request.mode !== 'navigate') return; // everything else loads as usual
  e.respondWith(fetch(e.request).then(res => {
    if (!res.status) return res; // redirects pass through untouched
    const h = new Headers(res.headers);
    h.set('Cross-Origin-Opener-Policy', 'same-origin');
    h.set('Cross-Origin-Embedder-Policy', 'credentialless'); // other sites' files load without cookies
    return new Response(res.body, { status: res.status, statusText: res.statusText, headers: h });
  }));
});
