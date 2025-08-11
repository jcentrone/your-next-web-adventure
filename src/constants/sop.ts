export type SectionKey =
  | "roof"
  | "exterior"
  | "structure"
  | "heating"
  | "cooling"
  | "plumbing"
  | "electrical"
  | "fireplace"
  | "attic"
  | "interior";

export const SOP_SECTIONS: { key: SectionKey; name: string }[] = [
  { key: "roof", name: "Roof" },
  { key: "exterior", name: "Exterior" },
  { key: "structure", name: "Foundation / Structure" },
  { key: "heating", name: "Heating" },
  { key: "cooling", name: "Cooling" },
  { key: "plumbing", name: "Plumbing" },
  { key: "electrical", name: "Electrical" },
  { key: "fireplace", name: "Fireplace" },
  { key: "attic", name: "Attic & Ventilation" },
  { key: "interior", name: "Doors / Windows / Interior" },
];
