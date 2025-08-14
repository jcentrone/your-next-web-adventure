import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

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

  // Bypass strict Database typing since "profiles" isn't in the generated types yet.
  const { error } = await (supabase as any)
    .from("profiles" as any)
    .upsert(payload, { onConflict: "user_id" });

  if (error) {
    // Keep non-blocking; just log for debugging
    console.error("upsertProfile error:", error.message);
  } else {
    console.log("Profile upserted for", user.id);
    
    // Check if this user needs to create an organization (from signup metadata)
    if (meta.is_organization_admin && meta.organization_name) {
      try {
        // Import the function dynamically to avoid circular imports
        const { createOrganization } = await import("@/integrations/supabase/organizationsApi");
        
        await createOrganization({
          name: meta.organization_name,
          email: email,
          phone: meta.phone,
          license_number: meta.license_number
        });
        
        console.log("Organization created during profile setup");
      } catch (orgError) {
        console.error("Failed to create organization during profile setup:", orgError);
      }
    }
  }
}
