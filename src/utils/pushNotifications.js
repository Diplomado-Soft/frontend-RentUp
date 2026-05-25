const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:9000';

export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.log('Push notifications not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/service-worker.js', {
      scope: '/',
      updateViaCache: 'none',
    });
    console.log('Service Worker registered');
    return registration;
  } catch (err) {
    console.error('Service Worker registration failed:', err);
    return null;
  }
}

export async function getVapidPublicKey() {
  try {
    const res = await fetch(`${API_URL}/push/vapid-public-key`);
    const data = await res.json();
    return data.publicKey;
  } catch (err) {
    console.error('Error fetching VAPID public key:', err);
    return null;
  }
}

async function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export async function subscribeToPush(registration, vapidPublicKey, token) {
  if (!registration || !vapidPublicKey || !token) return null;

  try {
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      const convertedKey = await urlBase64ToUint8Array(vapidPublicKey);
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey,
      });
    }

    // Send subscription to backend
    const subData = subscription.toJSON();

    const res = await fetch(`${API_URL}/push/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(subData),
    });

    if (!res.ok) throw new Error('Failed to subscribe on server');
    console.log('Push subscription registered on server');
    return subscription;
  } catch (err) {
    console.error('Error subscribing to push:', err);
    return null;
  }
}

export async function unsubscribeFromPush(token) {
  if (!('serviceWorker' in navigator)) return;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      const subData = subscription.toJSON();
      await subscription.unsubscribe();

      await fetch(`${API_URL}/push/unsubscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ endpoint: subData.endpoint }),
      });
    }
  } catch (err) {
    console.error('Error unsubscribing:', err);
  }
}
