import { Select, SelectContent, SelectValue, SelectTrigger, SelectItem } from "@/components/ui/select";
import { REPORT_TYPE_LABELS } from "@/constants/reportTypes";
import type { Report } from "@/lib/reportSchemas";

interface ReportTypeSelectorProps {
  value: Report["reportType"];
  onValueChange: (value: Report["reportType"]) => void;
  placeholder?: string;
}

export default function ReportTypeSelector({
  value,
  onValueChange,
  placeholder = "Select report type"
}: ReportTypeSelectorProps) {
  const allTypes = Object.entries(REPORT_TYPE_LABELS);

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