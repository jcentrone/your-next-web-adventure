import { CalendarIcon, ChevronDownIcon } from "lucide-react";
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear, subYears } from "date-fns";
import { DateRange, DayFlag, SelectionState, UI } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
interface DateRangePickerProps {
  value?: DateRange;
  onChange: (range: DateRange | undefined) => void;
}
const datePresets = [{
  label: "Today",
  value: "today"
}, {
  label: "This Week",
  value: "thisWeek"
}, {
  label: "This Month",
  value: "thisMonth"
}, {
  label: "This Quarter",
  value: "thisQuarter"
}, {
  label: "This Year",
  value: "thisYear"
}, {
  label: "Last Year",
  value: "lastYear"
}, {
  label: "All Time",
  value: "all"
}];
const getDateRangeFromPreset = (preset: string): DateRange | undefined => {
  const now = new Date();
  switch (preset) {
    case "today":
      return {
        from: startOfDay(now),
        to: endOfDay(now)
      };
    case "thisWeek":
      return {
        from: startOfWeek(now),
        to: endOfWeek(now)
      };
    case "thisMonth":
      return {
        from: startOfMonth(now),
        to: endOfMonth(now)
      };
    case "thisQuarter":
      return {
        from: startOfQuarter(now),
        to: endOfQuarter(now)
      };
    case "thisYear":
      return {
        from: startOfYear(now),
        to: endOfYear(now)
      };
    case "lastYear":
      const lastYear = subYears(now, 1);
      return {
        from: startOfYear(lastYear),
        to: endOfYear(lastYear)
      };
    case "all":
      return undefined;
    default:
      return undefined;
  }
};
export function DateRangePicker({
  value,
  onChange
}: DateRangePickerProps) {
  const handlePresetChange = (preset: string) => {
    const range = getDateRangeFromPreset(preset);
    onChange(range);
  };
  return <div className="space-y-3">
            <Label className="text-sm font-medium">Date Range</Label>
            
            <div className="flex gap-2">
                <Select onValueChange={handlePresetChange}>
                    <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Quick select" />
                    </SelectTrigger>
                    <SelectContent>
                        {datePresets.map(preset => <SelectItem key={preset.value} value={preset.value}>
                                {preset.label}
                            </SelectItem>)}
                    </SelectContent>
                </Select>
                <Popover>
                    <PopoverTrigger asChild>
                        
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <div className="p-3 border-b">
                        <div className="text-sm font-medium">Select Date Range</div>
                        <div className="text-xs text-muted-foreground mt-1">
                            Choose start and end dates for your analytics period
                        </div>
                    </div>
                    <Calendar initialFocus mode="range" defaultMonth={value?.from} selected={value} onSelect={onChange} numberOfMonths={2} className="pointer-events-auto" />
                </PopoverContent>
                </Popover>
            </div>
        </div>;
}
export default DateRangePicker;