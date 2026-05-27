self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('push', (event) => {
  if (!event.data) return;

  let notificationData;

  try {
    notificationData = event.data.json();
  } catch {
    const text = event.data.text();
    notificationData = {
      title: 'RentUp',
      body: text,
      tag: `rentup-raw-${Date.now()}`,
      data: { url: '/' },
    };
  }

  const { title, body, icon, badge, tag, data: payload } = notificationData;

  event.waitUntil(
    self.registration.showNotification(title || 'RentUp', {
      body: body || '',
      icon: icon || '/favicon.ico',
      badge: badge || '/favicon.ico',
      vibrate: [200, 100, 200],
      tag: tag || `rentup-${Date.now()}`,
      data: payload || {},
      requireInteraction: true,
      actions: [
        { action: 'open', title: 'Abrir' },
        { action: 'close', title: 'Cerrar' },
      ],
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      const matchingClient = windowClients.find((client) => {
        try {
          return client.url === urlToOpen;
        } catch {
          return false;
        }
      });

      if (matchingClient) {
        return matchingClient.focus();
      }

      return clients.openWindow(urlToOpen);
    })
  );
});
