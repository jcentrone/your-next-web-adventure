import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  console.log("=== ANALYZE IMAGE FUNCTION START ===");
  
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    console.log("Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Processing analyze-image request");
    
    const authHeader = req.headers.get("Authorization");
    const jwt = authHeader?.replace("Bearer ", "");
    if (!jwt) {
      console.error("No JWT token provided");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("JWT token found, validating user...");
    const client = createClient(supabaseUrl, serviceKey);
    const {
      data: { user },
    } = await client.auth.getUser(jwt);
    
    if (!user) {
      console.error("Invalid JWT token - user not found");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`User validated: ${user.id}`);

    // Get API key from database
    console.log("Fetching OpenAI API key from database...");
    const { data: tokenRow, error: tokenError } = await client
      .from("ai_tokens")
      .select("api_key")
      .eq("user_id", user.id)
      .maybeSingle();
      
    if (tokenError) {
      console.error("Database error fetching API key:", tokenError);
      return new Response(JSON.stringify({ error: "Database error", details: tokenError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    if (!tokenRow) {
      console.error("No API key found for user:", user.id);
      return new Response(JSON.stringify({ error: "No API key found for user" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    const OPENAI_API_KEY = tokenRow.api_key as string;
    console.log("API key retrieved successfully (length:", OPENAI_API_KEY.length, ")");

    // Parse request body
    console.log("Parsing request body...");
    const body = await req.json();
    const imageUrl: string | undefined = body.imageUrl;
    const imageData: string | undefined = body.imageData;
    const context: string | undefined = body.context;

    console.log("Request parameters:", {
      hasImageUrl: !!imageUrl,
      hasImageData: !!imageData,
      context: context?.substring(0, 100) + "..."
    });

    if (!imageUrl && !imageData) {
      console.error("No image provided in request");
      return new Response(JSON.stringify({ error: "Provide imageUrl or imageData" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const imageSource = imageUrl || imageData!;
    console.log("Using image source:", imageSource?.substring(0, 100) + "...");
    
    // Build prompt
    const prompt = [
      "You are a certified home inspection assistant.",
      "Analyze the provided image for visible defects, safety issues, or maintenance concerns.",
      "Return ONLY valid JSON (no markdown, no backticks) with exactly these keys: ",
      '{"title":"","observation":"","implications":"","severity":"","recommendation":""}',
      "Field rules:",
      "- title: 2-6 word concise noun phrase describing the main issue (e.g., 'Door Misalignment', 'Overgrown Vegetation').",
      "- observation: 1-2 sentences of what is visible (objective description).",
      "- implications: 1-2 sentences on possible impacts or risks.",
      "- severity: one of exactly [Info, Maintenance, Minor, Moderate, Major, Safety] (choose the best match).",
      "- recommendation: clear, liability-aware action (e.g., 'Have a qualified contractor evaluate and repair as needed.').",
      "Keep each field under 300 characters. Do not fabricate details you cannot see.",
      context ? `Context: ${context}` : "",
    ].filter(Boolean).join("\n");

    console.log("Prompt prepared (length:", prompt.length, ")");

    // Make OpenAI API call
    console.log("Making OpenAI API request...");
    const requestBody = {
      model: "gpt-4.1",
      messages: [
        { role: "system", content: "You write clear, liability-aware home inspection report narratives. Always output strict JSON when asked." },
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: imageSource } },
          ],
        },
      ],
      max_completion_tokens: 1000,
    };

    console.log("Request body prepared:", {
      model: requestBody.model,
      messageCount: requestBody.messages.length,
      maxTokens: requestBody.max_completion_tokens
    });

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    console.log("OpenAI API response status:", response.status);
    console.log("OpenAI API response headers:", Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      return new Response(JSON.stringify({ 
        error: "OpenAI request failed", 
        status: response.status,
        details: errorText 
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("OpenAI API request successful, parsing response...");
    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content?.trim() ?? "";

    console.log("OpenAI response content:", {
      hasContent: !!content,
      contentLength: content.length,
      contentPreview: content.substring(0, 200) + "..."
    });

    // Try to parse strict JSON and normalize severity
    let structured: {
      title: string;
      observation: string;
      implications: string;
      severity: string;
      recommendation: string;
    } | null = null;
    
    try {
      console.log("Attempting to parse JSON response...");
      const parsed = JSON.parse(content) as Record<string, unknown>;
      console.log("JSON parsed successfully:", Object.keys(parsed));
      
      const allowed = ["Info", "Maintenance", "Minor", "Moderate", "Major", "Safety"] as const;
      const sevRaw = String(parsed.severity || "").trim().toLowerCase();
      const sevMap: Record<string, (typeof allowed)[number]> = {
        info: "Info",
        informational: "Info",
        maintenance: "Maintenance",
        minor: "Minor",
        low: "Minor",
        moderate: "Moderate",
        medium: "Moderate",
        major: "Major",
        significant: "Major",
        safety: "Safety",
        hazard: "Safety",
      };
      const normalizedSeverity = sevMap[sevRaw] || (allowed as readonly string[]).find((s) => s.toLowerCase() === sevRaw) || "Info";
      
      structured = {
        title: String(parsed.title || "").trim(),
        observation: String(parsed.observation || "").trim(),
        implications: String(parsed.implications || "").trim(),
        severity: normalizedSeverity,
        recommendation: String(parsed.recommendation || "").trim(),
      };
      
      console.log("Structured data created:", {
        title: structured.title.substring(0, 50) + "...",
        severity: structured.severity,
        hasRecommendation: !!structured.recommendation
      });
    } catch (parseError) {
      console.error("JSON parsing failed:", parseError);
      console.log("Raw content that failed to parse:", content);
    }

    console.log("=== ANALYZE IMAGE FUNCTION SUCCESS ===");
    return new Response(
      JSON.stringify({ structured, analysis: content || "No analysis returned." }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("=== ANALYZE IMAGE FUNCTION ERROR ===");
    console.error("Error details:", {
      name: err instanceof Error ? err.name : "Unknown",
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : "No stack trace"
    });
    return new Response(JSON.stringify({ 
      error: "Unexpected error", 
      details: err instanceof Error ? err.message : String(err) 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
