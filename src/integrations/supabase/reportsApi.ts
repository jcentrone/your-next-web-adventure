
import { supabase } from "@/integrations/supabase/client";
import { SOP_SECTIONS } from "@/constants/sop";
import { Report, ReportSchema, Section } from "@/lib/reportSchemas";

type ReportListItem = Pick<Report, "id" | "title" | "clientName" | "inspectionDate" | "status">;

function toDbPayload(report: Report) {
  return {
    title: report.title,
    client_name: report.clientName,
    address: report.address,
    inspection_date: report.inspectionDate.slice(0, 10), // 'YYYY-MM-DD'
    status: report.status,
    final_comments: report.finalComments || null,
    sections: report.sections,
  };
}

function fromDbRow(row: any): Report {
  const base: Report = {
    id: row.id,
    title: row.title,
    clientName: row.client_name,
    address: row.address,
    inspectionDate: new Date(`${row.inspection_date}T00:00:00Z`).toISOString(),
    status: row.status,
    finalComments: row.final_comments || "",
    sections: (row.sections || []) as Section[],
  };
  const parsed = ReportSchema.safeParse(base);
  if (!parsed.success) {
    console.error("Failed to parse report from DB", parsed.error, base);
    throw new Error("Invalid report data from database");
  }
  return parsed.data;
}

export async function dbCreateReport(meta: {
  title: string;
  clientName: string;
  address: string;
  inspectionDate: string; // 'YYYY-MM-DD' or ISO
}, userId: string): Promise<Report> {
  const id = crypto.randomUUID();
  const sections: Section[] = SOP_SECTIONS.map((s, idx) => ({
    id: `${id}-sec-${idx + 1}`,
    key: s.key as any,
    title: s.name,
    findings: [],
  }));

  const report: Report = {
    id,
    title: meta.title,
    clientName: meta.clientName,
    address: meta.address,
    inspectionDate: new Date(meta.inspectionDate).toISOString(),
    status: "Draft",
    finalComments: "",
    sections,
  };

  const payload = {
    user_id: userId,
    ...toDbPayload(report),
    sections,
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

  return fromDbRow(data);
}

export async function dbListReports(userId: string): Promise<ReportListItem[]> {
  const { data, error } = await (supabase as any)
    .from("reports")
    .select("id,title,client_name,inspection_date,status")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

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
