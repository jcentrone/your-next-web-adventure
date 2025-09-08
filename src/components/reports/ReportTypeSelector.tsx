import { Select, SelectContent, SelectValue, SelectTrigger, SelectItem } from "@/components/ui/select";
import { REPORT_TYPE_LABELS } from "@/constants/reportTypes";
import { useReportTemplates } from "@/hooks/useReportTemplates";
import { useCustomReportTypes } from "@/hooks/useCustomReportTypes";
import type { Report } from "@/lib/reportSchemas";

interface ReportTypeSelectorProps {
  value: Report["reportType"];
  onValueChange: (value: Report["reportType"]) => void;
  placeholder?: string;
  includeCustomTypes?: boolean;
}

export default function ReportTypeSelector({ 
  value, 
  onValueChange, 
  placeholder = "Select report type",
  includeCustomTypes = false 
}: ReportTypeSelectorProps) {
  const { templates } = useReportTemplates();
  const { customTypes } = useCustomReportTypes();
  
  // Get all available types
  const standardTypes = Object.entries(REPORT_TYPE_LABELS);
  const customTypeEntries = includeCustomTypes 
    ? customTypes.map(type => [type.id, type.name])
    : [];

  const allTypes = [
    ...standardTypes,
    ...customTypeEntries
  ];

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {allTypes.map(([key, label]) => (
          <SelectItem key={key} value={key}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}