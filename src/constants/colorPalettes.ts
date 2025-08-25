export interface ColorPalette {
  id: string;
  name: string;
  colors: string[];
}

export const COLOR_PALETTES: ColorPalette[] = [
  {
    id: "classic-blue",
    name: "Classic Blue",
    colors: ["#1e3a8a", "#3b82f6", "#fcd34d", "#1f2937"],
  },
  {
    id: "sunset",
    name: "Sunset",
    colors: ["#f97316", "#fb923c", "#f43f5e", "#1c1917"],
  },
  {
    id: "forest",
    name: "Forest",
    colors: ["#166534", "#22c55e", "#d9f99d", "#1f2937"],
  },
  {
    id: "monochrome",
    name: "Monochrome",
    colors: ["#0f172a", "#334155", "#64748b", "#f1f5f9"],
  },
  {
    id: "lavender",
    name: "Lavender",
    colors: ["#7c3aed", "#c4b5fd", "#f9a8d4", "#1f2937"],
  },
  {
    id: "ruby",
    name: "Ruby",
    colors: ["#be123c", "#fda4af", "#f87171", "#fafafa"],
  },
];
