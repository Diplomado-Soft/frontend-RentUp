const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:9000';

export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.log('❌ Push notifications not supported in this browser');
    return null;
  }

  try {
    const existing = await navigator.serviceWorker.getRegistration('/');
    if (existing) {
      console.log('✅ Service Worker ya registrado');
      await existing.update();
      return existing;
    }

    const registration = await navigator.serviceWorker.register('/service-worker.js', {
      scope: '/',
      updateViaCache: 'none',
    });
    console.log('✅ Service Worker registrado correctamente');
    return registration;
  } catch (err) {
    console.error('❌ Service Worker registration failed:', err);
    return null;
  }
}

export async function getVapidPublicKey() {
  try {
    const res = await fetch(`${API_URL}/push/vapid-public-key`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    console.log('✅ VAPID public key obtenida');
    return data.publicKey;
  } catch (err) {
    console.error('❌ Error fetching VAPID public key:', err);
    return null;
  }
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export async function subscribeToPush(registration, vapidPublicKey, token) {
  if (!registration || !vapidPublicKey || !token) {
    console.log('❌ subscribeToPush: missing params', { hasReg: !!registration, hasKey: !!vapidPublicKey, hasToken: !!token });
    return null;
  }

  try {
    let subscription = await registration.pushManager.getSubscription();
    console.log('ℹ️ Push subscription existente:', subscription ? 'SÍ' : 'NO');

    if (!subscription) {
      const convertedKey = urlBase64ToUint8Array(vapidPublicKey);
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey,
      });
      console.log('✅ Nueva suscripción push creada');
    }

    const subData = subscription.toJSON();

    const res = await fetch(`${API_URL}/push/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(subData),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`HTTP ${res.status}: ${errText}`);
    }
    console.log('✅ Suscripción push registrada en el servidor');
    return subscription;
  } catch (err) {
    console.error('❌ Error subscribing to push:', err);
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
      console.log('✅ Push unsubscribed from browser');

      await fetch(`${API_URL}/push/unsubscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ endpoint: subData.endpoint }),
      });
      console.log('✅ Push unsubscribed from server');
    }
  } catch (err) {
    console.error('❌ Error unsubscribing:', err);
  }
}

export async function checkNotificationPermission() {
  if (!('Notification' in window)) {
    return { granted: false, reason: 'API no soportada' };
  }

  if (Notification.permission === 'granted') {
    return { granted: true };
  }

  if (Notification.permission === 'denied') {
    return { granted: false, reason: 'Bloqueado por el usuario' };
  }

  const permission = await Notification.requestPermission();
  return { granted: permission === 'granted', reason: permission };
}
