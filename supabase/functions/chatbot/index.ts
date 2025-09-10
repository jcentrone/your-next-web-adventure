import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { zodToJsonSchema } from "https://esm.sh/zod-to-json-schema@2.1.4";
import { CreateAccountSchema } from "../../../src/lib/accountSchemas.ts";
import {
  CreateContactSchema,
  TaskSchema,
  AppointmentSchema,
} from "../../../src/lib/crmSchemas.ts";
import { BaseReportSchema } from "../../../src/lib/reportSchemas.ts";

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

function zodSchemaToJson(schema: any) {
  // use refStrategy none to inline definitions for OpenAI tools
  return zodToJsonSchema(schema, { $refStrategy: "none" });
}

const toolParameterSchemas = {
  create_account: zodSchemaToJson(
    CreateAccountSchema.omit({
      id: true,
      created_at: true,
      updated_at: true,
      user_id: true,
    }),
  ),
  create_contact: zodSchemaToJson(CreateContactSchema),
  create_report: zodSchemaToJson(
    BaseReportSchema.omit({
      id: true,
      created_at: true,
      updated_at: true,
      user_id: true,
    }),
  ),
  create_task: zodSchemaToJson(
    TaskSchema.omit({ id: true, created_at: true, updated_at: true, user_id: true }),
  ),
  create_appointment: zodSchemaToJson(
    AppointmentSchema.omit({ id: true, created_at: true, updated_at: true, user_id: true }),
  ),
} as const;

const tools = [
  {
    type: "function",
    function: {
      name: "create_account",
      description: "Create a new account record",
      parameters: toolParameterSchemas.create_account,
    },
  },
  {
    type: "function",
    function: {
      name: "create_contact",
      description: "Create a new contact",
      parameters: toolParameterSchemas.create_contact,
    },
  },
  {
    type: "function",
    function: {
      name: "create_report",
      description: "Create a new report",
      parameters: toolParameterSchemas.create_report,
    },
  },
  {
    type: "function",
    function: {
      name: "create_task",
      description: "Create a new task",
      parameters: toolParameterSchemas.create_task,
    },
  },
  {
    type: "function",
    function: {
      name: "create_appointment",
      description: "Create a new appointment",
      parameters: toolParameterSchemas.create_appointment,
    },
  },
];

async function handleToolCall(
  name: string,
  args: any,
  client: any,
  user: any,
  conversationId?: string,
) {
  const schemaMap = {
    create_account: CreateAccountSchema.omit({
      id: true,
      created_at: true,
      updated_at: true,
      user_id: true,
    }),
    create_contact: CreateContactSchema,
    create_report: BaseReportSchema.omit({
      id: true,
      created_at: true,
      updated_at: true,
      user_id: true,
    }),
    create_task: TaskSchema.omit({ id: true, created_at: true, updated_at: true, user_id: true }),
    create_appointment: AppointmentSchema.omit({ id: true, created_at: true, updated_at: true, user_id: true }),
  } as const;

  const tableMap = {
    create_account: "accounts",
    create_contact: "contacts",
    create_report: "reports",
    create_task: "tasks",
    create_appointment: "appointments",
  } as const;

  const schema = (schemaMap as any)[name];
  const table = (tableMap as any)[name];
  if (!schema || !table) {
    return { error: "Unknown tool" };
  }
  const parsed = schema.safeParse(args);
  if (!parsed.success) {
    const missing = parsed.error.issues.map((i: any) => i.path.join("."));
    return { missing };
  }

  // Verify role before sensitive operations
  if (name === "create_report") {
    const { data: member } = await client
      .from("organization_members")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();
    const role = member?.role;
    if (!role || role === "viewer") {
      await client.from("support_action_logs").insert({
        user_id: user.id,
        action: name,
        payload: { args: parsed.data, error: "unauthorized", conversation_id: conversationId },
      });
      return { error: "Unauthorized" };
    }
  }

  const { data, error } = await client
    .from(table)
    .insert({ ...parsed.data, user_id: user.id })
    .select()
    .single();

  if (error) {
    await client.from("support_action_logs").insert({
      user_id: user.id,
      action: name,
      payload: { args: parsed.data, error: error.message, conversation_id: conversationId },
    });
    return { error: error.message };
  }

  await client.from("support_action_logs").insert({
    user_id: user.id,
    action: name,
    payload: { args: parsed.data, record: data, conversation_id: conversationId },
  });

  return { record: data };
}

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
    const last = messages?.[messages.length - 1];
    const question = last?.content;
    const image = last?.image;
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
      ...(image ? { image_url: image } : {}),
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
      "You are a helpful support assistant for HomeReportPro. Answer using the provided context. If you're uncertain about something, mention it in your response. Use Markdown formatting (lists, tables, code blocks) whenever it improves clarity.\n\n" +
      "Available tools:\n" +
      "- create_account: create a new account record\n" +
      "- create_contact: create a new contact\n" +
      "- create_report: create a new report\n" +
      "- create_task: create a new task\n" +
      "- create_appointment: create a new appointment\n\n" +
      "When a user requests any of these actions, call the corresponding tool with the required arguments.";
    const userPrompt = `Context:\n${fallbackContext}\n\nQuestion: ${question}`;
    const userMessageContent = image
      ? [
          { type: "text", text: userPrompt },
          { type: "image_url", image_url: { url: image } },
        ]
      : userPrompt;

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
          { role: "user", content: userMessageContent },
        ],
        temperature: 0.7,
        max_tokens: 1500,
        stream: true,
        tools,
        tool_choice: "auto",
        response_format: "markdown",
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
        let toolCall: { name: string; arguments: string } | null = null;

        outer: while (true) {
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
              const data = line.slice(6);
              if (data === '[DONE]') continue;
              try {
                const parsed = JSON.parse(data);
                const delta = parsed.choices?.[0]?.delta;

                if (delta?.content) {
                  controller.enqueue(new TextEncoder().encode(delta.content));
                  accumulatedContent += delta.content;
                }

                if (delta?.tool_calls) {
                  const call = delta.tool_calls[0];
                  if (!toolCall) {
                    toolCall = { name: call.function?.name || '', arguments: '' };
                  }
                  if (call.function?.arguments) {
                    toolCall.arguments += call.function.arguments;
                  }
                }

                const finish = parsed.choices?.[0]?.finish_reason;
                if (finish === 'tool_calls') {
                  await reader.cancel();
                  break outer;
                }
              } catch (e) {
                await log('error', 'Skipping malformed chunk', { chunk: data.substring(0, 100) });
              }
            }
          }
        }

        if (toolCall) {
          try {
            const args = JSON.parse(toolCall.arguments || '{}');
            const result = await handleToolCall(
              toolCall.name,
              args,
              client,
              user,
              conversationId,
            );
            let message;
            if (result.missing) {
              message = `Missing required fields: ${result.missing.join(', ')}`;
            } else if (result.error) {
              message = `Error: ${result.error}`;
            } else {
              message = JSON.stringify(result.record);
            }
            controller.enqueue(new TextEncoder().encode(message));
            accumulatedContent += message;
          } catch (err) {
            const msg = 'Invalid tool call arguments';
            controller.enqueue(new TextEncoder().encode(msg));
            accumulatedContent += msg;
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

