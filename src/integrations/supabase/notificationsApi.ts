import { supabase } from './client';

export interface NotificationPreferences {
  appointment_reminders: boolean;
  appointment_reminder_times: number[];
  client_messages: boolean;
  system_alerts: boolean;
  sync_notifications: boolean;
  business_intelligence: boolean;
  quiet_hours_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
}

export interface PushSubscription {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh_key: string;
  auth_key: string;
  user_agent?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationLog {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  data: any;
  sent_at: string;
  delivered: boolean;
  clicked: boolean;
  error_message?: string;
  related_appointment_id?: string;
  related_report_id?: string;
  related_contact_id?: string;
}

// Notification Preferences API
export const notificationPreferencesApi = {
  // Get user's notification preferences
  async getPreferences(userId: string) {
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data;
  },

  // Update notification preferences
  async updatePreferences(userId: string, preferences: Partial<NotificationPreferences>) {
    const { data, error } = await supabase
      .from('notification_preferences')
      .upsert({
        user_id: userId,
        ...preferences
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }
};

// Push Subscriptions API
export const pushSubscriptionsApi = {
  // Get user's active push subscriptions
  async getSubscriptions(userId: string) {
    const { data, error } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) {
      throw error;
    }

    return data;
  },

  // Add new push subscription
  async addSubscription(subscription: Omit<PushSubscription, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('push_subscriptions')
      .upsert(subscription, {
        onConflict: 'user_id,endpoint'
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  },

  // Deactivate push subscription
  async deactivateSubscription(userId: string, endpoint: string) {
    const { data, error } = await supabase
      .from('push_subscriptions')
      .update({ is_active: false })
      .eq('user_id', userId)
      .eq('endpoint', endpoint)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }
};

// Notification Log API
export const notificationLogApi = {
  // Get user's notification history
  async getNotificationHistory(userId: string, limit = 50, offset = 0) {
    const { data, error } = await supabase
      .from('notification_log')
      .select('*')
      .eq('user_id', userId)
      .order('sent_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    return data;
  },

  // Mark notification as clicked
  async markAsClicked(logId: string) {
    const { error } = await supabase
      .from('notification_log')
      .update({ clicked: true })
      .eq('id', logId);

    if (error) {
      throw error;
    }
  },

  // Get notification statistics
  async getNotificationStats(userId: string, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('notification_log')
      .select('type, delivered, clicked, sent_at')
      .eq('user_id', userId)
      .gte('sent_at', startDate.toISOString());

    if (error) {
      throw error;
    }

    return data;
  }
};

// Send Notification API
export const sendNotificationApi = {
  // Send immediate notification
  async sendNotification(payload: {
    userId: string;
    type: string;
    title: string;
    body: string;
    data?: any;
    icon?: string;
    badge?: string;
    tag?: string;
    requireInteraction?: boolean;
    actions?: Array<{
      action: string;
      title: string;
      icon?: string;
    }>;
  }) {
    const { data, error } = await supabase.functions.invoke('send-push-notification', {
      body: payload
    });

    if (error) {
      throw error;
    }

    return data;
  },

  // Schedule notification
  async scheduleNotification(payload: {
    userId: string;
    type: string;
    title: string;
    body: string;
    scheduledFor: string; // ISO date string
    data?: any;
    icon?: string;
    badge?: string;
    tag?: string;
    requireInteraction?: boolean;
    actions?: Array<{
      action: string;
      title: string;
      icon?: string;
    }>;
  }) {
    const { data, error } = await supabase.functions.invoke('send-push-notification', {
      body: payload
    });

    if (error) {
      throw error;
    }

    return data;
  },

  // Send appointment reminder
  async sendAppointmentReminder(appointmentId: string, minutesBefore: number) {
    // This would typically be called by a scheduled job
    // For now, we'll implement it as a direct call
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .select('*, contacts(*)')
      .eq('id', appointmentId)
      .single();

    if (appointmentError || !appointment) {
      throw new Error('Appointment not found');
    }

    const reminderTime = new Date(appointment.appointment_date);
    reminderTime.setMinutes(reminderTime.getMinutes() - minutesBefore);

    const timeText = minutesBefore < 60 
      ? `${minutesBefore} minutes`
      : `${Math.floor(minutesBefore / 60)} hour${Math.floor(minutesBefore / 60) > 1 ? 's' : ''}`;

    return this.scheduleNotification({
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
  },

  // Send booking notification
  async sendBookingNotification(appointmentId: string, type: 'new' | 'cancelled' | 'rescheduled') {
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
      rescheduled: `Inspection at ${appointment.location} has been rescheduled`
    };

    return this.sendNotification({
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
  },

  // Send sync notification
  async sendSyncNotification(userId: string, type: 'complete' | 'failed', details?: string) {
    const titles = {
      complete: 'Sync Complete',
      failed: 'Sync Failed'
    };

    const bodies = {
      complete: details || 'Your data has been synchronized successfully',
      failed: details || 'Data synchronization failed. Please try again.'
    };

    return this.sendNotification({
      userId,
      type: `sync_${type}`,
      title: titles[type],
      body: bodies[type],
      data: {
        syncType: type,
        url: '/reports'
      }
    });
  }
};