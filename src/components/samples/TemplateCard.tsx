import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import type { SampleReport } from "@/constants/sampleData";
import { REPORT_TYPE_LABELS } from "@/constants/reportTypes";
import { COVER_TEMPLATES } from "@/constants/coverTemplates";

interface TemplateCardProps {
  report: SampleReport;
  onPreview: (report: SampleReport) => void;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({
  report,
  onPreview
}) => {
  const CoverComponent = COVER_TEMPLATES[report.coverTemplate].component;
  
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
      <div className="relative">
        {/* Cover Preview */}
        <div className="h-48 bg-muted overflow-hidden">
          <div className="scale-[0.3] origin-top-left w-[300%] h-[300%] pointer-events-none">
            <CoverComponent
              reportTitle={report.title}
              organizationName={report.organization.name}
              organizationAddress={report.organization.address}
              organizationPhone={report.organization.phone}
              organizationEmail={report.organization.email}
              organizationWebsite={report.organization.website}
              organizationLogo={report.organization.logo_url || undefined}
              inspectorName={report.inspector.name}
              inspectorLicenseNumber={report.inspector.license_number}
              inspectorPhone={report.inspector.phone}
              inspectorEmail={report.inspector.email}
              clientName={report.client.name}
              clientAddress={report.client.address}
              clientEmail={report.client.email}
              clientPhone={report.client.phone}
              inspectionDate={report.property.inspection_date}
              weatherConditions={report.property.weather_conditions}
              colorScheme={report.colorScheme}
              className="w-full h-full"
            />
          </div>
        </div>
        
        {/* Overlay Actions */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onPreview(report)}
            className="bg-white/90 hover:bg-white text-black"
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-sm leading-tight">{report.title}</h3>
          <Badge variant="secondary" className="text-xs ml-2 shrink-0">
            {COVER_TEMPLATES[report.coverTemplate].label}
          </Badge>
        </div>
        
        <div className="space-y-1 text-xs text-muted-foreground">
          <p className="font-medium text-foreground">
            {REPORT_TYPE_LABELS[report.reportType]}
          </p>
          <p>{report.organization.name}</p>
          <p>Inspector: {report.inspector.name}</p>
        </div>
        
        <div className="flex items-center gap-2 mt-3">
          <div
            className="w-3 h-3 rounded-full border border-white/20"
            style={{ backgroundColor: report.colorScheme.primary }}
          />
          <div
            className="w-3 h-3 rounded-full border border-white/20"
            style={{ backgroundColor: report.colorScheme.secondary }}
          />
          <div
            className="w-3 h-3 rounded-full border border-white/20"
            style={{ backgroundColor: report.colorScheme.accent }}
          />
          <span className="text-xs text-muted-foreground ml-auto">
            {report.previewTemplate}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};