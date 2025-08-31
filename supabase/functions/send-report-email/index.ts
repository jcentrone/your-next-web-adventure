import React from "npm:react@18.3.1";
import { Resend } from "npm:resend@4.0.0";
import { renderAsync } from "npm:@react-email/components@0.0.22";
import ReportShareEmail from "./_templates/report-share.tsx";

interface Recipient {
  email: string;
  name?: string;
}

const resend = new Resend(Deno.env.get("RESEND_API_KEY") ?? "");

Deno.serve(async (req) => {
  try {
    const { shareLink, recipients } = (await req.json()) as {
      shareLink?: string;
      recipients?: Recipient[];
    };

    if (!shareLink || !recipients || recipients.length === 0) {
      return new Response(
        JSON.stringify({ error: "Missing shareLink or recipients" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    for (const recipient of recipients) {
      const html = await renderAsync(
        React.createElement(ReportShareEmail, {
          link: shareLink,
          name: recipient.name,
        })
      );

      const { error } = await resend.emails.send({
        from: "reports <onboarding@resend.dev>",
        to: [recipient.email],
        subject: "A report has been shared with you",
        html,
      });

      if (error) throw error;
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

