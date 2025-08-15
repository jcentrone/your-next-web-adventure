import { supabase } from "./client";

export interface CustomField {
  id: string;
  user_id: string;
  organization_id?: string;
  section_key: string;
  field_name: string;
  field_label: string;
  widget_type: "text" | "textarea" | "select" | "multiselect" | "date" | "contact_lookup";
  options: string[];
  required: boolean;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export async function getUserCustomFields(
  userId: string,
  sectionKey?: string
): Promise<CustomField[]> {
  let query = supabase
    .from("user_custom_fields")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (sectionKey) {
    query = query.eq("section_key", sectionKey);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching custom fields:", error);
    throw error;
  }

  return (data || []) as CustomField[];
}

export async function createCustomField(
  userId: string,
  fieldData: {
    section_key: string;
    field_name: string;
    field_label: string;
    widget_type: CustomField["widget_type"];
    options?: string[];
    required?: boolean;
    organization_id?: string;
  }
): Promise<CustomField> {
  // Get the next sort order
  const { data: existingFields } = await supabase
    .from("user_custom_fields")
    .select("sort_order")
    .eq("user_id", userId)
    .eq("section_key", fieldData.section_key)
    .order("sort_order", { ascending: false })
    .limit(1);

  const nextSortOrder = existingFields?.[0]?.sort_order ? existingFields[0].sort_order + 1 : 1;

  const { data, error } = await supabase
    .from("user_custom_fields")
    .insert({
      user_id: userId,
      ...fieldData,
      options: fieldData.options || [],
      required: fieldData.required || false,
      sort_order: nextSortOrder,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating custom field:", error);
    throw error;
  }

  return data as CustomField;
}

export async function updateCustomField(
  fieldId: string,
  updates: Partial<Pick<CustomField, "field_label" | "widget_type" | "options" | "required" | "sort_order">>
): Promise<CustomField> {
  const { data, error } = await supabase
    .from("user_custom_fields")
    .update(updates)
    .eq("id", fieldId)
    .select()
    .single();

  if (error) {
    console.error("Error updating custom field:", error);
    throw error;
  }

  return data as CustomField;
}

export async function deleteCustomField(fieldId: string): Promise<void> {
  const { error } = await supabase
    .from("user_custom_fields")
    .update({ is_active: false })
    .eq("id", fieldId);

  if (error) {
    console.error("Error deleting custom field:", error);
    throw error;
  }
}

export async function reorderCustomFields(
  userId: string,
  sectionKey: string,
  fieldIds: string[]
): Promise<void> {
  const updates = fieldIds.map((fieldId, index) => ({
    id: fieldId,
    sort_order: index + 1,
  }));

  for (const update of updates) {
    await supabase
      .from("user_custom_fields")
      .update({ sort_order: update.sort_order })
      .eq("id", update.id)
      .eq("user_id", userId)
      .eq("section_key", sectionKey);
  }
}

export const customFieldsApi = {
  getUserCustomFields,
  createCustomField,
  updateCustomField,
  deleteCustomField,
  reorderCustomFields,
};