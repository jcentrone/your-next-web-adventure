import { supabase } from "./client";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function exportReportData() {
  const client = supabase as SupabaseClient;
  const { data, error } = await client.functions.invoke("export-report-data");
  if (error) throw error;
  return data as Blob;
}

export async function deleteAccount() {
  const client = supabase as SupabaseClient;
  const { error } = await client.functions.invoke("delete-account");
  if (error) throw error;
}

