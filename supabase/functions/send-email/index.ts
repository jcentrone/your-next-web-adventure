import React from "react";
import {NextResponse} from "next/server";
import {Webhook} from "standardwebhooks";
import {Resend} from "resend";
import {renderAsync} from "@react-email/render";
import {MagicLinkEmail} from "../../../_templates/magic-link.tsx";

const resend = new Resend(process.env.RESEND_API_KEY as string);
const hookSecret = process.env.SEND_EMAIL_HOOK_SECRET as string;

export async function POST(request: Request) {
    try {
        const payload = await request.text();
        const headers = Object.fromEntries(request.headers as any);
        const wh = new Webhook(hookSecret);

        const {
            user,
            email_data: {token, token_hash, redirect_to, email_action_type},
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
                supabase_url: process.env.SUPABASE_URL ?? "",
                token,
                token_hash,
                redirect_to,
                email_action_type,
            })
        );

        const {error} = await resend.emails.send({
            from: "welcome <onboarding@resend.dev>",
            to: [user.email],
            subject: "Supa Custom MagicLink!",
            html,
        });

        if (error) throw error;

        return NextResponse.json({}, {status: 200});
    } catch (error: any) {
        console.error(error);
        return NextResponse.json(
            {
                error: {
                    http_code: error.code ?? 401,
                    message: error.message ?? "Unauthorized",
                },
            },
            {status: 401}
        );
    }
}
