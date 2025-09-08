import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ReportTypeSelector from "@/components/reports/ReportTypeSelector";
import { TemplatesList } from "@/components/sections/TemplatesList";
import { UniversalSectionsList } from "@/components/sections/UniversalSectionsList";
import { SectionFieldsPanel } from "@/components/sections/SectionFieldsPanel";
import { FieldEditor } from "@/components/sections/FieldEditor";
import { CustomSectionDialog } from "@/components/reports/CustomSectionDialog";
import { useCustomSections } from "@/hooks/useCustomSections";
import { useCustomFields } from "@/hooks/useCustomFields";
import { useReportTemplates } from "@/hooks/useReportTemplates";
import { useAuth } from "@/contexts/AuthContext";
import { REPORT_TYPE_LABELS } from "@/constants/reportTypes";
import type { CustomField } from "@/integrations/supabase/customFieldsApi";
import type { Report } from "@/lib/reportSchemas";
import type { ReportTemplate } from "@/integrations/supabase/reportTemplatesApi";

export default function ReportManager() {
  const { user } = useAuth();
  const [selectedReportType, setSelectedReportType] = useState<Report["reportType"]>("home_inspection");
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [fieldEditorOpen, setFieldEditorOpen] = useState(false);
  const [sectionDialogOpen, setSectionDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<CustomField | undefined>();

  const { customSections, isLoading: sectionsLoading, createSection, deleteSection } = useCustomSections();
  const { customFields, isLoading: fieldsLoading, createField, updateField, deleteField } = useCustomFields();
  const { templates, isLoading: templatesLoading, createTemplate, updateTemplate, deleteTemplate, duplicateTemplate } = useReportTemplates(selectedReportType);

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
    // The creation is handled by the dialog itself
    setSectionDialogOpen(false);
  };

  const handleCreateTemplate = () => {
    // TODO: Implement template creation dialog
    console.log("Create template for", selectedReportType);
  };

  const handleEditTemplate = (template: ReportTemplate) => {
    // TODO: Implement template editing dialog
    console.log("Edit template", template);
  };

  const handleDuplicateTemplate = async (template: ReportTemplate) => {
    const newName = `${template.name} (Copy)`;
    await duplicateTemplate(template.id, newName);
  };

  if (!user) {
    return <div>Please log in to manage reports.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Report Manager</h2>
        <p className="text-muted-foreground mt-1">
          Manage sections, fields, and templates for all report types
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Report Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-md">
            <ReportTypeSelector
              value={selectedReportType}
              onValueChange={(value) => {
                setSelectedReportType(value);
                setSelectedTemplate(null);
                setSelectedSection(null);
              }}
              placeholder="Select a report type to manage"
            />
          </div>
          {selectedReportType && (
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <p className="text-sm">
                Currently managing: <span className="font-medium">{REPORT_TYPE_LABELS[selectedReportType]}</span>
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedReportType && (
        <div className="h-[600px] flex gap-2 border rounded-lg overflow-hidden">
          <TemplatesList
            templates={templates}
            selectedTemplate={selectedTemplate}
            onTemplateSelect={setSelectedTemplate}
            onCreateTemplate={handleCreateTemplate}
            onEditTemplate={handleEditTemplate}
            onDuplicateTemplate={handleDuplicateTemplate}
            onDeleteTemplate={deleteTemplate}
            isLoading={templatesLoading}
          />
          
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
      )}

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
        userId={user.id}
        reportTypes={[selectedReportType]}
        onSectionCreated={handleSectionCreated}
      />
    </div>
  );
}