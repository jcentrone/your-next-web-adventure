import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Settings2 } from "lucide-react";
import { UniversalSectionsList } from "@/components/sections/UniversalSectionsList";
import { SectionFieldsPanel } from "@/components/sections/SectionFieldsPanel";
import { FieldEditor } from "@/components/sections/FieldEditor";
import { CustomSectionDialog } from "@/components/reports/CustomSectionDialog";
import { useCustomSections } from "@/hooks/useCustomSections";
import { useCustomFields } from "@/hooks/useCustomFields";
import { useToast } from "@/hooks/use-toast";
import { customReportTypesApi } from "@/integrations/supabase/customReportTypesApi";
import type { CustomField } from "@/integrations/supabase/customFieldsApi";
import type { Report } from "@/lib/reportSchemas";
import type { ReportCategory } from "@/constants/reportCategories";

interface NewReportBuilderProps {
  userId: string;
  category: ReportCategory;
}

export function NewReportBuilder({ userId, category }: NewReportBuilderProps) {
  const navigate = useNavigate();
  const [reportTitle, setReportTitle] = useState("");
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [fieldEditorOpen, setFieldEditorOpen] = useState(false);
  const [sectionDialogOpen, setSectionDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<CustomField | undefined>();
  const [isSaving, setIsSaving] = useState(false);

  const [reportType] = useState<Report["reportType"]>(() => (`custom_${crypto.randomUUID()}`) as Report["reportType"]);

  const { customSections, deleteSection, loadCustomSections } = useCustomSections();
  const { customFields, createField, updateField, deleteField } = useCustomFields();
  const { toast } = useToast();

  const orderedCustomSections = customSections
    .filter(section => section.report_types.includes(reportType))
    .map(section => ({
      key: section.section_key,
      name: section.title,
      type: "custom" as const,
      id: section.section_key,
      sortOrder: section.sort_order || 0,
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder);

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
        report_types: [reportType],
      });
    }
  };

  const handleSectionCreated = async () => {
    await loadCustomSections();
    setSectionDialogOpen(false);
  };

  const handleSaveReport = async () => {
    if (!reportTitle.trim()) {
      toast({
        title: "Error",
        description: "Please enter a report title",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      await customReportTypesApi.create(userId, {
        id: reportType,
        name: reportTitle.trim(),
        category,
      });

      toast({
        title: "Success",
        description: "Report type created successfully",
      });

      setReportTitle("");
      setSelectedSection(null);
      navigate("/settings/account/report-manager");
    } catch (error) {
      console.error("Error saving report type:", error);
      toast({
        title: "Error",
        description: "Failed to save report type",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Report Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div>
              <Label htmlFor="report-title">Report Title</Label>
              <Input
                id="report-title"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                placeholder="Enter report title"
              />
            </div>
          </div>
        </CardContent>
      </Card>

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
              reportType={reportType}
              selectedSection={selectedSection}
              onSectionSelect={setSelectedSection}
              customSections={customSections}
              customFields={customFields}
              onAddSection={() => setSectionDialogOpen(true)}
              orderedSections={orderedCustomSections}
            />

            <SectionFieldsPanel
              selectedSection={selectedSection}
              reportType={reportType}
              customFields={customFields.filter(field =>
                selectedSection ?
                  field.section_key === selectedSection &&
                  field.report_types.includes(reportType)
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

      <div className="flex justify-end">
        <Button onClick={handleSaveReport} disabled={!reportTitle.trim() || isSaving} size="lg">
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? "Saving..." : "Save Report"}
        </Button>
      </div>

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
        reportTypes={[reportType]}
        onSectionCreated={handleSectionCreated}
      />
    </div>
  );
}

export default NewReportBuilder;

