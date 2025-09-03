self.addEventListener('install', () => {
  // Skip waiting to activate the new service worker immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Clean up old caches or perform additional setup here
  console.log('Service worker activated', event);
});

self.addEventListener('fetch', () => {
  // Placeholder fetch handler
});
