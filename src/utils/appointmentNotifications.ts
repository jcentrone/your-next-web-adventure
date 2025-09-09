import { supabase } from '@/integrations/supabase/client';
import { sendNotificationApi } from '@/integrations/supabase/notificationsApi';

export class AppointmentNotificationManager {
  // Schedule notifications when appointment is created or updated
  static async handleAppointmentChange(appointmentId: string, eventType: 'INSERT' | 'UPDATE' | 'DELETE', oldData?: any, newData?: any) {
    try {
      switch (eventType) {
        case 'INSERT':
          if (newData?.id) {
            await this.scheduleAppointmentReminders(newData.id);
            await this.sendBookingNotification(newData.id, 'new');
          }
          break;

        case 'UPDATE':
          if (newData?.status === 'cancelled' && oldData?.status !== 'cancelled') {
            // Appointment was cancelled
            await this.cancelAppointmentNotifications(newData.id);
            await this.sendBookingNotification(newData.id, 'cancelled');
          } else if (newData?.appointment_date !== oldData?.appointment_date) {
            // Appointment was rescheduled
            await this.cancelAppointmentNotifications(newData.id);
            await this.scheduleAppointmentReminders(newData.id);
            await this.sendBookingNotification(newData.id, 'rescheduled');
          }
          break;

        case 'DELETE':
          if (oldData?.id) {
            await this.cancelAppointmentNotifications(oldData.id);
          }
          break;
      }
    } catch (error) {
      console.error('Error handling appointment notification change:', error);
    }
  }

  // Schedule all reminder notifications for an appointment
  static async scheduleAppointmentReminders(appointmentId: string) {
    try {
      const { data: appointment, error: appointmentError } = await supabase
        .from('appointments')
        .select('*, user_id')
        .eq('id', appointmentId)
        .single();

      if (appointmentError || !appointment) {
        console.error('Failed to fetch appointment:', appointmentError);
        return;
      }

      // Get user's notification preferences
      const { data: preferences, error: prefsError } = await supabase
        .from('notification_preferences')
        .select('appointment_reminders, appointment_reminder_times')
        .eq('user_id', appointment.user_id)
        .single();

      if (prefsError || !preferences?.appointment_reminders) {
        console.log('Appointment reminders disabled for user');
        return;
      }

      const appointmentDate = new Date(appointment.appointment_date);
      const now = new Date();

      // Schedule each reminder
      for (const minutesBefore of preferences.appointment_reminder_times) {
        const reminderTime = new Date(appointmentDate);
        reminderTime.setMinutes(reminderTime.getMinutes() - minutesBefore);

        // Only schedule if reminder time is in the future
        if (reminderTime > now) {
          const timeText = minutesBefore < 60 
            ? `${minutesBefore} minutes`
            : `${Math.floor(minutesBefore / 60)} hour${Math.floor(minutesBefore / 60) > 1 ? 's' : ''}`;

          await sendNotificationApi.scheduleNotification({
            userId: appointment.user_id,
            type: 'appointment_reminder',
            title: `Inspection in ${timeText}`,
            body: `${appointment.title} at ${appointment.location}`,
            scheduledFor: reminderTime.toISOString(),
            data: {
              appointmentId: appointment.id,
              contactId: appointment.contact_id,
              address: appointment.location,
              url: `/calendar?appointment=${appointment.id}`
            },
            actions: [
              { action: 'view_appointment', title: 'View Details' },
              { action: 'navigate', title: 'Navigate' }
            ]
          });

          console.log(`Scheduled ${timeText} reminder for appointment ${appointmentId}`);
        }
      }
    } catch (error) {
      console.error('Error scheduling appointment reminders:', error);
    }
  }

  // Cancel all notifications for an appointment
  static async cancelAppointmentNotifications(appointmentId: string) {
    try {
      // Mark queued notifications as sent to prevent them from being processed
      await supabase
        .from('notification_queue')
        .update({ 
          sent: true, 
          attempts: 999 // Set high to prevent retries
        })
        .eq('related_appointment_id', appointmentId)
        .eq('sent', false);

      console.log(`Cancelled notifications for appointment ${appointmentId}`);
    } catch (error) {
      console.error('Error cancelling appointment notifications:', error);
    }
  }

  // Send booking notification (new, cancelled, rescheduled)
  static async sendBookingNotification(appointmentId: string, type: 'new' | 'cancelled' | 'rescheduled') {
    try {
      const { data: appointment, error: appointmentError } = await supabase
        .from('appointments')
        .select('*, contacts(*)')
        .eq('id', appointmentId)
        .single();

      if (appointmentError || !appointment) {
        throw new Error('Appointment not found');
      }

      const titles = {
        new: 'New Booking Received',
        cancelled: 'Booking Cancelled',
        rescheduled: 'Booking Rescheduled'
      };

      const bodies = {
        new: `New inspection booked for ${new Date(appointment.appointment_date).toLocaleDateString()} at ${appointment.location}`,
        cancelled: `Inspection at ${appointment.location} has been cancelled`,
        rescheduled: `Inspection at ${appointment.location} has been rescheduled to ${new Date(appointment.appointment_date).toLocaleDateString()}`
      };

      await sendNotificationApi.sendNotification({
        userId: appointment.user_id,
        type: `booking_${type}`,
        title: titles[type],
        body: bodies[type],
        data: {
          appointmentId: appointment.id,
          contactId: appointment.contact_id,
          url: `/calendar?appointment=${appointment.id}`
        },
        actions: [
          { action: 'view_appointment', title: 'View Details' }
        ]
      });

      console.log(`Sent ${type} booking notification for appointment ${appointmentId}`);
    } catch (error) {
      console.error('Error sending booking notification:', error);
    }
  }

  // Initialize reminders for all upcoming appointments
  static async initializeUpcomingReminders() {
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
        console.log(`Initialized reminders for ${upcomingAppointments.length} upcoming appointments`);
      }
    } catch (error) {
      console.error('Error initializing upcoming reminders:', error);
    }
  }
}