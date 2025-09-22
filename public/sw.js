const CACHE_NAME = "slask-finder-v1";
const STATIC_CACHE = "slask-finder-static-v1";
const DYNAMIC_CACHE = "slask-finder-dynamic-v1";

// Files to cache for offline use
const STATIC_FILES = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icons/app-icon.svg",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

// Install event - cache static files
self.addEventListener("install", (event) => {
  console.log("Service Worker installing...");
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        console.log("Caching static files");
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("Service Worker activating...");
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log("Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        self.clients.claim();
      })
  );
});

// Fetch event - serve cached content when offline
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Handle API requests
  if (request.url.includes("/api/") || request.url.includes("/admin/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone the response before caching
          const responseClone = response.clone();

          // Cache successful API responses
          if (response.status === 200) {
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }

          return response;
        })
        .catch(() => {
          // Return cached API response if available
          return caches.match(request);
        })
    );
    return;
  }

  // Handle static files and pages
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request)
        .then((response) => {
          // Don't cache non-successful responses
          if (
            !response ||
            response.status !== 200 ||
            response.type !== "basic"
          ) {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          // Cache the response
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          // Return a fallback page for navigation requests
          if (request.destination === "document") {
            return caches.match("/index.html");
          }
        });
    })
  );
});

// Handle background sync for offline actions
self.addEventListener("sync", (event) => {
  console.log("Background sync:", event.tag);

  if (event.tag === "background-sync") {
    event.waitUntil(
      // Handle any queued actions here
      Promise.resolve()
    );
  }
});

// Handle push notifications
self.addEventListener("push", (event) => {
  console.log("Push message received:", event.data.text());

  let data = { title: "New message", body: "You have a new message." };
  try {
    data = event.data.json();
  } catch (e) {
    console.log("Push message data is not JSON, using default.");
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-192x192.png",
      data: data.url || "/",
    })
  );
});

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  console.log("Notification clicked:", event.notification);

  event.notification.close();

  event.waitUntil(clients.openWindow(event.notification.data));
});
