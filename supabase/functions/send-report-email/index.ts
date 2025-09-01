import React from "npm:react@18.3.1";
import { Resend } from "npm:resend@4.0.0";
import { renderAsync } from "npm:@react-email/components@0.0.22";
import ReportShareEmail from "./_templates/report-share.tsx";

interface Recipient {
  email: string;
  name?: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY") ?? "");
const FROM_EMAIL =
  Deno.env.get("EMAIL_FROM") ?? "reports <onboarding@resend.dev>";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    console.log("Edge function started");
    const body = await req.json();
    console.log("Received request body:", JSON.stringify(body, null, 2));
    
    const { shareLink, recipients } = body as {
      shareLink?: string;
      recipients?: Recipient[];
    };

    console.log("Parsed shareLink:", shareLink);
    console.log("Parsed recipients:", recipients);

    if (!shareLink || !recipients || recipients.length === 0) {
      console.log("Missing required fields");
      return new Response(
        JSON.stringify({ error: "Missing shareLink or recipients" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Sending emails to ${recipients.length} recipients`);

    // Check if Resend API key is available
    const apiKey = Deno.env.get("RESEND_API_KEY");
    console.log("Resend API key available:", !!apiKey);
    
    if (!apiKey) {
      throw new Error("RESEND_API_KEY environment variable not set");
    }

    for (const recipient of recipients) {
      console.log(`Sending email to: ${recipient.email}`);
      
      const html = await renderAsync(
        React.createElement(ReportShareEmail, {
          link: shareLink,
          name: recipient.name,
        })
      );

      console.log("Email template rendered successfully");

      const emailResult = await resend.emails.send({
        from: FROM_EMAIL,
        to: [recipient.email],
        subject: "A report has been shared with you",
        html,
      });

      console.log("Email send result:", emailResult);

      if (emailResult.error) {
        console.error("Resend error:", emailResult.error);
        throw emailResult.error;
      }
    }

    console.log("All emails sent successfully");
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error in send-report-email function:", err);
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
