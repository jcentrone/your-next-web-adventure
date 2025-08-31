import React from "npm:react@18.3.1";
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";
import { Resend } from "npm:resend@4.0.0";
import { renderAsync } from "npm:@react-email/components@0.0.22";
import MagicLinkEmail from "./_templates/magic-link.tsx";

const resend = new Resend(Deno.env.get("RESEND_API_KEY") ?? "");
const hookSecret = Deno.env.get("SEND_EMAIL_HOOK_SECRET") ?? "";

Deno.serve(async (req) => {
  try {
    const payload = await req.text();
    const headers = Object.fromEntries(req.headers.entries());
    const wh = new Webhook(hookSecret);

    const {
      user,
      email_data: { token, token_hash, redirect_to, email_action_type },
    } = wh.verify(payload, headers) as {
      user: { email: string };
      email_data: {
        token: string;
        token_hash: string;
        redirect_to: string;
        email_action_type: string;
        site_url?: string;
        token_new?: string;
        token_hash_new?: string;
      };
    };

    const html = await renderAsync(
      React.createElement(MagicLinkEmail, {
        supabase_url: Deno.env.get("SUPABASE_URL") ?? "",
        token,
        token_hash,
        redirect_to,
        email_action_type,
      })
    );

    const { error } = await resend.emails.send({
      from: "welcome <onboarding@resend.dev>",
      to: [user.email],
      subject: "Supa Custom MagicLink!",
      html,
    });

    if (error) throw error;

    return new Response(JSON.stringify({}), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    const error = err as { code?: number; message?: string };
    const body = {
      error: {
        http_code: error.code ?? 401,
        message: error.message ?? "Unauthorized",
      },
    };
    return new Response(JSON.stringify(body), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
});
