import { useEffect, useContext, useRef, useState, useCallback } from 'react';
import { UserContext } from '../contexts/UserContext';
import { registerServiceWorker, getVapidPublicKey, subscribeToPush, unsubscribeFromPush } from '../utils/pushNotifications';

export default function PushNotificationProvider({ children }) {
  const { user } = useContext(UserContext);
  const autoSubscribed = useRef(false);

  useEffect(() => {
    if (!user?.token || autoSubscribed.current) return;

    if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      return;
    }

    if (Notification.permission !== 'granted') return;

    const token = user.token;

    async function autoSubscribe() {
      try {
        const existing = await navigator.serviceWorker.getRegistration('/');
        const registration = existing || await registerServiceWorker();
        if (!registration) return;

        const vapidPublicKey = await getVapidPublicKey();
        if (!vapidPublicKey) return;

        const sub = await subscribeToPush(registration, vapidPublicKey, token);
        if (sub) {
          autoSubscribed.current = true;
        }
      } catch (err) {
        console.error('Push auto-subscribe error:', err);
      }
    }

    autoSubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) autoSubscribed.current = false;
  }, [user]);

  return children;
}

export function usePushNotifications() {
  const { user } = useContext(UserContext);
  const [status, setStatus] = useState('idle');

  useEffect(() => {
    if (!user?.token) {
      setStatus('idle');
      return;
    }

    async function checkExisting() {
      const perm = Notification.permission;
      if (perm !== 'granted') {
        setStatus('inactive');
        return;
      }

      try {
        const registration = await navigator.serviceWorker.getRegistration('/');
        if (!registration) {
          setStatus('inactive');
          return;
        }
        const subscription = await registration.pushManager.getSubscription();
        setStatus(subscription ? 'active' : 'inactive');
      } catch {
        setStatus('inactive');
      }
    }

    checkExisting();
  }, [user]);

  const enable = useCallback(async () => {
    if (!user?.token) return false;

    if (!('Notification' in window)) {
      setStatus('unsupported');
      return false;
    }

    setStatus('requesting-permission');

    let permission = Notification.permission;
    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }

    if (permission !== 'granted') {
      setStatus('denied');
      return false;
    }

    setStatus('registering-sw');
    const registration = await registerServiceWorker();
    if (!registration) {
      setStatus('failed');
      return false;
    }

    setStatus('getting-key');
    const key = await getVapidPublicKey();
    if (!key) {
      setStatus('failed');
      return false;
    }

    setStatus('subscribing');
    const sub = await subscribeToPush(registration, key, user.token);
    if (sub) {
      setStatus('active');
      return true;
    }

    setStatus('failed');
    return false;
  }, [user]);

  const disable = useCallback(async () => {
    await unsubscribeFromPush(user?.token);
    setStatus('disabled');
  }, [user]);

  return { status, enable, disable };
}
