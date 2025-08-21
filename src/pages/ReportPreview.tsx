import React from "react";
import {Button} from "@/components/ui/button";
import {useNavigate, useParams} from "react-router-dom";
import Seo from "@/components/Seo";
import {loadReport as loadLocalReport, saveReport as saveLocalReport} from "@/hooks/useLocalDraft";
import {useAuth} from "@/contexts/AuthContext";
import {dbGetReport, dbUpdateReport} from "@/integrations/supabase/reportsApi";
import {Report} from "@/lib/reportSchemas";
import {getSignedUrlFromSupabaseUrl, isSupabaseUrl} from "@/integrations/supabase/storage";
import {coverPagesApi} from "@/integrations/supabase/coverPagesApi";
import {CoverPagePreview} from "@/components/cover-pages/CoverPagePreview";
import {Badge} from "@/components/ui/badge";
import {PREVIEW_TEMPLATES} from "@/constants/previewTemplates";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {toast} from "@/components/ui/use-toast";
import {AlertCircle, AlertOctagon, AlertTriangle, Info, MinusCircle, Wrench} from "lucide-react";
import {useReactToPrint} from "react-to-print";
import PDFDocument from "@/components/reports/PDFDocument";
import ReportDetailsSection from "@/components/reports/ReportDetailsSection";
import SectionInfoDisplay from "@/components/reports/SectionInfoDisplay";
import "../styles/pdf.css";
import {fillWindMitigationPDF} from "@/utils/fillWindMitigationPDF";


function ButtonBar({id}: { id: string }) {
    const nav = useNavigate();
    return (
        <div className="w-full flex items-center justify-between gap-2">
            <Button variant="outline" onClick={() => nav(`/reports/${id}`)}
                    aria-label="Close preview and return to editor">
                Close Preview
            </Button>
            <Button onClick={() => window.print()} aria-label="Download PDF">
                Download PDF
            </Button>
        </div>
    );
}

