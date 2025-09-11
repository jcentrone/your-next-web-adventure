// deno-lint-ignore-file no-explicit-any
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-require-imports */
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import {serve} from "https://deno.land/std@0.168.0/http/server.ts";
import {createClient} from "https://esm.sh/@supabase/supabase-js@2";
import {zodToJsonSchema} from "https://esm.sh/zod-to-json-schema@3.23.3";
import {z} from "https://esm.sh/zod@3.23.8";

// === Inlined Zod Schemas ===
const CreateAccountSchema = z.object({
  name: z.string().min(1, "Account name is required"),
  type: z.string().default("company"),
  industry: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip_code: z.string().optional(),
  notes: z.string().optional(),
  annual_revenue: z.number().optional(),
  employee_count: z.number().optional(),
  tags: z.array(z.string()).default([]),
  organization_id: z.string().uuid().optional(),
  is_active: z.boolean().default(true),
});

const CreateContactSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email().optional().or(z.literal("")).nullable(),
  phone: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  contact_type: z.enum(["client", "realtor", "vendor", "contractor", "other"]),
  account_id: z.string().nullable().optional(),
  formatted_address: z.string().optional().nullable(),
  place_id: z.string().optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  address_components: z.any().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  zip_code: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  tags: z.array(z.string()).default([]),
  is_active: z.boolean().default(true),
});

