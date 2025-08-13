import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import type { InfoField } from "@/hooks/useSectionGuidance";

interface InfoFieldWidgetProps {
  field: InfoField | string;
  value: string;
  onChange: (value: string) => void;
}

export function InfoFieldWidget({ field, value, onChange }: InfoFieldWidgetProps) {
  // Handle legacy string fields
  if (typeof field === "string") {
    return (
      <div>
        <Label className="block text-sm font-medium">{field}</Label>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    );
  }

  // Handle structured fields
  const { name, label, sop_ref, widget, required = false, options = [] } = field;

  if (widget === "select" && options.length > 0) {
    // Determine what should be selected in the dropdown
    const isPredefinedOption = options.includes(value);
    const isCustomValue = value && !isPredefinedOption;
    
    // Track what's selected in the dropdown - separate from the stored value
    const [selectedOption, setSelectedOption] = useState(() => {
      if (isPredefinedOption) return value;
      if (isCustomValue) return "Other";
      return "";
    });
    
    // Show custom input when "Other" or "Multiple" is selected, or when there's a custom value
    const showCustomInput = selectedOption === "Other" || selectedOption === "Multiple" || isCustomValue;

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium">
            {label}
            {required && <span className="text-destructive">*</span>}
          </Label>
          {sop_ref && (
            <Badge variant="secondary" className="text-xs">
              {sop_ref}
            </Badge>
          )}
        </div>
        
        <Select
          value={selectedOption}
          onValueChange={(newValue) => {
            setSelectedOption(newValue);
            if (newValue === "Other" || newValue === "Multiple") {
              // Keep existing custom value if there is one, otherwise clear
              if (!isCustomValue) {
                onChange("");
              }
            } else {
              // User selected a predefined option
              onChange(newValue);
            }
          }}
        >
          <SelectTrigger className="bg-background">
            <SelectValue placeholder={isCustomValue ? `Custom: ${value}` : "Select an option..."} />
          </SelectTrigger>
          <SelectContent className="bg-background border z-50">
            {options.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {showCustomInput && (
          <div className="mt-2">
            <Label className="text-sm text-muted-foreground">
              Please specify:
            </Label>
            <Input
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Enter custom value..."
            />
          </div>
        )}
      </div>
    );
  }

  if (widget === "textarea") {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium">
            {label}
            {required && <span className="text-destructive">*</span>}
          </Label>
          {sop_ref && (
            <Badge variant="secondary" className="text-xs">
              {sop_ref}
            </Badge>
          )}
        </div>
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter any additional notes relevant to this section..."
          className="min-h-[100px]"
        />
      </div>
    );
  }

  // Default to text widget
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive">*</span>}
        </Label>
        {sop_ref && (
          <Badge variant="secondary" className="text-xs">
            {sop_ref}
          </Badge>
        )}
      </div>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}