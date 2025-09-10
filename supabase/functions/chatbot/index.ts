// deno-lint-ignore-file no-explicit-any
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import {serve} from "https://deno.land/std@0.168.0/http/server.ts";
import {createClient} from "https://esm.sh/@supabase/supabase-js@2";
import {zodToJsonSchema} from "https://esm.sh/zod-to-json-schema@2.1.4";

// === Your schemas ===
import {CreateAccountSchema} from "../../../src/lib/accountSchemas.ts";
import {AppointmentSchema, CreateContactSchema, TaskSchema,} from "../../../src/lib/crmSchemas.ts";
import {BaseReportSchema} from "../../../src/lib/reportSchemas.ts";

// ====== Config / env ======
const LOG_URL = Deno.env.get("LOG_SERVICE_URL");
const METRICS_URL = Deno.env.get("METRICS_SERVICE_URL");

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const openaiKey = Deno.env.get("OPENAI_API_KEY")!;


// Use a current tool-capable model
const MODEL = "gpt-4.1"; // or "gpt-4o-2024-08-06"

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

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
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({level, message, metadata, timestamp: new Date().toISOString()}),
            });
        } catch (err) {
            console.error("failed to send log", err);
        }
    }
}

async function emitMetric(
    name: string,
    value: number = 1,
    tags: Record<string, string> = {},
) {
    if (!METRICS_URL) return;
    try {
        await fetch(METRICS_URL, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({name, value, tags, timestamp: new Date().toISOString()}),
        });
    } catch (err) {
        console.error("failed to emit metric", err);
    }
}

function zodSchemaToJson(schema: any) {
    return zodToJsonSchema(schema, {$refStrategy: "none"});
}

// ====== Tool registrations (OpenAI schema) ======
const toolParameterSchemas = {
    create_account: zodSchemaToJson(
        CreateAccountSchema.omit({id: true, created_at: true, updated_at: true, user_id: true}),
    ),
    create_contact: zodSchemaToJson(CreateContactSchema),
    create_report: zodSchemaToJson(
        BaseReportSchema.omit({id: true, created_at: true, updated_at: true, user_id: true}),
    ),
    create_task: zodSchemaToJson(
        TaskSchema.omit({id: true, created_at: true, updated_at: true, user_id: true}),
    ),
    create_appointment: zodSchemaToJson(
        AppointmentSchema.omit({id: true, created_at: true, updated_at: true, user_id: true}),
    ),
} as const;

const tools = [
    {
        type: "function",
        function: {
            name: "create_account",
            description:
                "Create a new account record when the user asks to create/add/set up a new account with company/contact details.",
            parameters: toolParameterSchemas.create_account,
        },
    },
    {
        type: "function",
        function: {
            name: "create_contact",
            description:
                "Create a new contact when the user provides names/emails/phones to add to their CRM.",
            parameters: toolParameterSchemas.create_contact,
        },
    },
    {
        type: "function",
        function: {
            name: "create_report",
            description:
                "Create a new inspection report when the user mentions a property/address/report type.",
            parameters: toolParameterSchemas.create_report,
        },
    },
    {
        type: "function",
        function: {
            name: "create_task",
            description:
                "Create a to-do/follow-up task when the user asks to add/schedule an action item.",
            parameters: toolParameterSchemas.create_task,
        },
    },
    {
        type: "function",
        function: {
            name: "create_appointment",
            description:
                "Create an appointment when the user wants to schedule/book a time.",
            parameters: toolParameterSchemas.create_appointment,
        },
    },
] as const;

await log("info", "tool schema create_account", toolParameterSchemas.create_account);


