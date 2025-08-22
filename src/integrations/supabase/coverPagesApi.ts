import { supabase } from "./client";
import type { Json } from "./types";

export interface CoverPage {
  id: string;
  user_id: string;
  name: string;
  template_slug: string | null;
  color_palette_key: string | null;
  text_content: Json;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface CoverPageAssignment {
  user_id: string;
  report_type: string;
  cover_page_id: string;
}

export async function getCoverPages(userId: string): Promise<CoverPage[]> {
  const { data, error } = await supabase
    .from("cover_pages")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching cover pages:", error);
    throw error;
  }

  return (data || []) as CoverPage[];
}

export async function createCoverPage(
  userId: string,
  payload: {
    name: string;
    template_slug?: string | null;
    color_palette_key?: string | null;
    text_content?: Json;
    image_url?: string | null;
  }
): Promise<CoverPage> {
  const { data, error } = await supabase
    .from("cover_pages")
    .insert({
      user_id: userId,
      name: payload.name,
      template_slug: payload.template_slug ?? null,
      color_palette_key: payload.color_palette_key ?? null,
      text_content: payload.text_content ?? {},
      image_url: payload.image_url ?? null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating cover page:", error);
    throw error;
  }

  return data as CoverPage;
}

export async function updateCoverPage(
  id: string,
  updates: Partial<
    Pick<
      CoverPage,
      "name" | "template_slug" | "color_palette_key" | "text_content" | "image_url"
    >
  >
): Promise<CoverPage> {
  const { data, error } = await supabase
    .from("cover_pages")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating cover page:", error);
    throw error;
  }

  return data as CoverPage;
}

export async function deleteCoverPage(id: string): Promise<void> {
  const { error } = await supabase.from("cover_pages").delete().eq("id", id);

  if (error) {
    console.error("Error deleting cover page:", error);
    throw error;
  }
}

export async function getCoverPageAssignments(
  userId: string,
): Promise<Record<string, string>> {
  const { data, error } = await supabase
    .from("cover_page_assignments")
    .select("report_type, cover_page_id")
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching cover page assignments:", error);
    throw error;
  }

  const assignments: Record<string, string> = {};
  for (const row of (data || []) as {
    report_type: string;
    cover_page_id: string;
  }[]) {
    assignments[row.report_type] = row.cover_page_id;
  }
  return assignments;
}

export async function setCoverPageAssignment(
  userId: string,
  reportType: string,
  coverPageId: string,
): Promise<void> {
  const { error } = await supabase
    .from("cover_page_assignments")
    .upsert(
      { user_id: userId, report_type: reportType, cover_page_id: coverPageId },
      { onConflict: "user_id,report_type" },
    );

  if (error) {
    console.error("Error setting cover page assignment:", error);
    throw error;
  }
}

export async function clearCoverPageAssignment(
  userId: string,
  reportType: string,
): Promise<void> {
  const { error } = await supabase
    .from("cover_page_assignments")
    .delete()
    .eq("user_id", userId)
    .eq("report_type", reportType);

  if (error) {
    console.error("Error clearing cover page assignment:", error);
    throw error;
  }
}

export const coverPagesApi = {
  getCoverPages,
  createCoverPage,
  updateCoverPage,
  deleteCoverPage,
  getCoverPageAssignments,
  setCoverPageAssignment,
  clearCoverPageAssignment,
};
