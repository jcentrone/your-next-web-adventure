import React from "react";
import {Report} from "@/lib/reportSchemas";
import {PREVIEW_TEMPLATES} from "@/constants/previewTemplates";
import {COLOR_SCHEMES} from "@/components/ui/color-scheme-picker";
import {AlertCircle, AlertOctagon, AlertTriangle, Info, MinusCircle, Wrench} from "lucide-react";
import ReportDetailsSection from "./ReportDetailsSection";
import SectionInfoDisplay from "./SectionInfoDisplay";
import {isSupabaseUrl} from "@/integrations/supabase/storage";
import {COVER_TEMPLATES} from "@/constants/coverTemplates";
import {renderInternachiStandards} from "@/utils/internachiStandardsContent";
import InspectorCertificationPage from "./InspectorCertificationPage";


interface PDFDocumentProps {
  report: Report;
  mediaUrlMap: Record<string, string>;
  coverUrl: string;
  company?: string;
  termsHtml?: string;
  inspector?: any;
  organization?: any;
}

const PDFDocument = React.forwardRef<HTMLDivElement, PDFDocumentProps>(
    ({report, mediaUrlMap, coverUrl, company, termsHtml, inspector, organization}, ref) => {
        // This component now only handles home inspection reports
        if (report.reportType !== "home_inspection" || !("sections" in report)) {
            return (
                <div className="p-8 text-center">
                    <p>This component only handles home inspection reports.</p>
                </div>
            );
        }

        const tpl = PREVIEW_TEMPLATES[report.previewTemplate] || PREVIEW_TEMPLATES.classic;
        const CoverComponent = COVER_TEMPLATES[report.coverTemplate].component;
        const severityOrder = ["Safety", "Major", "Moderate", "Minor", "Maintenance", "Info"] as const;

        const DEFAULT_TEXT_COLOR = "222 47% 11%";
        const colorVars =
            report.colorScheme === "custom" && report.customColors
                ? {
                    "--heading-text-color": `hsl(${report.customColors.headingText || DEFAULT_TEXT_COLOR})`,
                    "--body-text-color": `hsl(${report.customColors.bodyText || DEFAULT_TEXT_COLOR})`,
                }
                : undefined;

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
            <div ref={ref} className="pdf-document relative z-10" style={colorVars as any}>
                <div className="preview-page pdf-page-break relative z-10">
                    <div className="h-[1056px] relative z-10">
                        <CoverComponent
                            reportTitle={report.title}
                            clientName={report.clientName}
                            coverImage={coverUrl}
                            organizationName={company}
                            inspectionDate={report.inspectionDate}
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
                        />
                    </div>
                </div>

                <div className="preview-page">
                    <article className={tpl.container}>
                        {/* Report Details */}
                        <section className={`${tpl.reportDetails} pdf-page-break`}>
                            <ReportDetailsSection
                                report={report}
                                sectionInfo={report.sections.find(s => s.key === 'report_details')?.info || {}}
                            />
                        </section>
                    </article>
                </div>

                {/* Summary */}
                {Object.keys(severityCounts).length > 0 && (
                    <div className="preview-page">
                        <article className={tpl.container}>
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
                        </article>
                    </div>
                )}

                {/* Sections */}
                {report.sections.filter(sec => sec.key !== 'report_details').map((sec) => (
                    <div key={sec.id} className="preview-page">
                        <article className={tpl.container}>
                            <section className={tpl.sectionWrapper}>
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
                        </article>
                    </div>
                ))}

                {/* Inspector Certification Page */}
                <div className="preview-page">
                    <article className={tpl.container}>
                        <section className="pdf-page-break">
                            <InspectorCertificationPage
                                inspector={inspector}
                                organization={organization}
                                report={report}
                                mediaUrlMap={mediaUrlMap}
                            />
                        </section>
                    </article>
                </div>

                {/* InterNACHI Standards of Practice */}
                {renderInternachiStandards()}

                {termsHtml && (
                    <div className="preview-page">
                        <article className={tpl.container}>
                            <section className="pdf-page-break" dangerouslySetInnerHTML={{__html: termsHtml}}/>
                        </article>
                    </div>
                )}
            </div>
        );
    }
);

PDFDocument.displayName = "PDFDocument";

export default PDFDocument;