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

    // Fetch user profile data
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    // Fetch organization data if user is part of an organization
    const { data: organizationMember } = await supabase
      .from("organization_members")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    let organizationData = null;
    if (organizationMember?.organization_id) {
      const { data: organization } = await supabase
        .from("organizations")
        .select("*")
        .eq("id", organizationMember.organization_id)
        .maybeSingle();
      
      if (organization) {
        organizationData = {
          membership: organizationMember,
          organization: organization
        };
      }
    }

    // Fetch custom fields and sections
    const { data: customFields = [] } = await supabase
      .from("user_custom_fields")
      .select("*")
      .eq("user_id", userId);

    const { data: customSections = [] } = await supabase
      .from("user_custom_sections")
      .select("*")
      .eq("user_id", userId);

    const { data: userDefects = [] } = await supabase
      .from("user_defects")
      .select("*")
      .eq("user_id", userId);

    const payload = { 
      profile,
      reports, 
      contacts, 
      activities, 
      customFields,
      customSections,
      userDefects,
      organizationData,
      media,
      exportedAt: new Date().toISOString()
    };

    const zip = new JSZip();
    zip.file("user-data.json", JSON.stringify(payload, null, 2));
    
    // Add a README file explaining the export
    const readme = `# Data Export

This export contains all your personal data from the Home Inspection Platform.

## Files included:
- user-data.json: All your reports, contacts, activities, custom fields, and profile information

## Data structure:
- profile: Your user profile information
- reports: All inspection reports you've created
- contacts: All contacts you've added
- activities: Activity log entries
- customFields: Custom fields you've created
- customSections: Custom sections you've created  
- userDefects: Personal defect templates you've created
- organizationData: Organization information if you're part of one
- media: References to media files in your reports
- exportedAt: Timestamp of when this export was created

Generated on: ${new Date().toLocaleString()}
`;
    
    zip.file("README.txt", readme);
    const zipped = await zip.generateAsync({ type: "uint8array" });

    return new Response(zipped, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/zip",
        "Content-Disposition": "attachment; filename=user-data-export.zip",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(message, { status: 500, headers: corsHeaders });
  }
});

