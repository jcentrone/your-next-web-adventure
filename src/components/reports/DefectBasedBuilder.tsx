import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Save, Settings2, FileText, AlertTriangle } from "lucide-react";
import { UniversalSectionsList } from "@/components/sections/UniversalSectionsList";
import { SectionFieldsPanel } from "@/components/sections/SectionFieldsPanel";
import { FieldEditor } from "@/components/sections/FieldEditor";
import { CustomSectionDialog } from "@/components/reports/CustomSectionDialog";
import { useCustomSections } from "@/hooks/useCustomSections";
import { useCustomFields } from "@/hooks/useCustomFields";
import { useReportTemplates } from "@/hooks/useReportTemplates";
import { getSectionsForReportType } from "@/constants/reportSections";
import { REPORT_TYPE_LABELS } from "@/constants/reportTypes";
import { useToast } from "@/hooks/use-toast";
import type { CustomField } from "@/integrations/supabase/customFieldsApi";
import type { Report } from "@/lib/reportSchemas";

interface DefectBasedBuilderProps {
  userId: string;
  onSaveTemplate: (templateData: {
    name: string;
    description?: string;
    report_type: Report["reportType"];
    sections_config: Array<{
      sectionKey: string;
      title: string;
      isCustom: boolean;
      isRequired: boolean;
      sortOrder: number;
    }>;
    fields_config: Record<string, Array<{
      fieldId: string;
      fieldName: string;
      fieldLabel: string;
      widgetType: string;
      options?: string[];
      required: boolean;
      sortOrder: number;
    }>>;
  }) => Promise<void>;
}

export function DefectBasedBuilder({ userId, onSaveTemplate }: DefectBasedBuilderProps) {
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [selectedReportType, setSelectedReportType] = useState<Report["reportType"]>("home_inspection");
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [fieldEditorOpen, setFieldEditorOpen] = useState(false);
  const [sectionDialogOpen, setSectionDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<CustomField | undefined>();
  const [isSaving, setIsSaving] = useState(false);

  const { customSections, createSection, deleteSection } = useCustomSections();
  const { customFields, createField, updateField, deleteField } = useCustomFields();
  const { toast } = useToast();

  const handleAddField = () => {
    setEditingField(undefined);
    setFieldEditorOpen(true);
  };

  const handleEditField = (field: CustomField) => {
    setEditingField(field);
    setFieldEditorOpen(true);
  };

  const handleSaveField = async (fieldData: {
    field_name: string;
    field_label: string;
    widget_type: CustomField["widget_type"];
    options?: string[];
    required?: boolean;
  }) => {
    if (!selectedSection) return;

    if (editingField) {
      await updateField(editingField.id, {
        field_label: fieldData.field_label,
        widget_type: fieldData.widget_type,
        options: fieldData.options,
        required: fieldData.required,
      });
    } else {
      await createField({
        ...fieldData,
        section_key: selectedSection,
        report_types: [selectedReportType],
      });
    }
  };

  const handleSectionCreated = async (title: string) => {
    setSectionDialogOpen(false);
  };

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a template name",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      // Build sections config from standard sections + custom sections
      const standardSections = getSectionsForReportType(selectedReportType);
      const relevantCustomSections = customSections.filter(s => 
        s.report_types.includes(selectedReportType)
      );

      const sectionsConfig = [
        ...standardSections.map(section => ({
          sectionKey: section.key,
          title: section.name,
          isCustom: false,
          isRequired: section.isRequired || false,
          sortOrder: section.sortOrder,
        })),
        ...relevantCustomSections.map((section, index) => ({
          sectionKey: section.section_key,
          title: section.title,
          isCustom: true,
          isRequired: false,
          sortOrder: standardSections.length + index + 1,
        })),
      ];

      // Build fields config
      const fieldsConfig: Record<string, any[]> = {};
      
      // Group custom fields by section
      const relevantFields = customFields.filter(field => 
        field.report_types.includes(selectedReportType)
      );

      relevantFields.forEach(field => {
        if (!fieldsConfig[field.section_key]) {
          fieldsConfig[field.section_key] = [];
        }
        fieldsConfig[field.section_key].push({
          fieldId: field.id,
          fieldName: field.field_name,
          fieldLabel: field.field_label,
          widgetType: field.widget_type,
          options: field.options,
          required: field.required,
          sortOrder: field.sort_order || 0,
        });
      });

      await onSaveTemplate({
        name: templateName,
        description: templateDescription || undefined,
        report_type: selectedReportType,
        sections_config: sectionsConfig,
        fields_config: fieldsConfig,
      });

      toast({
        title: "Success",
        description: "Defect-based report template created successfully",
      });

      // Reset form
      setTemplateName("");
      setTemplateDescription("");
      setSelectedSection(null);
    } catch (error) {
      console.error("Error saving template:", error);
      toast({
        title: "Error",
        description: "Failed to save template",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Template Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Defect-Based Report Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="template-name">Template Name</Label>
              <Input
                id="template-name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Enter template name"
              />
            </div>
            <div>
              <Label htmlFor="report-type">Report Type</Label>
              <div className="pt-2">
                <Badge variant="outline">
                  {REPORT_TYPE_LABELS[selectedReportType]}
                </Badge>
              </div>
            </div>
          </div>
          <div>
            <Label htmlFor="template-description">Description (Optional)</Label>
            <Textarea
              id="template-description"
              value={templateDescription}
              onChange={(e) => setTemplateDescription(e.target.value)}
              placeholder="Describe this template..."
              rows={2}
            />
          </div>
          <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Defect-Based Report Features</h4>
                <ul className="text-sm text-blue-700 mt-1 space-y-1">
                  <li>• Section-based observations and defect tracking</li>
                  <li>• Built-in SOP compliance structure</li>
                  <li>• Photo and media attachment support</li>
                  <li>• Customizable fields for additional data collection</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Builder Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="w-5 h-5" />
            Section & Field Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[600px] flex gap-4 rounded-lg overflow-hidden border">
            <UniversalSectionsList
              reportType={selectedReportType}
              selectedSection={selectedSection}
              onSectionSelect={setSelectedSection}
              customSections={customSections}
              customFields={customFields}
              onAddSection={() => setSectionDialogOpen(true)}
            />
            
            <SectionFieldsPanel
              selectedSection={selectedSection}
              reportType={selectedReportType}
              customFields={customFields.filter(field => 
                selectedSection ? 
                  field.section_key === selectedSection && 
                  field.report_types.includes(selectedReportType) 
                  : false
              )}
              customSections={customSections}
              onAddField={handleAddField}
              onEditField={handleEditField}
              onDeleteField={deleteField}
              onDeleteSection={deleteSection}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Template */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSaveTemplate} 
          disabled={!templateName.trim() || isSaving}
          size="lg"
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? "Saving..." : "Save Template"}
        </Button>
      </div>

      {/* Dialogs */}
      <FieldEditor
        open={fieldEditorOpen}
        onOpenChange={setFieldEditorOpen}
        field={editingField}
        sectionKey={selectedSection || ""}
        onSave={handleSaveField}
        isEditing={!!editingField}
      />

      <CustomSectionDialog
        open={sectionDialogOpen}
        onOpenChange={setSectionDialogOpen}
        userId={userId}
        reportTypes={[selectedReportType]}
        onSectionCreated={handleSectionCreated}
      />
    </div>
  );
}