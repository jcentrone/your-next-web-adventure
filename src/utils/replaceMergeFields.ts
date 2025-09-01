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

export const MERGE_FIELD_MAP = {
  "{{organization.name}}": "Organization name",
  "{{organization.address}}": "Organization address",
  "{{organization.phone}}": "Organization phone",
  "{{organization.email}}": "Organization email",
  "{{inspector.name}}": "Inspector name",
  "{{inspector.license_number}}": "Inspector license number",
  "{{inspector.phone}}": "Inspector phone",
  "{{contact.name}}": "Contact name",
  "{{contact.address}}": "Contact address",
  "{{contact.email}}": "Contact email",
  "{{contact.phone}}": "Contact phone",
  "{{report.inspection_date}}": "Report inspection date",
  "{{report.weather_conditions}}": "Report weather conditions",
} as const;

export const MERGE_FIELDS = Object.keys(MERGE_FIELD_MAP) as (keyof typeof MERGE_FIELD_MAP)[];

export function replaceMergeFields(text: string, { organization, inspector, report }: MergeData) {
  if (!text) return "";

  const reportRecord = report as Record<string, unknown> | null;
  const sections = reportRecord?.sections as SectionLike[] | undefined;
  const reportDetails = sections?.find((s) => s.key === "report_details")?.info || {};

  const reportData = reportRecord?.reportData as Record<string, unknown> | undefined;

  const rawReplacements: Record<(typeof MERGE_FIELDS)[number], string | null | undefined> = {
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
