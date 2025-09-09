
import { supabase } from "@/integrations/supabase/client";
import { activitiesApi } from "@/integrations/supabase/crmApi";
import { SOP_SECTIONS } from "@/constants/sop";
import { Report, ReportSchema, Section } from "@/lib/reportSchemas";
import type { ReportTemplate } from "@/integrations/supabase/reportTemplatesApi";
import { REPORT_TYPE_LABELS } from "@/constants/reportTypes";

type ReportListItem = {
  id: string;
  title: string;
  clientName: string;
  inspectionDate: string;
  status: "Draft" | "Final";
  reportType: Report["reportType"];
  archived?: boolean;
  address?: string;
  tags?: string[];
};

function toDbPayload(report: Report) {
  return {
    title: report.title,
    client_name: report.clientName,
    address: report.address,
    inspection_date: report.inspectionDate.slice(0, 10), // 'YYYY-MM-DD'
    status: report.status,
    final_comments: report.finalComments || null,
    terms_html: (report as any).termsHtml || null,
    agreement_id: (report as any).agreementId || null,
    cover_image: report.coverImage || null,
    cover_template: report.coverTemplate || 'templateOne',
    preview_template: report.previewTemplate || 'classic',
    color_scheme: report.colorScheme || 'default',
    custom_colors: report.customColors || null,
    report_type: report.reportType,
    report_data: report.reportType === "home_inspection" ? null : (report as any).reportData || null,
    contact_id: (report as any).contactId || null,
    contact_ids: (report as any).contactIds || [],
    tags: (report as any).tags || [],
    county: (report as any).county || null,
    ofStories: (report as any).ofStories || null,
    phone_home: (report as any).phoneHome || null,
    phone_work: (report as any).phoneWork || null,
    phone_cell: (report as any).phoneCell || null,
    insurance_company: (report as any).insuranceCompany || null,
    policy_number: (report as any).policyNumber || null,
    email: (report as any).email || null,
  };
}

function fromDbRow(row: any): Report {
  const reportType = row.report_type || "home_inspection";

  // Transform old cover template names to new format
  const transformCoverTemplate = (template: string): string => {
    if (!template) return "templateOne";
    
    // Convert "CoverTemplateXxx" to "templateXxx"
    if (template.startsWith("CoverTemplate")) {
      const suffix = template.replace("CoverTemplate", "");
      return `template${suffix}`;
    }
    
    return template;
  };

  let base: any = {
    id: row.id,
    title: row.title,
    clientName: row.client_name,
    address: row.address,
    county: row.county || "",
    ofStories: row.ofStories || "",
    inspectionDate: new Date(`${row.inspection_date}T00:00:00Z`).toISOString(),
    status: row.status,
    finalComments: row.final_comments || "",
    termsHtml: row.terms_html ?? undefined,
    agreementId: row.agreement_id || undefined,
    coverImage: row.cover_image || "",
    coverTemplate: transformCoverTemplate(row.cover_template || "templateOne"),
    previewTemplate: row.preview_template || "classic",
    colorScheme: row.color_scheme || "default",
    customColors: row.custom_colors || undefined,
    contactId: row.contact_id || undefined,
    contactIds: row.contact_ids || [],
    tags: row.tags || [],
    reportData: row.report_data ?? {},
    reportType,
    phoneHome: row.phone_home || "",
    phoneWork: row.phone_work || "",
    phoneCell: row.phone_cell || "",
    insuranceCompany: row.insurance_company || "",
    policyNumber: row.policy_number || "",
    email: row.email || "",
    // includeStandardsOfPractice: removed as not in DB schema
  };

  const shareTokenRow = row.report_shares?.find(
    (s: any) => !s.expires_at || new Date(s.expires_at) > new Date()
  );
  if (shareTokenRow) {
    base.shareToken = shareTokenRow.token;
  }

  if (reportType === "home_inspection") {
    // Clean up sections data to ensure media objects have required fields
    const cleanSections = (row.sections || []).map((section: any) => ({
      ...section,
      findings: (section.findings || []).map((finding: any) => ({
        ...finding,
        media: (finding.media || []).map((media: any) => {
          // Ensure each media item has required fields with fallbacks
          const cleanMedia = {
            id: media.id || crypto.randomUUID(),
            url: media.url || "",
            caption: media.caption || "",
            type: media.type || inferMediaType(media.url) || "image",
          };
          return cleanMedia;
        }),
      })),
    }));

    base.sections = cleanSections;
  } else if (reportType === "wind_mitigation") {
    base.reportData = row.report_data || {
      "1_building_code": {},
      "2_roof_covering": {},
      "3_roof_deck_attachment": {},
      "4_roof_to_wall_attachment": {},
      "5_roof_geometry": {},
      "6_secondary_water_resistance": {},
      "7_opening_protection": {},
    };

    // Normalize opening protection data - older reports may store single string values
    const openingProtection =
      base.reportData?.["7_opening_protection"]?.openingProtection;
    if (openingProtection && typeof openingProtection === "object") {
      for (const key of Object.keys(openingProtection)) {
        const value = openingProtection[key];
        if (typeof value === "string") {
          openingProtection[key] = {
            NA: false,
            A: false,
            B: false,
            C: false,
            D: false,
            N: false,
            X: false,
            [value]: true,
          };
        }
      }
    }
  }
  
  const parsed = ReportSchema.safeParse(base);
  if (!parsed.success) {
    console.error("Failed to parse report from DB", parsed.error, base);
    throw new Error("Invalid report data from database");
  }
  return parsed.data;
}

