import { SectionKey } from "@/constants/sop";

export const SOP_GUIDANCE: Record<SectionKey, string[]> = {
  roof: [
    "Inspect roof-covering materials (shingles, tiles, metal, membrane)",
    "Observe flashing, penetrations, and sealant conditions",
    "Inspect gutters, downspouts, and roof drainage",
    "Report methods used to inspect (roof walk/visual from ground)"
  ],
  exterior: [
    "Inspect siding, trim, and exterior wall coverings",
    "Observe soffits, fascia, and eaves",
    "Inspect walkways, driveways, steps, porches, and decks",
    "Examine grading and drainage near the foundation"
  ],
  structure: [
    "Describe foundation type and materials",
    "Observe visible structural components for movement or distress",
    "Report signs of moisture intrusion and wood-destroying organisms"
  ],
  heating: [
    "Operate heating system using normal controls",
    "Report the energy source and heating method",
    "Inspect visible components, venting, and combustion air"
  ],
  cooling: [
    "Operate cooling system using normal controls (weather permitting)",
    "Inspect condenser, evaporator (if accessible), condensate handling",
    "Report system type and observed conditions"
  ],
  plumbing: [
    "Describe water supply and distribution piping materials",
    "Inspect fixtures, faucets, drains, and visible leaks",
    "Inspect water heater, TPR valve, and venting"
  ],
  electrical: [
    "Inspect service drop and service equipment",
    "Inspect main disconnects, panels, and overcurrent devices",
    "Test a representative number of outlets, switches, and GFCI/AFCI (if present)"
  ],
  fireplace: [
    "Inspect readily accessible fireplaces, dampers, and hearths",
    "Observe clearances and evidence of improper operation"
  ],
  attic: [
    "Inspect attic insulation levels and distribution",
    "Observe ventilation (intake and exhaust)",
    "Inspect visible framing and moisture staining"
  ],
  interior: [
    "Inspect a representative number of doors and windows",
    "Observe walls, ceilings, floors for damage or moisture",
    "Test stairs/railings; report safety hazards (egress/guards)"
  ],
  finalize: [],
};
