import { Select, SelectContent, SelectValue, SelectTrigger, SelectItem } from "@/components/ui/select";
import { REPORT_TYPE_LABELS } from "@/constants/reportTypes";
import type { CustomReportType } from "@/integrations/supabase/customReportTypesApi";

interface ReportTypeSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  customTypes?: CustomReportType[];
}

export default function ReportTypeSelector({
  value,
  onValueChange,
  placeholder = "Select report type",
  customTypes = [],
}: ReportTypeSelectorProps) {
  const builtIn = Object.entries(REPORT_TYPE_LABELS);
  const custom = customTypes.map((t) => [t.id, t.name] as [string, string]);
  const allTypes = [...builtIn, ...custom];

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