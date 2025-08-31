import React from "react";
import {Button} from "@/components/ui/button";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Palette} from "lucide-react";
import {cn} from "@/lib/utils";

export const COLOR_SCHEMES = {
    coralAmber: {
        name: "Coral → Amber",
        primary: "12 82% 56%",
        secondary: "350 72% 46%",
        accent: "38 95% 55%",
        preview: "bg-rose-500",
    },
    indigoOrchid: {
        name: "Indigo → Orchid",
        primary: "238 75% 45%",
        secondary: "270 70% 42%",
        accent: "286 85% 60%",
        preview: "bg-indigo-600",
    },
    forestMint: {
        name: "Forest → Mint",
        primary: "145 65% 28%",
        secondary: "158 60% 24%",
        accent: "158 70% 52%",
        preview: "bg-emerald-700",
    },
    slateSky: {
        name: "Slate → Sky",
        primary: "215 25% 26%",
        secondary: "215 25% 18%",
        accent: "199 89% 48%",
        preview: "bg-slate-700",
    },
    royalAqua: {
        name: "Royal → Aqua",
        primary: "220 85% 45%",
        secondary: "195 85% 42%",
        accent: "187 92% 50%",
        preview: "bg-blue-600",
    },
    burgundyGold: {
        name: "Burgundy → Gold",
        primary: "347 70% 30%",
        secondary: "10 70% 28%",
        accent: "44 96% 52%",
        preview: "bg-rose-700",
    },
    emeraldLime: {
        name: "Emerald → Lime",
        primary: "152 60% 36%",
        secondary: "145 55% 28%",
        accent: "95 75% 54%",
        preview: "bg-green-600",
    },
    navyOrange: {
        name: "Navy → Orange",
        primary: "220 70% 22%",
        secondary: "220 70% 16%",
        accent: "26 95% 55%",
        preview: "bg-blue-900",
    },
    charcoalNeon: {
        name: "Charcoal → Neon Pink",
        primary: "210 10% 20%",
        secondary: "210 10% 14%",
        accent: "330 90% 60%",
        preview: "bg-neutral-800",
    },
    cocoaPeach: {
        name: "Cocoa → Peach",
        primary: "24 30% 32%",
        secondary: "16 35% 26%",
        accent: "18 90% 65%",
        preview: "bg-amber-700",
    },
} as const;


export interface CustomColors {
    primary?: string;
    secondary?: string;
    accent?: string;
    headingText?: string;
    bodyText?: string;
}

export type ColorScheme = keyof typeof COLOR_SCHEMES | "custom" | "default";

interface ColorSchemePickerProps {
    value: ColorScheme;
    onChange: (scheme: ColorScheme, customColors?: CustomColors) => void;
    disabled?: boolean;
    customColors?: CustomColors;
}

// Hard-split swatch: 50/50 diagonal with a sharp separator
const Swatch: React.FC<{
    primary?: string;
    secondary?: string;
    /** degrees; 135 gives bottom-left ↗ top-right like your sample */
    angle?: number;
    /** CSS color for the separator line (e.g., "black", "white", "hsl(...)" ) */
    separatorColor?: string;
    /** separator thickness in px (2 looks good at 16px swatch size) */
    separatorWidthPx?: number;
    className?: string;
}> = ({
          primary,
          secondary,
          angle = 135,
          separatorColor = "black",
          separatorWidthPx = 2,
          className,
      }) => {
    const p = primary ?? "210 100% 50%";
    const s = secondary ?? p;
    const half = `${separatorWidthPx / 2}px`;

    return (
        <span
            className={cn("inline-block w-5 h-5 rounded-full border", className)}
            style={{
                // two solid color regions with a thin separator band in the middle
                backgroundImage: `linear-gradient(${angle}deg,
          hsl(${p}) 0 calc(50% - ${half}),
          ${separatorColor} calc(50% - ${half}) calc(50% + ${half}),
          hsl(${s}) calc(50% + ${half}) 100%)`,
            }}
            aria-hidden
        />
    );
};


export function ColorSchemePicker({value, onChange, disabled, customColors}: ColorSchemePickerProps) {
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

    const currentScheme =
        value === "custom"
            ? {name: "Custom", preview: ""}
            : value === "default"
                ? {name: "Default", preview: "bg-background border"}
                : COLOR_SCHEMES[value];

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
                    <Palette className="h-4 w-4"/>
                    {value === "custom" ? (
                        <Swatch primary={custom.primary} secondary={custom.secondary}/>
                    ) : value === "default" ? (
                        <div className="w-4 h-4 rounded-full border bg-background"/>
                    ) : (
                        <Swatch
                            primary={COLOR_SCHEMES[value as keyof typeof COLOR_SCHEMES].primary}
                            secondary={COLOR_SCHEMES[value as keyof typeof COLOR_SCHEMES].accent}
                        />
                    )}

                    {currentScheme.name}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[420px] p-3" align="center">
                <div className="space-y-2">
                    <h4 className="font-medium text-sm">Color Scheme</h4>
                    <div className="grid grid-cols-2 gap-2">
                        <Button
                            variant={value === "default" ? "default" : "outline"}
                            size="sm"
                            className="justify-start gap-2 h-9"
                            onClick={() => {
                                onChange("default");
                                setOpen(false);
                                setShowCustom(false);
                            }}
                        >
                            <div className="w-4 h-4 rounded-full border bg-background"/>
                            Default
                        </Button>
                        {Object.entries(COLOR_SCHEMES).map(([key, scheme]) => (
                            <Button
                                key={key}
                                variant={value === key ? "default" : "outline"}
                                size="sm"
                                className="justify-start gap-2 h-9"
                                onClick={() => {
                                    onChange(key as ColorScheme);
                                    setOpen(false);
                                    setShowCustom(false);
                                }}
                            >
                                <Swatch primary={scheme.primary} secondary={scheme.secondary}/>
                                {scheme.name}
                            </Button>
                        ))}
                        <Button
                            variant={value === "custom" ? "default" : "outline"}
                            size="sm"
                            className="justify-start gap-2 h-9"
                            onClick={() => setShowCustom(!showCustom)}
                        >
                            <div className="w-4 h-4 rounded-full" style={{backgroundColor: `hsl(${custom.primary})`}}/>
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
                                        onChange={(e) => setCustom((prev) => ({
                                            ...prev,
                                            [key]: hexToHsl(e.target.value)
                                        }))}
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
