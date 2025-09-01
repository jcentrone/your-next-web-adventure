import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceKey) {
      throw new Error("Server not configured");
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    const payload = await req.json();
    const service = payload.service || payload.source || "unknown";
    const booking = payload.booking || payload.event || payload.payload || payload;

    const appointment = {
      user_id: booking.user_id || booking.userId,
      contact_id: booking.contact_id || booking.contactId,
      title: booking.title || `${service} booking`,
      appointment_date:
        booking.appointment_date || booking.start_time || new Date().toISOString(),
      status: "confirmed",
    };

    const appointmentsApi = {
      async create(data: any) {
        const { data: created, error } = await supabase
          .from("appointments")
          .insert(data)
          .select()
          .single();
        if (error) throw error;

        // Track activity to notify users
        await supabase.from("activities").insert({
          user_id: data.user_id,
          activity_type: "appointment_created",
          title: `Created appointment: ${data.title}`,
          description: `Scheduled for ${new Date(data.appointment_date).toLocaleDateString()}`,
          appointment_id: created.id,
          contact_id: data.contact_id,
        });
        return created;
      },
    };

    await appointmentsApi.create(appointment);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
