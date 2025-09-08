import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Settings, FileText, FormInput } from "lucide-react";
import ReportTypeSelector from "@/components/reports/ReportTypeSelector";
import { UniversalSectionsList } from "@/components/sections/UniversalSectionsList";
import { SectionFieldsPanel } from "@/components/sections/SectionFieldsPanel";
import { FieldEditor } from "@/components/sections/FieldEditor";
import { CustomSectionDialog } from "@/components/reports/CustomSectionDialog";
import { useCustomSections } from "@/hooks/useCustomSections";
import { useCustomFields } from "@/hooks/useCustomFields";
import { useAuth } from "@/contexts/AuthContext";
import { REPORT_TYPE_LABELS } from "@/constants/reportTypes";
import { getReportCategory, REPORT_CATEGORY_LABELS, REPORT_CATEGORY_DESCRIPTIONS, isDefectBasedReport } from "@/constants/reportCategories";
import Seo from "@/components/Seo";
import type { CustomField } from "@/integrations/supabase/customFieldsApi";
import type { Report } from "@/lib/reportSchemas";

export default function ReportBuilder() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedReportType, setSelectedReportType] = useState<Report["reportType"]>("home_inspection");
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [fieldEditorOpen, setFieldEditorOpen] = useState(false);
  const [sectionDialogOpen, setSectionDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<CustomField | undefined>();

  const { customSections, isLoading: sectionsLoading, createSection, deleteSection } = useCustomSections();
  const { customFields, isLoading: fieldsLoading, createField, updateField, deleteField } = useCustomFields();

  const reportCategory = getReportCategory(selectedReportType);
  const isDefectBased = isDefectBasedReport(selectedReportType);

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
    return <div>Please log in to access the report builder.</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Report Builder"
        description="Build and customize report sections and fields"
      />
      
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Report Builder</h1>
            <p className="text-muted-foreground">
              Design custom sections and fields for your reports
            </p>
          </div>
        </div>

        {/* Report Type Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Report Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Report Type</label>
                <ReportTypeSelector
                  value={selectedReportType}
                  onValueChange={(value) => {
                    setSelectedReportType(value);
                    setSelectedSection(null);
                  }}
                  placeholder="Select a report type to build"
                />
              </div>
              {selectedReportType && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <div className="flex items-center gap-2">
                    <Badge variant={isDefectBased ? "default" : "secondary"} className="flex items-center gap-1">
                      {isDefectBased ? <FileText className="w-3 h-3" /> : <FormInput className="w-3 h-3" />}
                      {REPORT_CATEGORY_LABELS[reportCategory]}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {REPORT_CATEGORY_DESCRIPTIONS[reportCategory]}
                  </p>
                </div>
              )}
            </div>

            {selectedReportType && (
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm">
                  Building: <span className="font-medium">{REPORT_TYPE_LABELS[selectedReportType]}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {isDefectBased 
                    ? "Add custom sections with observation and defect tracking capabilities"
                    : "Configure form fields and structured data collection"
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Builder Interface */}
        {selectedReportType && (
          <div className="h-[700px] flex gap-4 rounded-lg overflow-hidden">
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
          userId={user.id}
          reportTypes={[selectedReportType]}
          onSectionCreated={handleSectionCreated}
        />
      </div>
    </div>
  );
}