function inferMediaType(url: string): "image" | "video" | "audio" {
  if (!url) return "image";
  
  const lowerUrl = url.toLowerCase();
  
  // Check for image extensions or blob URLs (often images)
  if (lowerUrl.includes('.png') || lowerUrl.includes('.jpg') || lowerUrl.includes('.jpeg') || 
      lowerUrl.includes('.gif') || lowerUrl.includes('.webp') || lowerUrl.includes('.svg') ||
      lowerUrl.startsWith('blob:')) {
    return "image";
  }
  
  // Check for video extensions
  if (lowerUrl.includes('.mp4') || lowerUrl.includes('.webm') || lowerUrl.includes('.mov') ||
      lowerUrl.includes('.avi') || lowerUrl.includes('.mkv')) {
    return "video";
  }
  
  // Check for audio extensions
  if (lowerUrl.includes('.mp3') || lowerUrl.includes('.wav') || lowerUrl.includes('.ogg') ||
      lowerUrl.includes('.m4a') || lowerUrl.includes('.flac')) {
    return "audio";
  }
  
  // Default to image
  return "image";
}

export async function dbCreateReport(meta: {
  title: string;
  clientName: string;
  address: string;
  inspectionDate: string; // 'YYYY-MM-DD' or ISO
  contact_id?: string;
  contactIds?: string[];
  appointment_id?: string;
  reportType: Report["reportType"];
  county?: string;
  ofStories?: string;
  phoneHome?: string;
  phoneWork?: string;
  phoneCell?: string;
  insuranceCompany?: string;
  policyNumber?: string;
  email?: string;
  includeStandardsOfPractice?: boolean;
  tags?: string[];
  template?: ReportTemplate | null;
}, userId: string, organizationId?: string): Promise<Report> {
  const id = crypto.randomUUID();

  let report: Report;

  if (meta.reportType === "home_inspection") {
    let sections: Section[];
    if (meta.template?.sections_config && meta.template.sections_config.length > 0) {
      const fieldsConfig = meta.template.fields_config || {};
      sections = meta.template.sections_config.map((cfg, idx) => ({
        id: `${id}-sec-${idx + 1}`,
        key: cfg.sectionKey as any,
        title: cfg.title,
        findings: [],
        info: Object.fromEntries(
          (fieldsConfig[cfg.sectionKey] || []).map(f => [f.fieldName, ""])
        ),
      }));
    } else {
      sections = SOP_SECTIONS.map((s, idx) => ({
        id: `${id}-sec-${idx + 1}`,
        key: s.key as any,
        title: s.name,
        findings: [],
      }));
    }

    report = {
      id,
      title: meta.title,
      clientName: meta.clientName,
      address: meta.address,
      county: meta.county || "",
      ofStories: meta.ofStories || "",
      inspectionDate: new Date(meta.inspectionDate).toISOString(),
      status: "Draft",
      finalComments: "",
      coverImage: "",
      coverTemplate: "templateOne",
      previewTemplate: "classic",
      reportType: "home_inspection",
      tags: meta.tags || [],
      sections,
      // includeStandardsOfPractice: removed as not in DB schema
    };
  } else if (meta.reportType === "wind_mitigation") {
    // Wind mitigation report
    report = {
      id,
      title: meta.title,
      clientName: meta.clientName,
      address: meta.address,
      county: meta.county || "",
      ofStories: meta.ofStories || "",
      inspectionDate: new Date(meta.inspectionDate).toISOString(),
      status: "Draft",
      finalComments: "",
      coverImage: "",
      coverTemplate: "templateOne",
      previewTemplate: "classic",
      reportType: "wind_mitigation",
      phoneHome: meta.phoneHome || "",
      phoneWork: meta.phoneWork || "",
      phoneCell: meta.phoneCell || "",
      insuranceCompany: meta.insuranceCompany || "",
      policyNumber: meta.policyNumber || "",
      email: meta.email || "",
      tags: meta.tags || [],
      reportData: {
        "1_building_code": {},
        "2_roof_covering": {},
        "3_roof_deck_attachment": {},
        "4_roof_to_wall_attachment": {},
        "5_roof_geometry": {},
        "6_secondary_water_resistance": {},
        "7_opening_protection": {},
      },
    };
  } else {
    // Generic report type with free-form data
    report = {
      id,
      title: meta.title,
      clientName: meta.clientName,
      address: meta.address,
      county: meta.county || "",
      ofStories: meta.ofStories || "",
      inspectionDate: new Date(meta.inspectionDate).toISOString(),
      status: "Draft",
      finalComments: "",
      coverImage: "",
      coverTemplate: "templateOne",
      previewTemplate: "classic",
      reportType: meta.reportType,
      clientPhone: meta.phoneHome || "",
      clientEmail: meta.email || "",
      tags: meta.tags || [],
      reportData: {},
    };
  }

  // If linked to an appointment, fetch agreement terms
  if (meta.appointment_id) {
    try {
      const { data: appt } = await supabase
        .from("appointments")
        .select("agreement_id")
        .eq("id", meta.appointment_id)
        .maybeSingle();
      if (appt?.agreement_id) {
        (report as any).agreementId = appt.agreement_id;
        const { data: agreement } = await supabase
          .from("inspection_agreements")
          .select("agreement_html")
          .eq("id", appt.agreement_id)
          .maybeSingle();
        if (agreement?.agreement_html) {
          (report as any).termsHtml = agreement.agreement_html;
        }
      }
    } catch (err) {
      console.error("Failed to attach agreement terms to report:", err);
    }
  }

  const payload = {
    user_id: userId,
    organization_id: organizationId || null,
    contact_id: meta.contact_id || null,
    ...toDbPayload(report),
    report_type: meta.reportType,
    report_data: report.reportType === "home_inspection" ? null : report.reportData,
    sections: report.reportType === "home_inspection" ? report.sections : null,
    id, // preserve generated id so local and remote stay aligned
  };

  const { data, error } = await (supabase as any)
    .from("reports")
    .insert([payload])
    .select("*")
    .single();

  if (error) {
    console.error("dbCreateReport error", error);
    throw error;
  }

  // Track activity
  try {
    await activitiesApi.trackActivity({
      userId,
      activity_type: 'report_created',
      title: `Created ${REPORT_TYPE_LABELS[meta.reportType] || meta.reportType} report: ${meta.title}`,
      description: `Report for ${meta.clientName} at ${meta.address}`,
      report_id: data.id,
      contact_id: meta.contact_id,
      organization_id: organizationId,
    });
  } catch (activityError) {
    console.warn('Failed to track report creation activity:', activityError);
  }

  return fromDbRow(data);
}

