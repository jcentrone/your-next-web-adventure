import { supabase } from "./client";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function exportReportData() {
  const client = supabase as SupabaseClient;
  
  try {
    const { data, error } = await client.functions.invoke("export-report-data", {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (error) {
      console.error('Edge function error:', error);
      throw new Error(error.message || 'Failed to export data');
    }
    
    // Ensure we got a blob response
    if (data && data instanceof Blob) {
      return data;
    } else if (data && data instanceof ArrayBuffer) {
      return new Blob([data], { type: 'application/zip' });
    } else if (data && typeof data === 'object' && data.error) {
      throw new Error(data.error);
    } else {
      throw new Error('Invalid response format from server');
    }
  } catch (error) {
    console.error('Export error:', error);
    throw error;
  }
}

export async function deleteAccount() {
  const client = supabase as SupabaseClient;
  const { error } = await client.functions.invoke("delete-account");
  if (error) throw error;
}

