export const FL_FOUR_POINT_QUESTIONS = {
  id: "fl_four_point_citizens",
  title: "Florida 4-Point (Citizens-style)",
  jurisdiction: "FL",
  use_case: "Underwriting for older homes",
  sections: [
    {
      name: "general",
      fields: [
        {
          name: "inspection_date",
          label: "Inspection Date",
          widget: "date",
          required: true
        },
        {
          name: "property_address",
          label: "Property Address",
          widget: "textarea",
          required: true
        },
        {
          name: "year_built",
          label: "Year Built",
          widget: "number",
          required: true
        }
      ]
    },
    {
      name: "roof",
      fields: [
        {
          name: "covering_type",
          label: "Covering Type",
          widget: "select",
          options: [
            "Asphalt Shingle",
            "Metal",
            "Tile",
            "Flat/BUR/Mod Bit",
            "Other"
          ],
          required: true
        },
        {
          name: "year_installed",
          label: "Year Installed",
          widget: "number",
          required: false
        },
        {
          name: "remaining_life_years",
          label: "Remaining Useful Life (yrs)",
          widget: "number",
          required: true
        },
        {
          name: "active_leaks",
          label: "Any Active Leaks?",
          widget: "radio",
          options: ["Yes", "No"],
          required: true
        }
      ]
    },
    {
      name: "electrical",
      fields: [
        {
          name: "service_amperage",
          label: "Main Service Amperage",
          widget: "number",
          required: true
        },
        {
          name: "panel_brand",
          label: "Panel Brand/Type",
          widget: "text",
          required: true
        },
        {
          name: "aluminum_branch_wiring",
          label: "Aluminum Branch Wiring Present",
          widget: "radio",
          options: ["Yes", "No", "Unknown"],
          required: true
        },
        {
          name: "knob_tube_present",
          label: "Knob & Tube Present",
          widget: "radio",
          options: ["Yes", "No", "Unknown"],
          required: true
        },
        {
          name: "hazards",
          label: "Observed Hazards/Deficiencies",
          widget: "textarea",
          required: false
        }
      ]
    },
    {
      name: "plumbing",
      fields: [
        {
          name: "supply_piping",
          label: "Supply Piping Material",
          widget: "select",
          options: [
            "COPPER",
            "CPVC",
            "PEX",
            "GALVANIZED",
            "POLYBUTYLENE",
            "OTHER"
          ],
          required: true
        },
        {
          name: "water_heater_year",
          label: "Water Heater Year",
          widget: "number",
          required: false
        },
        {
          name: "leaks_present",
          label: "Leaks Observed",
          widget: "radio",
          options: ["Yes", "No"],
          required: true
        }
      ]
    },
    {
      name: "hvac",
      fields: [
        {
          name: "primary_system_type",
          label: "Primary System Type",
          widget: "select",
          options: ["Central AC", "Heat Pump", "Mini-Split", "Other"],
          required: true
        },
        {
          name: "cooling_year",
          label: "Cooling Equipment Year",
          widget: "number",
          required: false
        },
        {
          name: "heating_present",
          label: "Heating Present",
          widget: "radio",
          options: ["Yes", "No"],
          required: true
        }
      ]
    },
    {
      name: "photos_signatures",
      fields: [
        {
          name: "photos",
          label: "Photo Uploads",
          widget: "upload",
          required: false
        },
        {
          name: "inspector_signature",
          label: "Signature",
          widget: "signature",
          required: true
        }
      ]
    }
  ]
};
