import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wrench, FileText, FormInput, Settings } from "lucide-react";
import ReportTypeSelector from "@/components/reports/ReportTypeSelector";
import { TemplatesList } from "@/components/sections/TemplatesList";
import { TemplateCreateDialog } from "@/components/sections/TemplateCreateDialog";
import { TemplateEditDialog } from "@/components/sections/TemplateEditDialog";
import { UniversalSectionsList } from "@/components/sections/UniversalSectionsList";
import { SectionFieldsPanel } from "@/components/sections/SectionFieldsPanel";
import { FieldEditor } from "@/components/sections/FieldEditor";
import { CustomSectionDialog } from "@/components/reports/CustomSectionDialog";
import { useReportTemplates } from "@/hooks/useReportTemplates";
import { useCustomSections } from "@/hooks/useCustomSections";
import { useCustomFields } from "@/hooks/useCustomFields";
import { useAuth } from "@/contexts/AuthContext";
import { REPORT_TYPE_LABELS } from "@/constants/reportTypes";
import { getReportCategory, REPORT_CATEGORY_LABELS, REPORT_CATEGORY_DESCRIPTIONS, isDefectBasedReport } from "@/constants/reportCategories";
import { createDefaultTemplate } from "@/utils/defaultTemplates";
import type { Report } from "@/lib/reportSchemas";
import type { ReportTemplate } from "@/integrations/supabase/reportTemplatesApi";
import type { CustomField } from "@/integrations/supabase/customFieldsApi";

export default function ReportManager() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedReportType, setSelectedReportType] = useState<Report["reportType"]>("home_inspection");
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [templateCreateOpen, setTemplateCreateOpen] = useState(false);
  const [templateEditOpen, setTemplateEditOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [fieldEditorOpen, setFieldEditorOpen] = useState(false);
  const [sectionDialogOpen, setSectionDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<CustomField | undefined>();

  const { templates, isLoading: templatesLoading, createTemplate, updateTemplate, deleteTemplate, duplicateTemplate } = useReportTemplates(selectedReportType);
  const { customSections, isLoading: sectionsLoading, createSection, deleteSection } = useCustomSections();
  const { customFields, isLoading: fieldsLoading, createField, updateField, deleteField } = useCustomFields();

  const reportCategory = getReportCategory(selectedReportType);
  const isDefectBased = isDefectBasedReport(selectedReportType);

  const handleOpenReportBuilder = () => {
    navigate("/report-builder");
  };

  const handleCreateTemplate = () => {
    setTemplateCreateOpen(true);
  };

  const handleEditTemplate = (template: ReportTemplate) => {
    setSelectedTemplate(template);
    setTemplateEditOpen(true);
  };

  const handleTemplateCreated = () => {
    // Templates will be reloaded automatically by the hook
  };

  const handleTemplateUpdated = () => {
    // Templates will be reloaded automatically by the hook
  };

  const handleCreateDefaultTemplate = async () => {
    if (!user?.id) return;
    
    try {
      await createDefaultTemplate(selectedReportType, user.id, createTemplate);
    } catch (error) {
      console.error("Error creating default template:", error);
    }
  };

  const handleDuplicateTemplate = async (template: ReportTemplate) => {
    const newName = `${template.name} (Copy)`;
    await duplicateTemplate(template.id, newName);
  };

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
          <CardTitle className="text-lg">Report Type & Category</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Report Type</label>
              <ReportTypeSelector
                value={selectedReportType}
                onValueChange={(value) => {
                  setSelectedReportType(value);
                  setSelectedTemplate(null);
                }}
                placeholder="Select a report type to manage"
              />
            </div>
            {selectedReportType && (
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <Badge variant={isDefectBased ? "default" : "secondary"} className="flex items-center gap-1 w-fit">
                  {isDefectBased ? <FileText className="w-3 h-3" /> : <FormInput className="w-3 h-3" />}
                  {REPORT_CATEGORY_LABELS[reportCategory]}
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">
                  {REPORT_CATEGORY_DESCRIPTIONS[reportCategory]}
                </p>
              </div>
            )}
          </div>

          {selectedReportType && (
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm font-medium">
                  Managing: {REPORT_TYPE_LABELS[selectedReportType]}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isDefectBased 
                    ? "Use templates to organize report sections and customize fields"
                    : "Create templates with structured form configurations"
                  }
                </p>
              </div>
              <Button onClick={handleOpenReportBuilder} className="flex items-center gap-2">
                <Wrench className="w-4 h-4" />
                Report Builder
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedReportType && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Report Templates</CardTitle>
              <p className="text-sm text-muted-foreground">
                Manage report templates for {REPORT_TYPE_LABELS[selectedReportType]}
              </p>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] overflow-hidden">
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
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Section Management
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Customize sections and fields for {REPORT_TYPE_LABELS[selectedReportType]}
              </p>
            </CardHeader>
            <CardContent>
              <div className="h-[600px] flex gap-4 rounded-lg overflow-hidden">
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
            </CardContent>
          </Card>
        </>
      )}

      <TemplateCreateDialog
        open={templateCreateOpen}
        onOpenChange={setTemplateCreateOpen}
        reportType={selectedReportType}
        onTemplateCreated={handleTemplateCreated}
        onCreateTemplate={createTemplate}
      />

      <TemplateEditDialog
        open={templateEditOpen}
        onOpenChange={setTemplateEditOpen}
        template={selectedTemplate}
        onTemplateUpdated={handleTemplateUpdated}
        onUpdateTemplate={updateTemplate}
      />

      {/* Field Editor Dialog */}
      <FieldEditor
        open={fieldEditorOpen}
        onOpenChange={setFieldEditorOpen}
        field={editingField}
        sectionKey={selectedSection || ""}
        onSave={handleSaveField}
        isEditing={!!editingField}
      />

      {/* Custom Section Dialog */}
      <CustomSectionDialog
        open={sectionDialogOpen}
        onOpenChange={setSectionDialogOpen}
        userId={user?.id || ""}
        reportTypes={[selectedReportType]}
        onSectionCreated={handleSectionCreated}
      />
    </div>
  );
}