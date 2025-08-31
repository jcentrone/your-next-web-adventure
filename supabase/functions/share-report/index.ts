import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PDFDocument, StandardFonts } from "https://esm.sh/pdf-lib@1.17.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");
    if (!token) {
      return new Response("Missing token", { status: 400, headers: corsHeaders });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceKey) {
      return new Response("Server not configured", { status: 500, headers: corsHeaders });
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    const { data: share, error: shareError } = await supabase
      .from("report_shares")
      .select("report_id, expires_at")
      .eq("token", token)
      .single();

    if (shareError || !share) {
      return new Response("Invalid token", { status: 404, headers: corsHeaders });
    }

    if (share.expires_at && new Date(share.expires_at) < new Date()) {
      return new Response("Token expired", { status: 403, headers: corsHeaders });
    }

    // Log that this token was accessed
    await supabase
      .from("report_shares")
      .update({ last_accessed_at: new Date().toISOString() })
      .eq("token", token);

    const { data: report, error: reportError } = await supabase
      .from("reports")
      .select("id, title, report_data")
      .eq("id", share.report_id)
      .single();

    if (reportError || !report) {
      return new Response("Report not found", { status: 404, headers: corsHeaders });
    }

    const bucket = Deno.env.get("REPORT_PDF_BUCKET") || "report-pdfs";
    const path = `${share.report_id}.pdf`;

    // try to return existing PDF via signed url
    const { data: signed, error: signedError } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, 60);

    if (!signedError && signed?.signedUrl) {
      return new Response(null, {
        status: 302,
        headers: { ...corsHeaders, Location: signed.signedUrl },
      });
    }

    // no existing pdf, generate a simple one
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([612, 792]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 24;
    const title = report.title || "Report";
    page.drawText(title, { x: 50, y: 742, size: fontSize, font });
    const pdfBytes = await pdfDoc.save();

    await supabase.storage.from(bucket).upload(path, pdfBytes, {
      contentType: "application/pdf",
      upsert: true,
    });

    return new Response(pdfBytes, {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/pdf" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(message, { status: 500, headers: corsHeaders });
  }
});

