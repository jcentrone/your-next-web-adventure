import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Plus, Settings, Folder, FolderOpen } from "lucide-react";
import { SOP_SECTIONS } from "@/constants/sop";
import type { CustomSection } from "@/integrations/supabase/customSectionsApi";
import type { CustomField } from "@/integrations/supabase/customFieldsApi";

interface SectionsListProps {
  selectedSection: string | null;
  onSectionSelect: (sectionKey: string) => void;
  customSections: CustomSection[];
  customFields: CustomField[];
  onAddSection: () => void;
}

export function SectionsList({
  selectedSection,
  onSectionSelect,
  customSections,
  customFields,
  onAddSection,
}: SectionsListProps) {
  const getFieldCount = (sectionKey: string) => {
    return customFields.filter(field => field.section_key === sectionKey).length;
  };

  const getSectionTitle = (sectionKey: string) => {
    const customSection = customSections.find(s => s.section_key === sectionKey);
    if (customSection) return customSection.title;
    const standardSection = SOP_SECTIONS.find(s => s.key === sectionKey);
    return standardSection?.name || sectionKey;
  };

  const isCustomSection = (sectionKey: string) => {
    return customSections.some(s => s.section_key === sectionKey);
  };

  // Get all sections (standard + custom)
  const standardSectionKeys = SOP_SECTIONS.map(s => s.key);
  const customSectionKeys = customSections.map(s => s.section_key);
  const allSectionKeys = [...standardSectionKeys, ...customSectionKeys];

  return (
    <div className="w-80 border-r border-border bg-background">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Sections</h2>
          <Button onClick={onAddSection} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Section
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
        {/* Standard Sections */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Standard Sections</h3>
          {standardSectionKeys.map((sectionKey) => {
            const fieldCount = getFieldCount(sectionKey);
            const isSelected = selectedSection === sectionKey;

            return (
              <Card
                key={sectionKey}
                className={`p-2 mb-2 cursor-pointer transition-colors hover:bg-accent ${
                  isSelected ? "bg-accent border-primary" : ""
                }`}
                onClick={() => onSectionSelect(sectionKey)}
              >
                <div className="flex items-center gap-2">
                  {isSelected ? (
                    <FolderOpen className="h-4 w-4 text-primary" />
                  ) : (
                    <Folder className="h-4 w-4 text-muted-foreground" />
                  )}
                  <div className="flex-1">
                    <div className="font-medium text-sm">{String(getSectionTitle(sectionKey))}</div>
                    <div className="flex items-center gap-2 mt-1">
                      {fieldCount > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {fieldCount} custom fields
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Custom Sections */}
        {customSections.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Custom Sections</h3>
            {customSections.map((section) => {
              const fieldCount = getFieldCount(section.section_key);
              const isSelected = selectedSection === section.section_key;

              return (
                <Card
                  key={section.id}
                  className={`p-3 cursor-pointer transition-colors hover:bg-accent ${
                    isSelected ? "bg-accent border-primary" : ""
                  }`}
                  onClick={() => onSectionSelect(section.section_key)}
                >
                  <div className="flex items-center gap-2">
                    {isSelected ? (
                      <FolderOpen className="h-4 w-4 text-primary" />
                    ) : (
                      <Folder className="h-4 w-4 text-muted-foreground" />
                    )}
                    <div className="flex-1">
                      <div className="font-medium text-sm">{section.title}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          Custom
                        </Badge>
                        {fieldCount > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {fieldCount} fields
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}