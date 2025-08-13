import React from "react";
import { format } from "date-fns";
import { useSectionGuidance } from "@/hooks/useSectionGuidance";
import { type SectionKey } from "@/constants/sop";

interface SectionInfoDisplayProps {
  sectionKey: SectionKey;
  sectionInfo: Record<string, any>;
  className?: string;
}

const SectionInfoDisplay: React.FC<SectionInfoDisplayProps> = ({
  sectionKey,
  sectionInfo,
  className = ""
}) => {
  const { guidance } = useSectionGuidance();

  const formatValue = (value: any, widget: string) => {
    if (!value || String(value).trim() === "") return null;
    
    if (widget === "date") {
      try {
        return format(new Date(value), "MMMM d, yyyy");
      } catch {
        return String(value);
      }
    }
    
    return String(value);
  };

  const infoFields = guidance[sectionKey]?.infoFields || [];
  const displayableFields = infoFields
    .map(field => ({
      ...field,
      value: formatValue(sectionInfo[field.name], field.widget)
    }))
    .filter(field => field.value);

  if (displayableFields.length === 0) return null;

  return (
    <div className={`bg-muted/50 rounded-lg p-4 mb-4 pdf-section-info ${className}`}>
      <h3 className="text-sm font-medium text-muted-foreground mb-3">Section Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {displayableFields.map(field => (
          <div key={field.name} className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">{field.label}</p>
            <p className="text-sm">{field.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SectionInfoDisplay;