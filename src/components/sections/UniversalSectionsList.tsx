import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Settings2, Hash } from "lucide-react";
import { getSectionsForReportType } from "@/constants/reportSections";
import type { CustomSection } from "@/integrations/supabase/customSectionsApi";
import type { CustomField } from "@/integrations/supabase/customFieldsApi";
import type { Report } from "@/lib/reportSchemas";

interface UniversalSectionsListProps {
  reportType: Report["reportType"];
  selectedSection: string | null;
  onSectionSelect: (sectionKey: string) => void;
  customSections: CustomSection[];
  customFields: CustomField[];
  onAddSection: () => void;
}

export function UniversalSectionsList({
  reportType,
  selectedSection,
  onSectionSelect,
  customSections,
  customFields,
  onAddSection,
}: UniversalSectionsListProps) {
  const getFieldCount = (sectionKey: string): number => {
    return customFields.filter(field => 
      field.section_key === sectionKey && 
      field.report_types.includes(reportType)
    ).length;
  };

  const getSectionTitle = (sectionKey: string): string => {
    const customSection = customSections.find(section => section.section_key === sectionKey);
    if (customSection) return customSection.title;
    
    const standardSections = getSectionsForReportType(reportType);
    const standardSection = standardSections.find(section => section.key === sectionKey);
    return standardSection?.name || sectionKey;
  };

  // Filter sections that apply to the current report type
  const relevantCustomSections = customSections.filter(section =>
    section.report_types.includes(reportType)
  );

  return (
    <div className="w-80 bg-muted/30 border-r border-border h-full overflow-auto">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">Sections</h3>
          <Button
            onClick={onAddSection}
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="p-2">
        <div className="space-y-1">
          {/* Combine standard and custom sections */}
          {[
            ...getSectionsForReportType(reportType).map(section => ({
              ...section,
              type: 'standard' as const,
              id: section.key
            })),
            ...relevantCustomSections.map(section => ({
              ...section,
              type: 'custom' as const,
              name: section.title,
              key: section.section_key
            }))
          ].map(section => {
            const fieldCount = getFieldCount(section.key);
            const isSelected = selectedSection === section.key;
            const isCustom = section.type === 'custom';
            
            return (
              <Card
                key={section.id}
                className={`p-3 cursor-pointer transition-colors hover:bg-muted/50 ${
                  isSelected 
                    ? "bg-primary/10 border-primary ring-1 ring-primary/20" 
                    : "bg-background"
                }`}
                onClick={() => onSectionSelect(section.key)}
              >
                <div className="flex items-center gap-3">
                  {isCustom ? (
                    <div className="h-4 w-4 rounded-full bg-gradient-to-br from-primary to-primary/60" />
                  ) : (
                    <Settings2 className="h-4 w-4 text-muted-foreground" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{section.name}</p>
                      {isCustom && (
                        <Badge variant="outline" className="text-xs px-1.5 py-0">
                          Custom
                        </Badge>
                      )}
                    </div>
                  </div>
                  {fieldCount > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      <Hash className="h-3 w-3 mr-1" />
                      {fieldCount}
                    </Badge>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}