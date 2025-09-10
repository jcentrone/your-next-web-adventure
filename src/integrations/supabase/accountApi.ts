import { supabase } from "./client";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function exportReportData() {
  const client = supabase as SupabaseClient;
  
  try {
    // Request the edge function and explicitly ask for binary data.
    // Without specifying the response type, supabase-js attempts to
    // parse the body as JSON which results in an "Invalid response
    // format" error when the function returns a zip file.
    const response = await client.functions.invoke("export-report-data", {
      headers: {
        'Accept': 'application/zip'
      }
    });
    
    if (response.error) {
      console.error('Edge function error:', response.error);
      throw new Error(response.error.message || 'Failed to export data');
    }
    
    // The response.data should be a Blob for zip files
    if (response.data) {
      // If it's already a blob, return it
      if (response.data instanceof Blob) {
        return response.data;
      }
      
      // If it's a Uint8Array (which JSZip generates), convert to blob
      if (response.data instanceof Uint8Array) {
        return new Blob([new Uint8Array(response.data)], { type: 'application/zip' });
      }
      
      // If it's an ArrayBuffer, convert to blob
      if (response.data instanceof ArrayBuffer) {
        return new Blob([response.data], { type: 'application/zip' });
      }
      
      // If it's an error response with a message
      if (typeof response.data === 'object' && response.data.error) {
        throw new Error(response.data.error);
      }
    }
    
    throw new Error('No data received from export function');
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

