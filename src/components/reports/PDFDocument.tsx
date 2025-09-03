import React from "react";
import {Report} from "@/lib/reportSchemas";
import {PREVIEW_TEMPLATES} from "@/constants/previewTemplates";
import { COLOR_SCHEMES } from "@/components/ui/color-scheme-picker";
import {AlertCircle, AlertOctagon, AlertTriangle, Info, MinusCircle, Wrench} from "lucide-react";
import ReportDetailsSection from "./ReportDetailsSection";
import SectionInfoDisplay from "./SectionInfoDisplay";
import { isSupabaseUrl } from "@/integrations/supabase/storage";
import { COVER_TEMPLATES } from "@/constants/coverTemplates";
import { FL_FOUR_POINT_QUESTIONS } from "@/constants/flFourPointQuestions";
import { TX_WINDSTORM_QUESTIONS } from "@/constants/txWindstormQuestions";
import { CA_WILDFIRE_QUESTIONS } from "@/constants/caWildfireQuestions";
import { MANUFACTURED_HOME_QUESTIONS } from "@/constants/manufacturedHomeQuestions";
import { ROOF_CERTIFICATION_QUESTIONS } from "@/constants/roofCertificationQuestions";

const QUESTION_CONFIGS: Partial<Record<Report["reportType"], { sections: readonly any[] }>> = {
    fl_four_point_citizens: FL_FOUR_POINT_QUESTIONS,
    tx_coastal_windstorm_mitigation: TX_WINDSTORM_QUESTIONS,
    ca_wildfire_defensible_space: CA_WILDFIRE_QUESTIONS,
    roof_certification_nationwide: ROOF_CERTIFICATION_QUESTIONS,
    manufactured_home_insurance_prep: MANUFACTURED_HOME_QUESTIONS,
};


interface PDFDocumentProps {
    report: Report;
    mediaUrlMap: Record<string, string>;
    coverUrl: string;
    company?: string;
}

const PDFDocument = React.forwardRef<HTMLDivElement, PDFDocumentProps>(
    ({report, mediaUrlMap, coverUrl, company}, ref) => {
        const config = QUESTION_CONFIGS[report.reportType];

        const coverColorScheme =
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

        const renderField = (sectionName: string, field: any) => {
            const sectionData = ((report as any).reportData?.[sectionName] || {}) as Record<string, any>;
            const value = sectionData[field.name];

            if (field.widget === "upload") {
                const urls = Array.isArray(value) ? value : [];
                return (
                    <div className="grid grid-cols-2 gap-3">
                        {urls.map((url: string, idx: number) => (
                            <img 
                                key={idx} 
                                src={mediaUrlMap[url] || url} 
                                alt="" 
                                className="w-full max-h-48 object-contain rounded border pdf-image" 
                            />
                        ))}
                    </div>
                );
            }

            if (field.widget === "signature" && value) {
                return <img src={mediaUrlMap[value] || value} alt="Signature" className="h-16 w-auto" />;
            }

            return String(value || "");
        };

        if (config) {
            const CoverComponent = COVER_TEMPLATES[report.coverTemplate].component;
            
            // Separate images from form fields for specialized reports
            const allImages: Array<{url: string, caption?: string, sectionName: string, fieldLabel: string}> = [];
            
            config.sections.forEach(section => {
                section.fields.forEach((field: any) => {
                    if (field.widget === "upload") {
                        const sectionData = ((report as any).reportData?.[section.name] || {}) as Record<string, any>;
                        const urls = Array.isArray(sectionData[field.name]) ? sectionData[field.name] : [];
                        urls.forEach((url: string) => {
                            allImages.push({
                                url,
                                sectionName: section.name.replace(/_/g, " "),
                                fieldLabel: field.label
                            });
                        });
                    }
                });
            });

            return (
                <div ref={ref} className="pdf-document">
                    {/* Cover Page - Full Height */}
                    <div className="preview-page">
                        <section className="pdf-page-break h-full flex flex-col">
                            <div className="flex-1 h-full">
                                <CoverComponent
                                    reportTitle={report.title}
                                    clientName={report.clientName}
                                    clientAddress={report.address}
                                    coverImage={coverUrl}
                                    organizationName={company}
                                    inspectionDate={report.inspectionDate}
                                    colorScheme={coverColorScheme}
                                />
                            </div>
                        </section>
                    </div>
                    
                    {/* Content Page - All form fields without images */}
                    <div className="preview-page">
                        <section className="pdf-page-break p-8">
                            <h1 className="text-3xl font-bold mb-8 text-primary">{report.title}</h1>
                            {config.sections.map((section, sectionIndex) => (
                                <div key={section.name} className={sectionIndex > 0 ? "mt-8" : ""}>
                                    <h2 className="text-2xl font-bold mb-4 capitalize text-primary border-b border-gray-300 pb-2">
                                        {section.name.replace(/_/g, " ")}
                                    </h2>
                                    <table className="w-full text-sm border-collapse mb-6">
                                        <tbody>
                                        {section.fields
                                            .filter((field: any) => field.widget !== "upload")
                                            .map((field: any) => (
                                                <tr key={field.name} className="border-b">
                                                    <td className="border-r p-3 font-semibold w-1/3 bg-gray-50 align-top">
                                                        {field.label}
                                                    </td>
                                                    <td className="p-3 align-top">{renderField(section.name, field)}</td>
                                                </tr>
                                            ))
                                        }
                                        </tbody>
                                    </table>
                                </div>
                            ))}
                        </section>
                    </div>
                    
                    {/* Images Pages - Two per row */}
                    {allImages.length > 0 && (
                        <div className="preview-page">
                            <section className="pdf-page-break p-8">
                                <h2 className="text-2xl font-bold mb-6 text-primary border-b border-gray-300 pb-2">
                                    Supporting Images
                                </h2>
                                <div className="grid grid-cols-2 gap-6">
                                    {allImages.map((image, idx) => (
                                        <div key={idx} className="break-inside-avoid">
                                            <img 
                                                src={mediaUrlMap[image.url] || image.url} 
                                                alt={`${image.sectionName} - ${image.fieldLabel}`}
                                                className="w-full h-64 object-contain rounded border pdf-image mb-2" 
                                            />
                                            <p className="text-xs text-gray-600 font-semibold">
                                                {image.sectionName} - {image.fieldLabel}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>
                    )}
                </div>
            );
        }

        if (report.reportType !== "home_inspection") {
            return (
                <div className="p-8 text-center">
                    <p>PDF generation for this report type is coming soon.</p>
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
            <div ref={ref} className="pdf-document" style={colorVars as any}>
                <div className="preview-page">
                    <section className="pdf-page-break">
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
                    </section>
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
            </div>
        );
    }
);

PDFDocument.displayName = "PDFDocument";

export default PDFDocument;