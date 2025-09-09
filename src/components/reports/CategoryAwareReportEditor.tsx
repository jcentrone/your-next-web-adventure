import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, FormInput, Plus, Settings2, Edit3, Trash2, Wand2 } from "lucide-react";
import { getReportCategory, isDefectBasedReport } from "@/constants/reportCategories";
import { useCustomFields } from "@/hooks/useCustomFields";
import { useSectionGuidance } from "@/hooks/useSectionGuidance";
import { InfoFieldWidget } from "./InfoFieldWidget";
import DefectPicker from "./DefectPicker";
import type { Report } from "@/lib/reportSchemas";
import type { ReportTemplate } from "@/integrations/supabase/reportTemplatesApi";
import { isSupabaseUrl, getSignedUrlFromSupabaseUrl } from "@/integrations/supabase/storage";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import AIAnalyzeDialog from "./AIAnalyzeDialog";

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
  const { customFields: _customFields } = useCustomFields();

  if (isDefectBased) {
    return <DefectBasedReportEditor report={report} onReportChange={onReportChange} template={template} />;
  } else {
    return <FormBasedReportEditor report={report} onReportChange={onReportChange} template={template} />;
  }
}

function DefectBasedReportEditor({
  report,
  onReportChange,
  template: _template
}: CategoryAwareReportEditorProps) {
  const [selectedSection, setSelectedSection] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState<"info" | "observations">("info");
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const nav = useNavigate();
  const [mediaUrlMap, setMediaUrlMap] = React.useState<Record<string, string>>({});
  const [aiDialogOpen, setAiDialogOpen] = React.useState(false);
  const [aiDialogImages, setAiDialogImages] = React.useState<{ id: string; url: string; caption?: string }[]>([]);
  const [aiDialogFindingId, setAiDialogFindingId] = React.useState<string | null>(null);
  const [aiLoading, setAiLoading] = React.useState(false);

  // Use existing section structure for defect-based reports
  const sections = (report as any).sections || [];
  const activeSection = sections.find((s: any) => s.id === selectedSection) || sections[0];
  const { guidance } = useSectionGuidance();
  const infoFields = activeSection ? guidance[activeSection.key]?.infoFields || [] : [];

  React.useEffect(() => {
    setActiveTab("info");
  }, [selectedSection]);

  React.useEffect(() => {
    if (!activeSection) return;
    const medias = (activeSection.findings || [])
      .flatMap((f: any) => f.media)
      .filter((m: any) => isSupabaseUrl(m.url));
    if (medias.length === 0) return;
    let cancelled = false;
    (async () => {
      const entries = await Promise.all(
        medias.map(async (m: any) => [m.id, await getSignedUrlFromSupabaseUrl(m.url)] as const)
      );
      if (!cancelled) {
        setMediaUrlMap((prev) => {
          const next = { ...prev };
          for (const [id, url] of entries) next[id] = url;
          return next;
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeSection]);

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

  const handleAIAnalyze = async (_imageId: string) => {
    setAiLoading(true);
    try {
      // AI analysis integration is handled elsewhere in the application
    } finally {
      setAiLoading(false);
      setAiDialogOpen(false);
    }
  };

return (
    <>
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
      <div className="flex-1 p-6 overflow-auto">
        {activeSection ? (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">{activeSection.title}</h2>
              <p className="text-muted-foreground">
                Document observations, defects, and recommendations
              </p>
            </div>

            <div className="border-b mb-4">
              <div className="mb-4 flex gap-6">
                <button
                  onClick={() => setActiveTab("info")}
                  className={`pb-2 border-b-2 ${
                    activeTab === "info"
                      ? "border-primary font-medium"
                      : "border-transparent text-muted-foreground"
                  }`}
                >
                  Information
                </button>
                <button
                  onClick={() => setActiveTab("observations")}
                  className={`pb-2 border-b-2 ${
                    activeTab === "observations"
                      ? "border-primary font-medium"
                      : "border-transparent text-muted-foreground"
                  }`}
                >
                  Observations
                </button>
              </div>
            </div>

            {activeTab === "info" && (
              <section className="mb-4 rounded-md border p-4 space-y-4">
                {infoFields.length > 0 ? (
                  infoFields.map((field: any, idx: number) => {
                    const fieldName = typeof field === "string" ? field : field.name;
                    return (
                      <InfoFieldWidget
                        key={idx}
                        field={field}
                        value={activeSection.info?.[fieldName] || ""}
                        onChange={(val) => {
                          const updatedSections = sections.map((s: any) =>
                            s.id === activeSection.id
                              ? {
                                  ...s,
                                  info: { ...(s.info || {}), [fieldName]: val },
                                }
                              : s
                          );
                          onReportChange({ ...report, sections: updatedSections } as Report);
                        }}
                      />
                    );
                  })
                ) : (
                  <p className="text-sm text-muted-foreground">No information fields for this section.</p>
                )}
              </section>
            )}

            {activeTab === "observations" && (
              <>
                <div className="flex gap-6 justify-between mb-4">
                  <section className="mb-4 flex-1 rounded-md border p-3 w-100">
                    <details>
                      <summary className="text-sm font-medium cursor-pointer">
                        What to inspect (InterNACHI)
                      </summary>
                      <ul className="mt-2 list-disc pl-5 text-sm">
                        {(guidance[activeSection.key]?.observationItems || []).map(
                          (item, idx) => (
                            <li key={idx}>{item}</li>
                          )
                        )}
                      </ul>
                    </details>
                  </section>
                  <div className="flex gap-2 mb-4">
                    <Button onClick={addObservation}>Add Observation</Button>
                    <Button onClick={() => setPickerOpen(true)}>Add Defect</Button>
                  </div>
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
                                        f.id === finding.id
                                          ? { ...f, title: e.target.value }
                                          : f
                                      ),
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
                                      f.id === finding.id
                                        ? { ...f, narrative: e.target.value }
                                        : f
                                    ),
                                  }
                                : s
                            );
                            onReportChange({ ...report, sections: updatedSections } as Report);
                          }}
                          className="w-full p-3 border rounded-md resize-none"
                          rows={3}
                          placeholder="Observation details..."
                        />

                        {finding.media && finding.media.length > 0 && (
                          <div className="mt-3">
                            <label className="block text-sm font-medium mb-1">Media</label>
                            <div className="flex flex-wrap gap-3">
                              {finding.media.map((m: any) => {
                                const hasSignedUrl = !isSupabaseUrl(m.url) || !!mediaUrlMap[m.id];
                                const resolvedUrl = hasSignedUrl ? mediaUrlMap[m.id] || m.url : undefined;
                                return (
                                  <div key={m.id} className="relative w-24 h-24 border rounded overflow-hidden">
                                    {hasSignedUrl ? (
                                      <img
                                        src={resolvedUrl}
                                        alt={m.caption || "Media"}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full bg-muted" />
                                    )}
                                    <button
                                      type="button"
                                      className="absolute top-1 right-1 bg-white rounded-full p-1 shadow"
                                      onClick={() => {
                                        const updated = sections.map((s: any) =>
                                          s.id === activeSection.id
                                            ? {
                                                ...s,
                                                findings: s.findings.map((f: any) =>
                                                  f.id === finding.id
                                                    ? { ...f, media: f.media.filter((x: any) => x.id !== m.id) }
                                                    : f
                                                ),
                                              }
                                            : s
                                        );
                                        onReportChange({ ...report, sections: updated } as Report);
                                      }}
                                    >
                                      <Trash2 className="w-4 h-4 text-red-500" />
                                    </button>

                                    {m.type === "image" && (
                                      <button
                                        type="button"
                                        className="absolute bottom-1 left-1 bg-white rounded-full p-1 shadow"
                                        onClick={() => {
                                          if (!report.id || !finding.id || !m.id) {
                                            toast({
                                              title: "Navigation Error",
                                              description: "Missing required IDs for annotation",
                                              variant: "destructive",
                                            });
                                            return;
                                          }
                                          nav(`/reports/${report.id}/findings/${finding.id}/media/${m.id}/annotate`);
                                        }}
                                      >
                                        <Edit3 className="w-4 h-4 text-orange-500" />
                                      </button>
                                    )}

                                    <button
                                      type="button"
                                      className="absolute bottom-1 right-1 bg-white rounded-full p-1 shadow"
                                      onClick={() => {
                                        if (!hasSignedUrl) return;
                                        setAiDialogFindingId(finding.id);
                                        setAiDialogImages([{ id: m.id, url: resolvedUrl!, caption: m.caption }]);
                                        setAiDialogOpen(true);
                                      }}
                                    >
                                      <Wand2 className="w-4 h-4 text-blue-500" />
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}

                  {(!activeSection.findings || activeSection.findings.length === 0) && (
                    <div className="text-center py-12 text-muted-foreground">
                      <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No observations in this section yet</p>
                      <Button
                        variant="outline"
                        onClick={addObservation}
                        className="mt-4"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add First Observation
                      </Button>
                    </div>
                  )}
                </div>
              </>
            )}
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
    <DefectPicker
      open={pickerOpen}
      onOpenChange={setPickerOpen}
      sectionKey={activeSection.key}
      onInsert={(tpl) => {
        if (!activeSection) return;
        const fid = crypto.randomUUID();
        const updatedSections = sections.map((s: any) =>
          s.id === activeSection.id
            ? {
                ...s,
                findings: [
                  {
                    id: fid,
                    title: tpl.title,
                    severity: tpl.severity,
                    narrative: tpl.narrative,
                    recommendation: tpl.recommendation || "",
                    mediaGuidance: tpl.mediaGuidance || "",
                    defectId: tpl.defectId || null,
                    media: [],
                    includeInSummary: false,
                  },
                  ...s.findings,
                ],
              }
            : s
        );
        onReportChange({ ...report, sections: updatedSections } as Report);
        if (tpl.defectId) setPickerOpen(false);
      }}
    />
    <AIAnalyzeDialog
      open={aiDialogOpen}
      onOpenChange={setAiDialogOpen}
      images={aiDialogImages}
      loading={aiLoading}
      onConfirm={handleAIAnalyze}
    />
    </>
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