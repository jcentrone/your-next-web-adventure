import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import React from "npm:react@18.3.1";
import { Resend } from "npm:resend@4.0.0";
import { renderAsync } from "npm:@react-email/components@0.0.22";
import ReportShareEmail from "../../../_templates/report-share.tsx";

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

    if (!reportId || !shareLink || !Array.isArray(recipients) || recipients.length === 0) {
      return new Response("Invalid payload", { status: 400, headers: corsHeaders });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const resendKey = Deno.env.get("RESEND_API_KEY");
    const fromEmail = Deno.env.get("EMAIL_FROM") || "noreply@example.com";

    if (!supabaseUrl || !serviceKey || !resendKey) {
      return new Response("Missing configuration", { status: 500, headers: corsHeaders });
    }

    const supabase = createClient(supabaseUrl, serviceKey);
    const resend = new Resend(resendKey);

    const { data: report, error: reportError } = await supabase
      .from("reports")
      .select("user_id")
      .eq("id", reportId)
      .single();

    if (reportError || !report) {
      return new Response("Report not found", { status: 404, headers: corsHeaders });
    }

    for (const r of recipients as Recipient[]) {
      const html = await renderAsync(
        React.createElement(ReportShareEmail, {
          shareLink,
          name: r.name,
        }),
      );

      const { error: sendError } = await resend.emails.send({
        from: fromEmail,
        to: [r.email],
        subject: "Inspection Report",
        html,
      });

      if (sendError) {
        console.error(sendError);
        return new Response("Failed to send email", { status: 502, headers: corsHeaders });
      }

      const { error: activityError } = await supabase.from("activities").insert({
        user_id: report.user_id,
        activity_type: "report_delivered",
        title: `Report emailed to ${r.name || r.email}`,
        report_id: reportId,
        contact_id: r.id,
      });

      if (activityError) {
        throw activityError;
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(message);
    return new Response(message, { status: 500, headers: corsHeaders });
  }
});
