self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const { title, body, icon, badge, data: payload } = data;

    event.waitUntil(
      self.registration.showNotification(title || 'RentUp', {
        body: body || '',
        icon: icon || '/favicon.ico',
        badge: badge || '/favicon.ico',
        vibrate: [200, 100, 200],
        tag: payload?.url || 'rentup-default',
        data: payload || {},
        requireInteraction: true,
        actions: [
          { action: 'open', title: 'Abrir' },
          { action: 'close', title: 'Cerrar' },
        ],
      })
    );
  } catch (e) {
    console.error('Error processing push event:', e);
  }
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