const AppointmentSchema = z.object({
  contact_id: z.string().nullable().optional(),
  report_id: z.string().nullable().optional(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  appointment_date: z.string(),
  duration_minutes: z.number().default(120),
  location: z.string().optional(),
  status: z.enum(["scheduled", "confirmed", "in_progress", "completed", "cancelled", "rescheduled"]),
});

const TaskSchema = z.object({
  assigned_to: z.string().nullable().optional(),
  contact_id: z.string().nullable().optional(),
  appointment_id: z.string().nullable().optional(),
  report_id: z.string().nullable().optional(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  status: z.enum(["pending", "in_progress", "completed", "cancelled"]),
  task_type: z.string().optional().nullable(),
  due_date: z.string().nullable().optional(),
  completed_at: z.string().nullable().optional(),
});

const BaseReportSchema = z.object({
  title: z.string().min(1, "Report title is required"),
  clientName: z.string().min(1, "Client name is required"),
  address: z.string().min(1, "Address is required"),
  clientEmail: z.string().optional(),
  clientPhone: z.string().optional(),
  county: z.string().optional(),
  ofStories: z.string().optional(),
  inspectionDate: z.string(),
  weatherConditions: z.string().optional(),
  status: z.enum(["Draft", "Final"]).default("Draft"),
  contactIds: z.array(z.string()).optional().default([]),
  tags: z.array(z.string()).default([]),
  finalComments: z.string().optional().default(""),
  termsHtml: z.string().optional(),
  agreementId: z.string().optional(),
  appointmentId: z.string().optional(),
  includeStandardsOfPractice: z.boolean().default(true),
  coverImage: z.string().optional().default(""),
  coverTemplate: z
    .enum(["templateOne", "templateTwo", "templateThree", "templateFour", "templateFive", "templateSix",
        "templateSeven", "templateEight", "templateNine", "templateTen", "templateEleven", "templateTwelve",
        "templateThirteen", "templateFourteen", "templateFifteen", "templateSixteen"])
    .default("templateOne"),
  previewTemplate: z.enum(["classic", "modern", "minimal"]).default("classic"),
  colorScheme: z
    .enum(["default", "coralAmber", "indigoOrchid", "forestMint", "slateSky", "royalAqua", "burgundyGold", "emeraldLime", "navyOrange", "charcoalNeon", "cocoaPeach", "custom"])
    .default("default"),
  customColors: z
    .object({
        primary: z.string().optional(),
        secondary: z.string().optional(),
        accent: z.string().optional(),
        headingText: z.string().optional(),
        bodyText: z.string().optional(),
    })
    .optional(),
  shareToken: z.string().optional(),
  archived: z.boolean().default(false),
  reportType: z.enum([
    "home_inspection",
    "wind_mitigation",
    "fl_wind_mitigation_oir_b1_1802",
    "fl_four_point_citizens",
    "tx_coastal_windstorm_mitigation",
    "ca_wildfire_defensible_space",
    "roof_certification_nationwide",
    "manufactured_home_insurance_prep",
  ]),
});

// ====== Config / env ======
const LOG_URL = Deno.env.get("LOG_SERVICE_URL");
const METRICS_URL = Deno.env.get("METRICS_SERVICE_URL");

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const openaiKey = Deno.env.get("OPENAI_API_KEY")!;

// Use a current tool-capable model
const MODEL = "gpt-4.1"; // or "gpt-4o-2024-08-06"
const MAX_TOKENS = Number(Deno.env.get("CHATBOT_MAX_TOKENS") ?? "1500");

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
    create_account: zodSchemaToJson(CreateAccountSchema),
    create_contact: zodSchemaToJson(CreateContactSchema),
    create_report: zodSchemaToJson(BaseReportSchema),
    create_task: zodSchemaToJson(TaskSchema),
    create_appointment: zodSchemaToJson(AppointmentSchema),
    // Plain JSON schema for search_support
    search_support: {
        type: "object",
        properties: {
            query: {type: "string", description: "End-user question to search for in support articles."},
            top_k: {type: "integer", minimum: 1, maximum: 10, default: 5},
            threshold: {type: "number", minimum: 0, maximum: 1, default: 0.7},
        },
        required: ["query"],
        additionalProperties: false,
    },
} as const;

const tools = [
    {
        type: "function",
        name: "create_account",
        description: "Create a new CRM/company account record.",
        parameters: toolParameterSchemas.create_account,
    },
    {
        type: "function",
        name: "create_contact",
        description: "Create a new person/lead/contact.",
        parameters: toolParameterSchemas.create_contact,
    },
    {
        type: "function",
        name: "create_report",
        description: "Create a new inspection report for a property.",
        parameters: toolParameterSchemas.create_report,
    },
    {
        type: "function",
        name: "create_task",
        description: "Create a to-do/follow-up task.",
        parameters: toolParameterSchemas.create_task,
    },
    {
        type: "function",
        name: "create_appointment",
        description: "Create/schedule an appointment or inspection time.",
        parameters: toolParameterSchemas.create_appointment,
    },
    {
        type: "function",
        name: "search_support",
        description:
            "Search HomeReportPro support articles when the user asks general 'how/why' questions or you need product docs. Prefer action tools when the user asks you to create/add/schedule something.",
        parameters: toolParameterSchemas.search_support,
    },
] as const;

// ====== DB + search tool handlers ======
async function handleToolCall(
    name: string,
    args: any,
    client: any,
    user: any,
    conversationId?: string,
) {
    if (name === "search_support") {
        const query = String(args?.query ?? "").trim();
        const top_k = Math.min(Math.max(Number(args?.top_k ?? 5), 1), 10);
        const threshold = Math.min(Math.max(Number(args?.threshold ?? 0.7), 0), 1);

        if (!query) return {error: "Missing query"};

        // Embed the query
        const embedRes = await fetch("https://api.openai.com/v1/embeddings", {
            method: "POST",
            headers: {Authorization: `Bearer ${openaiKey}`, "Content-Type": "application/json"},
            body: JSON.stringify({model: "text-embedding-3-small", input: query}),
        });
        if (!embedRes.ok) {
            const errorText = await embedRes.text();
            await log("error", "OpenAI embedding API error", {error: errorText});
            return {error: "embedding_failed"};
        }
        const embedData = await embedRes.json();
        const embedding = embedData.data[0].embedding;

        const {data: hits, error: matchErr} = await client.rpc("match_support_articles", {
            query_embedding: embedding,
            match_threshold: threshold,
            match_count: top_k,
        });
        if (matchErr) {
            await log("error", "match_support_articles error", {error: matchErr});
            return {error: "search_failed"};
        }

        const articles = (hits || []).map((a: any) => ({
            id: a.id ?? null,
            title: a.title,
            // trim to keep tokens in check
            content: (a.content ?? "").slice(0, 2000),
            url: a.url ?? null,
        }));

        await log("info", "search_support results", {count: articles.length, query});

        return {
            status: "ok",
            message: `found ${articles.length} articles`,
            data: {articles},
            idempotency_key: crypto.randomUUID(),
        };
    }

    const schemaMap = {
        create_account: CreateAccountSchema,
        create_contact: CreateContactSchema,
        create_report: BaseReportSchema,
        create_task: TaskSchema,
        create_appointment: AppointmentSchema,
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
        return {
            status: "error",
            message: "Unknown tool",
            idempotency_key: crypto.randomUUID(),
        };
    }

    const parsed = schema.safeParse(args);
    if (!parsed.success) {
        const missing = parsed.error.issues.map((i: any) => i.path.join("."));
        return {
            status: "needs_input",
            message: "Missing required fields",
            missing_fields: missing,
            idempotency_key: crypto.randomUUID(),
        };
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
            return {
                status: "error",
                message: "Unauthorized",
                idempotency_key: crypto.randomUUID(),
            };
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
        return {
            status: "error",
            message: error.message,
            idempotency_key: crypto.randomUUID(),
            transient: true,
        };
    }

    await client.from("support_action_logs").insert({
        user_id: user.id,
        action: name,
        payload: {args: parsed.data, record: data, conversation_id: conversationId},
    });

    return {
        status: "ok",
        message: "record created",
        data: {record: data},
        idempotency_key: crypto.randomUUID(),
    };
}

// --- lightweight intent router to bias/force tool choice ---
function wantsLoginFlow(s: string) {
    return /\b(sign ?up|register|log ?in|password|2fa|(verification|security)\s+code|email\s+verification)\b/i.test(s);
}

function normalize(s: string) {
    return (s || "").toLowerCase();
}

type RouterIntent = { name: string; confidence: number };

function strictRegexRouter(question: string): {intents: RouterIntent[]; reason: string} | null {
    const intents: RouterIntent[] = [];
    const q = normalize(question);
    if (/\b(schedule|book|set|arrange)\b.*\b(appointment|meeting|inspection)\b/i.test(q)) {
        intents.push({name: "create_appointment", confidence: 1});
    }
    if (/\b(create|add|make|set\s*up)\b.*\baccount\b(?!\s*(number|no\.?|id))/i.test(q) && !wantsLoginFlow(q)) {
        intents.push({name: "create_account", confidence: 1});
    }
    if (/\b(create|start|generate|new)\b.*\b(report|inspection report)\b/i.test(q)) {
        intents.push({name: "create_report", confidence: 1});
    }
    if (/\b(create|add|new|make)\b.*\b(contact|lead|person|client|realtor|vendor|contractor)\b/i.test(q) ||
        /\b(contact|client|person)\b.*\bnamed?\b/i.test(q)) {
        intents.push({name: "create_contact", confidence: 1});
    }
    if (/\b(create|add|make|new|remind|task|todo|to-do|follow)\b/i.test(q) && /\b(task|remind|follow|call|email|check)\b/i.test(q)) {
        intents.push({name: "create_task", confidence: 1});
    }
    return intents.length ? {intents, reason: "regex"} : null;
}

async function routeIntents(question: string) {
    const strict = strictRegexRouter(question);
    if (strict) {
        return {intents: strict.intents, force: true, reason: strict.reason};
    }
    try {
        const res = await fetch("https://api.openai.com/v1/responses", {
            method: "POST",
            headers: {Authorization: `Bearer ${openaiKey}`, "Content-Type": "application/json"},
            body: JSON.stringify({
                model: "gpt-4.1-mini",
                input: [
                    {
                        role: "system",
                        content:
                            "You are an intent router for a home inspection assistant. Valid intents: create_account, create_contact, create_report, create_task, create_appointment, search_support. Return JSON {intents:[{name,confidence}], force:boolean, reason:string}.",
                    },
                    {role: "user", content: question},
                ],
                max_output_tokens: 200,
            }),
        });
        const data = await res.json();
        const txt = data.output?.[0]?.content?.[0]?.text || "{}";
        const parsed = JSON.parse(txt);
        return {
            intents: parsed.intents || [],
            force: Boolean(parsed.force),
            reason: parsed.reason || "",
        };
    } catch (e) {
        await log("error", "router failed", {error: e.message});
        return {intents: [], force: false, reason: "router_error"};
    }
}

// ====== System prompt ======
const systemPrompt = `You are HomeReportPro Assistant, an AI chatbot designed to help home inspectors with their daily workflow and productivity.

## Your Primary Role
You are an expert assistant for HomeReportPro, a comprehensive home inspection reporting platform. Your main responsibility is to help inspectors by taking actions through the available tools when they ask you to create, add, or schedule something.

## Available Tools & When to Use Them
1. **create_contact** - Use when users want to add/create a new contact, client, realtor, vendor, or person
   - Examples: "add a contact named Jim Jones", "create a new client", "add realtor Sarah Smith"
   
2. **create_account** - Use when users want to add/create a new company/business account
   - Examples: "add ABC Realty company", "create account for Johnson Construction"
   
3. **create_report** - Use when users want to start/create a new inspection report
   - Examples: "create a new inspection report", "start a report for 123 Main St"
   
4. **create_task** - Use when users want to add a task, to-do, or follow-up item
   - Examples: "remind me to call the client", "add task to review photos"
   
5. **create_appointment** - Use when users want to schedule an inspection or meeting
   - Examples: "schedule inspection for tomorrow", "book appointment with client"
   
6. **search_support** - Use for general questions about how HomeReportPro works
   - Examples: "how do I add photos to a report?", "what's the difference between report types?"

## Tool Requirements
**create_contact** - Required: first_name, last_name (minimum for a contact)
**create_account** - Required: name (company/business name)  
**create_report** - Required: reportType, address (what kind of report and where)
**create_task** - Required: title, due_date (what to do and when)
**create_appointment** - Required: appointment_date, address (when and where)

## Information Gathering Approach
- **GATHER REQUIRED INFORMATION FIRST** before calling tools
- When users request creation/scheduling actions, ask for the essential required details if they're missing
- Only call tools when you have sufficient information to succeed
- Be efficient - ask for just the required fields, optional fields can be added later

## Handling Tool Results
- If a tool returns missing field information, immediately ask the user for those specific fields
- Be specific about what information is needed and why
- Don't make the user guess - clearly state what's required

## Examples of Proper Responses
User: "add a contact named Jim Jones"
- If you have a name, IMMEDIATELY call create_contact with the provided information
- Then ask for any additional details they want to add (email, phone, etc.)

User: "schedule an inspection"
- Ask: "I'd be happy to schedule that inspection! What's the property address and preferred date/time?"
- Once provided, IMMEDIATELY call create_appointment

User: "create a task to call the client back"
- Ask: "Got it! What's the task description and when should it be completed?"
- Once provided, IMMEDIATELY call create_task

User: "create a client"
- Ask: "I'll help you create a new client! What's their first and last name?"
- Once provided, call create_contact and then offer to add additional details

## Important Guidelines
- Always be helpful and gather information efficiently
- Ask for required fields when missing, but don't ask for every detail upfront
- Call tools only when you have enough information for them to succeed
- If a tool indicates missing fields, ask for those specific fields clearly
- Be conversational and friendly while being efficient
- If users ask general "how to" questions, use search_support to find relevant documentation
- Use only facts provided in tool messages. If a field is missing, ask for it. If a tool returns an error, explain it and propose next steps.

Remember: Your goal is to make inspectors more productive by quickly handling their requests through the available tools.`;

// ====== Server ======
serve(async (req) => {
    const start = performance.now();
    
    // Variables to track tool execution results
    let toolRecordId = "";
    let toolRecordType = "";
    let toolMissingFields = "";
    
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
                status: 401, headers: {...corsHeaders, "Content-Type": "application/json"},
            });
        }

        const client = createClient(supabaseUrl, serviceKey);
        const {data: {user}} = await client.auth.getUser(jwt);
        if (!user) {
            return new Response(JSON.stringify({error: "Unauthorized"}), {
                status: 401, headers: {...corsHeaders, "Content-Type": "application/json"},
            });
        }

        const {messages, conversation_id} = await req.json();
        const last = messages?.[messages.length - 1];
        const question: string | undefined = last?.content;
        const imageUrl: string | undefined = last?.image;

        if (!question) {
            return new Response(JSON.stringify({error: "No question provided"}), {
                status: 400, headers: {...corsHeaders, "Content-Type": "application/json"},
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

        // Build the user message content (no auto-doc context!)
        const userMessageContent = imageUrl
            ? [{type: "text", text: question}, {type: "image_url", image_url: {url: imageUrl}}]
            : question;

        const routerResult = await routeIntents(question);
        let forcedToolChoice: any = null;
        if (routerResult.force && routerResult.intents.length > 0) {
            forcedToolChoice = {type: "function", name: routerResult.intents[0].name};

        }
        await log("info", "router decision", {question, routerResult});

        // ===== First model call (may produce tool_calls) =====
        const messageList: any[] = [{role: "system", content: systemPrompt}];
        if (forcedToolChoice) {
            messageList.push({role: "system", content: `router_reason: ${routerResult.reason}`});
        }
        messageList.push({role: "user", content: userMessageContent as any});

        const firstRes = await fetch("https://api.openai.com/v1/responses", {

            method: "POST",
            headers: {Authorization: `Bearer ${openaiKey}`, "Content-Type": "application/json"},
            body: JSON.stringify({
                model: MODEL,
                input: messageList,
                tools,
                tool_choice: forcedToolChoice || "auto",
                max_output_tokens: 1500,
            }),
        });

        if (!firstRes.ok) {
            const text = await firstRes.text();
            await log("error", "OpenAI request failed", {status: firstRes.status, error: text, model: MODEL});
            return new Response(JSON.stringify({error: "OpenAI request failed"}), {
                status: 500, headers: {...corsHeaders, "Content-Type": "application/json"},
            });
        }

        const firstJson = await firstRes.json();

        let accumulatedAssistantText = "";
        const assistantToolMessage: any = {role: "assistant", content: [] as any[]};


        type PendingCall = {
            id: string;
            index: number;
            function: { name: string; arguments: string };
            type: "function";
        };
        const pendingCallsByIndex = new Map<number, PendingCall>();

        const outputs = firstJson.output || [];
        for (const out of outputs) {
            if (out.role !== "assistant") continue;
            for (const part of out.content || []) {
                if (part.type === "output_text" && part.text) {
                    accumulatedAssistantText += part.text;
                    continue;
                }

              // The Responses API emits tool calls as content items with
                // type "tool_call" and nests the name/arguments under
                // part.function. Handle that shape here.
                if (part.type === "tool_call" && part.function) {
                    const idx = pendingCallsByIndex.size;
                    const fnArgs = typeof part.function.arguments === "string"
                        ? part.function.arguments
                        : JSON.stringify(part.function.arguments || {});
                    pendingCallsByIndex.set(idx, {
                        id: part.id || `call_${idx}`,
                        index: idx,
                        type: "function",
                        function: {name: part.function.name || "", arguments: fnArgs},
                    });
                }

                // Legacy compatibility: some older Responses versions used
                // "function_call" with top-level name/arguments fields.
                if (part.type === "function_call") {
                    const idx = pendingCallsByIndex.size;
                    pendingCallsByIndex.set(idx, {
                        id: part.id || `call_${idx}`,
                        index: idx,
                        type: "function",
                        function: {
                            name: part.name || "",
                            arguments: part.arguments || "",
                        },

                    });
                }
            }
        }

        // Prepare final stream back to the browser (we stream only the second call)
        const stream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();

                // If no tool calls, return the first text and exit.
                if (pendingCallsByIndex.size === 0) {
                    if (accumulatedAssistantText) {
                        controller.enqueue(encoder.encode(accumulatedAssistantText));
                    }
                    controller.close();

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
                if (accumulatedAssistantText) {
                    (assistantToolMessage.content as any[]).push({type: "text", text: accumulatedAssistantText});
                }
                for (const c of pendingCallsByIndex.values()) {
                    (assistantToolMessage.content as any[]).push({
                        type: "tool_call",
                        id: c.id,
                        function: {name: c.function.name, arguments: c.function.arguments},
                    });
                }


                const toolMessages: any[] = [];
                for (const call of pendingCallsByIndex.values()) {
                    let toolContent: string;
                    try {
                        await log("info", "executing tool call", {
                            tool: call.function.name,
                            args: call.function.arguments,
                        });

                        const args = call.function.arguments ? JSON.parse(call.function.arguments) : {};
                        const result = await handleToolCall(call.function.name, args, client, user, conversationId);

                        await log("info", "tool execution result", {
                            tool: call.function.name,
                            result: result,
                        });

                        if (result.status === "ok" && (result.data as any)?.record?.id) {
                            toolRecordId = (result.data as any).record.id;
                            toolRecordType = call.function.name.replace("create_", "");
                        }

                        if (result.status === "needs_input" && result.missing_fields) {
                            toolMissingFields = result.missing_fields.join(", ");
                        }

                        toolContent = JSON.stringify(result);
                    } catch (e) {
                        await log("error", "tool call exception", {
                            tool: call.function.name,
                            error: e.message,
                        });
                        toolContent = JSON.stringify({status: "error", message: "Invalid tool call arguments: " + e.message});
                    }

                    toolMessages.push({
                        role: "tool",
                        tool_call_id: call.id,
                        name: call.function.name,
                        content: toolContent,
                    });
                }

                // ===== Second model call (model sees tool outputs and produces final answer) =====
                const followRes = await fetch("https://api.openai.com/v1/responses", {
                    method: "POST",
                    headers: {Authorization: `Bearer ${openaiKey}`, "Content-Type": "application/json"},
                    body: JSON.stringify({
                        model: MODEL,
                        stream: true,
                        input: [
                            {role: "system", content: systemPrompt},
                            {role: "user", content: userMessageContent as any},
                            assistantToolMessage,
                            ...toolMessages,
                        ],
                        max_output_tokens: 1500,
                    }),
                });

                if (!followRes.ok || !followRes.body) {
                    const txt = await followRes.text();
                    await log("error", "OpenAI follow-up failed", {status: followRes.status, error: txt, model: MODEL});
                    controller.enqueue(encoder.encode("Error: failed to generate final response."));
                    controller.close();
                    return;
                }

                const fReader = followRes.body.getReader();
                const fDecoder = new TextDecoder();
                let finalText = "";
                let fBuffer = "";

                while (true) {
                    const {value, done} = await fReader.read();
                    if (done) break;

                    fBuffer += fDecoder.decode(value, {stream: true});
                    const lines = fBuffer.split("\n");
                    fBuffer = lines.pop() || "";
                    for (const line of lines) {
                        if (!line.startsWith("data: ")) continue;
                        const payload = line.slice(6).trim();
                        if (payload === "[DONE]") continue;

                        try {
                            const parsed = JSON.parse(payload);
                            if (
                                parsed.type === "response.output_text.delta" &&
                                typeof parsed.delta === "string"
                            ) {
                                finalText += parsed.delta;
                                controller.enqueue(encoder.encode(parsed.delta));
                            }
                        } catch {
                            // ignore JSON parse errors
                        }
                    }
                }

                if (fBuffer) {
                    try {
                        const parsed = JSON.parse(fBuffer);
                        if (
                            parsed.type === "response.output_text.delta" &&
                            typeof parsed.delta === "string"
                        ) {
                            finalText += parsed.delta;
                            controller.enqueue(encoder.encode(parsed.delta));
                        }
                    } catch {
                        // ignore leftover
                    }
                }

                controller.close();

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
                "Content-Type": "application/octet-stream",
                "x-conversation-id": conversationId || "",
                "x-tool-record-id": toolRecordId || "",
                "x-tool-record-type": toolRecordType || "",
                "x-tool-missing-fields": toolMissingFields || "",
            },
        });
    } catch (err) {
        await log("error", "chatbot function error", {error: String(err)});
        const duration = performance.now() - start;
        await emitMetric("chatbot_response_time_ms", duration);
        return new Response(JSON.stringify({error: "Unexpected error"}), {
            status: 500, headers: {...corsHeaders, "Content-Type": "application/json"},
        });
    }
});
