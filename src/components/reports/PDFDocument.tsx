import React from "react";
import { Report } from "@/lib/reportSchemas";
import { PREVIEW_TEMPLATES } from "@/constants/previewTemplates";
import { AlertTriangle, AlertCircle, AlertOctagon, Info, Wrench, MinusCircle } from "lucide-react";

interface PDFDocumentProps {
  report: Report;
  mediaUrlMap: Record<string, string>;
  coverUrl: string;
}

const PDFDocument = React.forwardRef<HTMLDivElement, PDFDocumentProps>(
  ({ report, mediaUrlMap, coverUrl }, ref) => {
    const tpl = PREVIEW_TEMPLATES[report.previewTemplate] || PREVIEW_TEMPLATES.classic;
    const severityOrder = ["Safety", "Major", "Moderate", "Minor", "Maintenance", "Info"] as const;
    
    const summary = report.sections.flatMap((s) =>
      s.findings.filter((f) => f.includeInSummary || f.severity === "Safety" || f.severity === "Major" || f.severity === "Moderate" || f.severity === "Minor" || f.severity === "Maintenance" || f.severity === "Info")
    );
    
    const severityCounts = summary.reduce((acc, finding) => {
      acc[finding.severity] = (acc[finding.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const orderedSeverities = severityOrder.filter(sev => severityCounts[sev]);
    
    const SEVERITY_ICONS: Record<string, React.ElementType> = {
      Safety: AlertTriangle,
      Major: AlertOctagon,
      Moderate: AlertCircle,
      Minor: MinusCircle,
      Maintenance: Wrench,
      Info: Info
    };

    const sectionSeverityCounts = report.sections.reduce((acc, sec) => {
      const counts: Record<string, number> = {};
      
      sec.findings
        .filter(f => f.includeInSummary || ["Safety", "Major", "Moderate", "Minor", "Maintenance", "Info"].includes(f.severity))
        .forEach(f => {
          counts[f.severity] = (counts[f.severity] || 0) + 1;
        });

      if (Object.keys(counts).length > 0) {
        acc.push({
          sectionTitle: sec.title,
          counts
        });
      }
      return acc;
    }, [] as { sectionTitle: string; counts: Record<string, number> }[]);

    return (
      <div ref={ref} className="pdf-document">
        <article className={tpl.container}>
          {/* Cover Page */}
          <section className={`${tpl.cover} pdf-page-break`}>
            <header className="mb-4 text-center">
              <h1 className={tpl.coverTitle}>{report.title}</h1>
              <p className={tpl.coverSubtitle}>
                {report.clientName} • {new Date(report.inspectionDate).toLocaleDateString()} • {report.address}
              </p>
            </header>
            {coverUrl && (
              <img src={coverUrl} alt="Report cover" className="cover max-w-full h-auto rounded border" />
            )}
          </section>

          {/* Summary */}
          {Object.keys(severityCounts).length > 0 && (
            <section className="my-10 text-center pdf-page-break">
              <h2 className={tpl.summaryTitle}>Summary of Deficiencies</h2>

              {/* Top Level: Big Bubbles */}
              <div className="flex flex-wrap justify-center gap-8 mb-8">
                {orderedSeverities.map(severity => {
                  const Icon = SEVERITY_ICONS[severity];
                  const badgeConfig = tpl.severityBadge[severity];
                  const badgeClasses = typeof badgeConfig === 'string' 
                    ? badgeConfig 
                    : (badgeConfig as any)?.className || '';
                  
                  return (
                    <div key={severity} className="flex flex-col items-center">
                      <div className={`flex items-center justify-center w-15 h-15 rounded-full ${badgeClasses}`}>
                        <Icon size={30} className="text-white"/>
                      </div>
                      <span className="mt-2 font-bold">{severityCounts[severity]}</span>
                      <span className="text-sm">{severity}</span>
                    </div>
                  );
                })}
              </div>

              {/* Second Level: Breakdown by Section */}
              <div className="mt-6 text-left max-w-3xl mx-auto">
                {sectionSeverityCounts.map(({ sectionTitle, counts }) => {
                  const breakdown = orderedSeverities
                    .filter(sev => counts[sev])
                    .map(sev => `${counts[sev]} ${sev}${counts[sev] > 1 ? 's' : ''}`)
                    .join(', ');

                  return (
                    <div key={sectionTitle} className="py-2 border-b border-gray-200">
                      <h3 className="font-semibold">{sectionTitle}</h3>
                      <p className="text-sm text-gray-700">{breakdown}</p>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Sections */}
          {report.sections.map((sec) => (
            <section key={sec.id} className={tpl.sectionWrapper}>
              <h2 className={tpl.h2}>{sec.title}</h2>
              {sec.findings.length === 0 ? (
                <p className="text-sm text-muted-foreground">No material defects noted.</p>
              ) : (
                sec.findings.map((f) => {
                  const Icon = SEVERITY_ICONS[f.severity];
                  const badgeConfig = tpl.severityBadge[f.severity];
                  const badgeClasses = typeof badgeConfig === 'string' 
                    ? badgeConfig 
                    : (badgeConfig as any)?.className || '';
                  
                  return (
                    <article key={f.id} className={tpl.findingWrapper}>
                      <h3 className={tpl.h3}>
                        <span 
                          aria-label={`${f.severity} issue`} 
                          className={`inline-flex items-center gap-1 px-2 py-0.5 mr-2 rounded ${badgeClasses}`}
                        >
                          <Icon size={14} />
                          {f.severity}
                        </span>
                        {f.title}
                      </h3>
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
                                  <img 
                                    src={resolvedUrl} 
                                    alt={m.caption || f.title} 
                                    className="w-full max-h-64 object-contain rounded border pdf-image" 
                                  />
                                ) : m.type === "video" ? (
                                  <div className="w-full h-32 bg-gray-100 rounded border flex items-center justify-center">
                                    <p className="text-sm text-gray-500">Video: {m.caption || f.title}</p>
                                  </div>
                                ) : (
                                  <div className="w-full h-16 bg-gray-100 rounded border flex items-center justify-center">
                                    <p className="text-xs text-gray-500">Audio: {m.caption || f.title}</p>
                                  </div>
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
                  );
                })
              )}
            </section>
          ))}
        </article>
      </div>
    );
  }
);

PDFDocument.displayName = "PDFDocument";

export default PDFDocument;