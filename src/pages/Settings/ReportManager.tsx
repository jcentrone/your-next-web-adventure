import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wrench, FileText, FormInput, Settings, Trash2 } from "lucide-react";
import ReportTypeSelector from "@/components/reports/ReportTypeSelector";
import { UniversalSectionsList } from "@/components/sections/UniversalSectionsList";
import { SectionFieldsPanel } from "@/components/sections/SectionFieldsPanel";
import { FieldEditor } from "@/components/sections/FieldEditor";
import { CustomSectionDialog } from "@/components/reports/CustomSectionDialog";
import { useReportTemplates } from "@/hooks/useReportTemplates";
import { useCustomSections } from "@/hooks/useCustomSections";
import { useCustomFields } from "@/hooks/useCustomFields";
import { useSectionOrder } from "@/hooks/useSectionOrder";
import { useAuth } from "@/contexts/AuthContext";
import { REPORT_TYPE_LABELS } from "@/constants/reportTypes";
import { getReportCategory, REPORT_CATEGORY_LABELS, REPORT_CATEGORY_DESCRIPTIONS, isDefectBasedReport } from "@/constants/reportCategories";
import { useToast } from "@/hooks/use-toast";
import type { Report } from "@/lib/reportSchemas";
import type { CustomField } from "@/integrations/supabase/customFieldsApi";

export default function ReportManager() {
  const { user } = useAuth();
  const [selectedReportType, setSelectedReportType] = useState<Report["reportType"]>("home_inspection");
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [fieldEditorOpen, setFieldEditorOpen] = useState(false);
  const [sectionDialogOpen, setSectionDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<CustomField | undefined>();

  const { templates, deleteTemplate } = useReportTemplates(); // Get all templates, not filtered by type
  const { customSections, createSection, deleteSection } = useCustomSections();
  const { customFields, createField, updateField, deleteField } = useCustomFields();
  const { updateSectionOrder, getOrderedSections } = useSectionOrder(selectedReportType, customSections);
  const { toast } = useToast();

  const reportCategory = getReportCategory(selectedReportType);
  const isDefectBased = isDefectBasedReport(selectedReportType);

  // Get all available report types (standard + custom from templates)
  const customReportTypes = templates
    .map(t => t.report_type)
    .filter((type, index, arr) => arr.indexOf(type) === index) // Remove duplicates
    .filter(type => !REPORT_TYPE_LABELS[type]); // Only custom types

  const handleOpenReportBuilder = () => {
    window.open("/report-builder", "_blank");
  };

  const handleDeleteCustomReportType = async (reportType: Report["reportType"]) => {
    const templatesToDelete = templates.filter(t => t.report_type === reportType);
    
    try {
      await Promise.all(templatesToDelete.map(t => deleteTemplate(t.id)));
      toast({
        title: "Success",
        description: "Custom report type deleted successfully",
      });
      
      // If we're currently viewing the deleted type, switch to home_inspection
      if (selectedReportType === reportType) {
        setSelectedReportType("home_inspection");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete custom report type",
        variant: "destructive",
      });
    }
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
    await createSection(title);
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
          Manage and customize your reports, sections, and fields
        </p>
      </div>

      {/* Report Builder Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="w-5 h-5" />
            Create New Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm font-medium">Report Builder</p>
              <p className="text-xs text-muted-foreground">
                Create new custom reports with tailored sections and fields
              </p>
            </div>
            <Button onClick={handleOpenReportBuilder} className="flex items-center gap-2">
              <Wrench className="w-4 h-4" />
              Open Report Builder
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Editing Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Edit Report
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Report Selection */}
          <div className="grid md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg border">
            <div>
              <label className="text-sm font-medium mb-2 block">Select Report to Edit</label>
              <ReportTypeSelector
                value={selectedReportType}
                onValueChange={(value) => {
                  setSelectedReportType(value);
                  setSelectedSection(null);
                }}
                placeholder="Choose a report type to customize"
                includeCustomTypes={true}
              />
            </div>
            {selectedReportType && (
              <div>
                <label className="text-sm font-medium mb-2 block">Report Category</label>
                <div className="flex items-center gap-2">
                  <Badge variant={isDefectBased ? "default" : "secondary"} className="flex items-center gap-1 w-fit">
                    {isDefectBased ? <FileText className="w-3 h-3" /> : <FormInput className="w-3 h-3" />}
                    {REPORT_CATEGORY_LABELS[reportCategory]}
                  </Badge>
                  {customReportTypes.includes(selectedReportType) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCustomReportType(selectedReportType)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {REPORT_CATEGORY_DESCRIPTIONS[reportCategory]}
                </p>
              </div>
            )}
          </div>

          {/* Section & Field Management */}
          {selectedReportType && (
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-medium">
                  Editing: {REPORT_TYPE_LABELS[selectedReportType] || selectedReportType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isDefectBased 
                    ? "Customize report sections and add fields for additional data collection"
                    : "Configure structured form fields and data collection elements"
                  }
                </p>
              </div>
              
              <div className="h-[600px] flex gap-4 rounded-lg overflow-hidden border">
                <UniversalSectionsList
                  reportType={selectedReportType}
                  selectedSection={selectedSection}
                  onSectionSelect={setSelectedSection}
                  customSections={customSections}
                  customFields={customFields}
                  onAddSection={() => setSectionDialogOpen(true)}
                  onReorderSections={updateSectionOrder}
                  orderedSections={getOrderedSections()}
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
            </div>
          )}

          {!selectedReportType && (
            <div className="text-center py-12 text-muted-foreground">
              <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Select a report above to customize its sections and fields</p>
            </div>
          )}
        </CardContent>
      </Card>

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