// ====== DB “tool” handlers ======
async function handleToolCall(
    name: string,
    args: any,
    client: any,
    user: any,
    conversationId?: string,
) {
    const schemaMap = {
        create_account: CreateAccountSchema.omit({id: true, created_at: true, updated_at: true, user_id: true}),
        create_contact: CreateContactSchema,
        create_report: BaseReportSchema.omit({id: true, created_at: true, updated_at: true, user_id: true}),
        create_task: TaskSchema.omit({id: true, created_at: true, updated_at: true, user_id: true}),
        create_appointment: AppointmentSchema.omit({id: true, created_at: true, updated_at: true, user_id: true}),
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
    if (!schema || !table) return {error: "Unknown tool"};

    const parsed = schema.safeParse(args);
    if (!parsed.success) {
        const missing = parsed.error.issues.map((i: any) => i.path.join("."));
        return {missing};
    }

    // role guard for reports
    if (name === "create_report") {
        const {data: member} = await client
            .from("organization_members")
            .select("role")
            .eq("user_id", user.id)
            .maybeSingle();
        const role = member?.role;
        if (!role || role === "viewer") {
            await client.from("support_action_logs").insert({
                user_id: user.id,
                action: name,
                payload: {args: parsed.data, error: "unauthorized", conversation_id: conversationId},
            });
            return {error: "Unauthorized"};
        }
    }

    const {data, error} = await client
        .from(table)
        .insert({...parsed.data, user_id: user.id})
        .select()
        .single();

    if (error) {
        await client.from("support_action_logs").insert({
            user_id: user.id,
            action: name,
            payload: {args: parsed.data, error: error.message, conversation_id: conversationId},
        });
        return {error: error.message};
    }

    await client.from("support_action_logs").insert({
        user_id: user.id,
        action: name,
        payload: {args: parsed.data, record: data, conversation_id: conversationId},
    });

    return {record: data};
}


function normalize(s: string) {
    return (s || "").toLowerCase();
}

// ====== System prompt ======
const systemPrompt = `
You are Bob, the HomeReportPro support assistant.

## Glossary (use these meanings by default)
- “Account” → **CRM/company record** in the Accounts module (company name, phone, address, etc.).
- “Contact” → **Person** (lead/client/agent/vendor) with name/email/phone, tied to an Account when known.
- “Report” → **Inspection report** (e.g., Full Home, Wind Mitigation, 4-Point) for a property address.
- “Task” → **To-do/follow-up** item (owner, title/notes, due date).
- “Appointment” → **Scheduled event** (inspection/meeting) with date, time, location, parties.

## What these terms do NOT mean (unless explicitly stated)
- Do NOT treat “account” as login/signup/subscription unless the user clearly says: sign up, register, password, login, 2FA, code, email verification.
- Do NOT treat “contact” as a support channel or help desk ticket.
- Do NOT treat “report” as a PDF export request unless the user explicitly asks to export/download.
- Do NOT treat “task” as a calendar event.
- Do NOT treat “appointment” as a generic reminder or email invite unless asked.

## Tool policy (MANDATORY)
When the user asks to CREATE / ADD / MAKE / SET UP any object below, you MUST call the matching tool (not instructions):
- create_account → create/update a **CRM/company** record.
- create_contact → create/update a **person** record (optionally link to an account).
- create_report → create a new **inspection report**.
- create_task → create a **to-do/follow-up**.
- create_appointment → create a **scheduled appointment/inspection**.

If required fields are missing:
1) Call the tool with what you have.
2) Then ask only for the specific missing fields returned by the backend.

## Disambiguation rules
- Default to the glossary meanings above.
- Only switch meanings if the user **explicitly** uses conflicting terms (e.g., “sign up for an account” = login context).
- If the user mixes concepts, prioritize CRM/reporting actions first and briefly note that other flows (e.g., signup) are separate.

## Examples (routing)
- “Create an account for BuildWise Inspections” → use **create_account**.
- “Add contact Jane Doe jane@foo.com at BuildWise” → **create_contact** (link to BuildWise if possible).
- “Start a wind mitigation report for 123 Main St” → **create_report**.
- “Add a follow-up to call the buyer tomorrow” → **create_task**.
- “Schedule an inspection next Tue 9am at 456 Oak Ln” → **create_appointment**.

## Output style
- Use Markdown.
- Be concise and action-oriented.
- After tools run, summarize what you did (e.g., “✅ Account created: BuildWise Inspections”).
`;


// ====== Server ======
serve(async (req) => {
    const start = performance.now();
    await log("info", "chatbot request received");

    if (req.method === "OPTIONS") {
        return new Response(null, {headers: corsHeaders});
    }

    try {
        if (!openaiKey) {
            return new Response(JSON.stringify({error: "Server configuration error: missing OPENAI_API_KEY"}), {
                status: 500, headers: {...corsHeaders, "Content-Type": "application/json"},
            });
        }


        const authHeader = req.headers.get("Authorization");
        const jwt = authHeader?.replace("Bearer ", "");
        if (!jwt) {
            return new Response(JSON.stringify({error: "Unauthorized"}), {
                status: 401,
                headers: {...corsHeaders, "Content-Type": "application/json"},
            });
        }

        const client = createClient(supabaseUrl, serviceKey);
        const {
            data: {user},
        } = await client.auth.getUser(jwt);
        if (!user) {
            return new Response(JSON.stringify({error: "Unauthorized"}), {
                status: 401,
                headers: {...corsHeaders, "Content-Type": "application/json"},
            });
        }

        const {messages, conversation_id} = await req.json();
        const last = messages?.[messages.length - 1];
        const question: string | undefined = last?.content;
        const imageUrl: string | undefined = last?.image;

        if (!question) {
            return new Response(JSON.stringify({error: "No question provided"}), {
                status: 400,
                headers: {...corsHeaders, "Content-Type": "application/json"},
            });
        }

        // Create conversation if needed
        let conversationId: string | undefined = conversation_id;
        if (!conversationId) {
            const {data: conv, error: convError} = await client
                .from("support_conversations")
                .insert({user_id: user.id})
                .select("id")
                .single();
            if (convError) await log("error", "create conversation error", {error: convError});
            conversationId = conv?.id;
        }

        // Persist user message
        await client.from("support_messages").insert({
            conversation_id: conversationId,
            user_id: user.id,
            role: "user",
            content: question,
            ...(imageUrl ? {image_url: imageUrl} : {}),
        });

        // === Embedding for article search ===
        const embedRes = await fetch("https://api.openai.com/v1/embeddings", {
            method: "POST",
            headers: {Authorization: `Bearer ${openaiKey}`, "Content-Type": "application/json"},
            body: JSON.stringify({model: "text-embedding-3-small", input: question}),
        });
        if (!embedRes.ok) {
            const errorText = await embedRes.text();
            await log("error", "OpenAI embedding API error", {error: errorText});
            if (errorText.toLowerCase().includes("invalid_api_key") || errorText.toLowerCase().includes("incorrect api key")) {
                return new Response(JSON.stringify({error: "AI service configuration error. Please contact support."}), {
                    status: 500, headers: {...corsHeaders, "Content-Type": "application/json"},
                });
            }
            return new Response(JSON.stringify({error: "AI service temporarily unavailable. Please try again later."}), {
                status: 500, headers: {...corsHeaders, "Content-Type": "application/json"},
            });
        }
        const embedData = await embedRes.json();
        const embedding = embedData.data[0].embedding;

        const {data: articles, error: matchErr} = await client.rpc("match_support_articles", {
            query_embedding: embedding,
            match_threshold: 0.7,
            match_count: 5,
        });
        if (matchErr) await log("error", "match_support_articles error", {error: matchErr});

        const context = (articles || []).map((a: any) => `${a.title}\n${a.content}`).join("\n---\n");
        await log("info", "article search results", {count: articles?.length || 0, question});

        const fallbackContext =
            articles && articles.length > 0
                ? context
                : "You are a HomeReportPro support assistant. This platform helps inspectors create reports, manage appointments, and organize contacts.";

        const userPrompt = `Context:\n${fallbackContext}\n\nQuestion: ${question}`;
        const userMessageContent = imageUrl
            ? [{type: "text", text: userPrompt}, {type: "image_url", image_url: {url: imageUrl}}]
            : userPrompt;


        const q = normalize(question);
        let forcedToolChoice: any = null;

        const setOnce = (v: any) => {
            if (!forcedToolChoice) forcedToolChoice = v;
        };

        // login markers: avoid “zip code” false positives
        function wantsLoginFlow(s: string) {
            return /\b(sign ?up|register|log ?in|password|2fa|(verification|security)\s+code|email\s+verification)\b/i.test(s);
        }

        // Appointment BEFORE report when “schedule/book” appears
        if (/\b(schedule|book|set|arrange)\b.*\b(appointment|meeting|inspection)\b/i.test(q)) {
            setOnce({type: "function", function: {name: "create_appointment"}});
        }

        // CRM account (not signup)
        if (/\b(create|add|make|set\s*up)\b.*\baccount\b(?!\s*(number|no\.?|id))/.test(q) && !wantsLoginFlow(q)) {
            setOnce({type: "function", function: {name: "create_account"}});
        }

        // Report (start/new/generate)
        if (/\b(create|start|generate|new)\b.*\b(report|inspection report)\b/i.test(q)) {
            setOnce({type: "function", function: {name: "create_report"}});
        }

        // Contact
        if (/\b(create|add|new)\b.*\b(contact|lead|person)\b/i.test(q)) {
            setOnce({type: "function", function: {name: "create_contact"}});
        }

        // Task
        if (/\b(create|add|new)\b.*\b(task|to-?do)\b/i.test(q)) {
            setOnce({type: "function", function: {name: "create_task"}});
        }


        // ===== First model call (may produce tool_calls) =====
        const firstRes = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {Authorization: `Bearer ${openaiKey}`, "Content-Type": "application/json"},
            body: JSON.stringify({
                model: MODEL,
                messages: [
                    {role: "system", content: systemPrompt},
                    {role: "user", content: userMessageContent as any},
                ],
                temperature: 0.7,
                max_tokens: 1500,
                stream: true,
                tools,
                tool_choice: forcedToolChoice || "auto",  // <— use the router when confident
                parallel_tool_calls: false, // optional while debugging
            }),
        });

        if (!firstRes.ok || !firstRes.body) {
            const text = await firstRes.text();
            await log("error", "OpenAI request failed", {error: text});
            return new Response(JSON.stringify({error: "OpenAI request failed"}), {
                status: 500,
                headers: {...corsHeaders, "Content-Type": "application/json"},
            });
        }

        // We’ll accumulate content and tool_calls from the first stream.
        let accumulatedAssistantText = "";
        // Build an assistant message that includes the tool_calls to send back later
        const assistantToolMessage: any = {role: "assistant", content: "", tool_calls: [] as any[]};

        // Track partial tool call arguments by id/index
        type PendingCall = {
            id: string;
            index: number;
            function: { name: string; arguments: string };
            type: "function";
        };
        const pendingCallsByIndex = new Map<number, PendingCall>();

        const reader = firstRes.body.getReader();
        const decoder = new TextDecoder();

        // Buffering lines (OpenAI streams in "data: {...}" lines)
        let buffer = "";
        let sawToolCallsFinish = false;

        // We’ll capture the full first-turn result before responding to the client,
        // but we’ll ultimately stream only the final answer (second call) to the client.
        while (true) {
            const {done, value} = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, {stream: true});

            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
                if (!line.startsWith("data: ")) continue;
                const payload = line.slice(6).trim();
                if (payload === "[DONE]") continue;

                try {
                    const parsed = JSON.parse(payload);
                    const choice = parsed.choices?.[0];
                    const delta = choice?.delta;

                    if (delta?.content) {
                        accumulatedAssistantText += delta.content;
                    }

                    if (delta?.tool_calls) {
                        for (const tc of delta.tool_calls) {
                            const idx = tc.index ?? 0;

                            // Initialize or update the pending call
                            let call = pendingCallsByIndex.get(idx);
                            if (!call) {
                                call = {
                                    id: tc.id || `call_${idx}`,
                                    index: idx,
                                    type: "function",
                                    function: {name: tc.function?.name || "", arguments: ""},
                                };
                                pendingCallsByIndex.set(idx, call);
                            }
                            // Update fields as they stream in
                            if (tc.id) call.id = tc.id;
                            if (tc.function?.name) call.function.name = tc.function.name;
                            if (tc.function?.arguments) call.function.arguments += tc.function.arguments;
                        }
                    }

                    const finish = choice?.finish_reason;
                    if (finish === "tool_calls") {
                        sawToolCallsFinish = true;
                    }
                } catch (_e) {
                    // ignore malformed partials
                }
            }
        }

        // Prepare final stream back to the browser (only the second call gets streamed out)
        const stream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();

                // If no tool calls, just stream the first answer and finish
                if (!sawToolCallsFinish || pendingCallsByIndex.size === 0) {
                    // Stream the assistant text from first call
                    if (accumulatedAssistantText) {
                        controller.enqueue(encoder.encode(accumulatedAssistantText));
                    }
                    controller.close();

                    // Persist assistant message
                    const low = accumulatedAssistantText.toLowerCase().includes("low confidence")
                        || accumulatedAssistantText.toLowerCase().includes("uncertain");

                    await client.from("support_messages").insert({
                        conversation_id: conversationId,
                        user_id: user.id,
                        role: "assistant",
                        content: accumulatedAssistantText || "No response generated",
                        confidence: low ? "low" : "high",
                    });

                    if (low) {
                        await client.from("support_conversations").update({escalated: true}).eq("id", conversationId);
                        await log("info", "conversation escalated", {conversationId, userId: user.id});
                        await emitMetric("chatbot_escalations", 1, {conversation_id: String(conversationId)});

                        await fetch(`${supabaseUrl}/functions/v1/send-support-email`, {
                            method: "POST",
                            headers: {Authorization: `Bearer ${serviceKey}`, "Content-Type": "application/json"},
                            body: JSON.stringify({
                                name: user.user_metadata?.full_name || user.email,
                                email: user.email,
                                subject: "Chatbot escalation",
                                message: `User question: ${question}`,
                            }),
                        });
                    }

                    const duration = performance.now() - start;
                    await emitMetric("chatbot_response_time_ms", duration);
                    await log("info", "chatbot response sent (no-tools)", {conversationId, duration});
                    return;
                }

                // ===== Execute ALL pending tool calls =====
                // Build assistant message with tool_calls to include in second request
                assistantToolMessage.content = accumulatedAssistantText; // may be empty; include anyway
                assistantToolMessage.tool_calls = Array.from(pendingCallsByIndex.values()).map((c) => ({
                    id: c.id,
                    type: "function",
                    function: {name: c.function.name, arguments: c.function.arguments},
                }));

                // Run tools and create role:"tool" messages
                const toolMessages: any[] = [];
                for (const call of pendingCallsByIndex.values()) {
                    let toolContent: string;
                    try {
                        const args = call.function.arguments ? JSON.parse(call.function.arguments) : {};
                        const result = await handleToolCall(call.function.name, args, client, user, conversationId);
                        if ((result as any).missing) {
                            toolContent = JSON.stringify({missing: (result as any).missing});
                        } else if ((result as any).error) {
                            toolContent = JSON.stringify({error: (result as any).error});
                        } else {
                            toolContent = JSON.stringify({record: (result as any).record});
                        }
                    } catch (_e) {
                        toolContent = JSON.stringify({error: "Invalid tool call arguments"});
                    }

                    toolMessages.push({
                        role: "tool",
                        tool_call_id: call.id,
                        name: call.function.name,
                        content: toolContent,
                    });
                }

                // ===== Second model call (model sees tool outputs and produces final answer) =====
                const followRes = await fetch("https://api.openai.com/v1/chat/completions", {
                    method: "POST",
                    headers: {Authorization: `Bearer ${openaiKey}`, "Content-Type": "application/json"},
                    body: JSON.stringify({
                        model: MODEL,
                        stream: true,
                        messages: [
                            {role: "system", content: systemPrompt},
                            {role: "user", content: userMessageContent as any},
                            assistantToolMessage,
                            ...toolMessages,
                        ],
                        temperature: 0.7,
                        max_tokens: 1500,
                    }),
                });

                if (!followRes.ok || !followRes.body) {
                    const txt = await followRes.text();
                    await log("error", "OpenAI follow-up failed", {error: txt});
                    controller.enqueue(encoder.encode("Error: failed to generate final response."));
                    controller.close();
                    return;
                }

                const fReader = followRes.body.getReader();
                const fDecoder = new TextDecoder();
                let finalText = "";

                // Stream final assistant text to client
                while (true) {
                    const {value, done} = await fReader.read();
                    if (done) break;

                    // Same JSON-lines format as first call
                    const chunk = fDecoder.decode(value, {stream: true});
                    const lines = chunk.split("\n");
                    for (const line of lines) {
                        if (!line.startsWith("data: ")) continue;
                        const payload = line.slice(6).trim();
                        if (payload === "[DONE]") continue;

                        try {
                            const parsed = JSON.parse(payload);
                            const delta = parsed.choices?.[0]?.delta;
                            const content = delta?.content ?? "";
                            if (content) {
                                finalText += content;
                                controller.enqueue(encoder.encode(content));
                            }
                        } catch {
                            // ignore
                        }
                    }
                }

                controller.close();

                // Persist assistant message + escalation check
                const low = finalText.toLowerCase().includes("low confidence")
                    || finalText.toLowerCase().includes("uncertain");

                await client.from("support_messages").insert({
                    conversation_id: conversationId,
                    user_id: user.id,
                    role: "assistant",
                    content: finalText || "No response generated",
                    confidence: low ? "low" : "high",
                });

                if (low) {
                    await client.from("support_conversations").update({escalated: true}).eq("id", conversationId);
                    await log("info", "conversation escalated", {conversationId, userId: user.id});
                    await emitMetric("chatbot_escalations", 1, {conversation_id: String(conversationId)});

                    await fetch(`${supabaseUrl}/functions/v1/send-support-email`, {
                        method: "POST",
                        headers: {Authorization: `Bearer ${serviceKey}`, "Content-Type": "application/json"},
                        body: JSON.stringify({
                            name: user.user_metadata?.full_name || user.email,
                            email: user.email,
                            subject: "Chatbot escalation",
                            message: `User question: ${question}`,
                        }),
                    });
                }

                const duration = performance.now() - start;
                await emitMetric("chatbot_response_time_ms", duration);
                await log("info", "chatbot response sent (tools)", {conversationId, duration});
            },
        });

        return new Response(stream, {
            headers: {
                ...corsHeaders,
                // You are reading with getReader() in the browser, not EventSource:
                "Content-Type": "application/octet-stream",
                "x-conversation-id": conversationId || "",
            },
        });
    } catch (err) {
        await log("error", "chatbot function error", {error: String(err)});
        const duration = performance.now() - start;
        await emitMetric("chatbot_response_time_ms", duration);
        return new Response(JSON.stringify({error: "Unexpected error"}), {
            status: 500,
            headers: {...corsHeaders, "Content-Type": "application/json"},
        });
    }
});
