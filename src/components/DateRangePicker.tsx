import {CalendarIcon} from "lucide-react";
import {format} from "date-fns";
import {DateRange, DayFlag, SelectionState, UI} from "react-day-picker";
import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {Calendar} from "@/components/ui/calendar";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Label} from "@/components/ui/label";

interface DateRangePickerProps {
    value?: DateRange;
    onChange: (range: DateRange | undefined) => void;
}

export function DateRangePicker({value, onChange}: DateRangePickerProps) {
    return (
        <div className="space-y-2">
            <Label className="text-sm font-medium">Date Range</Label>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant="outline"
                        className={cn(
                            "w-[300px] justify-start text-left font-normal h-10",
                            !value && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4"/>
                        <div className="flex items-center gap-2 flex-1">
                            {value?.from ? (
                                <>
                                    <span className="text-xs text-muted-foreground">From:</span>
                                    <span>{format(value.from, "MMM dd, yyyy")}</span>
                                    {value.to && (
                                        <>
                                            <span className="text-xs text-muted-foreground">To:</span>
                                            <span>{format(value.to, "MMM dd, yyyy")}</span>
                                        </>
                                    )}
                                </>
                            ) : (
                                <span>Select date range</span>
                            )}
                        </div>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <div className="p-3 border-b">
                        <div className="text-sm font-medium">Select Date Range</div>
                        <div className="text-xs text-muted-foreground mt-1">
                            Choose start and end dates for your analytics period
                        </div>
                    </div>
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={value?.from}
                        selected={value}
                        onSelect={onChange}
                        numberOfMonths={2}
                        className="pointer-events-auto"
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
}

export default DateRangePicker;
