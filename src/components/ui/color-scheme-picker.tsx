import React from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Palette } from "lucide-react";
import { cn } from "@/lib/utils";

export const COLOR_SCHEMES = {
  blue: {
    name: "Blue",
    primary: "210 100% 50%",
    secondary: "210 100% 40%", 
    accent: "210 100% 60%",
    preview: "bg-blue-500"
  },
  green: {
    name: "Green", 
    primary: "142 76% 36%",
    secondary: "142 76% 26%",
    accent: "142 76% 46%",
    preview: "bg-green-600"
  },
  purple: {
    name: "Purple",
    primary: "262 83% 58%",
    secondary: "262 83% 48%", 
    accent: "262 83% 68%",
    preview: "bg-purple-500"
  },
  orange: {
    name: "Orange",
    primary: "25 95% 53%",
    secondary: "25 95% 43%",
    accent: "25 95% 63%", 
    preview: "bg-orange-500"
  },
  red: {
    name: "Red",
    primary: "0 84% 60%",
    secondary: "0 84% 50%",
    accent: "0 84% 70%",
    preview: "bg-red-500"
  },
  slate: {
    name: "Slate",
    primary: "215 28% 17%",
    secondary: "215 28% 12%",
    accent: "215 28% 22%",
    preview: "bg-slate-700"
  }
} as const;

export type ColorScheme = keyof typeof COLOR_SCHEMES;

interface ColorSchemePickerProps {
  value: ColorScheme;
  onChange: (scheme: ColorScheme) => void;
  disabled?: boolean;
}

export function ColorSchemePicker({ value, onChange, disabled }: ColorSchemePickerProps) {
  const [open, setOpen] = React.useState(false);
  
  const currentScheme = COLOR_SCHEMES[value];

  React.useEffect(() => {
    // Remove global CSS variable setting - we'll pass colors as props instead
  }, [value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-[200px] justify-start gap-2" disabled={disabled}>
          <Palette className="h-4 w-4" />
          <div className={cn("w-4 h-4 rounded-full", currentScheme.preview)} />
          {currentScheme.name}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-3" align="start">
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Color Scheme</h4>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(COLOR_SCHEMES).map(([key, scheme]) => (
              <Button
                key={key}
                variant={value === key ? "default" : "outline"}
                size="sm"
                className="justify-start gap-2 h-9"
                onClick={() => {
                  onChange(key as ColorScheme);
                  setOpen(false);
                }}
              >
                <div className={cn("w-4 h-4 rounded-full", scheme.preview)} />
                {scheme.name}
              </Button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}