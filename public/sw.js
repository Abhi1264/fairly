// Service Worker for Fairly App
// Handles offline caching, background sync, and PWA functionality

const CACHE_NAME = 'fairly-v1';
const STATIC_CACHE_NAME = 'fairly-static-v1';
const DYNAMIC_CACHE_NAME = 'fairly-dynamic-v1';

// Files to cache immediately
const STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/fairly-white.svg',
  '/fairly-black.svg',
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('Service Worker installed');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - handle requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle different types of requests
  if (url.origin === self.location.origin) {
    // Same-origin requests
    event.respondWith(handleSameOriginRequest(request));
  } else if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    // Google Fonts - cache first
    event.respondWith(handleFontRequest(request));
  } else if (url.hostname === 'api.exchangerate-api.com') {
    // Currency API - network first with cache fallback
    event.respondWith(handleApiRequest(request));
  } else if (url.hostname === 'firestore.googleapis.com') {
    // Firestore - network first with cache fallback
    event.respondWith(handleFirestoreRequest(request));
  } else {
    // Other external requests - network first
    event.respondWith(handleExternalRequest(request));
  }
});

// Handle same-origin requests
async function handleSameOriginRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
  } catch (error) {
    console.log('Network failed for same-origin request:', request.url);
  }

  // Fallback to cache
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  // Fallback to index.html for SPA routes
  if (request.destination === 'document') {
    return caches.match('/index.html');
  }

  return new Response('Not found', { status: 404 });
}

// Handle font requests
async function handleFontRequest(request) {
  const cache = await caches.open(STATIC_CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('Font request failed:', request.url);
    return new Response('Font not available', { status: 404 });
  }
}

// Handle API requests
async function handleApiRequest(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful API responses
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
  } catch (error) {
    console.log('API request failed:', request.url);
  }

  // Fallback to cache
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  return new Response('API not available', { status: 503 });
}

// Handle Firestore requests
async function handleFirestoreRequest(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful Firestore responses
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
  } catch (error) {
    console.log('Firestore request failed:', request.url);
  }

  // Fallback to cache
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  return new Response('Database not available', { status: 503 });
}

// Handle external requests
async function handleExternalRequest(request) {
  try {
    return await fetch(request);
  } catch (error) {
    console.log('External request failed:', request.url);
    return new Response('External resource not available', { status: 503 });
  }
}

// Background sync for offline operations
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'offline-queue') {
    event.waitUntil(syncOfflineOperations());
  }
});

// Sync offline operations
async function syncOfflineOperations() {
  try {
    // Get all clients
    const clients = await self.clients.matchAll();
    
    // Notify clients to sync
    clients.forEach((client) => {
      client.postMessage({
        type: 'SYNC_OFFLINE_OPERATIONS',
      });
    });
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Handle messages from clients
self.addEventListener('message', (event) => {
  const { type, data } = event.data;

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
    case 'GET_CACHE_INFO':
      getCacheInfo().then((info) => {
        event.ports[0].postMessage(info);
      });
      break;
    case 'CLEAR_CACHE':
      clearCache().then(() => {
        event.ports[0].postMessage({ success: true });
      });
      break;
  }
});

// Get cache information
async function getCacheInfo() {
  const staticCache = await caches.open(STATIC_CACHE_NAME);
  const dynamicCache = await caches.open(DYNAMIC_CACHE_NAME);
  
  const staticKeys = await staticCache.keys();
  const dynamicKeys = await dynamicCache.keys();
  
  return {
    staticFiles: staticKeys.length,
    dynamicFiles: dynamicKeys.length,
    totalFiles: staticKeys.length + dynamicKeys.length,
  };
}

// Clear all caches
async function clearCache() {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames.map((cacheName) => caches.delete(cacheName))
  );
  console.log('All caches cleared');
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  const options = {
    body: event.data ? event.data.text() : 'New notification from Fairly',
    icon: '/fairly-white.svg',
    badge: '/fairly-white.svg',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: 'explore',
        title: 'View',
        icon: '/fairly-white.svg',
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/fairly-white.svg',
      },
    ],
  };

  event.waitUntil(
    self.registration.showNotification('Fairly', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      self.clients.openWindow('/')
    );
  }
}); 