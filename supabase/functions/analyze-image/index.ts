
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
    const prompt = [
      "You are a certified home inspection assistant.",
      "Analyze the provided image for visible defects, safety issues, or maintenance concerns.",
      "Respond with a concise, professional narrative suitable for an inspection report.",
      "Include:", 
      "- Observation (what you see).",
      "- Possible implications.",
      "- Severity suggestion (Info/Maintenance/Minor/Moderate/Major/Safety).",
      "- Clear recommendation.",
      "Keep under 120 words. Do not fabricate details you cannot see.",
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
          { role: "system", content: "You write clear, liability-aware home inspection report narratives." },
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
    const analysis = data?.choices?.[0]?.message?.content ?? "No analysis returned.";
    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("analyze-image function error:", err);
    return new Response(JSON.stringify({ error: "Unexpected error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
