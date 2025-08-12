
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (!OPENAI_API_KEY) {
    console.error("Missing OPENAI_API_KEY");
    return new Response(JSON.stringify({ error: "Missing OPENAI_API_KEY" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const imageUrl: string | undefined = body.imageUrl; // http(s) or data URL
    const imageData: string | undefined = body.imageData; // data URL (e.g., data:image/jpeg;base64,...)
    const context: string | undefined = body.context; // optional context like section/finding title

    if (!imageUrl && !imageData) {
      return new Response(JSON.stringify({ error: "Provide imageUrl or imageData" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const imageSource = imageUrl || imageData!;
    // Ask for strict JSON so we can map to fields in the app
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

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
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
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("OpenAI error:", response.status, text);
      return new Response(JSON.stringify({ error: "OpenAI request failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content?.trim() ?? "";

    // Try to parse strict JSON and normalize severity
    let structured: any = null;
    try {
      const parsed = JSON.parse(content);
      const allowed = ["Info", "Maintenance", "Minor", "Moderate", "Major", "Safety"] as const;
      const sevRaw = String(parsed.severity || "").trim().toLowerCase();
      const sevMap: Record<string, typeof allowed[number]> = {
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
    } catch (_err) {
      // fall back: not JSON
    }

    return new Response(
      JSON.stringify({ structured, analysis: content || "No analysis returned." }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("analyze-image function error:", err);
    return new Response(JSON.stringify({ error: "Unexpected error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
