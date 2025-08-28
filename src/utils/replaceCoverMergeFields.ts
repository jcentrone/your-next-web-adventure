// utils/replaceCoverMergeFields.ts
import get from "lodash.get";

/**
 * Replace {{path.to.value}} placeholders in a Fabric JSON design.
 * - Walks all objects (including nested groups)
 * - Rewrites `text` and any string props inside `metadata.replaceableProps` if provided
 * - Silently falls back to '' when a path is missing
 */
type MergeCtx = {
  organization: any | null;
  inspector: any | null;
  report: any | null;
};

const TOKEN_RE = /\{\{\s*([^\}]+?)\s*\}\}/g;

function replaceInString(str: string, ctx: MergeCtx): string {
  return str.replace(TOKEN_RE, (_m, path) => {
    const val = get(ctx, path.trim(), "");
    // stringify non-strings safely
    if (val === null || val === undefined) return "";
    return typeof val === "string" ? val : String(val);
  });
}

function walkObjects(objs: any[], ctx: MergeCtx) {
  for (const obj of objs) {
    // 1) Replace common textual fields
    if (typeof obj.text === "string") obj.text = replaceInString(obj.text, ctx);
    if (typeof obj.caption === "string") obj.caption = replaceInString(obj.caption, ctx);

    // 2) Optional: allow authors to declare extra props to run replacements on
    // e.g., in the designer, set object.metadata = { replaceableProps: ["customLabel"] }
    if (obj.metadata && Array.isArray(obj.metadata.replaceableProps)) {
      for (const prop of obj.metadata.replaceableProps) {
        if (typeof obj[prop] === "string") obj[prop] = replaceInString(obj[prop], ctx);
      }
    }

    // 3) Recurse into groups (Fabric puts children under `objects` for groups)
    if (Array.isArray(obj.objects)) {
      walkObjects(obj.objects, ctx);
    }
  }
}

/**
 * Accepts the parsed Fabric JSON (object or stringified JSON OK).
 * Returns a deep-cloned, placeholder-replaced JSON ready for loadFromJSON.
 */
export async function replaceCoverMergeFields(
  designJson: any,
  ctx: MergeCtx
): Promise<any> {
  const json = typeof designJson === "string" ? JSON.parse(designJson) : JSON.parse(JSON.stringify(designJson));

  // Fabric root usually has `objects`; sometimes nested under `canvas` in exports—cover both.
  const rootObjects =
    Array.isArray(json.objects)
      ? json.objects
      : Array.isArray(json.canvas?.objects)
      ? json.canvas.objects
      : null;

  if (!rootObjects) return json;

  // Optional: also replace top-level strings like `backgroundImage.src` captions, etc.
  if (typeof json.title === "string") json.title = replaceInString(json.title, ctx);

  walkObjects(rootObjects, {
    // normalize a few common aliases so {{organization.phone}} works even if your API returns phone_number
    organization: normalizeOrg(ctx.organization),
    inspector: normalizeInspector(ctx.inspector),
    report: ctx.report,
  });

  return json;
}

function normalizeOrg(org: any) {
  if (!org) return org;
  const phone = org.phone ?? org.phone_number ?? org.primary_phone ?? "";
  const email = org.email ?? org.primary_email ?? "";
  const name = org.name ?? org.organization_name ?? org.company_name ?? "";
  return { ...org, phone, email, name };
}

function normalizeInspector(inspector: any) {
  if (!inspector) return inspector;
  const phone = inspector.phone ?? inspector.phone_number ?? "";
  const email = inspector.email ?? "";
  const name = inspector.name ?? inspector.full_name ?? `${inspector.first_name ?? ""} ${inspector.last_name ?? ""}`.trim();
  return { ...inspector, phone, email, name };
}
