// src/utils/replaceCoverImages.ts
import get from "lodash.get";
import type {Organization, Profile} from "@/integrations/supabase/organizationsApi";
import type {Report} from "@/lib/reportSchemas";
import {getSignedUrlFromSupabaseUrl, isSupabaseUrl} from "@/integrations/supabase/storage";

type JsonAny = Record<string, any>;

const TOKEN_RE = /\{\{\s*([^\}]+?)\s*\}\}/g;
const TOKEN_ONLY_RE = /^\s*\{\{\s*([^\}]+?)\s*\}\}\s*$/;

/* ------------------------- URL helpers ------------------------- */
function isHttpUrl(s?: string) {
    return typeof s === "string" && /^https?:\/\//i.test(s);
}

function isDataUrl(s?: string) {
    return typeof s === "string" && /^data:image\//i.test(s);
}

function isProbablyUrl(s?: string) {
    return isHttpUrl(s) || isDataUrl(s);
}

function nodeType(o: any): string {
    return String(o?.type ?? "").toLowerCase();
}

// if (nodeType(obj) === "image") {
//   hoistAltImageProps(obj);
//   // ... rest unchanged ...
// }

// find the first url-ish substring anywhere in text
function firstUrl(s?: string): string | null {
    if (typeof s !== "string") return null;
    // http(s) or data:image
    const m = s.match(/https?:\/\/\S+|data:image\/\S+/i);
    if (m) return m[0];

    // fallback: relative-ish path with common image extensions
    const m2 = s.match(/(?:^|\s)([^\s"']+\.(?:png|jpe?g|gif|webp|svg))(?:\s|$)/i);
    return m2 ? m2[1] : null;
}

/* ------------------------- Context ------------------------- */
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

function ciGet(ctx: any, dottedPath: string) {
    const parts = dottedPath.split(".").map((p) => p.trim()).filter(Boolean);
    if (!parts.length) return "";
    const [first, ...rest] = parts;
    const lowerFirst = first.toLowerCase();
    let root: any;
    if (lowerFirst === "organization") root = ctx.organization;
    else if (lowerFirst === "inspector") root = ctx.inspector;
    else if (lowerFirst === "report") root = ctx.report;
    else root = ctx[first];
    const fullPath = rest.length ? rest.join(".") : "";
    return fullPath ? get(root, fullPath) : root;
}

function replaceTokensKeepUnresolved(str: string, ctx: any): string {
    if (typeof str !== "string" || !str.includes("{{")) return str;
    return str.replace(TOKEN_RE, (match, path) => {
        const val = ciGet(ctx, String(path).trim());
        if (val === null || val === undefined) return match; // keep unresolved token
        return typeof val === "string" ? val : String(val);
    });
}

function extractTokenPathIfOnly(str?: string): string | null {
    if (typeof str !== "string") return null;
    const m = str.match(TOKEN_ONLY_RE);
    return m ? m[1].trim() : null;
}

/* ------------------- Image src resolution ------------------- */
async function resolveSrc(src?: string): Promise<string | undefined> {
    if (!src) return undefined;
    if (isDataUrl(src)) return src;
    if (isSupabaseUrl(src)) {
        try {
            const signed = await getSignedUrlFromSupabaseUrl(src);
            return signed ?? undefined;
        } catch {
            return undefined;
        }
    }
    if (isHttpUrl(src)) return src;
    try {
        return new URL(src, window.location.origin).toString();
    } catch {
        return undefined;
    }
}

/* --------- Hoist alternate props into .src if needed --------- */
function hoistAltImageProps(obj: JsonAny) {
    if (!obj || typeof obj !== "object") return;
    if (nodeType(obj) === "image") {
        const candidates = ["src", "url", "imgUrl", "imageUrl", "image_url", "href", "dataSrc", "path"];
        if (!obj.src) {
            for (const key of candidates) {
                const v = obj[key];
                if (typeof v === "string" && v.trim()) {
                    obj.src = v.trim();
                    break;
                }
            }
        }
    }
    if (Array.isArray(obj.objects)) obj.objects.forEach(hoistAltImageProps);
    if (obj.clipPath && typeof obj.clipPath === "object") hoistAltImageProps(obj.clipPath);
}

/* ---------------------- Walk & convert ---------------------- */
type Stats = {
    total: number;
    resolved: number;
    missing: number;
    converted: number;
    textSeen?: number;
    tokenOnlySeen?: number;
    urlInTextSeen?: number;
    examples: string[];
};

async function processObject(obj: JsonAny, ctx: any, stats: Stats): Promise<void> {
    if (!obj || typeof obj !== "object") return;

    // --- TEXT → IMAGE ---
    const t = nodeType(obj);
    if (t === "text" || t === "textbox" || t === "i-text") {
        stats.textSeen = (stats.textSeen ?? 0) + 1;
        let didConvert = false;

        // Case A: token-only (e.g., "{{organization.logo}}")
        const tokenPath = extractTokenPathIfOnly(obj.text);
        if (tokenPath) {
            stats.tokenOnlySeen = (stats.tokenOnlySeen ?? 0) + 1;
            const raw = ciGet(ctx, tokenPath);
            if (raw && typeof raw === "string") {
                const candidate = replaceTokensKeepUnresolved(raw, ctx);
                if (candidate && candidate.indexOf("{{") === -1) {
                    const resolvedUrl = await resolveSrc(candidate);
                    if (resolvedUrl) {
                        convertTextNodeToImage(obj, resolvedUrl);
                        stats.converted++;
                        stats.total++;
                        stats.resolved++;
                        didConvert = true;
                        if (stats.examples.length < 5) stats.examples.push(`text->image: {{${tokenPath}}} -> ${resolvedUrl}`);
                    }
                }
            }
        }

        // Case B: the text contains ANY url-ish substring (not necessarily equal)
        if (!didConvert && typeof obj.text === "string") {
            const found = firstUrl(obj.text);
            if (found) {
                stats.urlInTextSeen = (stats.urlInTextSeen ?? 0) + 1;
                const resolvedUrl = await resolveSrc(found);
                if (resolvedUrl) {
                    convertTextNodeToImage(obj, resolvedUrl);
                    stats.converted++;
                    stats.total++;
                    stats.resolved++;
                    didConvert = true;
                    if (stats.examples.length < 5) stats.examples.push(`text->image (url-in-text): ${resolvedUrl}`);
                }
            }
        }
    }

    // --- IMAGE nodes ---
    if (obj.type === "image") {
        hoistAltImageProps(obj);

        if (typeof obj.src === "string" && obj.src.includes("{{")) {
            obj.src = replaceTokensKeepUnresolved(obj.src, ctx);
        }

        stats.total++;

        if (typeof obj.src === "string" && obj.src.indexOf("{{") === -1 && obj.src.trim() !== "") {
            const next = await resolveSrc(obj.src);
            if (next) {
                obj.src = next;
                obj.crossOrigin = obj.crossOrigin ?? "anonymous";
                stats.resolved++;
                if (stats.examples.length < 5) stats.examples.push(`image.src resolved -> ${next}`);
            } else {
                stats.missing++;
                if (stats.examples.length < 5) stats.examples.push(`image.src unresolved: ${obj.src}`);
                obj.src = undefined;
            }
        } else {
            stats.missing++;
            if (stats.examples.length < 5) stats.examples.push(`image.src unresolved (token/empty): ${obj.src ?? "<empty>"}`);
            obj.src = undefined;
        }
    }

    // Recurse
    if (Array.isArray(obj.objects)) {
        for (const child of obj.objects) await processObject(child, ctx, stats);
    }
    if (obj.clipPath && typeof obj.clipPath === "object") {
        await processObject(obj.clipPath, ctx, stats);
    }
}

// Turn a Fabric text-like node into an image node, preserving transforms
function convertTextNodeToImage(obj: any, url: string) {
    // capture the intended frame from the placeholder box using numeric props
    const scaleX = obj.scaleX ?? 1;
    const scaleY = obj.scaleY ?? 1;
    const frameWidth = (obj.width ?? 0) * scaleX;
    const frameHeight = (obj.height ?? 0) * scaleY;

    let frameLeft = obj.left ?? 0;
    let frameTop = obj.top ?? 0;

    const originX = obj.originX || "left";
    const originY = obj.originY || "top";

    if (originX === "center") frameLeft -= frameWidth / 2;
    else if (originX === "right") frameLeft -= frameWidth;

    if (originY === "center") frameTop -= frameHeight / 2;
    else if (originY === "bottom") frameTop -= frameHeight;

    // pull any template hint for fit; default to contain
    const fit =
        obj?.data?.objectFit ||
        (obj as any).objectFit ||
        obj?.metadata?.objectFit ||
        "contain";

    // mutate into an image
    const angle = obj.angle;
    const flipX = obj.flipX;
    const flipY = obj.flipY;
    const opacity = obj.opacity;
    const clipPath = obj.clipPath;

    obj.type = "image";
    obj.src = url;
    obj.crossOrigin = obj.crossOrigin ?? "anonymous";

    // normalize to the captured frame
    obj.originX = "left";
    obj.originY = "top";
    obj.left = frameLeft;
    obj.top = frameTop;
    obj.width = frameWidth;
    obj.height = frameHeight;
    obj.scaleX = 1;
    obj.scaleY = 1;

    // remove text-only props
    delete obj.text;
    delete obj.fontFamily;
    delete obj.fontSize;
    delete obj.fontStyle;
    delete obj.fontWeight;
    delete obj.lineHeight;
    delete obj.charSpacing;
    delete obj.textAlign;
    delete obj.underline;
    delete obj.overline;
    delete obj.linethrough;
    delete obj.styles;

    // strip design-time styles (borders, shadows, backgrounds)
    obj.stroke = undefined;
    obj.strokeWidth = 0;
    obj.strokeDashArray = undefined;
    obj.shadow = undefined;
    obj.backgroundColor = undefined;

    // ✅ persist frame + fit under `data` (Fabric preserves `data`)
    obj.data = {
        ...(obj.data || {}),
        __frame: {left: frameLeft, top: frameTop, width: frameWidth, height: frameHeight},
        objectFit: String(fit).toLowerCase(), // "contain" | "cover"
    };

    // legacy fallback (kept for older loaders; harmless otherwise)
    (obj as any)._frameLeft = frameLeft;
    (obj as any)._frameTop = frameTop;
    (obj as any)._frameW = frameWidth;
    (obj as any)._frameH = frameHeight;

    // restore transforms
    obj.left = frameLeft;
    obj.top = frameTop;
    obj.angle = angle;
    obj.flipX = flipX;
    obj.flipY = flipY;
    obj.opacity = opacity;
    obj.clipPath = clipPath;
}


/* ------------------------- Public API ------------------------- */
export async function replaceCoverImages(
    designJson: any,
    report?: Partial<Report> | null,
    organization?: Organization | null,
    inspector?: Profile | null
): Promise<any> {
    const json =
        typeof designJson === "string"
            ? JSON.parse(designJson)
            : JSON.parse(JSON.stringify(designJson));

    const ctx = {
        organization: normalizeOrg(organization ?? null),
        inspector: normalizeInspector(inspector ?? null),
        report: report ?? null,
    };

    // Hoist alt image props first
    if (Array.isArray(json.objects)) json.objects.forEach(hoistAltImageProps);
    else if (Array.isArray(json.canvas?.objects)) json.canvas.objects.forEach(hoistAltImageProps);

    // Background image (string or object) – token substitute & resolve
    if (json.backgroundImage) {
        if (typeof json.backgroundImage === "string") {
            json.backgroundImage = {src: json.backgroundImage};
        }
        if (typeof json.backgroundImage === "object" && typeof json.backgroundImage.src === "string") {
            json.backgroundImage.src = replaceTokensKeepUnresolved(json.backgroundImage.src, ctx);
            if (json.backgroundImage.src.indexOf("{{") === -1 && json.backgroundImage.src.trim() !== "") {
                const nextBg = await resolveSrc(json.backgroundImage.src);
                if (nextBg) {
                    json.backgroundImage.src = nextBg;
                    json.backgroundImage.crossOrigin = json.backgroundImage.crossOrigin ?? "anonymous";
                } else {
                    delete json.backgroundImage;
                }
            } else {
                delete json.backgroundImage;
            }
        }
    }

    const rootObjects = Array.isArray(json.objects)
        ? json.objects
        : Array.isArray(json.canvas?.objects)
            ? json.canvas.objects
            : null;

    const stats: Stats = {total: 0, resolved: 0, missing: 0, converted: 0, examples: []};
    if (rootObjects) {
        for (const o of rootObjects) await processObject(o, ctx, stats);
    }

    if (typeof window !== "undefined") {
        // eslint-disable-next-line no-console
        console.log(
            `[replaceCoverImages] images total=${stats.total}, resolved=${stats.resolved}, ` +
            `missing=${stats.missing}, converted(text->image)=${stats.converted} | ` +
            `textSeen=${stats.textSeen ?? 0}, tokenOnly=${stats.tokenOnlySeen ?? 0}, urlInText=${stats.urlInTextSeen ?? 0}`,
            stats.examples.length ? `examples: ${stats.examples.join(" | ")}` : ""
        );
    }
    console.log(json);
    return json;

}

