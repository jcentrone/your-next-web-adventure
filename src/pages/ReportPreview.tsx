import React from "react";
import {Button} from "@/components/ui/button";
import {useNavigate, useParams} from "react-router-dom";
import Seo from "@/components/Seo";
import {loadReport as loadLocalReport, saveReport as saveLocalReport} from "@/hooks/useLocalDraft";
import {useAuth} from "@/contexts/AuthContext";
import {dbGetReport, dbUpdateReport} from "@/integrations/supabase/reportsApi";
import {Report} from "@/lib/reportSchemas";
import {getSignedUrlFromSupabaseUrl, isSupabaseUrl} from "@/integrations/supabase/storage";
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
import {coverPagesApi} from "@/integrations/supabase/coverPagesApi";
import * as fabric from 'fabric';
import {replaceCoverImages} from "@/utils/replaceCoverImages";
import {replaceCoverMergeFields} from "@/utils/replaceCoverMergeFields";
import {getMyOrganization, getMyProfile} from "@/integrations/supabase/organizationsApi";

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
            <span
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cls}`}
            >
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

function TemplateSelector({
                              value,
                              onChange,
                              disabled,
                          }: {
    value: "classic" | "modern" | "minimal";
    onChange: (v: "classic" | "modern" | "minimal") => void;
    disabled?: boolean;
}) {
    return (
        <Select
            value={value}
            onValueChange={(v) => onChange(v as "classic" | "modern" | "minimal")}
            disabled={disabled}
        >
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
    const [hasCoverPage, setHasCoverPage] = React.useState(false);

    // Fabric canvas refs
    const coverCanvasRef = React.useRef<HTMLCanvasElement>(null);
    const fabricRef = React.useRef<fabric.Canvas | null>(null);

    const [isGeneratingPDF, setIsGeneratingPDF] = React.useState(false);
    const [savingTpl, setSavingTpl] = React.useState(false);
    const nav = useNavigate();

    // react-to-print: use off-screen container (must be measurable, not display:none)
    const pdfContainerRef = React.useRef<HTMLDivElement>(null);
    const handlePrint = useReactToPrint({
        contentRef: pdfContainerRef,              // ✅ v3 API
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
                toast({title: "PDF Generated", description: "Your report has been generated successfully."});
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

    const handleTemplateChange = async (tplKey: "classic" | "modern" | "minimal") => {
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
            toast({title: "Template updated", description: `Applied ${tplKey} template.`});
        } catch (e) {
            console.error(e);
            toast({
                title: "Failed to update template",
                description: "Please try again.",
                variant: "destructive",
            });
        } finally {
            setSavingTpl(false);
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

    // Resolve media URLs + build cover page
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
                                const next = {...prev};
                                for (const e of entries) {
                                    if (e) next[e[0]] = e[1];
                                }
                                return next;
                            });
                        }
                    }
                }

                // cover image
                if (report.coverImage) {
                    if (isSupabaseUrl(report.coverImage)) {
                        const signed = await getSignedUrlFromSupabaseUrl(report.coverImage);
                        if (!cancelled) setCoverUrl(signed);
                    } else if (!cancelled) {
                        setCoverUrl(report.coverImage);
                    }
                }

                // Assigned cover page
                const [cp, organization, inspector] = await Promise.all([
                    coverPagesApi.getAssignedCoverPage(user.id, report.reportType),
                    getMyOrganization(),
                    getMyProfile(),
                ]);

                if (cp && cp.design_json && coverCanvasRef.current) {
                    if (!cancelled) setHasCoverPage(true);

                    // Match DOM canvas size with Fabric logical size
                    const W = 850;
                    const H = 1100;

                    // Init or reset fabric canvas
                    if (!fabricRef.current) {
                        fabricRef.current = new fabric.Canvas(coverCanvasRef.current, {
                            width: W,
                            height: H,
                        });
                    } else {
                        fabricRef.current.clear();
                        fabricRef.current.setDimensions({width: W, height: H});
                    }

                    // Optional: handle retina scaling for sharper output
                    const ratio = window.devicePixelRatio || 1;
                    // Scale backing store but keep CSS pixels consistent
                    coverCanvasRef.current.width = W * ratio;
                    coverCanvasRef.current.height = H * ratio;
                    coverCanvasRef.current.style.width = `${W}px`;
                    coverCanvasRef.current.style.height = `${H}px`;
                    fabricRef.current.setZoom(ratio);
                    fabricRef.current.setDimensions({width: W * ratio, height: H * ratio});

                    // Parse and replace fields/images
                    const designJson = typeof cp.design_json === "string" ? JSON.parse(cp.design_json) : cp.design_json;

                    const mergeFieldsReplaced = await replaceCoverMergeFields(designJson, {
                        organization: organization ?? null,
                        inspector,
                        report,
                    });

                    const imagesReplaced = await replaceCoverImages(mergeFieldsReplaced, report, organization ?? null, inspector);


                    // --- replace your loadFromJSON block with this ---
                    const DEBUG_COVER_FIT = true;

// Decide which root to pass to Fabric: {objects:[...]} or {canvas:{objects:[...]}}
                    const hasCanvasWrapper =
                        imagesReplaced &&
                        typeof imagesReplaced === "object" &&
                        imagesReplaced.canvas &&
                        typeof imagesReplaced.canvas === "object" &&
                        Array.isArray(imagesReplaced.canvas.objects);

                    const payloadRoot = hasCanvasWrapper ? imagesReplaced.canvas : imagesReplaced;

                    if (DEBUG_COVER_FIT) {
                        console.groupCollapsed("[cover-fit] preparing loadFromJSON");
                        console.log("  hasCanvasWrapper:", hasCanvasWrapper);
                        console.log("  payloadRoot keys:", Object.keys(payloadRoot || {}));
                        console.log(
                            "  objects length:",
                            Array.isArray(payloadRoot?.objects) ? payloadRoot.objects.length : 0
                        );
                        console.groupEnd();
                    }

                    fabricRef.current.loadFromJSON(
                        payloadRoot as any,
                        () => {
                            const c = fabricRef.current!;
                            const objects = c.getObjects();
                            const isImage = (o: any) => (o?.type?.toLowerCase?.() ?? "") === "image";

                            if (DEBUG_COVER_FIT) {
                                console.groupCollapsed(
                                    `[cover-fit] loadFromJSON callback: objs=${objects.length}, canvas {w=${c.getWidth()}, h=${c.getHeight()}, zoom=${c.getZoom()}}`
                                );
                                console.log(
                                    "  object types:",
                                    objects.map((o: any) => o?.type)
                                );
                            }

                            const getIntrinsicSize = (o: any) => {
                                // Prefer Fabric’s width/height after image element has been attached
                                if (
                                    typeof o.width === "number" &&
                                    o.width > 0 &&
                                    typeof o.height === "number" &&
                                    o.height > 0
                                ) {
                                    return {iw: o.width as number, ih: o.height as number, via: "fabric.width/height"};
                                }
                                const el: any =
                                    o.getElement?.() ??
                                    (o as any)._originalElement ??
                                    (o as any)._element ??
                                    null;
                                const iw = el?.naturalWidth ?? el?.videoWidth ?? el?.width ?? 1;
                                const ih = el?.naturalHeight ?? el?.videoHeight ?? el?.height ?? 1;
                                return {iw, ih, via: el ? "element.naturalSize" : "fallback=1"};
                            };

                            objects.forEach((o: any, idx: number) => {
                                if (!isImage(o)) return;

                                const frameW = Number.isFinite(o._frameW) ? o._frameW : (o.width ?? 0);
                                const frameH = Number.isFinite(o._frameH) ? o._frameH : (o.height ?? 0);
                                const frameLeft = Number.isFinite(o._frameLeft) ? o._frameLeft : (o.left ?? 0);
                                const frameTop = Number.isFinite(o._frameTop) ? o._frameTop : (o.top ?? 0);

                                const {iw, ih, via} = getIntrinsicSize(o);
                                const fitMode = (o.objectFit || o?.metadata?.objectFit || "contain").toLowerCase();

                                if (DEBUG_COVER_FIT) {
                                    console.groupCollapsed(`[cover-fit] #${idx} image`);
                                    console.log("  src:", (o as any).src);
                                    console.log("  frame:", {frameLeft, frameTop, frameW, frameH});
                                    console.log("  intrinsic:", {iw, ih, via});
                                    console.log("  before:", {
                                        left: o.left,
                                        top: o.top,
                                        scaleX: o.scaleX,
                                        scaleY: o.scaleY,
                                        getScaledW: o.getScaledWidth?.(),
                                        getScaledH: o.getScaledHeight?.(),
                                        objectFit: fitMode,
                                        clipPath: !!o.clipPath,
                                    });
                                }

                                if (frameW > 0 && frameH > 0 && iw > 0 && ih > 0) {
                                    const sx = frameW / iw;
                                    const sy = frameH / ih;
                                    const scale = fitMode === "cover" ? Math.max(sx, sy) : Math.min(sx, sy);

                                    o.set({scaleX: scale, scaleY: scale});

                                    const drawnW = iw * scale;
                                    const drawnH = ih * scale;
                                    const left = frameLeft + (frameW - drawnW) / 2;
                                    const top = frameTop + (frameH - drawnH) / 2;

                                    o.set({left, top});

                                    if (fitMode === "cover") {
                                        o.set({
                                            clipPath: new fabric.Rect({
                                                left: frameLeft,
                                                top: frameTop,
                                                width: frameW,
                                                height: frameH,
                                                absolutePositioned: true,
                                            }),
                                        });
                                    } else if (o.clipPath) {
                                        o.set({clipPath: undefined});
                                    }

                                    // Remove design-time styles & enforce CORS
                                    o.set({
                                        crossOrigin: o.crossOrigin ?? "anonymous",
                                        stroke: undefined,
                                        strokeWidth: 0,
                                        strokeDashArray: undefined,
                                        shadow: undefined,
                                        backgroundColor: undefined,
                                    });

                                    delete (o as any)._frameW;
                                    delete (o as any)._frameH;
                                    delete (o as any)._frameLeft;
                                    delete (o as any)._frameTop;

                                    o.setCoords();

                                    if (DEBUG_COVER_FIT) {
                                        console.log("  computed:", {sx, sy, scale, drawnW, drawnH, left, top});
                                        console.log("  after:", {
                                            left: o.left,
                                            top: o.top,
                                            scaleX: o.scaleX,
                                            scaleY: o.scaleY,
                                            getScaledW: o.getScaledWidth?.(),
                                            getScaledH: o.getScaledHeight?.(),
                                            clipPath: !!o.clipPath,
                                        });
                                        console.groupEnd();
                                    }
                                } else if (DEBUG_COVER_FIT) {
                                    console.warn("  ⚠️ skipping fit: invalid frame or intrinsic size", {
                                        frameW,
                                        frameH,
                                        iw,
                                        ih
                                    });
                                    console.groupEnd();
                                }
                            });

                            if (DEBUG_COVER_FIT) console.groupEnd();
                            c.requestRenderAll();
                        },
                        // Reviver: ensure images get crossOrigin (and log it)
                        (serialized: any, obj: fabric.Object) => {
                            if ((obj as any)?.type === "image" && typeof (obj as any).set === "function") {
                                const before = (obj as any).crossOrigin;
                                (obj as any).set("crossOrigin", (obj as any).crossOrigin ?? "anonymous");
                                if (DEBUG_COVER_FIT) {
                                    console.log(
                                        `[cover-fit] reviver(image): crossOrigin ${before ?? "<unset>"} -> ${(obj as any).crossOrigin}`
                                    );
                                }
                            }
                        }
                    );


                } else if (!cancelled) {
                    setHasCoverPage(false);
                }
            } catch (err) {
                console.error("Error generating cover page:", err);
                if (!cancelled) setHasCoverPage(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [user, report]);

    React.useEffect(() => {
        return () => {
            fabricRef.current?.dispose();
            fabricRef.current = null;
        };
    }, []);

    if (!report) return null;

    const tpl = PREVIEW_TEMPLATES[report.previewTemplate] || PREVIEW_TEMPLATES.classic;
    const severityOrder = ["Safety", "Major", "Moderate", "Minor", "Maintenance", "Info"] as const;

    if (report.reportType !== "home_inspection") {
        return (
            <div className="max-w-4xl mx-auto px-4 py-10 text-center">
                <h1 className="text-2xl font-bold mb-4">Wind Mitigation Report</h1>
                <p className="text-muted-foreground mb-6">Generate your completed Wind Mitigation Report as a PDF.</p>
                <div className="flex justify-center gap-4">
                    <Button onClick={handleWindMitigationDownload}>Download Wind Mitigation PDF</Button>
                    <Button variant="outline" onClick={() => nav(`/reports/${report.id}`)}>
                        Back to Editor
                    </Button>
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
        if (Object.keys(counts).length > 0) acc.push({sectionTitle: sec.title, counts});
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

            {/* Top bar */}
            <div className="max-w-4xl mx-auto px-4 py-4 print-hidden flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => nav(`/reports/${report.id}`)}
                            aria-label="Close preview and return to editor">
                        Close Preview
                    </Button>
                    <TemplateSelector value={report.previewTemplate} onChange={handleTemplateChange}
                                      disabled={savingTpl}/>
                </div>
                <Button onClick={onPrintClick} disabled={isGeneratingPDF} aria-label="Download PDF">
                    {isGeneratingPDF ? "Generating PDF..." : "Download PDF"}
                </Button>
            </div>

            {/* Custom Cover Page from Template */}
            <section className={`page-break flex justify-center ${hasCoverPage ? "" : "hidden"}`}>
                {/* Keep CSS size matching (visibility) */}
                <canvas
                    ref={coverCanvasRef}
                    // CSS pixels; Fabric backing store/zoom handled in effect
                    style={{width: 850, height: 1100}}
                    className="max-w-full h-auto border rounded"
                />
            </section>

            {/* Fallback Cover Page */}
            {!hasCoverPage && (
                <article className={tpl.container}>
                    <section className={`${tpl.cover} page-break`}>
                        <header className="mb-4 text-center">
                            <h1 className={tpl.coverTitle}>{report.title}</h1>
                            <p className={tpl.coverSubtitle}>
                                {report.clientName} • {new Date(report.inspectionDate).toLocaleDateString()} • {report.address}
                            </p>
                        </header>
                        {coverUrl && <img src={coverUrl} alt="Report cover" className="w-auto h-100 rounded border"/>}
                    </section>
                </article>
            )}

            <article className={tpl.container}>
                {/* Report Details */}
                <ReportDetailsSection
                    report={report}
                    sectionInfo={report.sections.find((s) => s.key === "report_details")?.info || {}}
                    className={tpl.reportDetails}
                />

                {/* Summary */}
                {Object.keys(severityCounts).length > 0 && (
                    <section className="my-10 text-center page-break">
                        <h2 className={tpl.summaryTitle}>Summary of Deficiencies</h2>

                        {/* Big bubbles */}
                        <div className="flex flex-wrap justify-center gap-8 mb-8">
                            {orderedSeverities.map((severity) => {
                                const Icon = SEVERITY_ICONS[severity];
                                return (
                                    <div key={severity} className="flex flex-col items-center">
                                        <div
                                            className={`flex items-center justify-center w-20 h-20 rounded-full ${tpl.severityBadge[severity] || ""}`}>
                                            <Icon size={45} className="text-white"/>
                                        </div>
                                        <span className="mt-2 font-bold">{severityCounts[severity]}</span>
                                        <span className="text-sm">{severity}</span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Breakdown by section */}
                        <div className="mt-6 text-left max-w-3xl mx-auto">
                            {sectionSeverityCounts.map(({sectionTitle, counts}) => {
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
                )}

                {/* Sections */}
                {report.sections
                    .filter((sec) => sec.key !== "report_details")
                    .map((sec) => (
                        <section key={sec.id} className={tpl.sectionWrapper}>
                            <h2 className={tpl.h2}>{sec.title}</h2>

                            <SectionInfoDisplay sectionKey={sec.key} sectionInfo={sec.info || {}}
                                                className={tpl.sectionInfo}/>

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
                          <Icon size={14}/>
                            {f.severity}
                        </span>
                                                {f.title}
                                            </h3>
                                            {f.narrative &&
                                                <p className="text-sm mt-1 whitespace-pre-wrap">{f.narrative}</p>}
                                            {f.recommendation &&
                                                <p className="text-sm mt-1 italic">Recommendation: {f.recommendation}</p>}
                                            {f.media.length > 0 && (
                                                <div className="mt-2 grid grid-cols-2 gap-3">
                                                    {f.media.map((m) => {
                                                        const hasSignedUrl = !isSupabaseUrl(m.url) || !!mediaUrlMap[m.id];
                                                        if (!hasSignedUrl) {
                                                            return (
                                                                <figure key={m.id}>
                                                                    <div
                                                                        className="w-full h-32 bg-muted rounded border"/>
                                                                    {m.caption && (
                                                                        <figcaption
                                                                            className="text-xs text-muted-foreground mt-1">{m.caption}</figcaption>
                                                                    )}
                                                                </figure>
                                                            );
                                                        }
                                                        const resolvedUrl = mediaUrlMap[m.id] || m.url;
                                                        return (
                                                            <figure key={m.id}>
                                                                {m.type === "image" ? (
                                                                    <img src={resolvedUrl} alt={m.caption || f.title}
                                                                         loading="lazy"
                                                                         className="w-full rounded border"/>
                                                                ) : m.type === "video" ? (
                                                                    <video src={resolvedUrl} controls
                                                                           className="w-full rounded border"/>
                                                                ) : (
                                                                    <audio src={resolvedUrl} controls/>
                                                                )}
                                                                {m.caption && <figcaption
                                                                    className="text-xs text-muted-foreground mt-1">{m.caption}</figcaption>}
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

            {/* Hidden/off-screen printable node for react-to-print */}
            <div ref={pdfContainerRef} style={{position: "absolute", left: "-10000px", top: 0}}>
                <PDFDocument report={report} mediaUrlMap={mediaUrlMap} coverUrl={coverUrl}/>
            </div>
        </>
    );
};

export default ReportPreview;
