import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToastNotifications } from './useToastNotifications';

const VAPID_PUBLIC_KEY = 'BNxVjWyUGHHzgfgYhYJZvF5xOdF5jNvH5RjN8NjH8Rj9PnH5RjN8Nj';

interface PushSubscriptionData {
  endpoint: string;
  p256dhKey: string;
  authKey: string;
}

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const { user } = useAuth();
  const { showSuccess, showError } = useToastNotifications();

  // Check if push notifications are supported
  useEffect(() => {
    const checkSupport = () => {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        setIsSupported(true);
        checkExistingSubscription();
      } else {
        setIsSupported(false);
      }
    };

    checkSupport();
  }, []);

  // Check for existing subscription
  const checkExistingSubscription = useCallback(async () => {
    if (!user) return;

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        const existingSubscription = await registration.pushManager.getSubscription();
        if (existingSubscription) {
          setSubscription(existingSubscription);
          setIsSubscribed(true);
          
          // Verify subscription exists in database
          const { data } = await supabase
            .from('push_subscriptions')
            .select('id')
            .eq('user_id', user.id)
            .eq('endpoint', existingSubscription.endpoint)
            .eq('is_active', true)
            .single();

          if (!data) {
            // Subscription exists locally but not in database, re-subscribe
            await saveSubscriptionToDatabase(existingSubscription);
          }
        }
      }
    } catch (error) {
      console.error('Error checking existing subscription:', error);
    }
  }, [user]);

  // Convert VAPID key from base64 to Uint8Array
  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  // Save subscription to database
  const saveSubscriptionToDatabase = async (subscription: PushSubscription) => {
    if (!user) return;

    const p256dh = subscription.getKey('p256dh');
    const auth = subscription.getKey('auth');

    if (!p256dh || !auth) {
      throw new Error('Unable to get subscription keys');
    }

    const subscriptionData = {
      user_id: user.id,
      endpoint: subscription.endpoint,
      p256dh_key: btoa(String.fromCharCode(...new Uint8Array(p256dh))),
      auth_key: btoa(String.fromCharCode(...new Uint8Array(auth))),
      user_agent: navigator.userAgent,
      is_active: true
    };

    const { error } = await supabase
      .from('push_subscriptions')
      .upsert(subscriptionData, {
        onConflict: 'user_id,endpoint'
      });

    if (error) {
      throw error;
    }
  };

  // Subscribe to push notifications
  const subscribe = useCallback(async () => {
    if (!isSupported || !user) {
      showError('Push notifications not supported');
      return false;
    }

    setIsLoading(true);

    try {
      // Request notification permission
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        showError('Notification permission denied');
        setIsLoading(false);
        return false;
      }

      // Register service worker
      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      // Subscribe to push notifications
      const newSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });

      // Save to database
      await saveSubscriptionToDatabase(newSubscription);

      setSubscription(newSubscription);
      setIsSubscribed(true);
      showSuccess('Push notifications enabled');
      
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      showError('Failed to enable push notifications');
      setIsLoading(false);
      return false;
    }
  }, [isSupported, user, showSuccess, showError]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async () => {
    if (!subscription || !user) return false;

    setIsLoading(true);

    try {
      // Unsubscribe from push manager
      await subscription.unsubscribe();

      // Deactivate in database
      await supabase
        .from('push_subscriptions')
        .update({ is_active: false })
        .eq('user_id', user.id)
        .eq('endpoint', subscription.endpoint);

      setSubscription(null);
      setIsSubscribed(false);
      showSuccess('Push notifications disabled');
      
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      showError('Failed to disable push notifications');
      setIsLoading(false);
      return false;
    }
  }, [subscription, user, showSuccess, showError]);

  // Send test notification
  const sendTestNotification = useCallback(async () => {
    if (!user || !isSubscribed) return;

    try {
      const { error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          userId: user.id,
          type: 'test',
          title: 'Test Notification',
          body: 'This is a test notification from Home Report Pro',
          data: { test: true }
        }
      });

      if (error) {
        throw error;
      }

      showSuccess('Test notification sent');
    } catch (error) {
      console.error('Error sending test notification:', error);
      showError('Failed to send test notification');
    }
  }, [user, isSubscribed, showSuccess, showError]);

  return {
    isSupported,
    isSubscribed,
    isLoading,
    subscription,
    subscribe,
    unsubscribe,
    sendTestNotification,
    checkExistingSubscription
  };
}