// NightFly Service Worker — auto-update + remote cache-bust
// v2026-05-15 — sblocca utenti rimasti con duckdns cached
const SW_VERSION = '2026-05-15-cachebust';

self.addEventListener('install', () => {
  // Installa subito senza aspettare che chiudi le tab
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    // 1) Cancella TUTTE le cache esistenti
    try {
      const names = await caches.keys();
      await Promise.all(names.map(n => caches.delete(n)));
    } catch (_) {}
    // 2) Prendi controllo immediato di tutti i tab aperti
    await self.clients.claim();
    // 3) Forza reload di tutti i client controllati (l'utente vedrà il nuovo index.html)
    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of clients) {
      try { c.navigate(c.url); } catch (_) {
        try { c.postMessage({ type: 'sw-update', version: SW_VERSION }); } catch (_) {}
      }
    }
  })());
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  // Per index.html del PWA: forza fetch fresh dal server (bypass HTTP cache)
  // Così se index.html è stato aggiornato su GitHub Pages, viene ricaricato subito
  if (url.origin === self.location.origin &&
      (url.pathname.endsWith('/NightFly/') ||
       url.pathname.endsWith('/NightFly/index.html'))) {
    event.respondWith(fetch(event.request, { cache: 'no-store' }));
    return;
  }
  // Altri asset: comportamento default (no cache SW, browser decide)
});
