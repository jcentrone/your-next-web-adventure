import { supabase } from "./client";
import type { Report } from "@/lib/reportSchemas";

export interface ReportTemplate {
  id: string;
  user_id: string;
  organization_id?: string;
  name: string;
  description?: string;
  report_type: Report["reportType"];
  sections_config: Array<{
    sectionKey: string;
    title: string;
    isCustom: boolean;
    isRequired: boolean;
    sortOrder: number;
  }>;
  fields_config: Record<string, Array<{
    fieldId: string;
    fieldName: string;
    fieldLabel: string;
    widgetType: string;
    options?: string[];
    required: boolean;
    sortOrder: number;
  }>>;
  is_active: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export async function getUserReportTemplates(
  userId: string,
  reportType?: Report["reportType"]
): Promise<ReportTemplate[]> {
  let query = supabase
    .from("user_report_templates")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("is_default", { ascending: false })
    .order("name", { ascending: true });

  if (reportType) {
    query = query.eq("report_type", reportType);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching report templates:", error);
    throw error;
  }

  return (data || []) as ReportTemplate[];
}

export async function createReportTemplate(
  userId: string,
  templateData: {
    name: string;
    description?: string;
    report_type: Report["reportType"];
    sections_config?: ReportTemplate["sections_config"];
    fields_config?: ReportTemplate["fields_config"];
    organization_id?: string;
  }
): Promise<ReportTemplate> {
  const { data, error } = await supabase
    .from("user_report_templates")
    .insert({
      user_id: userId,
      ...templateData,
      sections_config: templateData.sections_config || [],
      fields_config: templateData.fields_config || {},
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating report template:", error);
    throw error;
  }

  return data as ReportTemplate;
}

export async function updateReportTemplate(
  templateId: string,
  updates: Partial<Pick<ReportTemplate, "name" | "description" | "sections_config" | "fields_config" | "is_default">>
): Promise<ReportTemplate> {
  const { data, error } = await supabase
    .from("user_report_templates")
    .update(updates)
    .eq("id", templateId)
    .select()
    .single();

  if (error) {
    console.error("Error updating report template:", error);
    throw error;
  }

  return data as ReportTemplate;
}

export async function deleteReportTemplate(templateId: string): Promise<void> {
  const { error } = await supabase
    .from("user_report_templates")
    .update({ is_active: false })
    .eq("id", templateId);

  if (error) {
    console.error("Error deleting report template:", error);
    throw error;
  }
}

export async function duplicateReportTemplate(
  templateId: string,
  newName: string,
  userId: string
): Promise<ReportTemplate> {
  // First get the template to duplicate
  const { data: original, error: fetchError } = await supabase
    .from("user_report_templates")
    .select("*")
    .eq("id", templateId)
    .single();

  if (fetchError) {
    console.error("Error fetching template to duplicate:", fetchError);
    throw fetchError;
  }

  // Create the duplicate
  const { data, error } = await supabase
    .from("user_report_templates")
    .insert({
      user_id: userId,
      organization_id: original.organization_id,
      name: newName,
      description: original.description,
      report_type: original.report_type,
      sections_config: original.sections_config,
      fields_config: original.fields_config,
      is_default: false, // Duplicates are never default
    })
    .select()
    .single();

  if (error) {
    console.error("Error duplicating report template:", error);
    throw error;
  }

  return data as ReportTemplate;
}

export const reportTemplatesApi = {
  getUserReportTemplates,
  createReportTemplate,
  updateReportTemplate,
  deleteReportTemplate,
  duplicateReportTemplate,
};