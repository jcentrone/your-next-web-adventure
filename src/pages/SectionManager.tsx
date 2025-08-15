import { useState } from "react";
import Seo from "@/components/Seo";
import { SectionsList } from "@/components/sections/SectionsList";
import { SectionFieldsPanel } from "@/components/sections/SectionFieldsPanel";
import { FieldEditor } from "@/components/sections/FieldEditor";
import { CustomSectionDialog } from "@/components/reports/CustomSectionDialog";
import { useCustomSections } from "@/hooks/useCustomSections";
import { useCustomFields } from "@/hooks/useCustomFields";
import { useAuth } from "@/contexts/AuthContext";
import type { CustomField } from "@/integrations/supabase/customFieldsApi";

export default function SectionManager() {
  const { user } = useAuth();
  const { customSections, isLoading: sectionsLoading, createSection, deleteSection } = useCustomSections();
  const { customFields, isLoading: fieldsLoading, createField, updateField, deleteField } = useCustomFields();
  
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [fieldEditorOpen, setFieldEditorOpen] = useState(false);
  const [sectionDialogOpen, setSectionDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<CustomField | undefined>();

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
      });
    }
  };

  const handleSectionCreated = () => {
    setSectionDialogOpen(false);
  };

  if (!user) {
    return <div>Please log in to manage sections.</div>;
  }

  return (
    <>
      <Seo 
        title="Section Manager - Home Inspection Platform"
        description="Manage custom sections and fields for your inspection reports"
      />
      
      <div className="h-screen flex gap-2">
        <SectionsList
          selectedSection={selectedSection}
          onSectionSelect={setSelectedSection}
          customSections={customSections}
          customFields={customFields}
          onAddSection={() => setSectionDialogOpen(true)}
          
        />
        
        <SectionFieldsPanel
          selectedSection={selectedSection}
          customFields={customFields.filter(field => 
            selectedSection ? field.section_key === selectedSection : false
          )}
          customSections={customSections}
          onAddField={handleAddField}
          onEditField={handleEditField}
          onDeleteField={deleteField}
          onDeleteSection={deleteSection}
        />

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
          onSectionCreated={handleSectionCreated}
        />
      </div>
    </>
  );
}