import { isSupabaseUrl, getSignedUrlFromSupabaseUrl } from "@/integrations/supabase/storage";
import type { Report } from "@/lib/reportSchemas";
import type { Organization } from "@/integrations/supabase/organizationsApi";

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

export async function replaceCoverImages(
  json: unknown,
  report: Report,
  organization?: Organization | null,
) {
  if (!json) return json;
  const coverUrl = report.coverImage
    ? isSupabaseUrl(report.coverImage)
      ? await getSignedUrlFromSupabaseUrl(report.coverImage)
      : report.coverImage
    : null;
  const logoUrl = organization?.logo_url
    ? isSupabaseUrl(organization.logo_url)
      ? await getSignedUrlFromSupabaseUrl(organization.logo_url)
      : organization.logo_url
    : null;
  const clone: FabricObject = JSON.parse(JSON.stringify(json));
  const traverse = async (obj: unknown): Promise<void> => {
    if (Array.isArray(obj)) {
      await Promise.all(obj.map((item) => traverse(item)));
      return;
    }
    if (obj && typeof obj === "object") {
      const o = obj as FabricObject;
      if (o.type === "image") {
        if (o.mergeField === "report.coverImage" && coverUrl) {
          o.src = coverUrl;
          o.stroke = undefined;
          o.strokeWidth = undefined;
          o.strokeDashArray = undefined;
          o.backgroundColor = undefined;
        }
        if (o.mergeField === "organization.logoUrl" && logoUrl) {
          o.src = logoUrl;
          o.stroke = undefined;
          o.strokeWidth = undefined;
          o.strokeDashArray = undefined;
          o.backgroundColor = undefined;
        }
        if (o.src && isSupabaseUrl(o.src)) {
          o.src = await getSignedUrlFromSupabaseUrl(o.src);
        }
      }
      if (o.objects) await traverse(o.objects);
    }
  };
  if (clone.objects) await traverse(clone.objects);
  return clone;
}
