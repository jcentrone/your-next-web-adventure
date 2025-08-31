import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "react-router-dom";
import Seo from "@/components/Seo";
import { loadReport as loadLocalReport, saveReport as saveLocalReport } from "@/hooks/useLocalDraft";
import { useAuth } from "@/contexts/AuthContext";
import { dbGetReport, dbUpdateReport } from "@/integrations/supabase/reportsApi";
import { Report } from "@/lib/reportSchemas";
import { getSignedUrlFromSupabaseUrl, isSupabaseUrl } from "@/integrations/supabase/storage";
import { Badge } from "@/components/ui/badge";
import { PREVIEW_TEMPLATES, PreviewTemplateId } from "@/constants/previewTemplates";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { AlertCircle, AlertOctagon, AlertTriangle, Info, MinusCircle, Wrench } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import PDFDocument from "@/components/reports/PDFDocument";
import ReportDetailsSection from "@/components/reports/ReportDetailsSection";
import SectionInfoDisplay from "@/components/reports/SectionInfoDisplay";
import "../styles/pdf.css";
import { fillWindMitigationPDF } from "@/utils/fillWindMitigationPDF";
import { getMyOrganization, getMyProfile, Organization, Profile } from "@/integrations/supabase/organizationsApi";
import { COVER_TEMPLATES, CoverTemplateId } from "@/constants/coverTemplates";
import { CoverTemplateSelector } from "@/components/ui/cover-template-selector";
import { ColorSchemePicker, ColorScheme, COLOR_SCHEMES, CustomColors } from "@/components/ui/color-scheme-picker";
import { CoverTemplateProps } from "@/components/report-covers/types";

