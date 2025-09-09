import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    console.log('Processing notification queue...');

    // Get pending notifications that are ready to be sent
    const now = new Date().toISOString();
    const { data: pendingNotifications, error: fetchError } = await supabase
      .from('notification_queue')
      .select('*')
      .eq('sent', false)
      .lte('scheduled_for', now)
      .lt('attempts', 3) // Don't retry more than 3 times
      .order('scheduled_for', { ascending: true })
      .limit(50); // Process in batches

    if (fetchError) {
      console.error('Error fetching pending notifications:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch pending notifications' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (!pendingNotifications || pendingNotifications.length === 0) {
      console.log('No pending notifications to process');
      return new Response(
        JSON.stringify({ success: true, processed: 0 }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`Processing ${pendingNotifications.length} notifications`);

    let successCount = 0;
    let failureCount = 0;

    // Process each notification
    for (const notification of pendingNotifications) {
      try {
        // Increment attempt counter
        await supabase
          .from('notification_queue')
          .update({ attempts: notification.attempts + 1 })
          .eq('id', notification.id);

        // Send the notification using the send-push-notification function
        const response = await supabase.functions.invoke('send-push-notification', {
          body: {
            userId: notification.user_id,
            type: notification.type,
            title: notification.title,
            body: notification.body,
            data: {
              ...notification.data,
              appointmentId: notification.related_appointment_id,
              reportId: notification.related_report_id,
              contactId: notification.related_contact_id
            }
          }
        });

        if (response.error) {
          console.error(`Failed to send notification ${notification.id}:`, response.error);
          failureCount++;
          
          // If max attempts reached, mark as failed
          if (notification.attempts + 1 >= notification.max_attempts) {
            await supabase
              .from('notification_queue')
              .update({ sent: false }) // Keep as not sent but won't be retried
              .eq('id', notification.id);
          }
        } else {
          console.log(`Successfully sent notification ${notification.id}`);
          successCount++;
          
          // Mark as sent
          await supabase
            .from('notification_queue')
            .update({ sent: true })
            .eq('id', notification.id);
        }

      } catch (error) {
        console.error(`Error processing notification ${notification.id}:`, error);
        failureCount++;
      }
    }

    // Clean up old processed notifications (older than 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    await supabase
      .from('notification_queue')
      .delete()
      .eq('sent', true)
      .lt('created_at', sevenDaysAgo.toISOString());

    console.log(`Queue processing complete. Success: ${successCount}, Failures: ${failureCount}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: pendingNotifications.length,
        successful: successCount,
        failed: failureCount
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error processing notification queue:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});