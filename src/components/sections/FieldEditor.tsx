import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import type { CustomField } from "@/integrations/supabase/customFieldsApi";

interface FieldEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  field?: CustomField;
  sectionKey: string;
  onSave: (fieldData: {
    field_name: string;
    field_label: string;
    widget_type: CustomField["widget_type"];
    options?: string[];
    required?: boolean;
  }) => Promise<void>;
  isEditing?: boolean;
}

const WIDGET_TYPES = [
  { value: "text", label: "Text Input" },
  { value: "textarea", label: "Text Area" },
  { value: "select", label: "Single Select" },
  { value: "multiselect", label: "Multi Select" },
  
  { value: "date", label: "Date" },
  { value: "contact_lookup", label: "Contact Lookup" },
] as const;

export function FieldEditor({ open, onOpenChange, field, sectionKey, onSave, isEditing = false }: FieldEditorProps) {
  const [fieldName, setFieldName] = useState(field?.field_name || "");
  const [fieldLabel, setFieldLabel] = useState(field?.field_label || "");
  const [widgetType, setWidgetType] = useState<CustomField["widget_type"]>(field?.widget_type || "text");
  const [required, setRequired] = useState(field?.required || false);
  const [options, setOptions] = useState<string[]>(field?.options || []);
  const [newOption, setNewOption] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const needsOptions = widgetType === "select" || widgetType === "multiselect";

  const handleSave = async () => {
    if (!fieldName.trim() || !fieldLabel.trim()) return;

    setIsLoading(true);
    try {
      await onSave({
        field_name: fieldName.trim(),
        field_label: fieldLabel.trim(),
        widget_type: widgetType,
        options: needsOptions ? options : [],
        required,
      });
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error("Error saving field:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFieldName("");
    setFieldLabel("");
    setWidgetType("text");
    setRequired(false);
    setOptions([]);
    setNewOption("");
  };

  const addOption = () => {
    if (newOption.trim() && !options.includes(newOption.trim())) {
      setOptions([...options, newOption.trim()]);
      setNewOption("");
    }
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const generateFieldName = (label: string) => {
    return label
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "");
  };

  const handleLabelChange = (label: string) => {
    setFieldLabel(label);
    if (!isEditing) {
      setFieldName(generateFieldName(label));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Field" : "Add Custom Field"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="field-label">Field Label</Label>
            <Input
              id="field-label"
              value={fieldLabel}
              onChange={(e) => handleLabelChange(e.target.value)}
              placeholder="Enter field label"
            />
          </div>

          {!isEditing && (
            <div>
              <Label htmlFor="field-name">Field Name</Label>
              <Input
                id="field-name"
                value={fieldName}
                onChange={(e) => setFieldName(e.target.value)}
                placeholder="Automatically generated from label"
              />
            </div>
          )}

          <div>
            <Label htmlFor="widget-type">Field Type</Label>
            <Select value={widgetType} onValueChange={(value: CustomField["widget_type"]) => setWidgetType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {WIDGET_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {needsOptions && (
            <div>
              <Label>Options</Label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                    placeholder="Add option"
                    onKeyDown={(e) => e.key === "Enter" && addOption()}
                  />
                  <Button type="button" onClick={addOption} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {options.map((option, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {option}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeOption(index)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Switch
              id="required"
              checked={required}
              onCheckedChange={setRequired}
            />
            <Label htmlFor="required">Required field</Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!fieldName.trim() || !fieldLabel.trim() || isLoading}>
            {isLoading ? "Saving..." : isEditing ? "Update Field" : "Add Field"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}