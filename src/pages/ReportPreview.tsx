
import React from "react";
import { useParams } from "react-router-dom";
import Seo from "@/components/Seo";
import { loadReport as loadLocalReport } from "@/hooks/useLocalDraft";
import { useAuth } from "@/contexts/AuthContext";
import { dbGetReport } from "@/integrations/supabase/reportsApi";
import { Report } from "@/lib/reportSchemas";

const ReportPreview: React.FC = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [report, setReport] = React.useState<Report | null>(null);

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

  if (!report) return null;

  const summary = report.sections.flatMap((s) => s.findings.filter((f) => f.includeInSummary));

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
      <article className="max-w-4xl mx-auto px-4 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold">{report.title}</h1>
          <p className="text-muted-foreground">
            {report.clientName} • {new Date(report.inspectionDate).toLocaleDateString()} • {report.address}
          </p>
        </header>

        {summary.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl font-medium mb-2">Summary of Significant Issues</h2>
            <ul className="list-disc pl-5 space-y-2">
              {summary.map((f) => (
                <li key={f.id}>
                  <strong>[{f.severity}]</strong> {f.title}
                </li>
              ))}
            </ul>
          </section>
        )}

        {report.sections.map((sec) => (
          <section key={sec.id} className="mb-8">
            <h2 className="text-xl font-medium mb-3">{sec.title}</h2>
            {sec.findings.length === 0 ? (
              <p className="text-sm text-muted-foreground">No material defects noted.</p>
            ) : (
              sec.findings.map((f) => (
                <article key={f.id} className="mb-4">
                  <h3 className="font-medium">[{f.severity}] {f.title}</h3>
                  {f.narrative && <p className="text-sm mt-1 whitespace-pre-wrap">{f.narrative}</p>}
                  {f.recommendation && (
                    <p className="text-sm mt-1 italic">Recommendation: {f.recommendation}</p>
                  )}
                  {f.media.length > 0 && (
                    <div className="mt-2 grid grid-cols-2 gap-3">
                      {f.media.map((m) => (
                        <figure key={m.id}>
                          {m.type === "image" ? (
                            <img src={m.url} alt={m.caption || f.title} loading="lazy" className="w-full rounded border" />
                          ) : m.type === "video" ? (
                            <video src={m.url} controls className="w-full rounded border" />
                          ) : (
                            <audio src={m.url} controls />
                          )}
                          {m.caption && (
                            <figcaption className="text-xs text-muted-foreground mt-1">{m.caption}</figcaption>
                          )}
                        </figure>
                      ))}
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
