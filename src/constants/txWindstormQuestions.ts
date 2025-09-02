export const TX_WINDSTORM_QUESTIONS = {
  id: "tx_coastal_windstorm_mitigation",
  title: "Texas Coastal Windstorm Mitigation (TWIA eligibility checklist)",
  jurisdiction: "TX (coastal counties)",
  use_case: "Carrier/TWIA windstorm eligibility documentation",
  sections: [
    {
      name: "property",
      fields: [
        { name: "county", label: "County", widget: "text", required: true },
        {
          name: "design_exposure",
          label: "Design Exposure Category (if known)",
          widget: "select",
          options: ["B", "C", "D", "Unknown"],
          required: false,
        },
      ],
    },
    {
      name: "roof_covering_deck",
      fields: [
        {
          name: "covering_type",
          label: "Covering Type",
          widget: "select",
          options: ["Shingle", "Metal", "Tile", "BUR/Mod Bit", "Other"],
          required: true,
        },
        {
          name: "fastening",
          label: "Deck Fastening (type/spacing)",
          widget: "text",
          required: true,
        },
        {
          name: "edge_metal",
          label: "Drip Edge / Edge Metal Present",
          widget: "radio",
          options: ["Yes", "No", "Unknown"],
          required: true,
        },
      ],
    },
    {
      name: "roof_to_wall",
      fields: [
        {
          name: "connection",
          label: "Roof-to-Wall Connection",
          widget: "select",
          options: ["Toe-Nails", "Clips", "Straps (single/double)", "Bolted Plate", "Unknown"],
          required: true,
        },
      ],
    },
    {
      name: "opening_protection",
      fields: [
        {
          name: "rated_openings",
          label: "Rated Opening Protection (impact/pressure)",
          widget: "radio",
          options: ["All openings rated", "Some openings rated", "None/Unknown"],
          required: true,
        },
        {
          name: "garage_door_reinforced",
          label: "Garage Door Wind-Load Rated",
          widget: "radio",
          options: ["Yes", "No", "Unknown"],
          required: true,
        },
      ],
    },
    {
      name: "ancillary",
      fields: [
        {
          name: "swr",
          label: "Secondary Water Barrier",
          widget: "radio",
          options: ["Yes", "No", "Unknown"],
          required: false,
        },
        {
          name: "soffit_secure",
          label: "Soffits Secure/Backed",
          widget: "radio",
          options: ["Yes", "No", "Unknown"],
          required: false,
        },
      ],
    },
    {
      name: "photos",
      fields: [
        { name: "photos", label: "Photo Uploads", widget: "upload", required: false },
      ],
    },
  ],
} as const;

export type TxWindstormQuestions = typeof TX_WINDSTORM_QUESTIONS;
