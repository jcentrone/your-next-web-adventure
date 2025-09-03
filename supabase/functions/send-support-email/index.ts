import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SupportEmailRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
  logs?: any;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, subject, message, logs }: SupportEmailRequest = await req.json();

    // Format logs for email if included
    const logsSection = logs ? `

--- TECHNICAL INFORMATION ---
User Agent: ${logs.userAgent || 'Not available'}
URL: ${logs.url || 'Not available'}
Timestamp: ${logs.timestamp || 'Not available'}

Local Storage:
${Object.entries(logs.localStorage || {}).map(([key, value]) => `${key}: ${value}`).join('\n')}

Session Storage:
${Object.entries(logs.sessionStorage || {}).map(([key, value]) => `${key}: ${value}`).join('\n')}

--- END TECHNICAL INFORMATION ---
` : '';

    const emailBody = `
New support request from ${name}

Email: ${email}
Subject: ${subject}

Message:
${message}
${logsSection}
    `;

    const emailResponse = await resend.emails.send({
      from: "HomeReportPro Support <noreply@homeexpertpro.com>",
      to: ["support@homeexpertpro.com"],
      reply_to: email,
      subject: `Support Request: ${subject}`,
      text: emailBody,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
            New Support Request
          </h2>
          
          <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>From:</strong> ${name}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>Subject:</strong> ${subject}</p>
          </div>
          
          <div style="margin: 20px 0;">
            <h3 style="color: #374151; margin-bottom: 10px;">Message:</h3>
            <div style="background: white; padding: 15px; border-left: 4px solid #2563eb; margin: 10px 0;">
              ${message.replace(/\n/g, '<br>')}
            </div>
          </div>
          
          ${logs ? `
            <details style="margin: 20px 0; padding: 15px; background: #f1f5f9; border-radius: 8px;">
              <summary style="cursor: pointer; font-weight: bold; color: #475569;">Technical Information</summary>
              <div style="margin-top: 10px; font-family: monospace; font-size: 12px;">
                <p><strong>User Agent:</strong> ${logs.userAgent || 'Not available'}</p>
                <p><strong>URL:</strong> ${logs.url || 'Not available'}</p>
                <p><strong>Timestamp:</strong> ${logs.timestamp || 'Not available'}</p>
                
                <h4 style="margin-top: 15px; color: #374151;">Local Storage:</h4>
                <pre style="background: white; padding: 10px; border-radius: 4px; overflow-x: auto;">${Object.entries(logs.localStorage || {}).map(([key, value]) => `${key}: ${value}`).join('\n')}</pre>
                
                <h4 style="margin-top: 15px; color: #374151;">Session Storage:</h4>
                <pre style="background: white; padding: 10px; border-radius: 4px; overflow-x: auto;">${Object.entries(logs.sessionStorage || {}).map(([key, value]) => `${key}: ${value}`).join('\n')}</pre>
              </div>
            </details>
          ` : ''}
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
            <p>This support request was submitted through the HomeReportPro application.</p>
            <p>Please reply to this email to respond to the user.</p>
          </div>
        </div>
      `,
    });

    console.log("Support email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-support-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);