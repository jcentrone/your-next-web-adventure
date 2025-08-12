import React from "react";
import { Button } from "@/components/ui/button";
import { useParams, useNavigate } from "react-router-dom";
import Seo from "@/components/Seo";
import { loadReport as loadLocalReport, saveReport as saveLocalReport } from "@/hooks/useLocalDraft";
import { useAuth } from "@/contexts/AuthContext";
import { dbGetReport, dbUpdateReport } from "@/integrations/supabase/reportsApi";
import { Report } from "@/lib/reportSchemas";
import { isSupabaseUrl, getSignedUrlFromSupabaseUrl } from "@/integrations/supabase/storage";
import { Badge } from "@/components/ui/badge";
import { PREVIEW_TEMPLATES } from "@/constants/previewTemplates";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";

function ButtonBar({ id }: { id: string }) {
  const nav = useNavigate();
  return (
    <div className="w-full flex items-center justify-between gap-2">
      <Button variant="outline" onClick={() => nav(`/reports/${id}`)} aria-label="Close preview and return to editor">
        Close Preview
      </Button>
      <Button onClick={() => window.print()} aria-label="Download PDF">
        Download PDF
      </Button>
    </div>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const map: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    Safety: "destructive",
    Major: "default",
    Moderate: "secondary",
    Minor: "outline",
    Maintenance: "outline",
    Info: "outline",
  };
  const variant = map[severity] ?? "outline";
  return <Badge variant={variant}>{severity}</Badge>;
}

function TemplateSelector({ value, onChange, disabled }: { value: 'classic' | 'modern' | 'minimal'; onChange: (v: 'classic' | 'modern' | 'minimal') => void; disabled?: boolean }) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as any)} disabled={disabled}>
      <SelectTrigger className="w-[200px]" aria-label="Choose preview template">
        <SelectValue placeholder="Choose template" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="classic">Classic</SelectItem>
        <SelectItem value="modern">Modern</SelectItem>
        <SelectItem value="minimal">Minimal</SelectItem>
      </SelectContent>
    </Select>
  );
}

