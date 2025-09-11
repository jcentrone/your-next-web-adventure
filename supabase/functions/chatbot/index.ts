// deno-lint-ignore-file no-explicit-any
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-require-imports */

/**
 * Minimal chatbot with enhanced logging + sturdier tool-call handling.
 */

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import {serve} from "https://deno.land/std@0.168.0/http/server.ts";
import {createClient} from "https://esm.sh/@supabase/supabase-js@2";
import {z} from "https://esm.sh/zod@3.23.8";
import {zodToJsonSchema} from "https://esm.sh/zod-to-json-schema@3.23.3";

// ====== Env ======
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const openaiKey = Deno.env.get("OPENAI_API_KEY")!;
const MODEL = "gpt-4.1";
const MAX_OUTPUT_TOKENS = Number(Deno.env.get("CHATBOT_MAX_TOKENS") ?? "1200");
const LOG_LEVEL = (Deno.env.get("LOG_LEVEL") ?? "info").toLowerCase(); // info|debug

// ====== CORS ======
const CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ====== tiny logger ======
function log(level: "debug" | "info" | "error", msg: string, meta: Record<string, unknown> = {}) {
    if (level === "debug" && LOG_LEVEL !== "debug") return;
    const payload = {level, msg, ...meta, ts: new Date().toISOString()};
    (level === "error" ? console.error : console.log)(payload);
}

// ====== Schemas (unchanged) ======
const CreateAccountSchema = z.object({
    name: z.string().min(1),
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
    first_name: z.string().min(1),
    last_name: z.string().min(1),
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
    title: z.string().min(1),
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
    title: z.string().min(1),
    description: z.string().optional(),
    priority: z.enum(["low", "medium", "high", "urgent"]),
    status: z.enum(["pending", "in_progress", "completed", "cancelled"]),
    task_type: z.string().optional().nullable(),
    due_date: z.string().nullable().optional(),
    completed_at: z.string().nullable().optional(),
});

