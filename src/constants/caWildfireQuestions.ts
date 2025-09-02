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
      name: "zone0_ember_resistant",
      fields: [
        {
          name: "zone0_clear",
          label: "Zone 0 Clear of Combustibles",
          widget: "radio",
          options: ["Yes", "No", "Partial"],
          required: true,
        },
        {
          name: "mulch_present",
          label: "Combustible Mulch Present",
          widget: "radio",
          options: ["Yes", "No"],
          required: false,
        },
      ],
    },
    {
      name: "zone1_and_2_defensible_space",
      fields: [
        {
          name: "zone1_5to30",
          label: "Zone 1 (5-30 ft) Vegetation Managed",
          widget: "radio",
          options: ["Yes", "No", "Partial"],
          required: false,
        },
        {
          name: "zone2_30to100",
          label: "Zone 2 (30-100 ft) Vegetation Managed",
          widget: "radio",
          options: ["Yes", "No", "Partial"],
          required: false,
        },
        {
          name: "trees_overhanging_roof",
          label: "Trees Overhanging Roof",
          widget: "radio",
          options: ["None", "Some", "Many"],
          required: false,
        },
      ],
    },
    {
      name: "access_and_water",
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
          name: "water_supply",
          label: "Water Supply",
          widget: "select",
          options: ["Hydrant", "Water Tank", "Pool/Pond", "None"],
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

