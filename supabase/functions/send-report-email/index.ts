import React from "npm:react@18.3.1";
import { Resend } from "npm:resend@4.0.0";
import { renderAsync } from "npm:@react-email/render@1.2.1";
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
  Deno.env.get("EMAIL_FROM") ?? "reports <reports@homereportpro.com>";
const REPLY_TO = Deno.env.get("EMAIL_REPLY_TO") ?? FROM_EMAIL;
const UNSUBSCRIBE_URL = Deno.env.get("UNSUBSCRIBE_URL") ?? "";
const ORGANIZATION_NAME =
  Deno.env.get("ORG_NAME") ?? "Home Report Pro";
const ORGANIZATION_ADDRESS = Deno.env.get("ORG_ADDRESS") ?? "";
const ORGANIZATION_URL = Deno.env.get("ORG_URL") ?? "";

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

      const templateProps = {
        link: shareLink,
        name: recipient.name,
        organizationName: ORGANIZATION_NAME,
        organizationAddress: ORGANIZATION_ADDRESS,
        organizationUrl: ORGANIZATION_URL,
        unsubscribeUrl: UNSUBSCRIBE_URL,
      };

      const html = await renderAsync(
        React.createElement(ReportShareEmail, templateProps)
      );
      const text = await renderAsync(
        React.createElement(ReportShareEmail, templateProps),
        { plainText: true }
      );

      console.log("Email template rendered successfully");

      const headers: Record<string, string> = {};
      if (UNSUBSCRIBE_URL) {
        headers["List-Unsubscribe"] = `<${UNSUBSCRIBE_URL}>`;
        headers["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click";
      }

      const emailResult = await resend.emails.send({
        from: FROM_EMAIL,
        to: [recipient.email],
        subject: `Inspection report from ${ORGANIZATION_NAME}`,
        html,
        text,
        reply_to: REPLY_TO,
        headers,
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
