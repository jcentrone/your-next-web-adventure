import { supabase } from "./client";

export interface CustomReportType {
  id: string;
  user_id: string;
  organization_id?: string;
  name: string;
  description?: string;
  icon_name: string;
  category: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export async function getCustomReportTypes(userId: string): Promise<CustomReportType[]> {
  const { data, error } = await supabase
    .from('custom_report_types')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('name');

  if (error) {
    console.error('Error fetching custom report types:', error);
    throw error;
  }

  return data || [];
}

export async function createCustomReportType(
  userId: string,
  reportTypeData: {
    name: string;
    description?: string;
    icon_name?: string;
    category?: string;
    organization_id?: string;
  }
): Promise<CustomReportType> {
  const { data, error } = await supabase
    .from('custom_report_types')
    .insert({
      user_id: userId,
      name: reportTypeData.name,
      description: reportTypeData.description,
      icon_name: reportTypeData.icon_name || 'FileText',
      category: reportTypeData.category || 'custom',
      organization_id: reportTypeData.organization_id
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating custom report type:', error);
    throw error;
  }

  return data;
}

export async function updateCustomReportType(
  typeId: string,
  updates: Partial<Pick<CustomReportType, "name" | "description" | "icon_name" | "category">>
): Promise<CustomReportType> {
  const { data, error } = await supabase
    .from('custom_report_types')
    .update(updates)
    .eq('id', typeId)
    .select()
    .single();

  if (error) {
    console.error('Error updating custom report type:', error);
    throw error;
  }

  return data;
}

export async function deleteCustomReportType(typeId: string): Promise<void> {
  const { error } = await supabase
    .from('custom_report_types')
    .update({ is_active: false })
    .eq('id', typeId);

  if (error) {
    console.error('Error deleting custom report type:', error);
    throw error;
  }
}

export const customReportTypesApi = {
  getCustomReportTypes,
  createCustomReportType,
  updateCustomReportType,
  deleteCustomReportType,
};