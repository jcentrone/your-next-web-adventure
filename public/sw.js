const CACHE_NAME = 'home-report-pro-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/pwa-192x192.png',
  '/pwa-512x512.png'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});

// Push event - handle received push notifications
self.addEventListener('push', (event) => {
  console.log('Push received:', event);
  
  let notificationData = {};
  
  if (event.data) {
    try {
      notificationData = event.data.json();
    } catch (e) {
      notificationData = {
        title: event.data.text() || 'New Notification',
        body: '',
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png'
      };
    }
  }

  const notificationOptions = {
    body: notificationData.body || 'You have a new notification',
    icon: notificationData.icon || '/pwa-192x192.png',
    badge: notificationData.badge || '/pwa-192x192.png',
    tag: notificationData.tag || 'default',
    data: notificationData.data || {},
    requireInteraction: notificationData.requireInteraction || false,
    actions: notificationData.actions || [],
    vibrate: notificationData.vibrate || [200, 100, 200],
    silent: notificationData.silent || false
  };

  event.waitUntil(
    self.registration.showNotification(
      notificationData.title || 'Home Report Pro',
      notificationOptions
    ).then(() => {
      // Log notification delivery
      if (notificationData.logId) {
        return fetch('/api/notifications/delivered', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ logId: notificationData.logId })
        });
      }
    }).catch(error => {
      console.error('Error showing notification:', error);
    })
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();

  const data = event.notification.data || {};
  const action = event.action;

  // Log notification click
  if (data.logId) {
    fetch('/api/notifications/clicked', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        logId: data.logId,
        action: action 
      })
    }).catch(error => {
      console.error('Error logging notification click:', error);
    });
  }

  // Handle different notification actions
  let urlToOpen = '/';
  
  if (action === 'view_appointment' && data.appointmentId) {
    urlToOpen = `/calendar?appointment=${data.appointmentId}`;
  } else if (action === 'view_report' && data.reportId) {
    urlToOpen = `/reports/${data.reportId}`;
  } else if (action === 'view_contact' && data.contactId) {
    urlToOpen = `/contacts/${data.contactId}`;
  } else if (data.url) {
    urlToOpen = data.url;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window/tab open with the target URL
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        
        // If no existing window, open a new one
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Background sync:', event.tag);
  
  if (event.tag === 'notification-queue') {
    event.waitUntil(
      // Process queued notifications when back online
      fetch('/api/notifications/process-queue', {
        method: 'POST'
      }).catch(error => {
        console.error('Error processing notification queue:', error);
      })
    );
  }
});

// Handle notification close event
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event);
  
  const data = event.notification.data || {};
  
  // Log notification dismissal
  if (data.logId) {
    fetch('/api/notifications/dismissed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ logId: data.logId })
    }).catch(error => {
      console.error('Error logging notification dismissal:', error);
    });
  }
});