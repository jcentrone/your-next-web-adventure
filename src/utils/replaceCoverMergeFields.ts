import get from "lodash.get";
import type {Organization, Profile} from "@/integrations/supabase/organizationsApi";
import type {Report} from "@/lib/reportSchemas";

type MergeData = {
    organization?: Organization | null;
    inspector?: Profile | null;
    report?: Partial<Report> | null;
};

const TOKEN_RE = /\{\{\s*([^\}]+?)\s*\}\}/g;
const TOKEN_ONLY_RE = /^\s*\{\{\s*([^\}]+?)\s*\}\}\s*$/;

/** Normalizers to give friendlier canonical keys like .phone, .email, .name, .logo */
function normalizeOrg(org: any) {
    if (!org) return org;
    const phone = org.phone ?? org.phone_number ?? org.primary_phone ?? "";
    const email = org.email ?? org.primary_email ?? "";
    const name = org.name ?? org.organization_name ?? org.company_name ?? "";
    const logo =
        org.logo ||
        org.logo_url ||
        org.brand_logo ||
        (org.brand && (org.brand.logo || org.brand.logo_url)) ||
        "";
    return {...org, phone, email, name, logo};
}

function normalizeInspector(inspector: any) {
    if (!inspector) return inspector;
    const phone = inspector.phone ?? inspector.phone_number ?? "";
    const email = inspector.email ?? "";
    const name =
        inspector.name ??
        inspector.full_name ??
        `${inspector.first_name ?? ""} ${inspector.last_name ?? ""}`.trim();
    return {...inspector, phone, email, name};
}

// add alongside your other normalizers
function normalizeReport(r: any) {
    if (!r) return r;
    const out = {...r};

    // alias snake_case <-> camelCase both ways so either token style works
    const alias = (from: string, to: string) => {
        if (out[from] !== undefined && out[to] === undefined) out[to] = out[from];
    };

    alias("inspectionDate", "inspection_date");
    alias("inspection_date", "inspectionDate");

    alias("coverImage", "cover_image");
    alias("cover_image", "coverImage");

    alias("weatherConditions", "weather_conditions");
    alias("weather_conditions", "weatherConditions");

    alias("clientName", "client_name");
    alias("client_name", "clientName");

    alias("address", "property_address"); // if you use one or the other
    alias("property_address", "address");

    alias("clientEmail", "client_email");
    alias("client_email", "clientEmail");

    alias("clientPhone", "client_phone");
    alias("client_phone", "clientPhone");

    return out;
}

function deriveContact(r: any) {
    if (!r) return null;
    const rr = normalizeReport(r);
    return {
        name: rr.clientName ?? rr.client_name ?? rr.contact?.name ?? "",
        address:
            rr.address ??
            rr.property_address ??
            rr.contact?.address ??
            "",
        email: rr.clientEmail ?? rr.client_email ?? rr.contact?.email ?? "",
        phone: rr.clientPhone ?? rr.client_phone ?? rr.contact?.phone ?? "",
    };
}

/** Case-insensitive root resolver: organization / inspector / report */
function ciGet(ctx: any, dottedPath: string) {
    const parts = dottedPath.split(".").map((p) => p.trim()).filter(Boolean);
    if (!parts.length) return "";
    const [first, ...rest] = parts;
    const lowerFirst = first.toLowerCase();
    let root: any;
    if (lowerFirst === "organization") root = ctx.organization;
    else if (lowerFirst === "inspector") root = ctx.inspector;
    else if (lowerFirst === "report") root = ctx.report;
    else if (lowerFirst === "contact") root = ctx.contact;          // ← NEW
    else root = ctx[first];
    const fullPath = rest.length ? rest.join(".") : "";
    return fullPath ? get(root, fullPath) : root;
}

