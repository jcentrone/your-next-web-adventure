import { supabase } from "./client";
import type { Json } from "./types";

export interface CoverPage {
  id: string;
  user_id: string;
  name: string;
  template_slug: string | null;
  color_palette_key: string | null;
  text_content: Json;
  design_json: Json;
  image_url: string | null;
  report_types: string[];
  created_at: string;
  updated_at: string;
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
    design_json?: Json;
    image_url?: string | null;
    report_types?: string[];
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
      design_json: payload.design_json ?? {},
      image_url: payload.image_url ?? null,
      report_types: payload.report_types ?? [],
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
      "name" | "template_slug" | "color_palette_key" | "text_content" | "design_json" | "image_url" | "report_types"
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

export async function getCoverPage(id: string): Promise<CoverPage | null> {
  const { data, error } = await supabase
    .from("cover_pages")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching cover page:", error);
    throw error;
  }

  return data as CoverPage;
}

export async function getAssignedCoverPage(
  userId: string,
  reportType: string,
): Promise<CoverPage | null> {
  const { data, error } = await supabase
    .from("cover_pages")
    .select("*")
    .eq("user_id", userId)
    .contains("report_types", [reportType])
    .maybeSingle();

  if (error) {
    console.error("Error fetching assigned cover page:", error);
    throw error;
  }

  return data as CoverPage | null;
}

export const coverPagesApi = {
  getCoverPages,
  createCoverPage,
  updateCoverPage,
  deleteCoverPage,
  getCoverPage,
  getAssignedCoverPage,
};
