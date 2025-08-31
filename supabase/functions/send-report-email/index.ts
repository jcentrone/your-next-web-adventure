import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Recipient {
  id: string;
  email: string;
  name?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { recipients, reportId, shareLink } = await req.json();
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return new Response("No recipients", { status: 400, headers: corsHeaders });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const sendgridKey = Deno.env.get("SENDGRID_API_KEY");
    const fromEmail = Deno.env.get("EMAIL_FROM") || "noreply@example.com";

    if (!supabaseUrl || !serviceKey || !sendgridKey) {
      return new Response("Missing configuration", { status: 500, headers: corsHeaders });
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    const { data: report, error: reportError } = await supabase
      .from("reports")
      .select("user_id")
      .eq("id", reportId)
      .single();

    if (reportError || !report) {
      return new Response("Report not found", { status: 404, headers: corsHeaders });
    }

    for (const r of recipients as Recipient[]) {
      await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sendgridKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: r.email, name: r.name }] }],
          from: { email: fromEmail },
          subject: "Inspection Report",
          content: [
            {
              type: "text/html",
              value: `<p>Your report is ready. View it here: <a href="${shareLink}">${shareLink}</a></p>`,
            },
          ],
        }),
      });

      await supabase.from("activities").insert({
        user_id: report.user_id,
        activity_type: "report_delivered",
        title: `Report emailed to ${r.name || r.email}`,
        report_id: reportId,
        contact_id: r.id,
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(message, { status: 500, headers: corsHeaders });
  }
});
