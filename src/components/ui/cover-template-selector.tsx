import React from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { COVER_TEMPLATES, CoverTemplateId } from "@/constants/coverTemplates";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface CoverTemplateSelectorProps {
  value: CoverTemplateId;
  onChange: (value: CoverTemplateId) => void;
  disabled?: boolean;
}

export function CoverTemplateSelector({
  value,
  onChange,
  disabled,
}: CoverTemplateSelectorProps) {
  const [open, setOpen] = React.useState(false);

  const selectedTemplate = COVER_TEMPLATES[value];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
          disabled={disabled}
        >
          {selectedTemplate.label}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[600px] p-5 max-h-[375px] overflow-auto" align="start">
        <div className="grid grid-cols-3  gap-4">
          {Object.entries(COVER_TEMPLATES).map(([key, template]) => {
            const TemplateComponent = template.component;
            const isSelected = value === key;

            return (
              <div
                key={key}
                className={cn(
                  "relative cursor-pointer rounded-lg border-2 p-2 transition-all hover:border-primary/50",
                  isSelected ? "border-primary bg-primary/5" : "border-border",
                )}
                onClick={() => {
                  onChange(key as CoverTemplateId);
                  setOpen(false);
                }}
              >
                {isSelected && (
                  <div className="absolute -top-2 -right-2 z-10 rounded-full bg-primary p-1">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </div>
                )}

                <div className="mb-2 text-xs font-medium text-center">
                  {template.label}
                </div>

                <div className="h-48 w-full overflow-hidden rounded border bg-white">
                  <div className="scale-[0.25] origin-top-left w-[400%] h-[400%]">
                    <TemplateComponent
                      reportTitle="Sample Report"
                      clientName="John Doe"
                      organizationName="Sample Inspection Co."
                      organizationAddress="123 Main St, City, ST 12345"
                      organizationPhone="(555) 123-4567"
                      organizationEmail="info@sample.com"
                      inspectorName="Jane Smith"
                      inspectorLicenseNumber="LIC123456"
                      clientAddress="456 Property Ave, City, ST 12345"
                      inspectionDate="2024-01-15"
                      weatherConditions="Clear, 72°F"
                      coverImage=""
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
