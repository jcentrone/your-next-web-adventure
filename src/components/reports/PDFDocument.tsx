import React from "react";
import {Report} from "@/lib/reportSchemas";
import {PREVIEW_TEMPLATES} from "@/constants/previewTemplates";
import {AlertCircle, AlertOctagon, AlertTriangle, Info, MinusCircle, Wrench} from "lucide-react";
import ReportDetailsSection from "./ReportDetailsSection";
import SectionInfoDisplay from "./SectionInfoDisplay";
import {useAuth} from "@/contexts/AuthContext";
import {coverPagesApi} from "@/integrations/supabase/coverPagesApi";
import {Canvas as FabricCanvas} from "fabric";
import {replaceCoverMergeFields} from "@/utils/replaceCoverMergeFields";
import {replaceCoverImages} from "@/utils/replaceCoverImages";
import {getMyOrganization, getMyProfile} from "@/integrations/supabase/organizationsApi";
import {isSupabaseUrl} from "@/integrations/supabase/storage";

interface PDFDocumentProps {
    report: Report;
    mediaUrlMap: Record<string, string>;
    coverUrl: string;
}

const PDFDocument = React.forwardRef<HTMLDivElement, PDFDocumentProps>(
    ({report, mediaUrlMap, coverUrl}, ref) => {
        const {user} = useAuth();
        const [coverPage, setCoverPage] = React.useState<string | null>(null);

        React.useEffect(() => {
            if (!user) return;
            let cancelled = false;

            const PAGE_W = 850;
            const PAGE_H = 1100;

            // helper: wait for a couple of rAFs to ensure images are painted
            const raf = () => new Promise<void>((res) => requestAnimationFrame(() => requestAnimationFrame(() => res())));

            // helper: promisified loadFromJSON
            function loadFabricFromJSON(canvas: FabricCanvas, json: any) {
                return new Promise<void>((resolve, reject) => {
                    try {
                        canvas.loadFromJSON(
                            json as any,
                            () => resolve(),
                            // You don't *need* the reviver now, but keeping it is harmless:
                            (serialized: any, obj: any) => {
                                if (obj?.type === "image" && typeof obj.set === "function" && !obj.crossOrigin) {
                                    obj.set("crossOrigin", "anonymous");
                                }
                            }
                        );
                    } catch (e) {
                        reject(e);
                    }
                });
            }

            (async () => {
                try {
                    console.log("🎨 Loading cover page for report type:", report.reportType);
                    const cp = await coverPagesApi.getAssignedCoverPage(user.id, report.reportType);
                    if (!cp || !cp.design_json) {
                        console.log("❌ No cover page template found");
                        if (!cancelled) setCoverPage(null);
                        return;
                    }

                    console.log("📋 Found cover page template, creating canvas...");

                    // Create an off-screen canvas, Hi-DPI aware
                    const ratio = window.devicePixelRatio || 1;
                    const canvasEl = document.createElement("canvas");
                    canvasEl.style.position = "absolute";
                    canvasEl.style.left = "-10000px";
                    canvasEl.style.top = "0";

                    // Backing store
                    canvasEl.width = PAGE_W * ratio;
                    canvasEl.height = PAGE_H * ratio;
                    // CSS size (logical)
                    canvasEl.style.width = `${PAGE_W}px`;
                    canvasEl.style.height = `${PAGE_H}px`;

                    document.body.appendChild(canvasEl);

                    const canvas = new FabricCanvas(canvasEl, {
                        width: PAGE_W * ratio,
                        height: PAGE_H * ratio,
                        backgroundColor: "#ffffff",
                    });
                    canvas.setZoom(ratio);

                    console.log("📐 Loading design JSON...");
                    const [organization, inspector] = await Promise.all([getMyOrganization(), getMyProfile()]);

                    let designJson: any = await replaceCoverMergeFields(cp.design_json, {
                        organization: organization ?? null,
                        inspector,
                        report,
                    });

                    // Important: resolve all image URLs *before* loading JSON
                    designJson = await replaceCoverImages(designJson, report, organization ?? null);

                    // Load and wait for fabric to finish creating objects and images
                    await loadFabricFromJSON(canvas, designJson);

                    // A couple of extra frames so remote images definitely paint
                    canvas.renderAll();
                    await raf();
                    canvas.renderAll();
                    await raf();

                    const url = canvas.toDataURL({
                        format: "png",
                        multiplier: 1, // already Hi-DPI via setZoom/backing store
                        quality: 0.92,
                    });

                    console.log("🖼️ Generated cover page URL:", url ? "✅ Success" : "❌ Failed");

                    if (!cancelled && url) setCoverPage(url);

                    // cleanup
                    requestAnimationFrame(() => {
                        canvas.dispose();
                        canvasEl.remove();
                    });
                } catch (err) {
                    console.error("❌ Error loading cover page:", err);
                    if (!cancelled) setCoverPage(null);
                }
            })();

            return () => {
                cancelled = true;
            };
        }, [user, report.reportType]); // keep this dependency set

        // Only render PDFs for home inspection reports for now
        if (report.reportType !== "home_inspection") {
            return (
                <div className="p-8 text-center">
                    <p>PDF generation for wind mitigation reports is coming soon.</p>
                </div>
            );
        }

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
                {/* Custom Cover Page from Template */}
                {coverPage && (
                    <section className="pdf-page-break flex justify-center">
                        <img src={coverPage} alt="Cover Page" className="max-w-full h-auto"/>
                    </section>
                )}

                {/* Fallback Cover Page (only if no custom cover page) */}
                {!coverPage && (
                    <article className={tpl.container}>
                        <section className={`${tpl.cover} pdf-page-break`}>
                            <header className="mb-4 text-center">
                                <h1 className={tpl.coverTitle}>{report.title}</h1>
                                <p className={tpl.coverSubtitle}>
                                    {report.clientName} • {new Date(report.inspectionDate).toLocaleDateString()} • {report.address}
                                </p>
                            </header>
                            {coverUrl && (
                                <img src={coverUrl} alt="Report cover"
                                     className="cover max-w-full h-auto rounded border"/>
                            )}
                        </section>
                    </article>
                )}

                <article className={tpl.container}>

                    {/* Report Details */}
                    <section className={`${tpl.reportDetails} pdf-page-break`}>
                        <ReportDetailsSection
                            report={report}
                            sectionInfo={report.sections.find(s => s.key === 'report_details')?.info || {}}
                        />
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
                                        : (badgeConfig as { className?: string })?.className || '';

                                    return (
                                        <div key={severity} className="flex flex-col items-center">
                                            <div
                                                className={`flex items-center justify-center w-17 h-17 rounded-full ${badgeClasses}`}>
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
                                    const badgeConfig = tpl.severityBadge[f.severity];
                                    const badgeClasses = typeof badgeConfig === 'string'
                                        ? badgeConfig
                                        : (badgeConfig as { className?: string })?.className || '';

                                    return (
                                        <article key={f.id} className={tpl.findingWrapper}>
                                            <h3 className={tpl.h3}>
                        <span
                            aria-label={`${f.severity} issue`}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 mr-2 rounded ${badgeClasses}`}
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
                                                        const hasSignedUrl = !isSupabaseUrl(m.url) || !!mediaUrlMap[m.id];
                                                        if (!hasSignedUrl) {
                                                            return (
                                                                <figure key={m.id}>
                                                                    <div
                                                                        className="w-full h-32 bg-gray-100 rounded border"/>
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
                                                                    <img
                                                                        src={resolvedUrl}
                                                                        alt={m.caption || f.title}
                                                                        className="w-full max-h-64 object-contain rounded border pdf-image"
                                                                    />
                                                                ) : m.type === "video" ? (
                                                                    <div
                                                                        className="w-full h-32 bg-gray-100 rounded border flex items-center justify-center">
                                                                        <p className="text-sm text-gray-500">Video: {m.caption || f.title}</p>
                                                                    </div>
                                                                ) : (
                                                                    <div
                                                                        className="w-full h-16 bg-gray-100 rounded border flex items-center justify-center">
                                                                        <p className="text-xs text-gray-500">Audio: {m.caption || f.title}</p>
                                                                    </div>
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
            </div>
        );
    }
);

PDFDocument.displayName = "PDFDocument";

export default PDFDocument;