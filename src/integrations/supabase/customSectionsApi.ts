import { supabase } from "./client";

export interface CustomSection {
  id: string;
  user_id: string;
  organization_id?: string;
  title: string;
  section_key: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export async function getUserCustomSections(userId: string): Promise<CustomSection[]> {
  const { data, error } = await supabase
    .from("user_custom_sections")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Error fetching custom sections:", error);
    throw error;
  }

  return data || [];
}

export async function createCustomSection(
  userId: string,
  title: string,
  organizationId?: string
): Promise<CustomSection> {
  // Generate a unique section key based on the title
  const sectionKey = `custom_${title.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
  
  // Get the next sort order
  const { data: existingSections } = await supabase
    .from("user_custom_sections")
    .select("sort_order")
    .eq("user_id", userId)
    .order("sort_order", { ascending: false })
    .limit(1);

  const nextSortOrder = existingSections?.[0]?.sort_order ? existingSections[0].sort_order + 1 : 1;

  const { data, error } = await supabase
    .from("user_custom_sections")
    .insert({
      user_id: userId,
      organization_id: organizationId,
      title,
      section_key: sectionKey,
      sort_order: nextSortOrder,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating custom section:", error);
    throw error;
  }

  return data;
}

export async function updateCustomSection(
  sectionId: string,
  updates: Partial<Pick<CustomSection, "title" | "sort_order">>
): Promise<CustomSection> {
  const { data, error } = await supabase
    .from("user_custom_sections")
    .update(updates)
    .eq("id", sectionId)
    .select()
    .single();

  if (error) {
    console.error("Error updating custom section:", error);
    throw error;
  }

  return data;
}

export async function deleteCustomSection(sectionId: string): Promise<void> {
  const { error } = await supabase
    .from("user_custom_sections")
    .update({ is_active: false })
    .eq("id", sectionId);

  if (error) {
    console.error("Error deleting custom section:", error);
    throw error;
  }
}

export const customSectionsApi = {
  getUserCustomSections,
  createCustomSection,
  updateCustomSection,
  deleteCustomSection,
};