const BaseReportSchema = z.object({
    title: z.string().min(1),
    clientName: z.string().min(1),
    address: z.string().min(1),
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
    coverTemplate: z.enum([
        "templateOne", "templateTwo", "templateThree", "templateFour", "templateFive", "templateSix",
        "templateSeven", "templateEight", "templateNine", "templateTen", "templateEleven", "templateTwelve",
        "templateThirteen", "templateFourteen", "templateFifteen", "templateSixteen",
    ]).default("templateOne"),
    previewTemplate: z.enum(["classic", "modern", "minimal"]).default("classic"),
    colorScheme: z.enum([
        "default", "coralAmber", "indigoOrchid", "forestMint", "slateSky", "royalAqua",
        "burgundyGold", "emeraldLime", "navyOrange", "charcoalNeon", "cocoaPeach", "custom",
    ]).default("default"),
    customColors: z.object({
        primary: z.string().optional(),
        secondary: z.string().optional(),
        accent: z.string().optional(),
        headingText: z.string().optional(),
        bodyText: z.string().optional(),
    }).optional(),
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

// ====== Tool schemas ======
const toolSchemas = {
    create_account: zodToJsonSchema(CreateAccountSchema, {$refStrategy: "none"}),
    create_contact: zodToJsonSchema(CreateContactSchema, {$refStrategy: "none"}),
    create_report: zodToJsonSchema(BaseReportSchema, {$refStrategy: "none"}),
    create_task: zodToJsonSchema(TaskSchema, {$refStrategy: "none"}),
    create_appointment: zodToJsonSchema(AppointmentSchema, {$refStrategy: "none"}),
    search_support: {
        type: "object",
        properties: {
            query: {type: "string", description: "Query to search support articles"},
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
        description: "Create an account/company",
        parameters: toolSchemas.create_account
    },
    {
        type: "function",
        name: "create_contact",
        description: "Create a contact/person",
        parameters: toolSchemas.create_contact
    },
    {
        type: "function",
        name: "create_report",
        description: "Create an inspection report",
        parameters: toolSchemas.create_report
    },
    {type: "function", name: "create_task", description: "Create a task/todo", parameters: toolSchemas.create_task},
    {
        type: "function",
        name: "create_appointment",
        description: "Schedule an appointment/inspection",
        parameters: toolSchemas.create_appointment
    },
    {
        type: "function",
        name: "search_support",
        description: "Semantic search over support docs",
        parameters: toolSchemas.search_support
    },
] as const;

// ====== Tool executor with logs ======
async function handleToolCall(name: string, rawArgs: any, client: any, user: any) {
    log("debug", "tool_call_received", {name, rawArgs});

    // Safer args parse (Responses may send string or object)
    let args: any = {};
    try {
        if (typeof rawArgs === "string") args = rawArgs ? JSON.parse(rawArgs) : {};
        else args = rawArgs || {};
    } catch (e) {
        log("error", "tool_args_parse_failed", {name, error: String(e)});
        return {status: "error", message: "Invalid tool arguments"};
    }

    if (name === "search_support") {
        const query = String(args?.query ?? "").trim();
        const top_k = Math.min(Math.max(Number(args?.top_k ?? 5), 1), 10);
        const threshold = Math.min(Math.max(Number(args?.threshold ?? 0.7), 0), 1);
        if (!query) return {status: "error", message: "Missing query"};

        // embed
        const embRes = await fetch("https://api.openai.com/v1/embeddings", {
            method: "POST",
            headers: {Authorization: `Bearer ${openaiKey}`, "Content-Type": "application/json"},
            body: JSON.stringify({model: "text-embedding-3-small", input: query}),
        });
        if (!embRes.ok) {
            const t = await embRes.text();
            log("error", "embedding_failed", {status: embRes.status, body: t});
            return {status: "error", message: "embedding_failed"};
        }
        const emb = await embRes.json();
        const embedding = emb.data?.[0]?.embedding;

        const {data: hits, error} = await client.rpc("match_support_articles", {
            query_embedding: embedding,
            match_threshold: threshold,
            match_count: top_k,
        });
        if (error) {
            log("error", "match_support_articles_failed", {error});
            return {status: "error", message: "search_failed"};
        }

        const articles = (hits || []).map((a: any) => ({
            id: a.id ?? null,
            title: a.title,
            content: (a.content ?? "").slice(0, 2000),
            url: a.url ?? null,
        }));

        log("debug", "search_support_ok", {count: articles.length});
        return {status: "ok", data: {articles}};
    }

    // DB-backed create_* tools
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
        log("error", "unknown_tool", {name});
        return {status: "error", message: "Unknown tool"};
    }

    const parsed = schema.safeParse(args);
    if (!parsed.success) {
        const missing = parsed.error.issues.map(i => i.path.join("."));
        log("info", "tool_needs_input", {name, missing});
        return {status: "needs_input", missing_fields: missing};
    }

    const {data, error} = await client.from(table)
        .insert({...parsed.data, user_id: user.id})
        .select()
        .single();

    if (error) {
        log("error", "db_insert_failed", {name, table, error: error.message});
        return {status: "error", message: error.message, transient: true};
    }

    log("info", "tool_ok", {name, table, id: data?.id});
    return {status: "ok", data: {record: data}};
}

// ====== System prompt (trim) ======
const systemPrompt = `You are HomeReportPro Assistant. Use tools to create/add/schedule; use search_support for "how to" questions. Ask only for required fields if missing. If a tool returns "needs_input", ask specifically for those fields.`;

// ====== Helpers to extract text from Responses JSON ======
function extractAssistantText(resJson: any): string {
    // Primary path: iterate outputs->assistant->content->output_text
    let text = "";
    for (const out of resJson?.output ?? []) {
        if (out?.role !== "assistant") continue;
        for (const part of out?.content ?? []) {
            if (part?.type === "output_text" && typeof part?.text === "string") {
                text += part.text;
            }
        }
    }
    // Fallbacks (some variants expose a single string)
    if (!text && typeof resJson?.output_text === "string") text = resJson.output_text;
    if (!text && Array.isArray(resJson?.output_text)) {
        text = resJson.output_text.join("");
    }
    return text;
}

// ====== Server ======
serve(async (req) => {
    if (req.method === "OPTIONS") return new Response(null, {headers: CORS});

    const started = performance.now();
    let headerToolCount = 0;
    let headerToolNames = "";
    let headerHadFollowText = "0";

    try {
        if (!openaiKey) {
            return new Response("Missing OPENAI_API_KEY", {
                status: 500,
                headers: {...CORS, "Content-Type": "text/plain"}
            });
        }

        const jwt = req.headers.get("Authorization")?.replace("Bearer ", "");
        if (!jwt) return new Response("Unauthorized", {
            status: 401,
            headers: {...CORS, "Content-Type": "text/plain"}
        });

        const client = createClient(supabaseUrl, serviceKey);
        const {data: {user}} = await client.auth.getUser(jwt);
        if (!user) return new Response("Unauthorized", {
            status: 401,
            headers: {...CORS, "Content-Type": "text/plain"}
        });

        const body = await req.json();
        const messages = body?.messages;
        if (!Array.isArray(messages) || messages.length === 0) {
            return new Response("No messages", {
                status: 400,
                headers: {...CORS, "Content-Type": "text/plain"}
            });
        }

        log("debug", "first_call_request", {model: MODEL, msgs: messages.length});

        // 1) First model call (tool discovery)
        const firstRes = await fetch("https://api.openai.com/v1/responses", {
            method: "POST",
            headers: {Authorization: `Bearer ${openaiKey}`, "Content-Type": "application/json"},
            body: JSON.stringify({
                model: MODEL,
                input: [{role: "system", content: systemPrompt}, ...messages],
                tools,
                tool_choice: "auto",
                max_output_tokens: MAX_OUTPUT_TOKENS,
            }),
        });

        const firstText = await firstRes.text();
        if (!firstRes.ok) {
            log("error", "first_call_failed", {status: firstRes.status, body: firstText.slice(0, 1000)});
            return new Response("OpenAI request failed", {
                status: 500,
                headers: {...CORS, "Content-Type": "text/plain"}
            });
        }
        let firstJson: any = {};
        try {
            firstJson = JSON.parse(firstText);
        } catch (e) {
            log("error", "first_call_json_parse_failed", {error: String(e), snippet: firstText.slice(0, 300)});
            return new Response("Bad OpenAI JSON", {
                status: 500,
                headers: {...CORS, "Content-Type": "text/plain"}
            });
        }

        // log the raw model output (trim large strings)
        function trimDeep(obj: any, max = 300): any {
            if (typeof obj === "string") {
                return obj.length > max ? obj.slice(0, max) + "..." : obj;
            }
            if (Array.isArray(obj)) return obj.map(x => trimDeep(x, max));
            if (obj && typeof obj === "object") {
                const out: any = {};
                for (const [k, v] of Object.entries(obj)) {
                    out[k] = trimDeep(v, max);
                }
                return out;
            }
            return obj;
        }

        log("debug", "first_model_response", trimDeep(firstJson, 300));

        const assistantText = extractAssistantText(firstJson);
        log("debug", "first_call_assistant_text", {len: assistantText.length});

        // Collect tool calls
        // Collect tool calls (support multiple shapes) + log content part types
        type PendingCall = { id: string; name: string; args: any };

        const calls: PendingCall[] = [];
        const partTypeTally: Record<string, number> = {};

        function safeParseArgs(raw: any) {
            try {
                if (typeof raw === "string") return raw ? JSON.parse(raw) : {};
                return raw || {};
            } catch {
                return {}; // don't crash on bad JSON, we'll log later when executing
            }
        }

        for (const out of firstJson.output ?? []) {
            if (out?.role !== "assistant") continue;
            for (const part of out?.content ?? []) {
                const t = String(part?.type ?? "unknown");
                partTypeTally[t] = (partTypeTally[t] ?? 0) + 1;

                // 1) Responses modern: tool_use
                // shape: { type:"tool_use", id, name, input }
                if (t === "tool_use" && part?.name) {
                    calls.push({
                        id: part?.id || crypto.randomUUID(),
                        name: part?.name,
                        args: part?.input ?? {},
                    });
                    continue;
                }

                // 2) Responses older: tool_call with .function
                // shape: { type:"tool_call", id, function:{ name, arguments } }
                if (t === "tool_call" && part?.function?.name) {
                    calls.push({
                        id: part?.id || crypto.randomUUID(),
                        name: part?.function?.name,
                        args: safeParseArgs(part?.function?.arguments),
                    });
                    continue;
                }

                // 3) Very old: function_call
                // shape: { type:"function_call", id, name, arguments }
                if (t === "function_call" && part?.name) {
                    calls.push({
                        id: part?.id || crypto.randomUUID(),
                        name: part?.name,
                        args: safeParseArgs(part?.arguments),
                    });
                    continue;
                }
            }
        }

        log("info", "tool_calls_detected", {count: calls.length, names: calls.map(c => c.name).join(",")});
        log("debug", "first_call_part_types", partTypeTally);

        headerToolCount = calls.length;
        headerToolNames = calls.map(c => c.name).join(",");

        log("info", "tool_calls_detected", {count: calls.length, names: headerToolNames});

        // 2) Execute tools and do follow-up call
        if (calls.length > 0) {
            const toolMsgs: any[] = [];
            const summary: string[] = []; // for fallback message

            for (const c of calls) {
                const result = await handleToolCall(c.name, c.args, client, user);
                toolMsgs.push({role: "tool", tool_call_id: c.id, name: c.name, content: JSON.stringify(result)});

                // keep a short summary for fallback
                if (result?.status === "ok" && (result as any)?.data?.record?.id) {
                    summary.push(`${c.name} → ${((result as any).data.record.id)}`);
                } else if (result?.status === "needs_input") {
                    summary.push(`${c.name} → needs: ${(result as any).missing_fields?.join(", ")}`);
                } else if (result?.status === "error") {
                    summary.push(`${c.name} → error: ${(result as any).message ?? "unknown"}`);
                }
                log("debug", "tool_result", {name: c.name, status: result?.status});
            }

            // Include the first assistant text as context, plus the tool_call markers
            const assistantToolEnvelope = {
                role: "assistant",
                content: [
                    ...(assistantText ? [{type: "text" as const, text: assistantText}] : []),
                    ...calls.map(c => ({
                        type: "tool_call" as const,
                        id: c.id,
                        function: {
                            name: c.name,
                            arguments: typeof c.args === "string" ? c.args : JSON.stringify(c.args ?? {})
                        }
                    })),
                ],
            };

            const followRes = await fetch("https://api.openai.com/v1/responses", {
                method: "POST",
                headers: {Authorization: `Bearer ${openaiKey}`, "Content-Type": "application/json"},
                body: JSON.stringify({
                    model: MODEL,
                    input: [
                        {role: "system", content: systemPrompt},
                        ...messages,
                        assistantToolEnvelope,
                        ...toolMsgs,
                    ],
                    max_output_tokens: MAX_OUTPUT_TOKENS,
                }),
            });

            const followText = await followRes.text();
            if (!followRes.ok) {
                log("error", "follow_call_failed", {status: followRes.status, body: followText.slice(0, 1000)});
                return new Response("OpenAI follow-up failed", {
                    status: 500,
                    headers: {
                        ...CORS,
                        "Content-Type": "text/plain",
                        "x-tool-calls": String(headerToolCount),
                        "x-tool-names": headerToolNames
                    }
                });
            }
            log("debug", "follow_model_response", trimDeep(followText, 300));

            let followJson: any = {};
            try {
                followJson = JSON.parse(followText);
            } catch (e) {
                log("error", "follow_call_json_parse_failed", {error: String(e), snippet: followText.slice(0, 300)});
            }

            let finalText = extractAssistantText(followJson);
            headerHadFollowText = finalText ? "1" : "0";
            log("info", "follow_text_extracted", {len: finalText.length});

            // Strong fallback if model gave nothing
            if (!finalText) {
                if (summary.length) {
                    finalText = `Done.\n${summary.join("\n")}`;
                    log("info", "fallback_synthesized_text", {lines: summary.length});
                } else if (assistantText) {
                    finalText = assistantText;
                } else {
                    finalText = "Action processed.";
                }
            }

            // Create a readable stream for the text response
            const stream = new ReadableStream({
                start(controller) {
                    const encoder = new TextEncoder();
                    controller.enqueue(encoder.encode(finalText));
                    controller.close();
                }
            });

            return new Response(stream, {
                headers: {
                    ...CORS,
                    "Content-Type": "text/plain",
                    "x-tool-calls": String(headerToolCount),
                    "x-tool-names": headerToolNames,
                    "x-follow-text": headerHadFollowText
                },
            });
        }

        // No tools → return first-pass text as stream
        const noToolText = assistantText || "";
        const stream = new ReadableStream({
            start(controller) {
                const encoder = new TextEncoder();
                controller.enqueue(encoder.encode(noToolText));
                controller.close();
            }
        });

        return new Response(stream, {
            headers: {...CORS, "Content-Type": "text/plain", "x-tool-calls": "0", "x-follow-text": "0"},
        });
    } catch (e) {
        log("error", "handler_exception", {error: String(e)});
        return new Response("Unexpected error", {
            status: 500,
            headers: {...CORS, "Content-Type": "text/plain"},
        });
    } finally {
        log("debug", "duration_ms", {ms: Math.round(performance.now() - started)});
    }
});