function SeverityBadge({severity, classes}: { severity: string; classes?: Record<string, string> }) {
    if (classes) {
        const cls = classes[severity] ?? "";
        return (
            <span className={
                `inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cls}`
            }>
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

function TemplateSelector({value, onChange, disabled}: {
    value: 'classic' | 'modern' | 'minimal';
    onChange: (v: 'classic' | 'modern' | 'minimal') => void;
    disabled?: boolean
}) {
    return (
        <Select value={value} onValueChange={(v) => onChange(v as any)} disabled={disabled}>
            <SelectTrigger className="w-[200px]" aria-label="Choose preview template">
                <SelectValue placeholder="Choose template"/>
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
    const {id} = useParams();
    const {user} = useAuth();
    const [report, setReport] = React.useState<Report | null>(null);
    const [mediaUrlMap, setMediaUrlMap] = React.useState<Record<string, string>>({});
    const [coverUrl, setCoverUrl] = React.useState<string>("");
    const [coverPage, setCoverPage] = React.useState<{ color: string; text?: string; imageUrl?: string } | null>(null);
    const [isGeneratingPDF, setIsGeneratingPDF] = React.useState(false);
    const pdfRef = React.useRef<HTMLDivElement>(null);

    const nav = useNavigate();
    const [savingTpl, setSavingTpl] = React.useState(false);

    const handlePrint = useReactToPrint({
        contentRef: pdfRef,
        documentTitle: `${report?.title || 'Report'} - ${report?.clientName || 'Client'}`,
    });

    const handleWindMitigationDownload = async () => {
        if (!report) return;
        try {
            const pdfBlob = await fillWindMitigationPDF(report || {}); // pass in report data
            const url = URL.createObjectURL(pdfBlob);

            const link = document.createElement("a");
            link.href = url;
            link.download = "wind_mitigation_report.pdf";
            link.click();

            URL.revokeObjectURL(url);
            toast({
                title: "PDF Generated",
                description: "Your Wind Mitigation Report has been generated successfully.",
            });
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
                toast({title: 'PDF Generated', description: 'Your report has been generated successfully.'});
            }, 1000);
        } catch (error) {
            setIsGeneratingPDF(false);
            toast({
                title: 'PDF Generation Failed',
                description: 'Failed to generate PDF. Please try again.',
                variant: 'destructive'
            });
        }
    };

    const handleTemplateChange = async (tplKey: 'classic' | 'modern' | 'minimal') => {
        if (!report) return;
        setSavingTpl(true);
        try {
            const next = {...report, previewTemplate: tplKey} as Report;
            if (user) {
                const updated = await dbUpdateReport(next);
                setReport(updated);
            } else {
                saveLocalReport(next);
                setReport(next);
            }
            toast({title: 'Template updated', description: `Applied ${tplKey} template.`});
        } catch (e) {
            console.error(e);
            toast({
                title: 'Failed to update template',
                description: 'Please try again.',
                variant: 'destructive'
            } as any);
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
        if (!user || !report || report.reportType !== "home_inspection") return;
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
                        const next = {...prev};
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
            // cover page
            if (report.coverPageId) {
                try {
                    const pages = await coverPagesApi.getCoverPages(user.id);
                    const cp = pages.find((p) => p.id === report.coverPageId);
                    if (cp) {
                        let imageUrl = cp.image_url || undefined;
                        if (imageUrl && isSupabaseUrl(imageUrl)) {
                            imageUrl = await getSignedUrlFromSupabaseUrl(imageUrl);
                        }
                        if (!cancelled) {
                            setCoverPage({
                                color: cp.color_palette_key || "#000000",
                                text: (cp.text_content as string) || "",
                                imageUrl,
                            });
                        }
                    } else if (!cancelled) {
                        setCoverPage(null);
                    }
                } catch (e) {
                    console.error(e);
                    if (!cancelled) setCoverPage(null);
                }
            } else if (!cancelled) {
                setCoverPage(null);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [user, report]);

    if (!report) return null;

    const tpl = PREVIEW_TEMPLATES[report.previewTemplate] || PREVIEW_TEMPLATES.classic;
    const severityOrder = ["Safety", "Major", "Moderate", "Minor", "Maintenance", "Info"] as const;

    // Only show preview for home inspection reports for now
    if (report.reportType !== "home_inspection") {
        return (
            <div className="max-w-4xl mx-auto px-4 py-10 text-center">
                <h1 className="text-2xl font-bold mb-4">Wind Mitigation Report</h1>
                <p className="text-muted-foreground mb-6">
                    Generate your completed Wind Mitigation Report as a PDF.
                </p>
                <div className="flex justify-center gap-4">
                    <Button onClick={handleWindMitigationDownload}>
                        Download Wind Mitigation PDF
                    </Button>
                    <Button variant="outline" onClick={() => nav(`/reports/${report.id}`)}>
                        Back to Editor
                    </Button>
                </div>
            </div>
        );
    }


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

    // Group summary findings by section and severity
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
                    <Button variant="outline" onClick={() => nav(`/reports/${report.id}`)}
                            aria-label="Close preview and return to editor">
                        Close Preview
                    </Button>
                    <TemplateSelector value={report.previewTemplate} onChange={handleTemplateChange}
                                      disabled={savingTpl}/>
                </div>
                <Button
                    onClick={onPrintClick}
                    disabled={isGeneratingPDF}
                    aria-label="Download PDF"
                >
                    {isGeneratingPDF ? 'Generating PDF...' : 'Download PDF'}
                </Button>
            </div>
            {coverPage && (
                <section className="page-break flex justify-center">
                    <CoverPagePreview
                        title={report.title}
                        text={coverPage.text}
                        color={coverPage.color}
                        imageUrl={coverPage.imageUrl}
                    />
                </section>
            )}
            <article className={tpl.container}>
                {/* Cover Page */}
                <section className={`${tpl.cover} page-break`}>
                    <header className="mb-4 text-center">
                        <h1 className={tpl.coverTitle}>{report.title}</h1>
                        <p className={tpl.coverSubtitle}>
                            {report.clientName} • {new Date(report.inspectionDate).toLocaleDateString()} • {report.address}
                        </p>
                    </header>
                    {coverUrl && (
                        <img src={coverUrl} alt="Report cover" className="w-auto h-100 rounded border"/>
                    )}
                </section>

                {/* Report Details */}
                <ReportDetailsSection
                    report={report}
                    sectionInfo={report.sections.find(s => s.key === 'report_details')?.info || {}}
                    className={tpl.reportDetails}
                />

                {/* Summary */}
                {Object.keys(severityCounts).length > 0 && (
                    <section className="my-10 text-center page-break">
                        <h2 className={tpl.summaryTitle}>Summary of Defeciencies</h2>

                        {/* Top Level: Big Bubbles */}
                        <div className="flex flex-wrap justify-center gap-8 mb-8">
                            {orderedSeverities.map(severity => {
                                const Icon = SEVERITY_ICONS[severity];
                                return (
                                    <div key={severity} className="flex flex-col items-center">
                                        <div
                                            className={`flex items-center justify-center w-20 h-20 rounded-full ${tpl.severityBadge[severity] || ''}`}
                                        >
                                            <Icon size={45} className="text-white"/>
                                        </div>
                                        <span className="mt-2 font-bold">{severityCounts[severity]}</span>
                                        <span className="text-sm">{severity}</span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Second Level: Breakdown by Section */}
                        <div className="mt-6 text-left max-w-3xl mx-auto">
                            {sectionSeverityCounts.map(({sectionTitle, counts}) => {
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
                {report.sections.filter(sec => sec.key !== 'report_details').map((sec) => (
                    <section key={sec.id} className={tpl.sectionWrapper}>
                        <h2 className={tpl.h2}>{sec.title}</h2>

                        {/* Section Information */}
                        <SectionInfoDisplay
                            sectionKey={sec.key}
                            sectionInfo={sec.info || {}}
                            className={tpl.sectionInfo}
                        />

                        {sec.findings.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No material defects noted.</p>
                        ) : (
                            sec.findings.map((f) => {
                                const Icon = SEVERITY_ICONS[f.severity];
                                return (
                                    <article key={f.id} className={tpl.findingWrapper}>
                                        <h3 className={tpl.h3}>
                      <span aria-label={`${f.severity} issue`}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 mr-2 rounded ${tpl.severityBadge[f.severity] || ''}`}
                      >
                        <Icon size={14}/>
                          {f.severity}
                      </span>
                                            {f.title}
                                        </h3>
                                        {f.narrative &&
                                            <p className="text-sm mt-1 whitespace-pre-wrap">{f.narrative}</p>}
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
                                                                <img src={resolvedUrl} alt={m.caption || f.title}
                                                                     loading="lazy" className="w-full rounded border"/>
                                                            ) : m.type === "video" ? (
                                                                <video src={resolvedUrl} controls
                                                                       className="w-full rounded border"/>
                                                            ) : (
                                                                <audio src={resolvedUrl} controls/>
                                                            )}
                                                            {m.caption && (
                                                                <figcaption
                                                                    className="text-xs text-muted-foreground mt-1">{m.caption}</figcaption>
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

            {/* Hidden PDF Document for react-to-print */}
            <div style={{display: 'none'}}>
                <PDFDocument
                    ref={pdfRef}
                    report={report}
                    mediaUrlMap={mediaUrlMap}
                    coverUrl={coverUrl}
                    coverPage={coverPage ? {
                        title: report.title,
                        text: coverPage.text,
                        color: coverPage.color,
                        imageUrl: coverPage.imageUrl
                    } : undefined}
                />
            </div>
        </>
    );
};

export default ReportPreview;
