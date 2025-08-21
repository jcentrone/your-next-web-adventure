export const WIND_MITIGATION_QUESTIONS = {
  "form_name": "Uniform Mitigation Verification Inspection",
  "version": "OIR-B1-1802 (Rev. 01/12)",
  "questions": [
    {
      "id": "1_building_code",
      "prompt": "Was the structure built in compliance with the Florida Building Code (FBC 2001 or later) OR, for HVHZ homes, the South Florida Building Code (SFBC-94)?",
      "options": [
        {
          "code": "A",
          "label": "Built in compliance with the FBC",
          "fields": [
            { "name": "year_built", "type": "year" },
            {
              "name": "building_permit_application_date",
              "type": "date",
              "format": "MM/DD/YYYY",
              "visible_if": { "year_built_in": [2002, 2003] }
            }
          ]
        },
        {
          "code": "B",
          "label": "(HVHZ only) Built in compliance with the SFBC-94",
          "fields": [
            { "name": "year_built", "type": "year" },
            {
              "name": "building_permit_application_date",
              "type": "date",
              "format": "MM/DD/YYYY",
              "visible_if": { "year_built_in": [1994, 1995, 1996] }
            }
          ]
        },
        { "code": "C", "label": "Unknown or does not meet A or B" }
      ]
    },
    {
      "id": "2_roof_covering",
      "prompt": "Select all roof covering types in use and provide one of the listed compliance data points for each.",
      "coverings": [
        {
          "type": "asphalt_fiberglass_shingle",
          "label": "Asphalt/Fiberglass Shingle",
          "fields": [
            { "name": "permit_application_date", "type": "date", "format": "MM/DD/YYYY" },
            { "name": "fbc_or_mdc_product_approval_number", "type": "string" },
            { "name": "year_of_original_install_or_replacement", "type": "year" },
            { "name": "no_information_provided_for_compliance", "type": "boolean" }
          ]
        },
        {
          "type": "concrete_clay_tile",
          "label": "Concrete/Clay Tile",
          "fields": [
            { "name": "permit_application_date", "type": "date", "format": "MM/DD/YYYY" },
            { "name": "fbc_or_mdc_product_approval_number", "type": "string" },
            { "name": "year_of_original_install_or_replacement", "type": "year" },
            { "name": "no_information_provided_for_compliance", "type": "boolean" }
          ]
        },
        {
          "type": "metal",
          "label": "Metal",
          "fields": [
            { "name": "permit_application_date", "type": "date", "format": "MM/DD/YYYY" },
            { "name": "fbc_or_mdc_product_approval_number", "type": "string" },
            { "name": "year_of_original_install_or_replacement", "type": "year" },
            { "name": "no_information_provided_for_compliance", "type": "boolean" }
          ]
        },
        {
          "type": "built_up",
          "label": "Built Up",
          "fields": [
            { "name": "permit_application_date", "type": "date", "format": "MM/DD/YYYY" },
            { "name": "fbc_or_mdc_product_approval_number", "type": "string" },
            { "name": "year_of_original_install_or_replacement", "type": "year" },
            { "name": "no_information_provided_for_compliance", "type": "boolean" }
          ]
        },
        {
          "type": "membrane",
          "label": "Membrane",
          "fields": [
            { "name": "permit_application_date", "type": "date", "format": "MM/DD/YYYY" },
            { "name": "fbc_or_mdc_product_approval_number", "type": "string" },
            { "name": "year_of_original_install_or_replacement", "type": "year" },
            { "name": "no_information_provided_for_compliance", "type": "boolean" }
          ]
        },
        {
          "type": "other",
          "label": "Other",
          "fields": [
            { "name": "description", "type": "string" },
            { "name": "permit_application_date", "type": "date", "format": "MM/DD/YYYY" },
            { "name": "fbc_or_mdc_product_approval_number", "type": "string" },
            { "name": "year_of_original_install_or_replacement", "type": "year" },
            { "name": "no_information_provided_for_compliance", "type": "boolean" }
          ]
        }
      ],
      "overall_compliance": {
        "options": [
          {
            "code": "A",
            "label": "All coverings meet FBC via Product Approval current at install OR permit date ≥ 03/01/2002 OR original roof built ≥ 2004"
          },
          {
            "code": "B",
            "label": "All coverings have Miami-Dade Product Approval OR (HVHZ) permit between 09/01/1994 and 02/28/2002 OR original roof built ≥ 1997"
          },
          { "code": "C", "label": "One or more coverings do not meet A or B" },
          { "code": "D", "label": "No coverings meet A or B" }
        ]
      }
    },
    {
      "id": "3_roof_deck_attachment",
      "prompt": "What is the weakest form of roof deck attachment?",
      "options": [
        {
          "code": "A",
          "label": "Staples or 6d nails @ 6\" edge/12\" field (≤24\" o.c.); batten decking; or equivalent mean uplift < B/C"
        },
        {
          "code": "B",
          "label": "≥7/16\" Plywood/OSB with 8d common nails @ ≤12\" field (≤24\" o.c.) or equivalent ≥ this; mean uplift ≥103 psf"
        },
        {
          "code": "C",
          "label": "≥7/16\" Plywood/OSB with 8d common nails @ ≤6\" field (≤24\" o.c.) OR dimensional lumber/T&G (min 2 nails/board or 1 if ≤6\" width); or equivalent ≥ this; mean uplift ≥182 psf"
        },
        { "code": "D", "label": "Reinforced Concrete Roof Deck" },
        { "code": "E", "label": "Other", "fields": [{ "name": "description", "type": "string" }] },
        { "code": "F", "label": "Unknown or unidentified" },
        { "code": "G", "label": "No attic access" }
      ]
    },
    {
      "id": "4_roof_to_wall_attachment",
      "prompt": "Roof to Wall Attachment: What is the WEAKEST roof to wall connection? (Do not include attachment of hip/valley jacks within 5 feet of the inside or outside corner of the roof in determination of WEAKEST type)",
      "minimal_conditions_for_B_C_D": "Minimal conditions to qualify for categories B, C, or D. All visible metal connectors are: Secured to truss/rafter with a minimum of three (3) nails, and Attached to the wall top plate of the wall framing, or embedded in the bond beam, with less than a ½\" gap from the blocking or truss/rafter and blocked no more than 1.5\" of the truss/rafter, and free of visible severe corrosion.",
      "fields": [
        {
          "name": "roof_wall_min_1",
          "type": "boolean",
          "label": "Secured to truss/rafter with a minimum of three (3) nails"
        },
        {
          "name": "roof_wall_min_2",
          "type": "boolean",
          "label": "Attached to the wall top plate of the wall framing, or embedded in the bond beam, with less than a 1/2\" gap from the blocking or truss/rafter and blocked no more than 1.5\" of the truss/rafter"
        },
        {
          "name": "roof_wall_min_3",
          "type": "boolean",
          "label": "Free of visible severe corrosion"
        }
      ],
      "options": [
        {
          "code": "A",
          "label": "Toe Nails - Truss/rafter anchored to top plate of wall using nails driven at an angle through the truss/rafter and attached to the top plate of the wall, or Metal connectors that do not meet the minimal conditions or requirements of B, C, or D",
          "fields": [
            {
              "name": "roof_wall_a_1",
              "type": "boolean",
              "label": "Truss/rafter anchored to top plate of wall using nails driven at an angle through the truss/rafter and attached to the top plate of the wall"
            },
            {
              "name": "roof_wall_a_2",
              "type": "boolean",
              "label": "Metal connectors that do not meet the minimal conditions or requirements of B, C, or D"
            }
          ]
        },
        {
          "code": "B",
          "label": "Clips - Metal connectors that do not wrap over the top of the truss/rafter, or Metal connectors with a minimum of 1 strap that wraps over the top of the truss/rafter and does not meet the nail position requirements of C or D, but is secured with a minimum of 3 nails.",
          "fields": [
            {
              "name": "roof_wall_b_1",
              "type": "boolean",
              "label": "Metal connectors that do not wrap over the top of the truss/rafter"
            },
            {
              "name": "roof_wall_b_2",
              "type": "boolean",
              "label": "Metal connectors with a minimum of 1 strap that wraps over the top of the truss/rafter and does not meet the nail position requirements of C or D, but is secured with a minimum of 3 nails"
            }
          ]
        },
        {
          "code": "C",
          "label": "Single Wraps - Metal connectors consisting of a single strap that wraps over the top of the truss/rafter and is secured with a minimum of 2 nails on the front side and a minimum of 1 nail on the opposing side."
        },
        {
          "code": "D",
          "label": "Double Wraps - Metal Connectors consisting of 2 separate straps that are attached to the wall frame, or embedded in the bond beam, on either side of the truss/rafter where each strap wraps over the top of the truss/rafter and is secured with a minimum of 2 nails on the front side, and a minimum of 1 nail on the opposing side, or Metal connectors consisting of a single strap that wraps over the top of the truss/rafter, is secured to the wall on both sides, and is secured to the top plate with a minimum of three nails on each side.",
          "fields": [
            {
              "name": "roof_wall_d_1",
              "type": "boolean",
              "label": "Metal connectors consisting of 2 separate straps that are attached to the wall frame, or embedded in the bond beam, on either side of the truss/rafter where each strap wraps over the top of the truss/rafter and is secured with a minimum of 2 nails on the front side, and a minimum of 1 nail on the opposing side"
            },
            {
              "name": "roof_wall_d_2",
              "type": "boolean",
              "label": "Metal connectors consisting of a single strap that wraps over the top of the truss/rafter, is secured to the wall on both sides, and is secured to the top plate with a minimum of three nails on each side"
            }
          ]
        },
        { "code": "E", "label": "Structural - Anchor bolts structurally connected or reinforced concrete roof." },
        { "code": "F", "label": "Other", "fields": [{ "name": "description", "type": "string" }] },
        { "code": "G", "label": "Unknown or unidentified" },
        { "code": "H", "label": "No attic access" }
      ]
    },
    {
      "id": "5_roof_geometry",
      "prompt": "What is the roof shape?",
      "options": [
        {
          "code": "A",
          "label": "Hip roof with no other roof shapes >10% of total roof system perimeter",
          "fields": [
            { "name": "non_hip_feature_total_length_ft", "type": "number" },
            { "name": "total_roof_system_perimeter_ft", "type": "number" }
          ]
        },
        {
          "code": "B",
          "label": "Flat roof on a building with ≥5 units where ≥90% of main roof area has slope < 2:12",
          "fields": [
            { "name": "area_lt_2to12_sqft", "type": "number" },
            { "name": "total_roof_area_sqft", "type": "number" }
          ]
        },
        { "code": "C", "label": "Other roof (does not qualify as A or B)" }
      ]
    },
    {
      "id": "6_secondary_water_resistance",
      "prompt": "Secondary Water Resistance (SWR)",
      "options": [
        {
          "code": "A",
          "label": "SWR (sealed roof deck): self-adhering mod-bit underlayment to sheathing or foam adhesive SWR barrier (not foamed insulation)"
        },
        { "code": "B", "label": "No SWR" },
        { "code": "C", "label": "Unknown or undetermined" }
      ]
    },
    {
      "id": "7_opening_protection",
      "prompt": "What is the weakest form of wind-borne debris protection installed on the structure?",
      "opening_types": [
        { "key": "windows_or_entry_doors_glazed", "label": "Windows or Entry Doors (Glazed)" },
        { "key": "garage_doors_glazed", "label": "Garage Doors (Glazed)" },
        { "key": "skylights_glazed", "label": "Skylights (Glazed)" },
        { "key": "glass_block_glazed", "label": "Glass Block (Glazed)" },
        { "key": "entry_doors_non_glazed", "label": "Entry Doors (Non-Glazed)" },
        { "key": "garage_doors_non_glazed", "label": "Garage Doors (Non-Glazed)" }
      ],
      "protection_levels": [
        { "code": "N/A", "label": "Not applicable — no openings of this type" },
        { "code": "A", "label": "Verified cyclic pressure & large missile (9 lb windows/doors; 4.5 lb skylights)" },
        { "code": "B", "label": "Verified cyclic pressure & large missile (4–8 lb windows/doors; 2 lb skylights)" },
        { "code": "C", "label": "Verified plywood/OSB meeting FBC 2007 Table 1609.1.2" },
        {
          "code": "D",
          "label": "Verified non-glazed entry/garage doors compliant with ASTM E330, ANSI/DASMA 108, or PA/TAS 202"
        },
        { "code": "N", "label": "Appears to be A/B but unverified, or other coverings not identifiable as A/B/C" },
        { "code": "X", "label": "No wind-borne debris protection" }
      ],
      "glazed_overall_classification": {
        "options": [
          {
            "code": "A",
            "label": "All glazed openings meet Level A",
            "standards": [
              "Miami-Dade PA 201/202/203",
              "FBC TAS 201/202/203",
              "ASTM E1886 & ASTM E1996",
              "SSTD 12",
              "Skylights: ASTM E1886 & E1996",
              "Garage Doors: ANSI/DASMA 115"
            ],
            "non_glazed_subclasses": [
              { "code": "A.1", "label": "All non-glazed openings Level A, or none exist" },
              { "code": "A.2", "label": "≥1 non-glazed Level D; none are B/C/N/X" },
              { "code": "A.3", "label": "≥1 non-glazed Level B, C, N, or X" }
            ]
          },
          {
            "code": "B",
            "label": "All glazed openings meet Level B",
            "standards": [
              "ASTM E1886 & E1996 (Large Missile 4.5 lb)",
              "SSTD 12 (Large Missile 4–8 lb)",
              "Skylights: ASTM E1886 & E1996 (2–4.5 lb)"
            ],
            "non_glazed_subclasses": [
              { "code": "B.1", "label": "All non-glazed A or B, or none exist" },
              { "code": "B.2", "label": "≥1 non-glazed Level D; none are C/N/X" },
              { "code": "B.3", "label": "≥1 non-glazed Level C, N, or X" }
            ]
          },
          {
            "code": "C",
            "label": "All glazed openings Level C (plywood/OSB per FBC 2007 Table 1609.1.2)",
            "non_glazed_subclasses": [
              { "code": "C.1", "label": "All non-glazed A/B/C, or none exist" },
              { "code": "C.2", "label": "≥1 non-glazed Level D; none are N/X" },
              { "code": "C.3", "label": "≥1 non-glazed Level N or X" }
            ]
          },
          {
            "code": "N",
            "label": "Glazed openings protected by unverified systems not meeting A/B, or appear A/B without documentation",
            "non_glazed_subclasses": [
              { "code": "N.1", "label": "All non-glazed A/B/C/N, or none exist" },
              { "code": "N.2", "label": "≥1 non-glazed Level D; none are X" },
              { "code": "N.3", "label": "≥1 non-glazed Level X" }
            ]
          },
          { "code": "X", "label": "None or some glazed openings Level X (no protection)" }
        ]
      }
    }
  ]
};