export const MANUFACTURED_HOME_QUESTIONS = {
  id: "manufactured_home_insurance_prep",
  title: "Manufactured/Mobile Home Insurance Inspection (Pre-Cert Checklist)",
  jurisdiction: "US (carrier/HUD-influenced)",
  use_case: "Underwriting for manufactured housing",
  sections: [
    {
      name: "home_identifiers",
      fields: [
        {
          name: "manufacturer",
          label: "Manufacturer",
          widget: "text",
          required: false,
        },
        {
          name: "model_year",
          label: "Model Year",
          widget: "number",
          required: false,
        },
        {
          name: "serial_vin",
          label: "HUD Label/Serial (if present)",
          widget: "text",
          required: false,
        },
      ],
    },
    {
      name: "foundation_tie_down",
      fields: [
        {
          name: "foundation_type",
          label: "Foundation Type",
          widget: "select",
          options: [
            "Pier & Anchor",
            "Permanent (engineered/retrofit)",
            "Slab",
            "Other",
          ],
          required: true,
        },
        {
          name: "tie_downs_present",
          label: "Tie-Downs Present & Tensioned",
          widget: "radio",
          options: ["Yes", "No", "Unknown"],
          required: true,
        },
        {
          name: "anchorage_corrosion",
          label: "Anchorage Corrosion/Damage",
          widget: "radio",
          options: ["None", "Minor", "Significant"],
          required: false,
        },
      ],
    },
    {
      name: "skirting_ventilation",
      fields: [
        {
          name: "skirting_type",
          label: "Skirting Type/Condition",
          widget: "text",
          required: false,
        },
        {
          name: "vents",
          label: "Crawlspace Ventilation Adequate",
          widget: "radio",
          options: ["Yes", "No", "Unknown"],
          required: false,
        },
        {
          name: "access_hatch",
          label: "Underfloor Access Present",
          widget: "radio",
          options: ["Yes", "No"],
          required: false,
        },
      ],
    },
    {
      name: "additions_utilities",
      fields: [
        {
          name: "additions_present",
          label: "Additions/Carports/Porches Attached",
          widget: "radio",
          options: ["Yes", "No"],
          required: true,
        },
        {
          name: "utilities_condition",
          label: "Utilities (Elec/Plumb/HVAC) Condition",
          widget: "select",
          options: ["Good", "Fair", "Poor"],
          required: false,
        },
      ],
    },
    {
      name: "photos_notes",
      fields: [
        {
          name: "photos",
          label: "Photo Uploads",
          widget: "upload",
          required: false,
        },
        {
          name: "notes",
          label: "Notes",
          widget: "textarea",
          required: false,
        },
        {
          name: "inspector_signature",
          label: "Signature",
          widget: "signature",
          required: true,
        },
      ],
    },
  ],
} as const;

export type ManufacturedHomeQuestions = typeof MANUFACTURED_HOME_QUESTIONS;
