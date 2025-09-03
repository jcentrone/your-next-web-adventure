import React from "react";
import {Report} from "@/lib/reportSchemas";
import {COVER_TEMPLATES} from "@/constants/coverTemplates";
import {COLOR_SCHEMES} from "@/components/ui/color-scheme-picker.tsx";

interface CoverPageWrapperProps {
    report: Report;
    coverUrl: string;
    company?: string;
    colorScheme?: {
        primary: string;
        secondary: string;
        accent: string;
    };
}

const CoverPageWrapper: React.FC<CoverPageWrapperProps> = ({
                                                               report,
                                                               coverUrl,
                                                               company,
                                                               colorScheme
                                                           }) => {
    const CoverComponent = COVER_TEMPLATES[report.coverTemplate].component;

    return (
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
    );
};

export default CoverPageWrapper;