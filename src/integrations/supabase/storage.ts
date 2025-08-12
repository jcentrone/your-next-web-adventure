
import { supabase } from "@/integrations/supabase/client";
import type { Media } from "@/lib/reportSchemas";

export const REPORT_MEDIA_BUCKET = "report-media";
const SUPABASE_URL_PREFIX = "supabase://"; // we store storage paths in Media.url with this prefix

export function isSupabaseUrl(url: string | undefined | null): boolean {
  if (!url) return false;
  return url.startsWith(SUPABASE_URL_PREFIX);
}

export function toSupabaseUrl(path: string): string {
  return `${SUPABASE_URL_PREFIX}${REPORT_MEDIA_BUCKET}/${path}`;
}

/**
 * Parse supabase://bucket/path/to/file.ext into { bucket, path }
 */
export function parseSupabaseUrl(url: string): { bucket: string; path: string } | null {
  if (!isSupabaseUrl(url)) return null;
  const stripped = url.slice(SUPABASE_URL_PREFIX.length); // bucket/path...
  const firstSlash = stripped.indexOf("/");
  if (firstSlash === -1) return null;
  return {
    bucket: stripped.slice(0, firstSlash),
    path: stripped.slice(firstSlash + 1),
  };
}

/**
 * Create a short-lived signed URL for a given supabase:// URL.
 */
export async function getSignedUrlFromSupabaseUrl(url: string, expiresInSeconds = 3600): Promise<string> {
  const parsed = parseSupabaseUrl(url);
  if (!parsed) return url;
  const { bucket, path } = parsed;
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresInSeconds);
  if (error || !data) {
    console.error("Failed to create signed URL", error, { bucket, path });
    return url; // fallback to stored value
  }
  return data.signedUrl;
}

/**
 * Upload files for a specific report/finding and return Media[] entries
 * whose url contains a supabase://<bucket>/<path> reference.
 */
export async function uploadFindingFiles(params: {
  userId: string;
  reportId: string;
  findingId: string;
  files: File[];
}): Promise<Media[]> {
  const { userId, reportId, findingId, files } = params;

  const uploads = await Promise.all(
    files.map(async (file, idx) => {
      const cleanName = file.name.replace(/\s+/g, "_");
      const ts = Date.now();
      const path = `${userId}/${reportId}/${findingId}/${ts}_${idx}_${cleanName}`;

      const { error } = await supabase.storage
        .from(REPORT_MEDIA_BUCKET)
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type || undefined,
        });

      if (error) {
        console.error("Upload error", error, { path, file });
        throw error;
      }

      const type: Media["type"] = file.type.startsWith("video")
        ? "video"
        : file.type.startsWith("audio")
        ? "audio"
        : "image";

      const media: Media = {
        id: crypto.randomUUID(),
        type,
        url: toSupabaseUrl(path),
        caption: file.name,
      };
      return media;
    })
  );

  return uploads;
}
