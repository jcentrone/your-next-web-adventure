import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { supabase } from '@/integrations/supabase/client';
import { AppointmentNotificationManager } from '@/utils/appointmentNotifications';

export function NotificationManager() {
  const { user } = useAuth();
  const { isSupported, checkExistingSubscription } = usePushNotifications();

  useEffect(() => {
    if (!user || !isSupported) return;

    // Check for existing subscription on app load
    checkExistingSubscription();

    // Initialize appointment scheduling
    AppointmentNotificationManager.initializeUpcomingReminders();

    // Set up periodic queue processing (every 5 minutes)
    const queueProcessor = setInterval(async () => {
      try {
        await supabase.functions.invoke('process-notification-queue');
      } catch (error) {
        console.error('Error processing notification queue:', error);
      }
    }, 5 * 60 * 1000);

    return () => {
      clearInterval(queueProcessor);
    };
  }, [user, isSupported, checkExistingSubscription]);

  // Listen for appointment changes to schedule notifications
  useEffect(() => {
    if (!user) return;

    const handleAppointmentChange = (payload: any) => {
      const { eventType, new: newRecord, old: oldRecord } = payload;
      AppointmentNotificationManager.handleAppointmentChange(
        newRecord?.id || oldRecord?.id,
        eventType,
        oldRecord,
        newRecord
      );
    };

    // Subscribe to real-time appointment changes
    const appointmentSubscription = supabase
      .channel('appointment-notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
          filter: `user_id=eq.${user.id}`
        },
        handleAppointmentChange
      )
      .subscribe();

    return () => {
      appointmentSubscription.unsubscribe();
    };
  }, [user]);

  // This component doesn't render anything visible
  return null;
}