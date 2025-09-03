import React from "react";
import {Report} from "@/lib/reportSchemas";
import {COLOR_SCHEMES} from "@/components/ui/color-scheme-picker";
import {FL_FOUR_POINT_QUESTIONS} from "@/constants/flFourPointQuestions";
import {TX_WINDSTORM_QUESTIONS} from "@/constants/txWindstormQuestions";
import {CA_WILDFIRE_QUESTIONS} from "@/constants/caWildfireQuestions";
import {MANUFACTURED_HOME_QUESTIONS} from "@/constants/manufacturedHomeQuestions";
import {ROOF_CERTIFICATION_QUESTIONS} from "@/constants/roofCertificationQuestions";
import {COVER_TEMPLATES} from "@/constants/coverTemplates.ts";
import {Profile} from "@/integrations/supabase/organizationsApi.ts";

const QUESTION_CONFIGS: Partial<Record<Report["reportType"], { sections: readonly any[] }>> = {
    fl_four_point_citizens: FL_FOUR_POINT_QUESTIONS,
    tx_coastal_windstorm_mitigation: TX_WINDSTORM_QUESTIONS,
    ca_wildfire_defensible_space: CA_WILDFIRE_QUESTIONS,
    roof_certification_nationwide: ROOF_CERTIFICATION_QUESTIONS,
    manufactured_home_insurance_prep: MANUFACTURED_HOME_QUESTIONS,
};

interface SpecializedReportPreviewProps {
    report: Report;
    mediaUrlMap: Record<string, string>;
    coverUrl: string;
    inspector?: Profile;
    organization?: any;
    className?: string;
}


const SpecializedReportPreview = React.forwardRef<HTMLDivElement, SpecializedReportPreviewProps>(
    ({report, inspector, organization, mediaUrlMap, coverUrl, className}, ref) => {
        const config = QUESTION_CONFIGS[report.reportType];

        if (!config) {
            return (
                <div className="p-8 text-center">
                    <p>PDF generation for this report type is coming soon.</p>
                </div>
            );
        }
        const CoverComponent = COVER_TEMPLATES[report.coverTemplate].component;


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
                return null; // Images will be rendered separately
            }

            if (field.widget === "signature" && value) {
                return <img src={mediaUrlMap[value] || value} alt="Signature" className="h-16 w-auto"/>;
            }

            return String(value || "");
        };

        // Collect all images for separate pages
        const allImages: Array<{ url: string, caption?: string, sectionName: string, fieldLabel: string }> = [];

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
            <div ref={ref} className="pdf-document" style={coverColorScheme as any}>
                <div className="preview-page page-break">
                    <div className="h-[1056px]">
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
                            colorScheme={coverColorScheme}
                            className={className}

                        />


                    </div>
                </div>

                {/* Content Page - All form fields without images */}
                <div className="preview-page">
                    <section className="pdf-page-break p-8 min-h-[11in]">
                        <h1 className="text-3xl font-bold mb-8 text-primary">{report.title}</h1>
                        {config.sections.filter(section => section.name.toLowerCase() !== 'photos' && section.name.toLowerCase() !== 'images').map((section, sectionIndex) => (
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
                        <section className="pdf-page-break p-8 min-h-[11in]">
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
);

SpecializedReportPreview.displayName = "SpecializedReportPreview";

export default SpecializedReportPreview;