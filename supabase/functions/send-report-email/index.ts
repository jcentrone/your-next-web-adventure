import React from "npm:react@18.3.1";
import { Resend } from "npm:resend@4.0.0";
import { renderAsync } from "npm:@react-email/render@1.2.1";
import { Html, Head, Preview, Body } from "npm:@react-email/components@0.0.22";
import { Markdown } from "npm:@react-email/markdown@0.0.15";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { replaceMergeFields } from "../../../src/utils/replaceMergeFields.ts";
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

    const { reportId, shareLink, recipients } = body as {
      reportId?: string;
      shareLink?: string;
      recipients?: Recipient[];
    };

    console.log("Parsed reportId:", reportId);
    console.log("Parsed shareLink:", shareLink);
    console.log("Parsed recipients:", recipients);

    if (!reportId || !shareLink || !recipients || recipients.length === 0) {
      console.log("Missing required fields");
      return new Response(
        JSON.stringify({ error: "Missing reportId, shareLink or recipients" }),
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

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Supabase environment variables not set");
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      global: { headers: { Authorization: req.headers.get("Authorization") || "" } },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data: report, error: reportError } = await supabase
      .from("reports")
      .select(
        "organization_id, client_name, address, email, phone_home, phone_work, phone_cell, inspection_date, sections, report_data"
      )
      .eq("id", reportId)
      .single();
    if (reportError || !report) throw reportError || new Error("Report not found");

    const { data: organization } = await supabase
      .from("organizations")
      .select("id, name, address, phone, email")
      .eq("id", report.organization_id)
      .single();

    const { data: inspector } = await supabase
      .from("profiles")
      .select("full_name, phone, license_number")
      .eq("user_id", user.id)
      .single();

    const { data: template } = await supabase
      .from("email_templates")
      .select("report_email_subject, report_email_body")
      .eq("organization_id", report.organization_id)
      .maybeSingle();

    const mergeData = {
      organization,
      inspector,
      report: {
        clientName: report.client_name,
        address: report.address,
        email: report.email,
        phoneHome: report.phone_home,
        phoneWork: report.phone_work,
        phoneCell: report.phone_cell,
        inspectionDate: report.inspection_date,
        sections: report.sections,
        reportData: report.report_data,
      },
    } as const;

    for (const recipient of recipients) {
      console.log(`Sending email to: ${recipient.email}`);

      let html: string;
      let text: string;
      let subject: string;

      if (template) {
        const mergedSubject = replaceMergeFields(
          template.report_email_subject,
          mergeData
        );
        let mergedBody = replaceMergeFields(
          template.report_email_body,
          mergeData
        );
        mergedBody = mergedBody.replace(/{{\s*(link|shareLink)\s*}}/g, shareLink);

        const email = React.createElement(
          Html,
          null,
          React.createElement(Head, null),
          React.createElement(Preview, null, mergedSubject),
          React.createElement(
            Body,
            null,
            React.createElement(Markdown, null, mergedBody)
          )
        );
        html = await renderAsync(email);
        text = await renderAsync(email, { plainText: true });
        subject = mergedSubject;
      } else {
        const templateProps = {
          link: shareLink,
          name: recipient.name,
          organizationName: ORGANIZATION_NAME,
          organizationAddress: ORGANIZATION_ADDRESS,
          organizationUrl: ORGANIZATION_URL,
          unsubscribeUrl: UNSUBSCRIBE_URL,
        };

        html = await renderAsync(
          React.createElement(ReportShareEmail, templateProps)
        );
        text = await renderAsync(
          React.createElement(ReportShareEmail, templateProps),
          { plainText: true }
        );
        subject = `Inspection report from ${ORGANIZATION_NAME}`;
      }

      console.log("Email template rendered successfully");

      const headers: Record<string, string> = {};
      if (UNSUBSCRIBE_URL) {
        headers["List-Unsubscribe"] = `<${UNSUBSCRIBE_URL}>`;
        headers["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click";
      }

      const emailResult = await resend.emails.send({
        from: FROM_EMAIL,
        to: [recipient.email],
        subject,
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
