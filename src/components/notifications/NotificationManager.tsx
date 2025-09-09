import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { notificationScheduler } from '@/utils/notificationScheduler';
import { supabase } from '@/integrations/supabase/client';

export function NotificationManager() {
  const { user } = useAuth();
  const { isSupported, checkExistingSubscription } = usePushNotifications();

  useEffect(() => {
    if (!user || !isSupported) return;

    // Check for existing subscription on app load
    checkExistingSubscription();

    // Initialize appointment scheduling
    notificationScheduler.initializeAppointmentScheduling();

    // Set up periodic queue processing (every 5 minutes)
    const queueProcessor = setInterval(() => {
      notificationScheduler.processNotificationQueue();
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

      switch (eventType) {
        case 'INSERT':
          // Schedule reminders for new appointment
          if (newRecord?.id) {
            notificationScheduler.scheduleAppointmentReminders(newRecord.id);
          }
          break;

        case 'UPDATE':
          // Reschedule if date changed, cancel if cancelled
          if (newRecord?.status === 'cancelled' && oldRecord?.id) {
            notificationScheduler.cancelAppointmentNotifications(oldRecord.id);
          } else if (
            newRecord?.appointment_date !== oldRecord?.appointment_date &&
            newRecord?.id
          ) {
            notificationScheduler.cancelAppointmentNotifications(newRecord.id);
            notificationScheduler.scheduleAppointmentReminders(newRecord.id);
          }
          break;

        case 'DELETE':
          // Cancel notifications for deleted appointment
          if (oldRecord?.id) {
            notificationScheduler.cancelAppointmentNotifications(oldRecord.id);
          }
          break;
      }
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