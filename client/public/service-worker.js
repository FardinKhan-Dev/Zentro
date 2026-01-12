// ----------------------------------------------
// Zentro Service Worker (Vite-Safe Version)
// ----------------------------------------------

const CACHE_VERSION = 'v1';
const STATIC_CACHE = `zentro-static-${CACHE_VERSION}`;
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
];

// IMPORTANT: Do NOT cache Vite dev server files.
const isViteRequest = (url) =>
  url.includes('localhost:5173') ||
  url.includes('@vite') ||
  url.includes('hot') ||
  url.includes('vite') ||
  url.includes('hmr');

// ----------------------------------------------
// Install: Precache essential app shell
// ----------------------------------------------
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

// ----------------------------------------------
// Activate: Clean old caches
// ----------------------------------------------
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => {
        if (key !== STATIC_CACHE) {
          console.log('[SW] Deleting old cache:', key);
          return caches.delete(key);
        }
      }))
    )
  );
  self.clients.claim();
});

// ----------------------------------------------
// Fetch Handler (Vite-Safe)
// ----------------------------------------------
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = req.url;

  // 1️⃣ Allow Vite HMR / dev files to bypass
  if (isViteRequest(url)) return;

  // 2️⃣ Ignore non-GET requests
  if (req.method !== 'GET') return;

  // 3️⃣ Always hit network first for HTML/JS/CSS (prevents stale builds)
  if (req.headers.get('accept')?.includes('text/html')) {
    return event.respondWith(networkFirst(req));
  }

  if (url.endsWith('.js') || url.endsWith('.css') || url.endsWith('.json')) {
    return event.respondWith(networkFirst(req));
  }

  // 4️⃣ For images/icons → cache-first for speed
  if (req.destination === 'image' || req.destination === 'icon') {
    return event.respondWith(cacheFirst(req));
  }

  // 5️⃣ Default: network-first fallback
  return event.respondWith(networkFirst(req));
});

// ----------------------------------------------
// Strategies
// ----------------------------------------------
async function networkFirst(request) {
  try {
    const fresh = await fetch(request);
    const cache = await caches.open(STATIC_CACHE);
    cache.put(request, fresh.clone());
    return fresh;
  } catch {
    const cache = await caches.match(request);
    return cache || new Response('Offline', { status: 503 });
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const fresh = await fetch(request);
  const cache = await caches.open(STATIC_CACHE);
  cache.put(request, fresh.clone());
  return fresh;
}

// ----------------------------------------------
// Push Notifications
// ----------------------------------------------
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();

  const options = {
    body: data.body || 'New notification',
    icon: data.icon || '/icon-192x192.png',
    badge: '/badge-72x72.png',
    tag: data.tag || 'notification',
    requireInteraction: data.requireInteraction || false,
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Zentro', options)
  );
});

// ----------------------------------------------
// Notification Click
// ----------------------------------------------
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientsList) => {
      for (const client of clientsList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow('/');
    })
  );
});