const ReportPreview: React.FC = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [report, setReport] = React.useState<Report | null>(null);
  const [mediaUrlMap, setMediaUrlMap] = React.useState<Record<string, string>>({});
  const [coverUrl, setCoverUrl] = React.useState<string>("");

  const nav = useNavigate();
  const [savingTpl, setSavingTpl] = React.useState(false);
  const handleTemplateChange = async (tplKey: 'classic' | 'modern' | 'minimal') => {
    if (!report) return;
    setSavingTpl(true);
    try {
      const next = { ...report, previewTemplate: tplKey } as Report;
      if (user) {
        const updated = await dbUpdateReport(next);
        setReport(updated);
      } else {
        saveLocalReport(next);
        setReport(next);
      }
      toast({ title: 'Template updated', description: `Applied ${tplKey} template.` });
    } catch (e) {
      console.error(e);
      toast({ title: 'Failed to update template', description: 'Please try again.', variant: 'destructive' } as any);
    } finally {
      setSavingTpl(false);
    }
  };
  React.useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        if (user) {
          const r = await dbGetReport(id);
          setReport(r);
        } else {
          const r = loadLocalReport(id);
          setReport(r);
        }
      } catch (e) {
        console.error(e);
        setReport(null);
      }
    };
    load();
  }, [id, user]);

  // Resolve signed URLs for all media in the report (only when authenticated)
  React.useEffect(() => {
    if (!user || !report) return;
    const allMedia = report.sections.flatMap((s) => s.findings.flatMap((f) => f.media));
    const needsSigned = allMedia.filter((m) => isSupabaseUrl(m.url));

    let cancelled = false;
    (async () => {
      if (needsSigned.length > 0) {
        const entries = await Promise.all(
          needsSigned.map(async (m) => {
            const signed = await getSignedUrlFromSupabaseUrl(m.url);
            return [m.id, signed] as const;
          })
        );
        if (!cancelled) {
          setMediaUrlMap((prev) => {
            const next = { ...prev };
            for (const [id, url] of entries) next[id] = url;
            return next;
          });
        }
      }
      // cover image
      if (report.coverImage) {
        if (isSupabaseUrl(report.coverImage)) {
          const signed = await getSignedUrlFromSupabaseUrl(report.coverImage);
          if (!cancelled) setCoverUrl(signed);
        } else {
          if (!cancelled) setCoverUrl(report.coverImage);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, report]);

  if (!report) return null;

  const tpl = PREVIEW_TEMPLATES[report.previewTemplate] || PREVIEW_TEMPLATES.classic;
  const severityOrder = ["Safety", "Major", "Moderate", "Minor", "Maintenance", "Info"] as const;
  const summary = report.sections.flatMap((s) =>
    s.findings.filter((f) => f.includeInSummary || f.severity === "Safety" || f.severity === "Major")
  );
  const sortedSummary = [...summary].sort(
    (a, b) => severityOrder.indexOf(a.severity as any) - severityOrder.indexOf(b.severity as any)
  );

  return (
    <>
      <Seo
        title={`${report.title} | Preview`}
        description={`Preview of report for ${report.clientName}`}
        canonical={window.location.origin + `/reports/${report.id}/preview`}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: report.title,
          datePublished: report.inspectionDate,
        }}
      />
      <div className="max-w-4xl mx-auto px-4 py-4 print-hidden flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => nav(`/reports/${report.id}`)} aria-label="Close preview and return to editor">
            Close Preview
          </Button>
          <TemplateSelector value={report.previewTemplate} onChange={handleTemplateChange} disabled={savingTpl} />
        </div>
        <Button onClick={() => window.print()} aria-label="Download PDF">
          Download PDF
        </Button>
      </div>
      <article className="{tpl.container}">
        {/* Cover Page */}
        <section className="mb-8 page-break">
          <header className="mb-4 text-center">
            <h1 className={`text-3xl font-semibold ${tpl.h1}`}>{report.title}</h1>
            <p className="text-muted-foreground">
              {report.clientName} • {new Date(report.inspectionDate).toLocaleDateString()} • {report.address}
            </p>
          </header>
          {coverUrl && (
            <img src={coverUrl} alt="Report cover" className="w-full rounded border" />
          )}
        </section>

        {/* Summary */}
        {sortedSummary.length > 0 && (
          <section className="mb-10 page-break">
            <h2 className={`text-xl font-medium mb-2 ${tpl.h2}`}>Summary of Significant Issues</h2>
            <ul className="space-y-2">
              {sortedSummary.map((f) => (
                <li key={f.id} className="flex items-start gap-2">
                  <SeverityBadge severity={f.severity} />
                  <span>
                    <strong>[{f.severity}]</strong> {f.title}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Sections */}
        {report.sections.map((sec) => (
          <section key={sec.id} className="mb-8">
            <h2 className={`text-xl font-medium mb-3 ${tpl.h2}`}>{sec.title}</h2>
            {sec.findings.length === 0 ? (
              <p className="text-sm text-muted-foreground">No material defects noted.</p>
            ) : (
              sec.findings.map((f) => (
                <article key={f.id} className="mb-4">
                  <h3 className={`font-medium ${tpl.h3}`}>[{f.severity}] {f.title}</h3>
                  {f.narrative && <p className="text-sm mt-1 whitespace-pre-wrap">{f.narrative}</p>}
                  {f.recommendation && (
                    <p className="text-sm mt-1 italic">Recommendation: {f.recommendation}</p>
                  )}
                  {f.media.length > 0 && (
                    <div className="mt-2 grid grid-cols-2 gap-3">
                      {f.media.map((m) => {
                        const resolvedUrl = mediaUrlMap[m.id] || m.url;
                        return (
                          <figure key={m.id}>
                            {m.type === "image" ? (
                              <img src={resolvedUrl} alt={m.caption || f.title} loading="lazy" className="w-full rounded border" />
                            ) : m.type === "video" ? (
                              <video src={resolvedUrl} controls className="w-full rounded border" />
                            ) : (
                              <audio src={resolvedUrl} controls />
                            )}
                            {m.caption && (
                              <figcaption className="text-xs text-muted-foreground mt-1">{m.caption}</figcaption>
                            )}
                          </figure>
                        );
                      })}
                    </div>
                  )}
                </article>
              ))
            )}
          </section>
        ))}
      </article>
    </>
  );
};

export default ReportPreview;
