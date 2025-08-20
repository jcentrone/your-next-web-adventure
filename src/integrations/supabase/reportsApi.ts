
import { supabase } from "@/integrations/supabase/client";
import { activitiesApi } from "@/integrations/supabase/crmApi";
import { SOP_SECTIONS } from "@/constants/sop";
import { Report, ReportSchema, Section } from "@/lib/reportSchemas";

type ReportListItem = {
  id: string;
  title: string;
  clientName: string;
  inspectionDate: string;
  status: "Draft" | "Final";
  reportType: "home_inspection" | "wind_mitigation";
  archived?: boolean;
};

function toDbPayload(report: Report) {
  return {
    title: report.title,
    client_name: report.clientName,
    address: report.address,
    inspection_date: report.inspectionDate.slice(0, 10), // 'YYYY-MM-DD'
    status: report.status,
    final_comments: report.finalComments || null,
    cover_image: report.coverImage || null,
    preview_template: report.previewTemplate || 'classic',
    report_type: report.reportType,
  };
}

function fromDbRow(row: any): Report {
  const reportType = row.report_type || "home_inspection";

  let base: any = {
    id: row.id,
    title: row.title,
    clientName: row.client_name,
    address: row.address,
    inspectionDate: new Date(`${row.inspection_date}T00:00:00Z`).toISOString(),
    status: row.status,
    finalComments: row.final_comments || "",
    coverImage: row.cover_image || "",
    previewTemplate: row.preview_template || "classic",
    reportType,
  };

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
      inspectorComments: "",
    };
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
  reportType: "home_inspection" | "wind_mitigation";
}, userId: string, organizationId?: string): Promise<Report> {
  const id = crypto.randomUUID();

  let report: Report;

  if (meta.reportType === "home_inspection") {
    const sections: Section[] = SOP_SECTIONS.map((s, idx) => ({
      id: `${id}-sec-${idx + 1}`,
      key: s.key as any,
      title: s.name,
      findings: [],
    }));

    report = {
      id,
      title: meta.title,
      clientName: meta.clientName,
      address: meta.address,
      inspectionDate: new Date(meta.inspectionDate).toISOString(),
      status: "Draft",
      finalComments: "",
      coverImage: "",
      previewTemplate: "classic",
      reportType: "home_inspection",
      sections,
    };
  } else {
    // Wind mitigation report
    report = {
      id,
      title: meta.title,
      clientName: meta.clientName,
      address: meta.address,
      inspectionDate: new Date(meta.inspectionDate).toISOString(),
      status: "Draft",
      finalComments: "",
      coverImage: "",
      previewTemplate: "classic",
      reportType: "wind_mitigation",
      reportData: {
        "1_building_code": {},
        "2_roof_covering": {},
        "3_roof_deck_attachment": {},
        "4_roof_to_wall_attachment": {},
        "5_roof_geometry": {},
        "6_secondary_water_resistance": {},
        "7_opening_protection": {},
        inspectorComments: "",
      },
    };
  }

  const payload = {
    user_id: userId,
    organization_id: organizationId || null,
    contact_id: meta.contact_id || null,
    ...toDbPayload(report),
    report_type: meta.reportType,
    report_data: report.reportType === "wind_mitigation" ? report.reportData : null,
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
      title: `Created ${meta.reportType === 'wind_mitigation' ? 'Wind Mitigation' : 'Home Inspection'} report: ${meta.title}`,
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
  let selectQuery = "id,title,client_name,inspection_date,status,archived,report_type";
  
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
  }));
}

export async function dbGetReport(id: string): Promise<Report | null> {
  const { data, error } = await (supabase as any)
    .from("reports")
    .select("*")
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
  const payload = toDbPayload(report);
  const { data, error } = await (supabase as any)
    .from("reports")
    .update(payload)
    .eq("id", report.id)
    .select("*")
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
