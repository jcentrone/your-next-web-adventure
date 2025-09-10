import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const openaiKey = Deno.env.get("OPENAI_API_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    const jwt = authHeader?.replace("Bearer ", "");
    if (!jwt) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const client = createClient(supabaseUrl, serviceKey);
    const {
      data: { user },
    } = await client.auth.getUser(jwt);
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { messages, conversation_id } = await req.json();
    const question = messages?.[messages.length - 1]?.content;
    if (!question) {
      return new Response(JSON.stringify({ error: "No question provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let conversationId = conversation_id;
    if (!conversationId) {
      const { data: conv, error: convError } = await client
        .from("support_conversations")
        .insert({ user_id: user.id })
        .select("id")
        .single();
      if (convError) {
        console.error("create conversation error", convError);
      }
      conversationId = conv?.id;
    }

    await client.from("support_messages").insert({
      conversation_id: conversationId,
      user_id: user.id,
      role: "user",
      content: question,
    });

    // create embedding for similarity search
    const embedRes = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "text-embedding-3-small",
        input: question,
      }),
    });
    if (!embedRes.ok) {
      const text = await embedRes.text();
      console.error("embedding error", text);
      return new Response(JSON.stringify({ error: "Embedding failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const embedData = await embedRes.json();
    const embedding = embedData.data[0].embedding;

    // similarity search on support_articles
    const { data: articles, error } = await client.rpc("match_support_articles", {
      query_embedding: embedding,
      match_threshold: 0.7,
      match_count: 5,
    });
    
    if (error) {
      console.error("match_support_articles error", error);
      // Fallback to general knowledge if similarity search fails
    }
    
    const context = (articles || [])
      .map((a: any) => `${a.title}\n${a.content}`)
      .join("\n---\n");
    
    console.log(`Found ${articles?.length || 0} relevant articles for query: "${question}"`);
    
    // If no relevant articles found, provide fallback context
    const fallbackContext = articles && articles.length > 0 ? context : 
      "You are a HomeReportPro support assistant. This is a home inspection reporting platform that helps inspectors create professional reports, manage appointments, and organize contacts.";

    const systemPrompt =
      "You are a helpful support assistant for HomeReportPro. Answer using the provided context. If unsure, set confidence to low.";
    const userPrompt = `Context:\n${fallbackContext}\n\nQuestion: ${question}\nReturn JSON with fields \\\"answer\\\" and \\\"confidence\\\" (high|low).`;

    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-5-mini-2025-08-07",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: true,
      }),
    });

    if (!aiRes.ok || !aiRes.body) {
      const text = await aiRes.text();
      console.error("OpenAI request failed", text);
      return new Response(JSON.stringify({ error: "OpenAI request failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let full = "";
    const stream = new ReadableStream({
      async start(controller) {
        const reader = aiRes.body!.getReader();
        const decoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          controller.enqueue(value);
          full += decoder.decode(value, { stream: true });
        }
        controller.close();

        const low = full.toLowerCase().includes('"confidence":"low"');

        // Extract just the answer from the streaming response for storage
        let extractedAnswer = full;
        try {
          const parsedResponse = JSON.parse(full);
          extractedAnswer = parsedResponse.answer || full;
        } catch (e) {
          // If not valid JSON, use the full response
          console.log("Response was not valid JSON, using full response");
        }

        await client.from("support_messages").insert({
          conversation_id: conversationId,
          user_id: user.id,
          role: "assistant",
          content: extractedAnswer,
          confidence: low ? "low" : "high",
        });

        if (low) {
          await client
            .from("support_conversations")
            .update({ escalated: true })
            .eq("id", conversationId);

          await fetch(`${supabaseUrl}/functions/v1/send-support-email`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${serviceKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: user.user_metadata?.full_name || user.email,
              email: user.email,
              subject: "Chatbot escalation",
              message: `User question: ${question}`,
            }),
          });
        }
      },
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "x-conversation-id": conversationId || "",
      },
    });
  } catch (err) {
    console.error("chatbot function error:", err);
    return new Response(JSON.stringify({ error: "Unexpected error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

