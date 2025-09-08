import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, FormInput, Plus, Settings2 } from "lucide-react";
import { getReportCategory, isDefectBasedReport } from "@/constants/reportCategories";
import { useCustomFields } from "@/hooks/useCustomFields";
import type { Report } from "@/lib/reportSchemas";
import type { ReportTemplate } from "@/integrations/supabase/reportTemplatesApi";

interface CategoryAwareReportEditorProps {
  report: Report;
  onReportChange: (report: Report) => void;
  template?: ReportTemplate | null;
}

export function CategoryAwareReportEditor({ 
  report, 
  onReportChange, 
  template 
}: CategoryAwareReportEditorProps) {
  const reportCategory = getReportCategory(report.reportType);
  const isDefectBased = isDefectBasedReport(report.reportType);
  const { customFields } = useCustomFields();

  if (isDefectBased) {
    return <DefectBasedReportEditor report={report} onReportChange={onReportChange} template={template} />;
  } else {
    return <FormBasedReportEditor report={report} onReportChange={onReportChange} template={template} />;
  }
}

function DefectBasedReportEditor({ 
  report, 
  onReportChange, 
  template 
}: CategoryAwareReportEditorProps) {
  const [selectedSection, setSelectedSection] = React.useState<string | null>(null);

  // Use existing section structure for defect-based reports
  const sections = (report as any).sections || [];
  const activeSection = sections.find((s: any) => s.id === selectedSection) || sections[0];

  const addObservation = () => {
    if (!activeSection) return;
    
    const newFinding = {
      id: crypto.randomUUID(),
      title: "New observation",
      severity: "Info",
      narrative: "",
      recommendation: "",
      mediaGuidance: "",
      media: [],
      includeInSummary: false,
    };

    const updatedSections = sections.map((s: any) => 
      s.id === activeSection.id 
        ? { ...s, findings: [newFinding, ...s.findings] }
        : s
    );

    onReportChange({
      ...report,
      sections: updatedSections,
    } as Report);
  };

  return (
    <div className="flex h-[800px] border rounded-lg overflow-hidden">
      {/* Sections Sidebar */}
      <div className="w-80 bg-muted/30 border-r">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            <h3 className="font-semibold">Report Sections</h3>
          </div>
        </div>
        <div className="p-2 space-y-1">
          {sections.map((section: any) => (
            <Card
              key={section.id}
              className={`p-3 cursor-pointer transition-colors ${
                selectedSection === section.id || (!selectedSection && section === sections[0])
                  ? "bg-primary/10 border-primary" 
                  : "bg-background hover:bg-muted/50"
              }`}
              onClick={() => setSelectedSection(section.id)}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{section.title}</span>
                {section.findings?.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {section.findings.length}
                  </Badge>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {activeSection ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{activeSection.title}</h2>
                <p className="text-muted-foreground">
                  Document observations, defects, and recommendations
                </p>
              </div>
              <Button onClick={addObservation}>
                <Plus className="w-4 h-4 mr-1" />
                Add Observation
              </Button>
            </div>

            {/* Observations List */}
            <div className="space-y-4">
              {activeSection.findings?.map((finding: any) => (
                <Card key={finding.id} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <input 
                        type="text"
                        value={finding.title}
                        onChange={(e) => {
                          const updatedSections = sections.map((s: any) => 
                            s.id === activeSection.id 
                              ? {
                                  ...s, 
                                  findings: s.findings.map((f: any) => 
                                    f.id === finding.id ? { ...f, title: e.target.value } : f
                                  )
                                }
                              : s
                          );
                          onReportChange({ ...report, sections: updatedSections } as Report);
                        }}
                        className="flex-1 font-medium bg-transparent border-none outline-none"
                        placeholder="Observation title"
                      />
                      <Badge variant="outline">{finding.severity}</Badge>
                    </div>
                    <textarea
                      value={finding.narrative}
                      onChange={(e) => {
                        const updatedSections = sections.map((s: any) => 
                          s.id === activeSection.id 
                            ? {
                                ...s, 
                                findings: s.findings.map((f: any) => 
                                  f.id === finding.id ? { ...f, narrative: e.target.value } : f
                                )
                              }
                            : s
                        );
                        onReportChange({ ...report, sections: updatedSections } as Report);
                      }}
                      className="w-full p-3 border rounded-md resize-none"
                      rows={3}
                      placeholder="Observation details..."
                    />
                  </div>
                </Card>
              ))}
              
              {(!activeSection.findings || activeSection.findings.length === 0) && (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No observations in this section yet</p>
                  <Button variant="outline" onClick={addObservation} className="mt-4">
                    <Plus className="w-4 h-4 mr-1" />
                    Add First Observation
                  </Button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <Settings2 className="w-12 h-12 mx-auto mb-4" />
              <p>Select a section to start editing</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FormBasedReportEditor({ 
  report, 
  onReportChange, 
  template 
}: CategoryAwareReportEditorProps) {
  const [selectedSectionKey, setSelectedSectionKey] = React.useState<string | null>(null);
  const { customFields } = useCustomFields();

  const sections = template?.sections_config || [];
  const fieldsConfig = template?.fields_config || {};
  const selectedSection = sections.find(s => s.sectionKey === selectedSectionKey) || sections[0];
  const sectionFields = selectedSection ? fieldsConfig[selectedSection.sectionKey] || [] : [];

  const updateFieldValue = (fieldName: string, value: any) => {
    const reportData = (report as any).formData || {};
    const updatedData = {
      ...reportData,
      [fieldName]: value
    };
    
    onReportChange({
      ...report,
      formData: updatedData,
    } as any);
  };

  const getFieldValue = (fieldName: string) => {
    return (report as any).formData?.[fieldName] || '';
  };

  const renderField = (field: any) => {
    const value = getFieldValue(field.fieldName);

    switch (field.widgetType) {
      case 'text':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => updateFieldValue(field.fieldName, e.target.value)}
            className="w-full p-3 border rounded-md"
            placeholder={`Enter ${field.fieldLabel.toLowerCase()}`}
            required={field.required}
          />
        );
      
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => updateFieldValue(field.fieldName, e.target.value)}
            className="w-full p-3 border rounded-md resize-none"
            rows={4}
            placeholder={`Enter ${field.fieldLabel.toLowerCase()}`}
            required={field.required}
          />
        );
      
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => updateFieldValue(field.fieldName, e.target.value)}
            className="w-full p-3 border rounded-md"
            required={field.required}
          >
            <option value="">Select {field.fieldLabel.toLowerCase()}</option>
            {field.options?.map((option: string) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      
      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => updateFieldValue(field.fieldName, e.target.valueAsNumber || 0)}
            className="w-full p-3 border rounded-md"
            placeholder={`Enter ${field.fieldLabel.toLowerCase()}`}
            required={field.required}
          />
        );
      
      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => updateFieldValue(field.fieldName, e.target.value)}
            className="w-full p-3 border rounded-md"
            required={field.required}
          />
        );
      
      case 'checkbox':
        return (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={!!value}
              onChange={(e) => updateFieldValue(field.fieldName, e.target.checked)}
              className="rounded"
            />
            <span>{field.fieldLabel}</span>
          </div>
        );
      
      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => updateFieldValue(field.fieldName, e.target.value)}
            className="w-full p-3 border rounded-md"
            placeholder={`Enter ${field.fieldLabel.toLowerCase()}`}
            required={field.required}
          />
        );
    }
  };

  return (
    <div className="flex h-[800px] border rounded-lg overflow-hidden">
      {/* Sections Sidebar */}
      <div className="w-80 bg-muted/30 border-r">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <FormInput className="w-5 h-5" />
            <h3 className="font-semibold">Form Sections</h3>
          </div>
        </div>
        <div className="p-2 space-y-1">
          {sections.map((section) => (
            <Card
              key={section.sectionKey}
              className={`p-3 cursor-pointer transition-colors ${
                selectedSectionKey === section.sectionKey || (!selectedSectionKey && section === sections[0])
                  ? "bg-primary/10 border-primary" 
                  : "bg-background hover:bg-muted/50"
              }`}
              onClick={() => setSelectedSectionKey(section.sectionKey)}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{section.title}</span>
                {sectionFields.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {sectionFields.length}
                  </Badge>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">
        {selectedSection ? (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">{selectedSection.title}</h2>
              <p className="text-muted-foreground">
                Complete the required form fields
              </p>
            </div>

            {/* Form Fields */}
            <div className="space-y-6">
              {sectionFields.map((field) => (
                <div key={field.fieldId} className="space-y-2">
                  <label className="block font-medium">
                    {field.fieldLabel}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {renderField(field)}
                </div>
              ))}
              
              {sectionFields.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <FormInput className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No fields configured for this section</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <Settings2 className="w-12 h-12 mx-auto mb-4" />
              <p>Select a section to start filling out the form</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}