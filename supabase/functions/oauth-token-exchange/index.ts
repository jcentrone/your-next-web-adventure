import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { provider, code, state, redirect_uri } = await req.json();

    if (!provider || !code || !state) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let tokenUrl: string;
    let clientId: string;
    let clientSecret: string;

    // Get the appropriate OAuth configuration based on provider
    switch (provider) {
      case 'google':
        tokenUrl = 'https://oauth2.googleapis.com/token';
        clientId = Deno.env.get('GOOGLE_CLIENT_ID') || '';
        clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET') || '';
        break;
      case 'outlook':
        tokenUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
        clientId = Deno.env.get('OUTLOOK_CLIENT_ID') || '';
        clientSecret = Deno.env.get('OUTLOOK_CLIENT_SECRET') || '';
        break;
      case 'apple':
        tokenUrl = 'https://appleid.apple.com/auth/token';
        clientId = Deno.env.get('APPLE_CLIENT_ID') || '';
        clientSecret = Deno.env.get('APPLE_CLIENT_SECRET') || '';
        break;
      default:
        return new Response(
          JSON.stringify({ error: 'Unsupported provider' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    if (!clientId || !clientSecret) {
      console.error(`Missing ${provider} OAuth credentials`);
      return new Response(
        JSON.stringify({ error: 'OAuth configuration missing' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Exchange authorization code for access token
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri,
        grant_type: 'authorization_code',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OAuth token exchange failed for ${provider}:`, errorText);
      return new Response(
        JSON.stringify({ error: 'Token exchange failed' }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const tokenData = await response.json();

    return new Response(JSON.stringify(tokenData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in oauth-token-exchange function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});