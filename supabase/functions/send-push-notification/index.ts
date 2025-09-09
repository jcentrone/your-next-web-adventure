import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationPayload {
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
  scheduledFor?: string; // ISO date string
}

const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY');
const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY');
const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT') || 'mailto:admin@homereportpro.com';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const payload: NotificationPayload = await req.json();
    console.log('Notification payload:', payload);

    // Validate required fields
    if (!payload.userId || !payload.type || !payload.title || !payload.body) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: userId, type, title, body' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Check if notification should be scheduled
    if (payload.scheduledFor) {
      const scheduledTime = new Date(payload.scheduledFor);
      
      // Queue the notification
      const { error: queueError } = await supabase
        .from('notification_queue')
        .insert({
          user_id: payload.userId,
          type: payload.type,
          title: payload.title,
          body: payload.body,
          data: payload.data || {},
          scheduled_for: scheduledTime.toISOString(),
          related_appointment_id: payload.data?.appointmentId,
          related_report_id: payload.data?.reportId,
          related_contact_id: payload.data?.contactId
        });

      if (queueError) {
        console.error('Error queuing notification:', queueError);
        return new Response(
          JSON.stringify({ error: 'Failed to queue notification' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Notification scheduled' }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get user's notification preferences
    const { data: preferences, error: prefsError } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', payload.userId)
      .single();

    if (prefsError && prefsError.code !== 'PGRST116') {
      console.error('Error fetching preferences:', prefsError);
    }

    // Check if notification type is enabled
    if (preferences) {
      const typeEnabled = checkNotificationTypeEnabled(payload.type, preferences);
      if (!typeEnabled) {
        console.log(`Notification type ${payload.type} is disabled for user ${payload.userId}`);
        return new Response(
          JSON.stringify({ success: true, message: 'Notification type disabled' }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // Check quiet hours
      if (preferences.quiet_hours_enabled && isInQuietHours(preferences)) {
        // Only send critical notifications during quiet hours
        if (!['emergency', 'critical', 'system_alert'].includes(payload.type)) {
          console.log(`Notification blocked by quiet hours for user ${payload.userId}`);
          return new Response(
            JSON.stringify({ success: true, message: 'Blocked by quiet hours' }),
            { 
              status: 200, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        }
      }
    }

    // Get user's active push subscriptions
    const { data: subscriptions, error: subsError } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', payload.userId)
      .eq('is_active', true);

    if (subsError) {
      console.error('Error fetching subscriptions:', subsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch subscriptions' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log(`No active subscriptions found for user ${payload.userId}`);
      return new Response(
        JSON.stringify({ success: true, message: 'No active subscriptions' }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Log notification
    const { data: logEntry, error: logError } = await supabase
      .from('notification_log')
      .insert({
        user_id: payload.userId,
        type: payload.type,
        title: payload.title,
        body: payload.body,
        data: payload.data || {},
        related_appointment_id: payload.data?.appointmentId,
        related_report_id: payload.data?.reportId,
        related_contact_id: payload.data?.contactId
      })
      .select('id')
      .single();

    const logId = logEntry?.id;

    // Prepare notification data
    const notificationData = {
      title: payload.title,
      body: payload.body,
      icon: payload.icon || '/pwa-192x192.png',
      badge: payload.badge || '/pwa-192x192.png',
      tag: payload.tag || payload.type,
      data: {
        ...payload.data,
        logId: logId,
        type: payload.type,
        timestamp: new Date().toISOString()
      },
      requireInteraction: payload.requireInteraction || false,
      actions: payload.actions || getDefaultActions(payload.type, payload.data)
    };

    // Send notifications to all subscriptions
    const sendPromises = subscriptions.map(async (subscription) => {
      try {
        const pushSubscription = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh_key,
            auth: subscription.auth_key
          }
        };

        // Use Web Push library to send notification
        const response = await sendWebPush(pushSubscription, notificationData);
        
        if (response.ok) {
          console.log(`Notification sent successfully to ${subscription.endpoint}`);
        } else {
          console.error(`Failed to send notification to ${subscription.endpoint}:`, response.status);
          
          // Deactivate subscription if it's invalid
          if (response.status === 410 || response.status === 404) {
            await supabase
              .from('push_subscriptions')
              .update({ is_active: false })
              .eq('id', subscription.id);
          }
        }

        return response.ok;
      } catch (error) {
        console.error(`Error sending to ${subscription.endpoint}:`, error);
        return false;
      }
    });

    const results = await Promise.all(sendPromises);
    const successCount = results.filter(success => success).length;

    // Update log with delivery status
    if (logId) {
      await supabase
        .from('notification_log')
        .update({ 
          delivered: successCount > 0,
          error_message: successCount === 0 ? 'Failed to deliver to all subscriptions' : null
        })
        .eq('id', logId);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        delivered: successCount,
        total: subscriptions.length,
        logId: logId
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error sending push notification:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

// Helper function to send web push notification
async function sendWebPush(subscription: any, data: any) {
  const payload = JSON.stringify(data);
  
  // This is a simplified version - in production, you'd use a proper Web Push library
  // For now, we'll simulate the response based on the endpoint validity
  try {
    const response = await fetch(subscription.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'Authorization': `Bearer ${VAPID_PRIVATE_KEY}`,
        'Crypto-Key': `p256ecdsa=${VAPID_PUBLIC_KEY}`,
        'TTL': '86400'
      },
      body: payload
    });
    
    return response;
  } catch (error) {
    console.error('Web push error:', error);
    throw error;
  }
}

// Helper function to check if notification type is enabled
function checkNotificationTypeEnabled(type: string, preferences: any): boolean {
  switch (type) {
    case 'appointment_reminder':
      return preferences.appointment_reminders;
    case 'client_message':
    case 'booking_new':
    case 'booking_cancelled':
      return preferences.client_messages;
    case 'system_alert':
    case 'emergency':
    case 'critical':
      return preferences.system_alerts;
    case 'sync_complete':
    case 'sync_failed':
      return preferences.sync_notifications;
    case 'business_intelligence':
    case 'weekly_summary':
    case 'monthly_report':
      return preferences.business_intelligence;
    default:
      return true; // Allow unknown types by default
  }
}

// Helper function to check if current time is in quiet hours
function isInQuietHours(preferences: any): boolean {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  const [startHour, startMin] = preferences.quiet_hours_start.split(':').map(Number);
  const [endHour, endMin] = preferences.quiet_hours_end.split(':').map(Number);
  
  const startTime = startHour * 60 + startMin;
  const endTime = endHour * 60 + endMin;
  
  if (startTime <= endTime) {
    // Same day quiet hours (e.g., 22:00 to 08:00 next day doesn't apply here)
    return currentTime >= startTime && currentTime <= endTime;
  } else {
    // Quiet hours spanning midnight (e.g., 22:00 to 08:00)
    return currentTime >= startTime || currentTime <= endTime;
  }
}

// Helper function to get default actions based on notification type
function getDefaultActions(type: string, data: any) {
  switch (type) {
    case 'appointment_reminder':
      return [
        { action: 'view_appointment', title: 'View Details', icon: '/icons/calendar.png' },
        { action: 'navigate', title: 'Navigate', icon: '/icons/navigation.png' }
      ];
    case 'client_message':
      return [
        { action: 'view_contact', title: 'View Contact', icon: '/icons/contact.png' },
        { action: 'reply', title: 'Reply', icon: '/icons/reply.png' }
      ];
    case 'booking_new':
      return [
        { action: 'view_appointment', title: 'View Booking', icon: '/icons/calendar.png' }
      ];
    case 'sync_complete':
      return [
        { action: 'view_reports', title: 'View Reports', icon: '/icons/reports.png' }
      ];
    default:
      return [];
  }
}