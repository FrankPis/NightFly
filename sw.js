// Service worker minimo per PWA install prompt
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => {}); // no-op: non cachea nulla, serve solo per PWA
