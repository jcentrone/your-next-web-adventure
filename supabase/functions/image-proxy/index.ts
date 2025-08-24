import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { searchParams } = new URL(req.url);
    const targetUrl = searchParams.get("url");

    if (!targetUrl) {
      return new Response("Missing url parameter", {
        status: 400,
        headers: corsHeaders,
      });
    }

    const response = await fetch(targetUrl);
    const contentType = response.headers.get("content-type") || "application/octet-stream";

    return new Response(response.body, {
      status: response.status,
      headers: {
        ...corsHeaders,
        "Content-Type": contentType,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return new Response(message, {
      status: 400,
      headers: corsHeaders,
    });
  }
});
