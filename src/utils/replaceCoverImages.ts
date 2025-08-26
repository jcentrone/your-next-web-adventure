import { isSupabaseUrl, getSignedUrlFromSupabaseUrl } from "@/integrations/supabase/storage";
import type { Report } from "@/lib/reportSchemas";

interface FabricObject extends Record<string, unknown> {
  type?: string;
  mergeField?: string;
  src?: string;
  objects?: unknown;
  stroke?: string;
  strokeWidth?: number;
  strokeDashArray?: number[];
  backgroundColor?: string;
}

export async function replaceCoverImages(json: unknown, report: Report) {
  if (!json || !report?.coverImage) return json;
  const url = isSupabaseUrl(report.coverImage)
    ? await getSignedUrlFromSupabaseUrl(report.coverImage)
    : report.coverImage;
  const clone: FabricObject = JSON.parse(JSON.stringify(json));
  const traverse = (obj: unknown): void => {
    if (Array.isArray(obj)) {
      obj.forEach(traverse);
      return;
    }
    if (obj && typeof obj === "object") {
      const o = obj as FabricObject;
      if (o.type === "image" && o.mergeField === "report.coverImage") {
        o.src = url;
        o.stroke = undefined;
        o.strokeWidth = undefined;
        o.strokeDashArray = undefined;
        o.backgroundColor = undefined;
      }
      if (o.objects) traverse(o.objects);
    }
  };
  if (clone.objects) traverse(clone.objects);
  return clone;
}
