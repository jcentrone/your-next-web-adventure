import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Edit, Trash2, GripVertical, Settings, Lock } from "lucide-react";
import { SOP_SECTIONS } from "@/constants/sop";
import type { CustomField } from "@/integrations/supabase/customFieldsApi";
import type { CustomSection } from "@/integrations/supabase/customSectionsApi";
import type { Report } from "@/lib/reportSchemas";
import { FL_FOUR_POINT_QUESTIONS } from "@/constants/flFourPointQuestions";
import { WIND_MITIGATION_QUESTIONS } from "@/constants/windMitigationQuestions";
import { TX_WINDSTORM_QUESTIONS } from "@/constants/txWindstormQuestions";
import { CA_WILDFIRE_QUESTIONS } from "@/constants/caWildfireQuestions";
import { MANUFACTURED_HOME_QUESTIONS } from "@/constants/manufacturedHomeQuestions";
import { ROOF_CERTIFICATION_QUESTIONS } from "@/constants/roofCertificationQuestions";

interface SectionFieldsPanelProps {
  selectedSection: string | null;
  reportType: Report["reportType"];
  customFields: CustomField[];
  customSections: CustomSection[];
  onAddField: () => void;
  onEditField: (field: CustomField) => void;
  onDeleteField: (fieldId: string) => void;
  onEditSection?: (section: CustomSection) => void;
  onDeleteSection?: (sectionId: string) => void;
}

export function SectionFieldsPanel({
  selectedSection,
  reportType,
  customFields,
  customSections,
  onAddField,
  onEditField,
  onDeleteField,
  onEditSection,
  onDeleteSection,
}: SectionFieldsPanelProps) {
  const [deleteFieldId, setDeleteFieldId] = useState<string | null>(null);
  const [deleteSectionId, setDeleteSectionId] = useState<string | null>(null);

  if (!selectedSection) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/50">
        <div className="text-center">
          <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Select a Section</h3>
          <p className="text-muted-foreground">
            Choose a section from the left to manage its fields
          </p>
        </div>
      </div>
    );
  }

  const sectionFields = customFields.filter(field => field.section_key === selectedSection);
  const customSection = customSections.find(s => s.section_key === selectedSection);
  const isCustomSection = !!customSection;
  const sectionTitle = customSection?.title || String(SOP_SECTIONS[selectedSection as keyof typeof SOP_SECTIONS] || selectedSection);

  // Get built-in fields for this section and report type
  const getBuiltInFields = () => {
    if (!selectedSection) return [];
    
    const questionMaps = {
      fl_four_point_citizens: FL_FOUR_POINT_QUESTIONS,
      wind_mitigation: WIND_MITIGATION_QUESTIONS,
      fl_wind_mitigation_oir_b1_1802: WIND_MITIGATION_QUESTIONS,
      tx_coastal_windstorm_mitigation: TX_WINDSTORM_QUESTIONS,
      ca_wildfire_defensible_space: CA_WILDFIRE_QUESTIONS,
      manufactured_home_insurance_prep: MANUFACTURED_HOME_QUESTIONS,
      roof_certification_nationwide: ROOF_CERTIFICATION_QUESTIONS,
    };

    const questions = questionMaps[reportType as keyof typeof questionMaps];
    if (!questions || !('sections' in questions)) return [];

    const section = questions.sections.find((s: any) => s.name === selectedSection);
    return section?.fields || [];
  };

  const builtInFields = getBuiltInFields();

  const getWidgetTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      text: "Text",
      textarea: "Text Area",
      select: "Select",
      multiselect: "Multi Select",
      number: "Number",
      date: "Date",
      contact_lookup: "Contact Lookup",
    };
    return labels[type] || type;
  };

  return (
    <div className="flex-1 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">{sectionTitle}</h2>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={isCustomSection ? "outline" : "secondary"}>
              {isCustomSection ? "Custom Section" : "Standard Section"}
            </Badge>
            {sectionFields.length > 0 && (
              <Badge variant="secondary">
                {sectionFields.length} custom fields
              </Badge>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {isCustomSection && onEditSection && (
            <Button variant="outline" onClick={() => onEditSection(customSection!)}>
              <Edit className="h-4 w-4 mr-1" />
              Edit Section
            </Button>
          )}
          <Button onClick={onAddField}>
            <Plus className="h-4 w-4 mr-1" />
            Add Field
          </Button>
        </div>
      </div>

      {sectionFields.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">
            No custom fields in this section yet
          </div>
          <Button onClick={onAddField}>
            <Plus className="h-4 w-4 mr-1" />
            Add Your First Field
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Built-in Fields */}
          {builtInFields.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Built-in Fields (Read-only)
              </h4>
              <div className="space-y-2">
                {builtInFields.map((field: any, index) => (
                  <Card key={index} className="p-3 bg-muted/30">
                    <div className="flex items-center gap-3">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium text-sm">{field.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {field.name} • {getWidgetTypeLabel(field.widget)}
                          {field.required && " • Required"}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Custom Fields */}
          {sectionFields.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-3">
                Custom Fields
              </h4>
              <div className="space-y-3">
                {sectionFields.map((field) => (
                  <Card key={field.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                        <div>
                          <div className="font-medium">{field.field_label}</div>
                          <div className="text-sm text-muted-foreground">
                            {field.field_name} • {getWidgetTypeLabel(field.widget_type)}
                            {field.required && " • Required"}
                          </div>
                          {field.options.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {field.options.map((option, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {option}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEditField(field)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteFieldId(field.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Empty state for custom fields */}
          {sectionFields.length === 0 && builtInFields.length > 0 && (
            <div className="text-center py-6 border-2 border-dashed border-border rounded-lg">
              <div className="text-muted-foreground mb-2 text-sm">
                No custom fields in this section yet
              </div>
              <Button onClick={onAddField} size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Custom Field
              </Button>
            </div>
          )}
        </div>
      )}

      {isCustomSection && onDeleteSection && (
        <div className="mt-8 pt-6 border-t border-border">
          <Button
            variant="destructive"
            onClick={() => setDeleteSectionId(customSection!.id)}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete Section
          </Button>
        </div>
      )}

      {/* Delete Field Confirmation */}
      <AlertDialog open={!!deleteFieldId} onOpenChange={() => setDeleteFieldId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Field</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this field? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteFieldId) {
                  onDeleteField(deleteFieldId);
                  setDeleteFieldId(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Section Confirmation */}
      <AlertDialog open={!!deleteSectionId} onOpenChange={() => setDeleteSectionId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Section</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this section and all its fields? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteSectionId) {
                  onDeleteSection(deleteSectionId);
                  setDeleteSectionId(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}