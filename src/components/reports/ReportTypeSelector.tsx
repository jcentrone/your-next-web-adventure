import { Select, SelectContent, SelectValue, SelectTrigger, SelectItem } from "@/components/ui/select";
import { REPORT_TYPE_LABELS } from "@/constants/reportTypes";
import { useReportTemplates } from "@/hooks/useReportTemplates";
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
  
  // Get custom report types from templates
  const customTypes = includeCustomTypes 
    ? templates
        .map(t => t.report_type)
        .filter((type, index, arr) => arr.indexOf(type) === index) // Remove duplicates
        .filter(type => !REPORT_TYPE_LABELS[type]) // Only include types not in standard labels
    : [];

  const allTypes = [
    ...Object.entries(REPORT_TYPE_LABELS),
    ...customTypes.map(type => [type, type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())])
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