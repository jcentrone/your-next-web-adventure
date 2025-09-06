import React from "npm:react@18.3.1";
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";
import { Resend } from "npm:resend@4.0.0";
import { renderAsync } from "npm:@react-email/components@0.0.22";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";
import MagicLinkEmail from "./_templates/magic-link.tsx";
import SignupConfirmationEmail from "./_templates/signup-confirmation.tsx";
import PasswordRecoveryEmail from "./_templates/password-recovery.tsx";
import InviteEmail from "./_templates/invite.tsx";
import EmailChangeEmail from "./_templates/email-change.tsx";

const resend = new Resend(Deno.env.get("RESEND_API_KEY") ?? "");
// Extract the base64 part from Supabase webhook secret format
const rawHookSecret = Deno.env.get("SEND_EMAIL_HOOK_SECRET") ?? "";
const hookSecret = rawHookSecret.startsWith("v1,whsec_") 
  ? rawHookSecret.replace("v1,whsec_", "")
  : rawHookSecret;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client for fetching organization data
const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

interface EmailData {
  token: string;
  token_hash: string;
  redirect_to: string;
  email_action_type: string;
  site_url?: string;
  token_new?: string;
  token_hash_new?: string;
}

interface User {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
    name?: string;
  };
}

async function getOrganizationBranding(userEmail: string) {
  try {
    // Try to find organization through profiles and organization_members
    const { data: profile } = await supabase
      .from('profiles')
      .select(`
        user_id,
        full_name,
        organization_members!inner (
          organization_id,
          organizations!inner (
            id,
            name,
            logo_url,
            primary_color,
            secondary_color,
            email_from_name,
            email_from_address
          )
        )
      `)
      .eq('email', userEmail)
      .single();

    if (profile?.organization_members?.organizations) {
      const org = profile.organization_members.organizations;
      return {
        organizationName: org.name,
        organizationLogo: org.logo_url,
        primaryColor: org.primary_color || '#2563eb',
        secondaryColor: org.secondary_color || '#64748b',
        emailFromName: org.email_from_name || org.name,
        emailFromAddress: org.email_from_address || 'noreply@homeexpertpro.com',
        userName: profile.full_name || 'there',
      };
    }
  } catch (error) {
    console.log('Could not fetch organization branding:', error);
  }

  // Return defaults if no organization found
  return {
    organizationName: 'HomeReportPro',
    organizationLogo: null,
    primaryColor: '#2563eb',
    secondaryColor: '#64748b',
    emailFromName: 'HomeReportPro',
    emailFromAddress: 'noreply@homeexpertpro.com',
    userName: 'there',
  };
}

function getEmailTemplate(emailActionType: string, props: any) {
  switch (emailActionType) {
    case 'signup':
    case 'confirmation':
      return React.createElement(SignupConfirmationEmail, props);
    case 'recovery':
      return React.createElement(PasswordRecoveryEmail, props);
    case 'invite':
      return React.createElement(InviteEmail, props);
    case 'email_change':
      return React.createElement(EmailChangeEmail, props);
    case 'magiclink':
    default:
      return React.createElement(MagicLinkEmail, props);
  }
}

function getEmailSubject(emailActionType: string, organizationName: string): string {
  switch (emailActionType) {
    case 'signup':
    case 'confirmation':
      return `Welcome to ${organizationName} - Verify your account`;
    case 'recovery':
      return `Reset your ${organizationName} password`;
    case 'invite':
      return `You've been invited to join ${organizationName}`;
    case 'email_change':
      return `Confirm your new email address - ${organizationName}`;
    case 'magiclink':
    default:
      return `Sign in to ${organizationName}`;
  }
}

Deno.serve(async (req) => {
  console.log('=== Send Email Function Called ===');
  console.log('Method:', req.method);
  console.log('Headers:', Object.fromEntries(req.headers.entries()));
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    console.log('Method not allowed:', req.method);
    return new Response('Method not allowed', { 
      status: 405, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    console.log('Processing email request...');
    
    const payload = await req.text();
    const headers = Object.fromEntries(req.headers.entries());
    const wh = new Webhook(hookSecret);

    const { user, email_data } = wh.verify(payload, headers) as {
      user: User;
      email_data: EmailData;
    };

    console.log('Email action type:', email_data.email_action_type);
    console.log('User email:', user.email);

    // Get organization branding
    const branding = await getOrganizationBranding(user.email);
    
    // Get user's display name
    const userName = user.user_metadata?.full_name || 
                    user.user_metadata?.name || 
                    branding.userName;

    // Prepare template props
    const templateProps = {
      supabase_url: Deno.env.get("SUPABASE_URL") ?? "",
      token: email_data.token,
      token_hash: email_data.token_hash,
      redirect_to: email_data.redirect_to,
      email_action_type: email_data.email_action_type,
      ...branding,
      userName,
      inviterName: branding.userName, // For invite emails
      inviteeEmail: user.email, // For invite emails
    };

    // Generate the appropriate email template
    const emailTemplate = getEmailTemplate(email_data.email_action_type, templateProps);
    const html = await renderAsync(emailTemplate);

    // Generate subject line
    const subject = getEmailSubject(email_data.email_action_type, branding.organizationName);

    // Send email with organization branding
    const { error } = await resend.emails.send({
      from: `${branding.emailFromName} <${branding.emailFromAddress}>`,
      to: [user.email],
      subject: subject,
      html,
    });

    if (error) {
      console.error('Resend error:', error);
      throw error;
    }

    console.log('Email sent successfully');

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error('Send email error:', err);
    const error = err as { code?: number; message?: string };
    const body = {
      error: {
        http_code: error.code ?? 500,
        message: error.message ?? "Internal Server Error",
      },
    };
    return new Response(JSON.stringify(body), {
      status: error.code ?? 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
