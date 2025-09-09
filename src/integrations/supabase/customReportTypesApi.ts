import { supabase } from "./client";

export interface CustomReportType {
  id: string;
  user_id: string;
  organization_id?: string | null;
  name: string;
  description?: string | null;
  icon_name?: string | null;
  category?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

async function create(userId: string, data: { id: string; name: string; description?: string; icon_name?: string; category?: string; organization_id?: string; }): Promise<CustomReportType> {
  const { data: result, error } = await supabase
    .from("custom_report_types")
    .insert({
      id: data.id,
      user_id: userId,
      organization_id: data.organization_id,
      name: data.name,
      description: data.description,
      icon_name: data.icon_name,
      category: data.category,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating custom report type:", error);
    throw error;
  }

  return result as CustomReportType;
}

export const customReportTypesApi = {
  create,
};

