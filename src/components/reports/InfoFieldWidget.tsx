import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    // Determine if current value is a predefined option or custom
    const isPredefinedOption = options.includes(value);
    const isCustomValue = value && !isPredefinedOption;
    
    // For select display: show actual value if predefined, otherwise show "Other"/"Multiple"
    const selectValue = isPredefinedOption ? value : "";
    
    // Show custom input when "Other"/"Multiple" is selected or when there's a custom value
    const showCustomInput = isCustomValue || selectValue === "Other" || selectValue === "Multiple";

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
          value={selectValue}
          onValueChange={(newValue) => {
            if (newValue === "Other" || newValue === "Multiple") {
              // Don't change the report value yet - wait for user to type
              // Keep existing custom value if there is one
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