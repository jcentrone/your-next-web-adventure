import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceKey) {
      throw new Error("Server not configured");
    }

    const supabase = createClient(supabaseUrl, serviceKey, {
      global: { headers: { Authorization: req.headers.get("Authorization") || "" } },
    });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return new Response("Unauthorized", { status: 401, headers: corsHeaders });
    }

    const userId = user.id;

    // Fetch organizations the user belongs to before deleting memberships
    const { data: memberships } = await supabase
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", userId);

    // Delete user's reports
    await supabase.from("reports").delete().eq("user_id", userId);

    // Delete profile
    await supabase.from("profiles").delete().eq("user_id", userId);

    // Remove from organization members
    await supabase.from("organization_members").delete().eq("user_id", userId);

    // Delete orphaned organizations
    if (memberships) {
      for (const m of memberships) {
        const { data: remaining } = await supabase
          .from("organization_members")
          .select("id")
          .eq("organization_id", m.organization_id)
          .limit(1);
        if (!remaining || remaining.length === 0) {
          await supabase.from("organizations").delete().eq("id", m.organization_id);
        }
      }
    }

    // Delete user from auth.users
    await supabase.auth.admin.deleteUser(userId);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response("Error deleting account", {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

