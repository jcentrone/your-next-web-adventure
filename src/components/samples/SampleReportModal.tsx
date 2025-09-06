import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, FileText, Eye, AlertTriangle, CheckCircle, AlertCircle } from "lucide-react";
import type { SampleReport } from "@/constants/sampleData";
import { REPORT_TYPE_LABELS } from "@/constants/reportTypes";
import { COVER_TEMPLATES } from "@/constants/coverTemplates";
import { getSectionsByReportType } from "@/constants/sampleReportContent";

interface SampleReportModalProps {
  report: SampleReport | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SampleReportModal: React.FC<SampleReportModalProps> = ({
  report,
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState("cover");
  
  if (!report) return null;

  const CoverComponent = COVER_TEMPLATES[report.coverTemplate].component;
  const sections = getSectionsByReportType(report.reportType);
  
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "safety": return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case "major": return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case "minor": return <CheckCircle className="w-4 h-4 text-yellow-500" />;
      default: return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
  };

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
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="overflow-auto max-h-[calc(90vh-120px)]">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="cover" className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Cover Page
              </TabsTrigger>
              <TabsTrigger value="content" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Sample Content
              </TabsTrigger>
              <TabsTrigger value="details" className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Report Details
              </TabsTrigger>
            </TabsList>

            <TabsContent value="cover" className="mt-6">
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
            </TabsContent>

            <TabsContent value="content" className="mt-6">
              <div className="space-y-6">
                {sections.map((section) => (
                  <div key={section.id} className="bg-white border rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-semibold mb-3">{section.title}</h3>
                    <p className="text-muted-foreground mb-4">{section.content}</p>
                    
                    {section.findings.length > 0 && (
                      <div className="space-y-4">
                        <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                          Findings ({section.findings.length})
                        </h4>
                        {section.findings.map((finding) => (
                          <div key={finding.id} className="border-l-4 border-muted pl-4">
                            <div className="flex items-start gap-2 mb-2">
                              {getSeverityIcon(finding.severity)}
                              <div className="flex-1">
                                <h5 className="font-medium">{finding.title}</h5>
                                <Badge variant="outline" className="text-xs ml-2">
                                  {finding.severity.toUpperCase()}
                                </Badge>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {finding.description}
                            </p>
                            <div className="bg-muted/50 p-3 rounded text-sm">
                              <span className="font-medium">Recommendation: </span>
                              {finding.recommendation}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {section.findings.length === 0 && (
                      <div className="flex items-center gap-2 text-green-600 text-sm">
                        <CheckCircle className="w-4 h-4" />
                        No deficiencies noted in this section
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="details" className="mt-6">
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white border rounded-lg p-6 shadow-sm">
                    <h4 className="font-semibold mb-4">Organization Information</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Name:</span> {report.organization.name}</p>
                      <p><span className="font-medium">Address:</span> {report.organization.address}</p>
                      <p><span className="font-medium">Phone:</span> {report.organization.phone}</p>
                      <p><span className="font-medium">Email:</span> {report.organization.email}</p>
                      <p><span className="font-medium">Website:</span> {report.organization.website}</p>
                    </div>
                  </div>

                  <div className="bg-white border rounded-lg p-6 shadow-sm">
                    <h4 className="font-semibold mb-4">Inspector Information</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Name:</span> {report.inspector.name}</p>
                      <p><span className="font-medium">License:</span> {report.inspector.license_number}</p>
                      <p><span className="font-medium">Phone:</span> {report.inspector.phone}</p>
                      <p><span className="font-medium">Email:</span> {report.inspector.email}</p>
                    </div>
                  </div>

                  <div className="bg-white border rounded-lg p-6 shadow-sm">
                    <h4 className="font-semibold mb-4">Client Information</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Name:</span> {report.client.name}</p>
                      <p><span className="font-medium">Address:</span> {report.client.address}</p>
                      <p><span className="font-medium">Email:</span> {report.client.email}</p>
                      <p><span className="font-medium">Phone:</span> {report.client.phone}</p>
                    </div>
                  </div>

                  <div className="bg-white border rounded-lg p-6 shadow-sm">
                    <h4 className="font-semibold mb-4">Property & Inspection</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Property:</span> {report.property.address}</p>
                      <p><span className="font-medium">Inspection Date:</span> {report.property.inspection_date}</p>
                      <p><span className="font-medium">Weather:</span> {report.property.weather_conditions}</p>
                      <p><span className="font-medium">Report Type:</span> {REPORT_TYPE_LABELS[report.reportType]}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border rounded-lg p-6 shadow-sm">
                  <h4 className="font-semibold mb-4">Design & Branding</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm mb-2"><span className="font-medium">Cover Template:</span> {COVER_TEMPLATES[report.coverTemplate].label}</p>
                      <p className="text-sm"><span className="font-medium">Preview Style:</span> {report.previewTemplate}</p>
                    </div>
                    <div>
                      <p className="text-sm mb-2 font-medium">Color Scheme:</p>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <div
                            className="w-4 h-4 rounded border border-border"
                            style={{ backgroundColor: `hsl(${report.colorScheme.primary})` }}
                          />
                          <span className="text-xs">Primary</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div
                            className="w-4 h-4 rounded border border-border"
                            style={{ backgroundColor: `hsl(${report.colorScheme.secondary})` }}
                          />
                          <span className="text-xs">Secondary</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div
                            className="w-4 h-4 rounded border border-border"
                            style={{ backgroundColor: `hsl(${report.colorScheme.accent})` }}
                          />
                          <span className="text-xs">Accent</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};