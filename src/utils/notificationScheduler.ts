import { supabase } from '@/integrations/supabase/client';
import { sendNotificationApi } from '@/integrations/supabase/notificationsApi';

export class NotificationScheduler {
  private static instance: NotificationScheduler;
  private scheduledCallbacks = new Map<string, number>();

  static getInstance(): NotificationScheduler {
    if (!NotificationScheduler.instance) {
      NotificationScheduler.instance = new NotificationScheduler();
    }
    return NotificationScheduler.instance;
  }

  // Schedule appointment reminders based on user preferences
  async scheduleAppointmentReminders(appointmentId: string) {
    try {
      // Get appointment details
      const { data: appointment, error: appointmentError } = await supabase
        .from('appointments')
        .select('*, notification_preferences(*)')
        .eq('id', appointmentId)
        .single();

      if (appointmentError || !appointment) {
        console.error('Failed to fetch appointment:', appointmentError);
        return;
      }

      // Get user's notification preferences
      const { data: preferences, error: prefsError } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', appointment.user_id)
        .single();

      if (prefsError || !preferences || !preferences.appointment_reminders) {
        console.log('Appointment reminders disabled or preferences not found');
        return;
      }

      const appointmentDate = new Date(appointment.appointment_date);
      const now = new Date();

      // Schedule reminders based on user's preferred times
      for (const minutesBefore of preferences.appointment_reminder_times) {
        const reminderTime = new Date(appointmentDate);
        reminderTime.setMinutes(reminderTime.getMinutes() - minutesBefore);

        // Only schedule if reminder time is in the future
        if (reminderTime > now) {
          await sendNotificationApi.sendAppointmentReminder(appointmentId, minutesBefore);
          console.log(`Scheduled reminder for ${minutesBefore} minutes before appointment ${appointmentId}`);
        }
      }
    } catch (error) {
      console.error('Error scheduling appointment reminders:', error);
    }
  }

  // Schedule sync completion notification
  async scheduleSyncNotification(userId: string, type: 'complete' | 'failed', details?: string) {
    try {
      await sendNotificationApi.sendSyncNotification(userId, type, details);
      console.log(`Scheduled sync notification for user ${userId}: ${type}`);
    } catch (error) {
      console.error('Error scheduling sync notification:', error);
    }
  }

  // Schedule business intelligence notifications (weekly summaries, etc.)
  async scheduleBusinessIntelligenceNotifications(userId: string) {
    try {
      // Get user preferences
      const { data: preferences } = await supabase
        .from('notification_preferences')
        .select('business_intelligence')
        .eq('user_id', userId)
        .single();

      if (!preferences?.business_intelligence) {
        return;
      }

      // Schedule weekly summary (every Sunday at 9 AM)
      const nextSunday = new Date();
      nextSunday.setDate(nextSunday.getDate() + (7 - nextSunday.getDay()));
      nextSunday.setHours(9, 0, 0, 0);

      await sendNotificationApi.scheduleNotification({
        userId,
        type: 'weekly_summary',
        title: 'Weekly Performance Summary',
        body: 'Your weekly inspection summary is ready to view',
        scheduledFor: nextSunday.toISOString(),
        data: {
          url: '/analytics'
        }
      });

      console.log(`Scheduled weekly summary for user ${userId}`);
    } catch (error) {
      console.error('Error scheduling business intelligence notifications:', error);
    }
  }

  // Cancel scheduled notifications for an appointment
  async cancelAppointmentNotifications(appointmentId: string) {
    try {
      // Remove from notification queue
      await supabase
        .from('notification_queue')
        .update({ sent: true, attempts: 999 }) // Mark as processed to prevent sending
        .eq('related_appointment_id', appointmentId)
        .eq('sent', false);

      console.log(`Cancelled notifications for appointment ${appointmentId}`);
    } catch (error) {
      console.error('Error cancelling appointment notifications:', error);
    }
  }

  // Initialize automatic scheduling for existing appointments
  async initializeAppointmentScheduling() {
    try {
      const { data: upcomingAppointments } = await supabase
        .from('appointments')
        .select('id, appointment_date, user_id')
        .gte('appointment_date', new Date().toISOString())
        .eq('status', 'scheduled');

      if (upcomingAppointments) {
        for (const appointment of upcomingAppointments) {
          await this.scheduleAppointmentReminders(appointment.id);
        }
      }

      console.log(`Initialized scheduling for ${upcomingAppointments?.length || 0} appointments`);
    } catch (error) {
      console.error('Error initializing appointment scheduling:', error);
    }
  }

  // Process queued notifications (called by background service)
  async processNotificationQueue() {
    try {
      await supabase.functions.invoke('process-notification-queue');
      console.log('Processed notification queue');
    } catch (error) {
      console.error('Error processing notification queue:', error);
    }
  }
}

// Export singleton instance
export const notificationScheduler = NotificationScheduler.getInstance();