function isProbablyUrl(s: any) {
    return typeof s === "string" && (/^https?:\/\//i.test(s) || /^data:image\//i.test(s));
}

/**
 * Replace tokens in a string.
 * IMPORTANT: If a token can't be resolved, we KEEP the original token text,
 * so the image stage can still see token-only values and convert them.
 */
function replaceInString(str: string, ctx: any, counters: { hits: number }) {
    if (typeof str !== "string" || !str.includes("{{")) return str;
    return str.replace(TOKEN_RE, (match, path) => {
        counters.hits++;
        const val = ciGet(ctx, String(path).trim());
        if (val === null || val === undefined) return match; // keep unresolved
        return typeof val === "string" ? val : String(val);
    });
}

/** If the string is exactly a single token, return its path; otherwise null */
function extractTokenPathIfOnly(str?: string): string | null {
    if (typeof str !== "string") return null;
    const m = str.match(TOKEN_ONLY_RE);
    return m ? m[1].trim() : null;
}

export async function replaceCoverMergeFields(
    designJson: any,
    {organization, inspector, report}: MergeData
): Promise<any> {
    if (!designJson) return designJson;

    const ctx = {
        organization: normalizeOrg(organization ?? null),
        inspector: normalizeInspector(inspector ?? null),
        report: normalizeReport(report ?? null),   // ← use normalizer
        contact: deriveContact(report ?? null),    // ← NEW
    };

    const json =
        typeof designJson === "string"
            ? JSON.parse(designJson)
            : JSON.parse(JSON.stringify(designJson));

    const counters = {hits: 0, nodes: 0};

    // Replace string props on an object (skip image.src — image stage owns it)
    const replaceStringsOnObject = (obj: any) => {
        for (const key of Object.keys(obj)) {
            if (obj.type === "image" && key === "src") continue;

            const v = obj[key];
            if (typeof v === "string" && v.includes("{{")) {
                obj[key] = replaceInString(v, ctx, counters);
            }

            // metadata may also contain strings worth replacing
            if (key === "metadata" && v && typeof v === "object") {
                for (const mkey of Object.keys(v)) {
                    const mv = v[mkey];
                    if (typeof mv === "string" && mv.includes("{{")) {
                        v[mkey] = replaceInString(mv, ctx, counters);
                    }
                }
            }
        }
    };

    const walk = (obj: any) => {
        if (!obj || typeof obj !== "object") return;
        counters.nodes++;

        // Generic pass first
        replaceStringsOnObject(obj);

        // TEXT NODES
        if (obj.type === "textbox" || obj.type === "text" || obj.type === "i-text") {
            if (typeof obj.text === "string") {
                const tokenOnly = extractTokenPathIfOnly(obj.text);
                if (tokenOnly) {
                    // If the single token resolves to a URL, LEAVE the token (image stage converts to <image>)
                    const val = ciGet(ctx, tokenOnly);
                    if (!isProbablyUrl(val)) {
                        obj.text = replaceInString(obj.text, ctx, counters);
                    }
                } else {
                    obj.text = replaceInString(obj.text, ctx, counters);
                    console.log("image_text", obj.text);
                }
            }

            // Custom merge displayToken
            if (obj.mergeField && obj.displayToken) {
                const tokenOnly = extractTokenPathIfOnly(obj.displayToken);
                if (tokenOnly) {
                    const val = ciGet(ctx, tokenOnly);
                    if (!isProbablyUrl(val)) {
                        obj.text = replaceInString(obj.displayToken, ctx, counters);
                    } else {
                        obj.text = obj.displayToken; // keep token for image stage

                    }
                } else {
                    obj.text = replaceInString(obj.displayToken, ctx, counters);
                }
            }
        }

        // CUSTOM MERGE-FIELD OBJECTS → normalize to text
        if (obj.isMergeField && obj.displayToken) {
            const tokenOnly = extractTokenPathIfOnly(obj.displayToken);
            if (tokenOnly) {
                const val = ciGet(ctx, tokenOnly);
                if (!isProbablyUrl(val)) {
                    obj.text = replaceInString(obj.displayToken, ctx, counters);
                } else {
                    obj.text = obj.displayToken; // keep token for image stage
                }
            } else {
                obj.text = replaceInString(obj.displayToken, ctx, counters);
            }

            delete obj.isMergeField;
            delete obj.mergeField;
            delete obj.displayToken;
            obj.backgroundColor = "transparent";
            obj.stroke = undefined;
            obj.strokeWidth = undefined;
            obj.strokeDashArray = undefined;
            obj.borderColor = undefined;
            obj.fill = obj.fill ?? "#000000";
        }

        // DO NOT touch image.src here.

        // Recurse
        if (Array.isArray(obj.objects)) obj.objects.forEach(walk);
        if (obj.clipPath && typeof obj.clipPath === "object") walk(obj.clipPath);
    };

    const rootObjects = Array.isArray(json.objects)
        ? json.objects
        : Array.isArray(json.canvas?.objects)
            ? json.canvas.objects
            : null;

    if (rootObjects) rootObjects.forEach(walk);

    // Debug
    if (typeof window !== "undefined") {
        console.log(
            `[replaceCoverMergeFields] nodes walked=${counters.nodes}, tokens replaced=${counters.hits}`
        );
    }

    return json;
}
