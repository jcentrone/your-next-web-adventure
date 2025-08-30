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

export interface CustomColors {
  primary: string;
  secondary: string;
  accent: string;
  headingText: string;
  bodyText: string;
}

export type ColorScheme = keyof typeof COLOR_SCHEMES | "custom";

interface ColorSchemePickerProps {
  value: ColorScheme;
  onChange: (scheme: ColorScheme, customColors?: CustomColors) => void;
  disabled?: boolean;
  customColors?: CustomColors;
}

export function ColorSchemePicker({ value, onChange, disabled, customColors }: ColorSchemePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [showCustom, setShowCustom] = React.useState(false);
  const [custom, setCustom] = React.useState<CustomColors>(
    customColors || {
      primary: "210 100% 50%",
      secondary: "210 100% 40%",
      accent: "210 100% 60%",
      headingText: "222 47% 11%",
      bodyText: "222 47% 11%",
    }
  );

  React.useEffect(() => {
    if (customColors) setCustom(customColors);
  }, [customColors]);

  const currentScheme = value === "custom" ? { name: "Custom", preview: "" } : COLOR_SCHEMES[value];

  const hslToHex = (hsl: string) => {
    const [h, s, l] = hsl.split(" ").map((v) => parseFloat(v));
    const sDec = s / 100;
    const lDec = l / 100;
    const c = (1 - Math.abs(2 * lDec - 1)) * sDec;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = lDec - c / 2;
    let r = 0,
      g = 0,
      b = 0;
    if (h < 60) {
      r = c;
      g = x;
    } else if (h < 120) {
      r = x;
      g = c;
    } else if (h < 180) {
      g = c;
      b = x;
    } else if (h < 240) {
      g = x;
      b = c;
    } else if (h < 300) {
      r = x;
      b = c;
    } else {
      r = c;
      b = x;
    }
    const toHex = (n: number) => Math.round((n + m) * 255).toString(16).padStart(2, "0");
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  const hexToHsl = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0,
      s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h *= 60;
    }
    return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  };

  const handleApplyCustom = () => {
    onChange("custom", custom);
    setOpen(false);
    setShowCustom(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-[200px] justify-start gap-2" disabled={disabled}>
          <Palette className="h-4 w-4" />
          <div
            className={cn("w-4 h-4 rounded-full", value === "custom" ? "" : currentScheme.preview)}
            style={value === "custom" ? { backgroundColor: `hsl(${custom.primary})` } : undefined}
          />
          {currentScheme.name}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-3" align="start">
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
            <Button
              variant={value === "custom" ? "default" : "outline"}
              size="sm"
              className="justify-start gap-2 h-9"
              onClick={() => setShowCustom(!showCustom)}
            >
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: `hsl(${custom.primary})` }} />
              Custom
            </Button>
          </div>
          {showCustom && (
            <div className="mt-4 space-y-3">
              {(["primary", "secondary", "accent", "headingText", "bodyText"] as const).map((key) => (
                <div key={key} className="flex items-center justify-between gap-2">
                  <label className="text-xs capitalize w-20">
                    {key === "headingText" ? "Headings" : key === "bodyText" ? "Body" : key}
                  </label>
                  <input
                    type="color"
                    value={hslToHex(custom[key])}
                    onChange={(e) => setCustom((prev) => ({ ...prev, [key]: hexToHsl(e.target.value) }))}
                  />
                </div>
              ))}
              <Button size="sm" onClick={handleApplyCustom} className="w-full">
                Apply
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}