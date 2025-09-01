import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import JSZip from "https://esm.sh/jszip@3.10.1";

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

    // get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response("Unauthorized", {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = user.id;

    // fetch data scoped to user
    const { data: reports = [] } = await supabase
      .from("reports")
      .select("*")
      .eq("user_id", userId);

    const { data: contacts = [] } = await supabase
      .from("contacts")
      .select("*")
      .eq("user_id", userId);

    const { data: activities = [] } = await supabase
      .from("activities")
      .select("*")
      .eq("user_id", userId);

    // gather media from storage
    const media: Record<string, unknown[]> = {};
    for (const report of reports) {
      const path = `${userId}/${report.id}`;
      const { data: files } = await supabase.storage
        .from("report-media")
        .list(path, { limit: 1000 });
      if (files && files.length) {
        media[report.id] = files.map((f) => ({ path: `${path}/${f.name}`, ...f }));
      }
    }

    const payload = { reports, contacts, activities, media };
    const zip = new JSZip();
    zip.file("data.json", JSON.stringify(payload, null, 2));
    const zipped = await zip.generateAsync({ type: "uint8array" });

    return new Response(zipped, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/zip",
        "Content-Disposition": "attachment; filename=report-data.zip",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(message, { status: 500, headers: corsHeaders });
  }
});

