import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { createOrganization } from "@/integrations/supabase/organizationsApi";

export async function upsertProfile(session: Session | null) {
  const user = session?.user;
  if (!user) return;

  const meta = (user.user_metadata || {}) as Record<string, any>;
  const full_name = meta.full_name || meta.name || meta.display_name || null;
  const avatar_url = meta.avatar_url || meta.picture || null;
  const provider = (user.app_metadata as any)?.provider || "email";
  const email = user.email;
  const last_sign_in_at = new Date().toISOString();

  const payload = {
    user_id: user.id,
    email,
    full_name,
    avatar_url,
    provider,
    last_sign_in_at,
    phone: meta.phone || null,
    license_number: meta.license_number || null,
  };

  // Use proper supabase client with correct typing
  const { error } = await supabase
    .from("profiles")
    .upsert(payload, { onConflict: "user_id" });

  if (error) {
    // Keep non-blocking; just log for debugging
    console.error("upsertProfile error:", error.message, error);
  } else {
    console.log("Profile upserted successfully for", user.id, payload);

    // Ensure the user has an organization membership
    const { data: member } = await supabase
      .from('organization_members')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!member) {
      try {
        await createOrganization({
          name: meta.organization_name || full_name || email || 'My Organization',
          email: email || undefined,
          phone: meta.phone || undefined,
          license_number: meta.license_number || undefined,
        });
      } catch (e: any) {
        console.error('createOrganization error:', e.message || e);
      }
    }
  }
}
