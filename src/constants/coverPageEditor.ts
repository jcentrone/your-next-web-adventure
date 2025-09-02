export const TEMPLATES: Record<string, string> = {
  default: "#ffffff",
  blue: "#ebf8ff",
};

export const REPORT_TYPES = [
  { value: "home_inspection", label: "Home Inspection" },
  { value: "wind_mitigation", label: "Uniform Mitigation" },
];

export const FONTS = ["Arial", "Times New Roman", "Courier New", "Georgia", "Verdana"];

export const GRID_SIZE = 20;

export const PRESET_BG_COLORS = [
  "#ffffff",
  "#f3f4f6",
  "#000000",
  "#3b82f6",
  "#10b981",
  "#fbbf24",
  "#ef4444",
];

// Re-export ColorPalette for a single import site if you like:
export type { ColorPalette } from "./colorPalettes"; // optional
