import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const LOG_URL = Deno.env.get("LOG_SERVICE_URL");
const METRICS_URL = Deno.env.get("METRICS_SERVICE_URL");

async function log(
  level: "info" | "error",
  message: string,
  metadata: Record<string, unknown> = {},
) {
  console[level](message, metadata);
  if (LOG_URL) {
    try {
      await fetch(LOG_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          level,
          message,
          metadata,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (err) {
      console.error("failed to send log", err);
    }
  }
}

async function emitMetric(
  name: string,
  value: number,
  tags: Record<string, string> = {},
) {
  if (!METRICS_URL) return;
  try {
    await fetch(METRICS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, value, tags, timestamp: new Date().toISOString() }),
    });
  } catch (err) {
    console.error("failed to emit metric", err);
  }
}

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const openaiKey = Deno.env.get("OPENAI_API_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  const start = performance.now();
  await log("info", "chatbot request received");

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
        await log("error", "create conversation error", { error: convError });
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
      const errorText = await embedRes.text();
      await log("error", "OpenAI embedding API error", { error: errorText });
      
      // Check if it's an API key issue
      if (errorText.toLowerCase().includes('invalid_api_key') || errorText.toLowerCase().includes('incorrect api key')) {
        return new Response(JSON.stringify({ 
          error: "AI service configuration error. Please contact support." 
        }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ 
        error: "AI service temporarily unavailable. Please try again later." 
      }), {
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
      await log("error", "match_support_articles error", { error });
      // Fallback to general knowledge if similarity search fails
    }

    const context = (articles || [])
      .map((a: any) => `${a.title}\n${a.content}`)
      .join("\n---\n");

    await log("info", "article search results", { count: articles?.length || 0, question });
    
    // If no relevant articles found, provide fallback context
    const fallbackContext = articles && articles.length > 0 ? context : 
      "You are a HomeReportPro support assistant. This is a home inspection reporting platform that helps inspectors create professional reports, manage appointments, and organize contacts.";

    const systemPrompt =
      "You are a helpful support assistant for HomeReportPro. Answer using the provided context. If you're uncertain about something, mention it in your response.";
    const userPrompt = `Context:\n${fallbackContext}\n\nQuestion: ${question}`;

    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1500,
        stream: true,
      }),
    });

    if (!aiRes.ok || !aiRes.body) {
      const text = await aiRes.text();
      await log("error", "OpenAI request failed", { error: text });
      return new Response(JSON.stringify({ error: "OpenAI request failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let full = "";
    let accumulatedContent = "";
    const stream = new ReadableStream({
      async start(controller) {
        const reader = aiRes.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          // Decode the chunk and add to buffer
          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;
          
          // Process complete lines from the buffer
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // Keep incomplete line in buffer
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6); // Remove 'data: ' prefix
              
              if (data === '[DONE]') {
                continue;
              }
              
              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                
                if (content) {
                  // Send only the content to the client
                  controller.enqueue(new TextEncoder().encode(content));
                  accumulatedContent += content;
                }
              } catch (e) {
                // Skip malformed JSON chunks
                await log("error", "Skipping malformed chunk", { chunk: data.substring(0, 100) });
              }
            }
          }
        }
        controller.close();

        const low = accumulatedContent.toLowerCase().includes('low confidence') || accumulatedContent.toLowerCase().includes('uncertain');

        // Use the accumulated content from the stream
        const extractedAnswer = accumulatedContent || "No response generated";

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

          await log("info", "conversation escalated", {
            conversationId,
            userId: user.id,
          });
          await emitMetric("chatbot_escalations", 1, {
            conversation_id: String(conversationId),
          });

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

    const duration = performance.now() - start;
    await emitMetric("chatbot_response_time_ms", duration);
    await log("info", "chatbot response sent", {
      conversationId,
      duration,
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "x-conversation-id": conversationId || "",
      },
    });
  } catch (err) {
    await log("error", "chatbot function error", { error: err });
    const duration = performance.now() - start;
    await emitMetric("chatbot_response_time_ms", duration);
    return new Response(JSON.stringify({ error: "Unexpected error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

