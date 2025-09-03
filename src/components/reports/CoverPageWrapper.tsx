import React from "react";
import { Report } from "@/lib/reportSchemas";
import { COVER_TEMPLATES } from "@/constants/coverTemplates";

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
        <section className="pdf-page-break h-full flex flex-col">
            <div className="flex-1 h-full">
                <CoverComponent
                    reportTitle={report.title}
                    clientName={report.clientName}
                    clientAddress={report.address}
                    coverImage={coverUrl}
                    organizationName={company}
                    inspectionDate={report.inspectionDate}
                    colorScheme={colorScheme}
                />
            </div>
        </section>
    );
};

export default CoverPageWrapper;