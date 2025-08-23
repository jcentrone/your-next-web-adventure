import type { Organization, Profile } from "@/integrations/supabase/organizationsApi";
import type { Report } from "@/lib/reportSchemas";

interface MergeData {
  organization?: Organization | null;
  inspector?: Profile | null;
  report?: Partial<Report> | null;
}

export function replaceMergeFields(text: string, { organization, inspector, report }: MergeData) {
  if (!text) return "";

  const replacements: Record<string, string> = {
    "{{organization.name}}": organization?.name ?? "",
    "{{organization.address}}": organization?.address ?? "",
    "{{organization.phone}}": organization?.phone ?? "",
    "{{organization.email}}": organization?.email ?? "",
    "{{inspector.name}}": inspector?.full_name ?? "",
    "{{inspector.license_number}}": inspector?.license_number ?? "",
    "{{inspector.phone}}": inspector?.phone ?? "",
    "{{contact.name}}": report?.clientName ?? "",
    "{{contact.address}}": report?.address ?? "",
    "{{contact.email}}": (report as any)?.email ?? "",
    "{{contact.phone}}":
      (report as any)?.phoneHome || (report as any)?.phoneWork || (report as any)?.phoneCell || "",
  };

  return text.replace(/{{[^}]+}}/g, (match) => replacements[match] ?? "");
}
