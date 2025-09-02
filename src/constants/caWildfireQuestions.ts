export const CA_WILDFIRE_QUESTIONS = {
  id: "ca_wildfire_defensible_space",
  title: "California Wildfire / Defensible Space Assessment",
  jurisdiction: "CA",
  use_case: "Carrier wildfire risk underwriting",
  sections: [
    {
      name: "structure_materials",
      fields: [
        {
          name: "roof_material",
          label: "Roof Material",
          widget: "select",
          options: [
            "Class A (e.g., composition/metal)",
            "Wood Shake/Shingle",
            "Tile",
            "Other"
          ],
          required: true,
        },
        {
          name: "vents_screened",
          label: "Vents Ember-Screened (≤1/8\")",
          widget: "radio",
          options: ["Yes", "No", "Partial"],
          required: true,
        },
        {
          name: "siding_type",
          label: "Siding Type",
          widget: "select",
          options: ["Stucco", "Fiber-Cement", "Wood", "Vinyl", "Masonry", "Other"],
          required: false,
        },
        {
          name: "eaves_enclosed",
          label: "Eaves Enclosed",
          widget: "radio",
          options: ["Yes", "No", "Partial"],
          required: false,
        },
      ],
    },
    {
      name: "zone_0_5_ft",
      fields: [
        {
          name: "combustibles_near_structure",
          label: "Combustibles within 0-5 ft of structure",
          widget: "radio",
          options: ["Yes", "No", "Partial"],
          required: true,
        },
        {
          name: "vegetation_managed",
          label: "Vegetation managed (cleared/mowed)",
          widget: "radio",
          options: ["Yes", "No", "Partial"],
          required: false,
        },
      ],
    },
    {
      name: "zone_5_30_ft",
      fields: [
        {
          name: "trees_overhanging",
          label: "Trees overhanging roof",
          widget: "radio",
          options: ["None", "Some", "Many"],
          required: false,
        },
        {
          name: "ladder_fuels",
          label: "Ladder Fuels Present",
          widget: "radio",
          options: ["Yes", "No", "Partial"],
          required: false,
        },
      ],
    },
    {
      name: "zone_30_100_ft",
      fields: [
        {
          name: "tree_spacing",
          label: "Tree Crown Spacing",
          widget: "select",
          options: ["<10 ft", "10-30 ft", ">30 ft"],
          required: false,
        },
        {
          name: "surface_fuel",
          label: "Surface Fuel Load",
          widget: "select",
          options: ["Light", "Moderate", "Heavy"],
          required: false,
        },
      ],
    },
    {
      name: "access_utilities",
      fields: [
        {
          name: "road_width",
          label: "Road Width ≥20 ft",
          widget: "radio",
          options: ["Yes", "No"],
          required: false,
        },
        {
          name: "address_visible",
          label: "Address Visible from Road",
          widget: "radio",
          options: ["Yes", "No"],
          required: false,
        },
        {
          name: "power_line_clearance",
          label: "Power Line Clearance",
          widget: "radio",
          options: ["Adequate", "Inadequate", "N/A"],
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

export type CaWildfireQuestions = typeof CA_WILDFIRE_QUESTIONS;

