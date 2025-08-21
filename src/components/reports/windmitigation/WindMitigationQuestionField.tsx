import React from "react";
import { Control, useWatch } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { WindMitigationData } from "@/lib/reportSchemas";

interface QuestionField {
  name: string;
  type: string;
  format?: string;
  visible_if?: any;
  label?: string;
}

interface WindMitigationQuestionFieldProps {
  field: QuestionField;
  control: Control<WindMitigationData>;
  questionId: string;
  optionCode?: string;
  coveringType?: string;
  watch: any;
}

export const WindMitigationQuestionField: React.FC<WindMitigationQuestionFieldProps> = ({
  field,
  control,
  questionId,
  optionCode,
  coveringType,
  watch,
}) => {
  const getFieldName = () => {
    if (coveringType) {
      return `${questionId}.coverings.${coveringType}.${field.name}`;
    }
    if (optionCode) {
      return `${questionId}.fields.${field.name}`;
    }
    return `${questionId}.${field.name}`;
  };

  const fieldName = getFieldName();

  // Check visibility conditions
  const shouldShow = () => {
    if (!field.visible_if) return true;
    
    if (field.visible_if.year_built_in) {
      const yearBuilt = watch(`${questionId}.fields.year_built`);
      return field.visible_if.year_built_in.includes(parseInt(yearBuilt));
    }
    
    return true;
  };

  if (!shouldShow()) return null;

  const renderField = () => {
    switch (field.type) {
      case "date":
        return (
          <FormField
            control={control}
            name={fieldName as any}
            render={({ field: formField }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-sm font-medium">
                  {field.label ?? field.name.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                </FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !formField.value && "text-muted-foreground"
                        )}
                      >
                        {formField.value ? (
                          format(new Date(formField.value), "MM/dd/yyyy")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formField.value ? new Date(formField.value) : undefined}
                      onSelect={(date) => formField.onChange(date?.toISOString().split('T')[0])}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case "year":
        return (
          <FormField
            control={control}
            name={fieldName as any}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  {field.label ?? field.name.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1900"
                    max={new Date().getFullYear()}
                    placeholder="YYYY"
                    {...formField}
                    onChange={(e) => formField.onChange(e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case "number":
        return (
          <FormField
            control={control}
            name={fieldName as any}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                    {field.label ?? field.name.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                  </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    {...formField}
                    onChange={(e) => formField.onChange(parseFloat(e.target.value) || "")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case "string":
        return field.name === "description" ? (
          <FormField
            control={control}
            name={fieldName as any}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  {field.name.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter description..."
                    {...formField}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : (
          <FormField
            control={control}
            name={fieldName as any}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  {field.name.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                </FormLabel>
                <FormControl>
                  <Input
                    {...formField}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case "boolean":
        return (
          <FormField
            control={control}
            name={fieldName as any}
            render={({ field: formField }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={formField.value}
                    onCheckedChange={formField.onChange}
                  />
                </FormControl>
                <FormLabel className="text-sm font-medium">
                    {field.label ?? field.name.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                  </FormLabel>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      default:
        return null;
    }
  };

  return <div className="mt-3">{renderField()}</div>;
};