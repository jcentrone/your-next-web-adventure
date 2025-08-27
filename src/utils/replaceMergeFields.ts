import type { Organization, Profile } from "@/integrations/supabase/organizationsApi";
import type { Report } from "@/lib/reportSchemas";

interface MergeData {
  organization?: Organization | null;
  inspector?: Profile | null;
  report?: Partial<Report> | null;
}

interface SectionLike {
  key?: string;
  info?: Record<string, unknown>;
}

export function replaceMergeFields(text: string, { organization, inspector, report }: MergeData) {
  if (!text) return "";

  const reportRecord = report as Record<string, unknown> | null;
  const sections = reportRecord?.sections as SectionLike[] | undefined;
  const reportDetails = sections?.find((s) => s.key === "report_details")?.info || {};

  const reportData = reportRecord?.reportData as Record<string, unknown> | undefined;

  const rawReplacements: Record<string, string | null | undefined> = {
    "{{organization.name}}": organization?.name,
    "{{organization.address}}": organization?.address,
    "{{organization.phone}}": organization?.phone,
    "{{organization.email}}": organization?.email,
    "{{inspector.name}}": inspector?.full_name,
    "{{inspector.license_number}}": inspector?.license_number,
    "{{inspector.phone}}": inspector?.phone,
    "{{contact.name}}": (reportRecord?.clientName as string | undefined),
    "{{contact.address}}": (reportRecord?.address as string | undefined),
    "{{contact.email}}": (reportRecord?.email as string | undefined),
    "{{contact.phone}}":
      (reportRecord?.phoneHome as string | undefined) ||
      (reportRecord?.phoneWork as string | undefined) ||
      (reportRecord?.phoneCell as string | undefined),
    "{{report.inspection_date}}": (reportRecord?.inspectionDate as string | undefined),
    "{{report.weather_conditions}}":
      (reportDetails as Record<string, unknown>).weather_conditions as string | undefined ||
      (reportData?.weather_conditions as string | undefined),
  };

  const replacements: Record<string, string> = {};
  for (const [token, value] of Object.entries(rawReplacements)) {
    if (typeof value === "string" && value !== "") {
      replacements[token] = value;
    }
  }

  return text.replace(/{{[^}]+}}/g, (match) =>
    Object.prototype.hasOwnProperty.call(replacements, match) ? replacements[match] : match
  );
}
