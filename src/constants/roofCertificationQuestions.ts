export const ROOF_CERTIFICATION_QUESTIONS = {
  id: "roof_certification_nationwide",
  title: "Roof Certification",
  jurisdiction: "US",
  use_case: "Insurance roof condition certification",
  sections: [
    {
      name: "general",
      fields: [
        {
          name: "roof_type",
          label: "Roof Type",
          widget: "select",
          options: ["Gable", "Hip", "Flat", "Other"],
          required: true,
        },
        {
          name: "covering_material",
          label: "Covering Material",
          widget: "select",
          options: ["Asphalt Shingle", "Metal", "Tile", "Modified Bitumen", "Other"],
          required: true,
        },
        {
          name: "year_installed",
          label: "Year Installed",
          widget: "number",
          required: false,
        },
        {
          name: "remaining_life_years",
          label: "Estimated Remaining Life (yrs)",
          widget: "number",
          required: false,
        },
        {
          name: "leaks_observed",
          label: "Any Leaks Observed?",
          widget: "radio",
          options: ["Yes", "No"],
          required: true,
        },
      ],
    },
    {
      name: "photos",
      fields: [
        {
          name: "photos",
          label: "Roof Photos",
          widget: "upload",
          required: false,
        },
      ],
    },
  ],
};
