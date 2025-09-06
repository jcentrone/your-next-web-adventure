import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, X } from "lucide-react";
import type { SampleReport } from "@/constants/sampleData";
import { REPORT_TYPE_LABELS } from "@/constants/reportTypes";
import { COVER_TEMPLATES } from "@/constants/coverTemplates";

interface SampleReportModalProps {
  report: SampleReport | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload?: (report: SampleReport) => void;
}

export const SampleReportModal: React.FC<SampleReportModalProps> = ({
  report,
  isOpen,
  onClose,
  onDownload
}) => {
  if (!report) return null;

  const CoverComponent = COVER_TEMPLATES[report.coverTemplate].component;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex-1">
            <DialogTitle className="text-xl font-semibold">
              {report.title}
            </DialogTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline">
                {REPORT_TYPE_LABELS[report.reportType]}
              </Badge>
              <Badge variant="secondary">
                {COVER_TEMPLATES[report.coverTemplate].label}
              </Badge>
              <span className="text-sm text-muted-foreground">
                • {report.previewTemplate} style
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onDownload && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDownload(report)}
              >
                <Download className="w-4 h-4 mr-2" />
                Download Sample
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="overflow-auto max-h-[calc(90vh-120px)]">
          {/* Report Cover Preview */}
          <div className="bg-white border rounded-lg p-8 shadow-sm">
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
              className="w-full"
            />
          </div>

          {/* Sample Content Info */}
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-semibold mb-2">Report Details</h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h5 className="font-medium mb-1">Organization</h5>
                <p>{report.organization.name}</p>
                <p className="text-muted-foreground">{report.organization.address}</p>
                <p className="text-muted-foreground">{report.organization.phone}</p>
              </div>
              <div>
                <h5 className="font-medium mb-1">Inspector</h5>
                <p>{report.inspector.name}</p>
                <p className="text-muted-foreground">License: {report.inspector.license_number}</p>
                <p className="text-muted-foreground">{report.inspector.phone}</p>
              </div>
              <div>
                <h5 className="font-medium mb-1">Client</h5>
                <p>{report.client.name}</p>
                <p className="text-muted-foreground">{report.client.address}</p>
              </div>
              <div>
                <h5 className="font-medium mb-1">Property</h5>
                <p>{report.property.address}</p>
                <p className="text-muted-foreground">Inspected: {report.property.inspection_date}</p>
                <p className="text-muted-foreground">Weather: {report.property.weather_conditions}</p>
              </div>
            </div>
            
            <div className="mt-4">
              <h5 className="font-medium mb-2">Color Scheme</h5>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <div
                    className="w-4 h-4 rounded border border-border"
                    style={{ backgroundColor: report.colorScheme.primary }}
                  />
                  <span className="text-xs">Primary</span>
                </div>
                <div className="flex items-center gap-1">
                  <div
                    className="w-4 h-4 rounded border border-border"
                    style={{ backgroundColor: report.colorScheme.secondary }}
                  />
                  <span className="text-xs">Secondary</span>
                </div>
                <div className="flex items-center gap-1">
                  <div
                    className="w-4 h-4 rounded border border-border"
                    style={{ backgroundColor: report.colorScheme.accent }}
                  />
                  <span className="text-xs">Accent</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};