import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToastNotifications } from './useToastNotifications';

interface NotificationPreferences {
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

const defaultPreferences: NotificationPreferences = {
  appointment_reminders: true,
  appointment_reminder_times: [30, 120, 1440], // 30min, 2hr, 24hr in minutes
  client_messages: true,
  system_alerts: true,
  sync_notifications: true,
  business_intelligence: false,
  quiet_hours_enabled: false,
  quiet_hours_start: '22:00:00',
  quiet_hours_end: '08:00:00'
};

export function useNotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();
  const { showSuccess, showError } = useToastNotifications();

  // Load preferences from database
  useEffect(() => {
    const loadPreferences = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('notification_preferences')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (data) {
          setPreferences({
            appointment_reminders: data.appointment_reminders,
            appointment_reminder_times: data.appointment_reminder_times,
            client_messages: data.client_messages,
            system_alerts: data.system_alerts,
            sync_notifications: data.sync_notifications,
            business_intelligence: data.business_intelligence,
            quiet_hours_enabled: data.quiet_hours_enabled,
            quiet_hours_start: data.quiet_hours_start,
            quiet_hours_end: data.quiet_hours_end
          });
        } else {
          // Create default preferences if none exist
          await savePreferences(defaultPreferences);
        }
      } catch (error) {
        console.error('Error loading notification preferences:', error);
        showError('Failed to load notification preferences');
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, [user, showError]);

  // Save preferences to database
  const savePreferences = async (newPreferences: NotificationPreferences) => {
    if (!user) return;

    setIsSaving(true);

    try {
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          ...newPreferences
        });

      if (error) {
        throw error;
      }

      setPreferences(newPreferences);
      showSuccess('Notification preferences saved');
    } catch (error) {
      console.error('Error saving notification preferences:', error);
      showError('Failed to save notification preferences');
    } finally {
      setIsSaving(false);
    }
  };

  // Update specific preference
  const updatePreference = <K extends keyof NotificationPreferences>(
    key: K,
    value: NotificationPreferences[K]
  ) => {
    const newPreferences = { ...preferences, [key]: value };
    savePreferences(newPreferences);
  };

  // Toggle boolean preference
  const togglePreference = (key: keyof NotificationPreferences) => {
    if (typeof preferences[key] === 'boolean') {
      updatePreference(key, !preferences[key] as any);
    }
  };

  // Update reminder times
  const updateReminderTimes = (times: number[]) => {
    updatePreference('appointment_reminder_times', times);
  };

  // Update quiet hours
  const updateQuietHours = (start: string, end: string) => {
    const newPreferences = {
      ...preferences,
      quiet_hours_start: start,
      quiet_hours_end: end
    };
    savePreferences(newPreferences);
  };

  return {
    preferences,
    isLoading,
    isSaving,
    updatePreference,
    togglePreference,
    updateReminderTimes,
    updateQuietHours,
    savePreferences
  };
}