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
  const [customValue, setCustomValue] = useState("");
  
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
    const isOtherSelected = value && !options.includes(value) && value !== "Other";
    const displayValue = isOtherSelected ? "Other" : value;

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
          value={displayValue}
          onValueChange={(newValue) => {
            if (newValue === "Other") {
              onChange(customValue || "");
            } else {
              onChange(newValue);
              setCustomValue("");
            }
          }}
        >
          <SelectTrigger className="bg-background">
            <SelectValue placeholder="Select an option..." />
          </SelectTrigger>
          <SelectContent className="bg-background border z-50">
            {options.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {(displayValue === "Other" || isOtherSelected) && (
          <div className="mt-2">
            <Label className="text-sm text-muted-foreground">
              Please specify:
            </Label>
            <Input
              value={isOtherSelected ? value : customValue}
              onChange={(e) => {
                const newValue = e.target.value;
                if (displayValue === "Other") {
                  setCustomValue(newValue);
                  onChange(newValue);
                } else {
                  onChange(newValue);
                }
              }}
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