export async function dbListReports(userId: string, includeArchived: boolean = false): Promise<ReportListItem[]> {
  const selectQuery = "id,title,client_name,address,inspection_date,status,archived,report_type,tags";
  
  const query = supabase
    .from("reports")
    .select(selectQuery)
    .eq("user_id", userId);
  
  // If not including archived, filter them out
  if (!includeArchived) {
    query.eq("archived", false);
  }
  
  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) {
    console.error("dbListReports error", error);
    throw error;
  }

  return (data || []).map((r: any) => ({
    id: r.id,
    title: r.title,
    clientName: r.client_name,
    inspectionDate: new Date(`${r.inspection_date}T00:00:00Z`).toISOString(),
    status: r.status,
    archived: r.archived || false,
    reportType: r.report_type || "home_inspection",
    address: r.address || "",
    tags: r.tags || [],
  }));
}

export async function dbGetReport(id: string): Promise<Report | null> {
  const { data, error } = await (supabase as any)
    .from("reports")
    .select("*, report_shares(token, expires_at)")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116" /* No rows */) return null;
    console.error("dbGetReport error", error);
    throw error;
  }
  return fromDbRow(data);
}

export async function dbUpdateReport(report: Report): Promise<Report> {
  const payload = {
    ...toDbPayload(report),
    // Include sections for home inspection reports
    sections: report.reportType === "home_inspection" ? (report as any).sections : null,
  };
  
  console.log("dbUpdateReport payload", payload);
  const { data, error } = await (supabase as any)
    .from("reports")
    .update(payload)
    .eq("id", report.id)
    .select("*, report_shares(token, expires_at)")
    .single();

  if (error) {
    console.error("dbUpdateReport error", error);
    throw error;
  }
  return fromDbRow(data);
}

export async function dbDeleteReport(id: string): Promise<void> {
  const { error } = await (supabase as any).from("reports").delete().eq("id", id);
  if (error) {
    console.error("dbDeleteReport error", error);
    throw error;
  }
}

export async function dbArchiveReport(id: string, archived: boolean = true): Promise<void> {
  const { error } = await supabase
    .from("reports")
    .update({ archived })
    .eq("id", id);
  
  if (error) {
    console.error("dbArchiveReport error", error);
    throw error;
  }
}

export async function dbGetReportsByContactId(contactId: string): Promise<any[]> {
  const { data, error } = await supabase
    .from("reports")
    .select("id, title, client_name, address, inspection_date, status, created_at")
    .eq("contact_id", contactId)
    .eq("archived", false) // Only show non-archived reports in contact view
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []).map((r: any) => ({
    id: r.id,
    title: r.title,
    clientName: r.client_name,
    address: r.address,
    inspection_date: r.inspection_date,
    status: r.status,
  }));
}

export const reportsApi = {
  dbCreateReport,
  dbListReports,
  dbGetReport,
  dbUpdateReport,
  dbDeleteReport,
  dbArchiveReport,
  getByContactId: dbGetReportsByContactId,
};
