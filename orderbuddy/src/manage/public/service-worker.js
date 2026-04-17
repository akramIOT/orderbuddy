self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');
    event.waitUntil(
      caches.open('v1').then((cache) => {
        return cache.addAll([
          '/',
          '/index.html',
          '/favicon.ico',
 
        ])
      })
    );
  });
  
  self.addEventListener('activate', (event) => {
    console.log('Service Worker activated');
  });
  
  self.addEventListener('fetch', (event) => {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  });

  self.addEventListener('push', function(event) {
    const options = {
      body: event.data ? event.data.text() : 'Default message',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: '1'
      },
      actions: [
        {
          action: 'view',
          title: 'View Order',
        }
      ]
    };
  
    event.waitUntil(
      self.registration.showNotification('New Order Update', options)
    );
  });
  
  self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    if (event.action === 'view') {
      clients.openWindow('/orders');
    }
  });