function SeverityBadge({
  severity,
  classes,
}: {
  severity: string;
  classes?: Record<string, string>;
}) {
  if (classes) {
    const cls = classes[severity] ?? "";
    return (
      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cls}`}>
        {severity}
      </span>
    );
  }
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


function StyleSelector({
  value,
  onChange,
  disabled,
}: {
  value: PreviewTemplateId;
  onChange: (v: PreviewTemplateId) => void;
  disabled?: boolean;
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as PreviewTemplateId)} disabled={disabled}>
      <SelectTrigger className="w-[200px]" aria-label="Choose style template">
        <SelectValue placeholder="Choose style" />
      </SelectTrigger>
      <SelectContent>
        {Object.keys(PREVIEW_TEMPLATES).map((key) => (
          <SelectItem key={key} value={key} className="capitalize">
            {key}
          </SelectItem>
        ))}
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
  const [organization, setOrganization] = React.useState<Organization | null>(null);
  const [inspector, setInspector] = React.useState<Profile | null>(null);

  const [isGeneratingPDF, setIsGeneratingPDF] = React.useState(false);
  const [savingCoverTpl, setSavingCoverTpl] = React.useState(false);
  const [savingStyleTpl, setSavingStyleTpl] = React.useState(false);
  const [savingColorScheme, setSavingColorScheme] = React.useState(false);
  const nav = useNavigate();

  // react-to-print
  const pdfContainerRef = React.useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: pdfContainerRef,
    documentTitle: `${report?.title || "Report"} - ${report?.clientName || "Client"}`,
  });

  const handleWindMitigationDownload = async () => {
    if (!report) return;
    try {
      const pdfBlob = await fillWindMitigationPDF(report);
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "wind_mitigation_report.pdf";
      link.click();
      URL.revokeObjectURL(url);
      toast({ title: "PDF Generated", description: "Your Wind Mitigation Report has been generated successfully." });
    } catch (error) {
      console.error(error);
      toast({
        title: "PDF Generation Failed",
        description: "Could not generate Wind Mitigation Report.",
        variant: "destructive",
      });
    }
  };

  const onPrintClick = () => {
    setIsGeneratingPDF(true);
    try {
      handlePrint();
      setTimeout(() => {
        setIsGeneratingPDF(false);
        toast({ title: "PDF Generated", description: "Your report has been generated successfully." });
      }, 1000);
    } catch (error) {
      setIsGeneratingPDF(false);
      toast({
        title: "PDF Generation Failed",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCoverTemplateChange = async (tplId: CoverTemplateId) => {
    if (!report) return;
    setSavingCoverTpl(true);
    try {
      const next = { ...report, coverTemplate: tplId } as Report;
      if (user) {
        await dbUpdateReport(next);
        setReport(next);
      } else {
        saveLocalReport(next);
        setReport(next);
      }
      toast({ title: "Cover template updated", description: `Applied ${tplId}` });
    } catch (e) {
      console.error(e);
      toast({ title: "Failed to update cover template", description: "Please try again.", variant: "destructive" });
    } finally {
      setSavingCoverTpl(false);
    }
  };

  const handleStyleTemplateChange = async (tplId: PreviewTemplateId) => {
    if (!report) return;
    setSavingStyleTpl(true);
    try {
      const next = { ...report, previewTemplate: tplId } as Report;
      if (user) {
        await dbUpdateReport(next);
        setReport(next);
      } else {
        saveLocalReport(next);
        setReport(next);
      }
      toast({ title: "Style updated", description: `Applied ${tplId}` });
    } catch (e) {
      console.error(e);
      toast({ title: "Failed to update style", description: "Please try again.", variant: "destructive" });
    } finally {
      setSavingStyleTpl(false);
    }
  };

  const handleColorSchemeChange = async (scheme: ColorScheme, colors?: CustomColors) => {
    if (!report) return;
    setSavingColorScheme(true);
    try {
      const next = {
        ...report,
        colorScheme: scheme,
        customColors: scheme === "custom" ? colors : undefined,
      } as Report;
      if (user) {
        await dbUpdateReport(next);
        setReport(next);
      } else {
        saveLocalReport(next);
        setReport(next);
      }
      toast({
        title: "Color scheme updated",
        description: scheme === "custom" ? "Applied custom scheme" : `Applied ${scheme}`,
      });
    } catch (e) {
      console.error(e);
      toast({ title: "Failed to update color scheme", description: "Please try again.", variant: "destructive" });
    } finally {
      setSavingColorScheme(false);
    }
  };

  React.useEffect(() => {
    if (!id) return;
    (async () => {
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
    })();
  }, [id, user]);

  // Resolve media URLs and sign cover image
  React.useEffect(() => {
    if (!user || !report) return;
    let cancelled = false;

    (async () => {
      try {
        if (report.reportType === "home_inspection") {
          const allMedia = report.sections.flatMap((s) => s.findings.flatMap((f) => f.media));
          const needsSigned = allMedia.filter((m) => isSupabaseUrl(m.url));
          if (needsSigned.length > 0) {
            const entries = await Promise.all(
              needsSigned.map(async (m) => {
                const signed = await getSignedUrlFromSupabaseUrl(m.url);
                return m.id ? ([m.id, signed] as const) : null;
              })
            );
            if (!cancelled) {
              setMediaUrlMap((prev) => {
                const next = { ...prev };
                for (const e of entries) if (e) next[e[0]] = e[1];
                return next;
              });
            }
          }
        }

        if (report.coverImage) {
          if (isSupabaseUrl(report.coverImage)) {
            const signed = await getSignedUrlFromSupabaseUrl(report.coverImage);
            if (!cancelled) setCoverUrl(signed);
          } else if (!cancelled) {
            setCoverUrl(report.coverImage);
          }
        }

        const organization = await getMyOrganization();
        const profile = await getMyProfile();
        if (!cancelled) {
          setOrganization(organization);
          setInspector(profile);
        }
      } catch (err) {
        console.error("Error preparing report preview:", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, report]);

  if (!report) return null;

  const tpl = PREVIEW_TEMPLATES[report.previewTemplate] || PREVIEW_TEMPLATES.classic;
  const CoverComponent = COVER_TEMPLATES[report.coverTemplate].component;
  const severityOrder = ["Safety", "Major", "Moderate", "Minor", "Maintenance", "Info"] as const;

  const colorVars =
    report.colorScheme === "custom" && report.customColors
      ? {
          "--heading-text-color": `hsl(${report.customColors.headingText})`,
          "--body-text-color": `hsl(${report.customColors.bodyText})`,
        }
      : undefined;

  if (report.reportType !== "home_inspection") {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 text-center" style={{ ...colorVars, color: "var(--body-text-color)" }}>
        <h1 className="text-2xl font-bold mb-4" style={{ color: "var(--heading-text-color)" }}>
          Wind Mitigation Report
        </h1>
        <p className="text-muted-foreground mb-6">Generate your completed Wind Mitigation Report as a PDF.</p>
        <div className="flex justify-center gap-4">
          <Button onClick={handleWindMitigationDownload}>Download Wind Mitigation PDF</Button>
          <Button variant="outline" onClick={() => nav(`/reports/${report.id}`)}>Back to Editor</Button>
        </div>
      </div>
    );
  }

  const summary = report.sections.flatMap((s) =>
    s.findings.filter(
      (f) =>
        f.includeInSummary ||
        f.severity === "Safety" ||
        f.severity === "Major" ||
        f.severity === "Moderate" ||
        f.severity === "Minor" ||
        f.severity === "Maintenance" ||
        f.severity === "Info"
    )
  );
  const severityCounts = summary.reduce((acc, finding) => {
    acc[finding.severity] = (acc[finding.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const orderedSeverities = severityOrder.filter((sev) => severityCounts[sev]);

  const SEVERITY_ICONS: Record<string, React.ElementType> = {
    Safety: AlertTriangle,
    Major: AlertOctagon,
    Moderate: AlertCircle,
    Minor: MinusCircle,
    Maintenance: Wrench,
    Info: Info,
  };

  const sectionSeverityCounts = report.sections.reduce((acc, sec) => {
    const counts: Record<string, number> = {};
    sec.findings
      .filter((f) => f.includeInSummary || ["Safety", "Major", "Moderate", "Minor", "Maintenance", "Info"].includes(f.severity))
      .forEach((f) => {
        counts[f.severity] = (counts[f.severity] || 0) + 1;
      });
    if (Object.keys(counts).length > 0) acc.push({ sectionTitle: sec.title, counts });
    return acc;
  }, [] as { sectionTitle: string; counts: Record<string, number> }[]);

  const previewColorScheme =
    report.colorScheme === "custom" && report.customColors
      ? {
          primary: report.customColors.primary || "220 87% 56%",
          secondary: report.customColors.secondary || "220 70% 40%",
          accent: report.customColors.accent || "220 90% 70%",
        }
      : report.colorScheme && report.colorScheme !== "default"
      ? {
          primary: COLOR_SCHEMES[report.colorScheme].primary,
          secondary: COLOR_SCHEMES[report.colorScheme].secondary,
          accent: COLOR_SCHEMES[report.colorScheme].accent,
        }
      : undefined;

  const coverPreviewData: CoverTemplateProps = {
    reportTitle: report.title,
    clientName: report.clientName,
    coverImage: coverUrl,
    organizationName: organization?.name || "",
    organizationAddress: organization?.address || "",
    organizationPhone: organization?.phone || "",
    organizationEmail: organization?.email || "",
    organizationWebsite: organization?.website || "",
    organizationLogo: organization?.logo_url || "",
    inspectorName: inspector?.full_name || "",
    inspectorLicenseNumber: inspector?.license_number || "",
    inspectorPhone: inspector?.phone || "",
    inspectorEmail: inspector?.email || "",
    clientAddress: report.address,
    clientEmail: report.clientEmail || "",
    clientPhone: report.clientPhone || "",
    inspectionDate: report.inspectionDate,
    weatherConditions: report.weatherConditions || "",
    colorScheme: previewColorScheme,
  };

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

      {/* Top bar */}
      <div className="max-w-4xl mx-auto px-4 py-4 print-hidden flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => nav(`/reports/${report.id}`)} aria-label="Close preview and return to editor">
            Close Preview
          </Button>
          <CoverTemplateSelector
            value={report.coverTemplate}
            onChange={handleCoverTemplateChange}
            disabled={savingCoverTpl}
            data={coverPreviewData}
          />
          <StyleSelector
            value={report.previewTemplate}
            onChange={handleStyleTemplateChange}
            disabled={savingStyleTpl}
          />
          <ColorSchemePicker
            value={report.colorScheme || "default"}
            customColors={report.customColors}
            onChange={handleColorSchemeChange}
            disabled={savingColorScheme}
          />
        </div>
        <Button onClick={onPrintClick} disabled={isGeneratingPDF} aria-label="Download PDF">
          {isGeneratingPDF ? "Generating PDF..." : "Download PDF"}
        </Button>
      </div>

      <div className="flex flex-col items-center" style={colorVars as any}>
        {/* Cover Page */}
        <div className="preview-page page-break">
          <div className={`${tpl.container} h-[1056px]`}>
            <CoverComponent
              reportTitle={report.title}
              clientName={report.clientName}
              coverImage={coverUrl}
              organizationName={organization?.name || ""}
              organizationAddress={organization?.address || ""}
              organizationPhone={organization?.phone || ""}
              organizationEmail={organization?.email || ""}
              organizationWebsite={organization?.website || ""}
              organizationLogo={organization?.logo_url || ""}
              inspectorName={inspector?.full_name || ""}
              inspectorLicenseNumber={inspector?.license_number || ""}
              inspectorPhone={inspector?.phone || ""}
              inspectorEmail={inspector?.email || ""}
              clientAddress={report.address}
              clientEmail={report.clientEmail || ""}
              clientPhone={report.clientPhone || ""}
              inspectionDate={report.inspectionDate}
              weatherConditions={report.weatherConditions || ""}
              colorScheme={
                report.colorScheme === "custom" && report.customColors
                  ? {
                      primary: report.customColors.primary || "220 87% 56%",
                      secondary: report.customColors.secondary || "220 70% 40%",
                      accent: report.customColors.accent || "220 90% 70%"
                    }
                  : report.colorScheme && report.colorScheme !== "default"
                  ? {
                      primary: COLOR_SCHEMES[report.colorScheme].primary,
                      secondary: COLOR_SCHEMES[report.colorScheme].secondary,
                      accent: COLOR_SCHEMES[report.colorScheme].accent,
                    }
                  : undefined
              }
              className={tpl.cover}
            />
          </div>
        </div>

        {/* Report Details */}
        <div className="preview-page page-break">
          <div className={tpl.container}>
            <ReportDetailsSection
              report={report}
              sectionInfo={report.sections.find((s) => s.key === "report_details")?.info || {}}
              className={tpl.reportDetails}
            />
          </div>
        </div>

        {/* Summary */}
        {Object.keys(severityCounts).length > 0 && (
          <div className="preview-page page-break">
            <div className={tpl.container}>
              <section className="my-10 text-center">
                <h2 className={tpl.summaryTitle}>Summary of Deficiencies</h2>

                <div className="flex flex-wrap justify-center gap-8 mb-8">
                  {orderedSeverities.map((severity) => {
                    const Icon = SEVERITY_ICONS[severity];
                    return (
                      <div key={severity} className="flex flex-col items-center">
                        <div className={`flex items-center justify-center w-20 h-20 rounded-full ${tpl.severityBadge[severity] || ""}`}>
                          <Icon size={45} className="text-white" />
                        </div>
                        <span className="mt-2 font-bold">{severityCounts[severity]}</span>
                        <span className="text-sm">{severity}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Breakdown by section */}
                <div className="mt-6 text-left max-w-3xl mx-auto">
                  {sectionSeverityCounts.map(({ sectionTitle, counts }) => {
                    const breakdown = orderedSeverities
                      .filter((sev) => counts[sev])
                      .map((sev) => `${counts[sev]} ${sev}${counts[sev] > 1 ? "s" : ""}`)
                      .join(", ");
                    return (
                      <div key={sectionTitle} className="py-2 border-b border-gray-200">
                        <h3 className="font-semibold">{sectionTitle}</h3>
                        <p className="text-sm text-gray-700">{breakdown}</p>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>
          </div>
        )}

        {/* Sections */}
        {report.sections
          .filter((sec) => sec.key !== "report_details")
          .map((sec) => (
            <div key={sec.id} className="preview-page page-break">
              <div className={tpl.container}>
                <section className={tpl.sectionWrapper}>
                  <h2 className={tpl.h2}>{sec.title}</h2>

                  <SectionInfoDisplay sectionKey={sec.key} sectionInfo={sec.info || {}} className={tpl.sectionInfo} />

                  {sec.findings.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No material defects noted.</p>
                  ) : (
                    sec.findings.map((f) => {
                      const Icon = SEVERITY_ICONS[f.severity];
                      return (
                        <article key={f.id} className={tpl.findingWrapper}>
                          <h3 className={tpl.h3}>
                            <span
                              aria-label={`${f.severity} issue`}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 mr-2 rounded ${tpl.severityBadge[f.severity] || ""}`}
                            >
                              <Icon size={14} />
                              {f.severity}
                            </span>
                            {f.title}
                          </h3>
                          {f.narrative && <p className="text-sm mt-1 whitespace-pre-wrap">{f.narrative}</p>}
                          {f.recommendation && <p className="text-sm mt-1 italic">Recommendation: {f.recommendation}</p>}
                          {f.media.length > 0 && (
                            <div className="mt-2 grid grid-cols-2 gap-3">
                              {f.media.map((m) => {
                                const hasSignedUrl = !isSupabaseUrl(m.url) || !!mediaUrlMap[m.id];
                                if (!hasSignedUrl) {
                                  return (
                                    <figure key={m.id}>
                                      <div className="w-full h-32 bg-muted rounded border" />
                                      {m.caption && <figcaption className="text-xs text-muted-foreground mt-1">{m.caption}</figcaption>}
                                    </figure>
                                  );
                                }
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
                                    {m.caption && <figcaption className="text-xs text-muted-foreground mt-1">{m.caption}</figcaption>}
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
              </div>
            </div>
          ))}
      </div>

      {/* Hidden/off-screen printable node for react-to-print */}
      <div ref={pdfContainerRef} style={{ position: "absolute", left: "-10000px", top: 0 }}>
        <PDFDocument
          report={report}
          mediaUrlMap={mediaUrlMap}
          coverUrl={coverUrl}
          company={organization?.name || ""}
        />
      </div>
    </>
  );
};

export default ReportPreview;
