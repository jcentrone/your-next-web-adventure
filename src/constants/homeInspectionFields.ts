// Built-in fields for standard home inspection sections
export const HOME_INSPECTION_FIELDS = {
  sections: [
    {
      name: "roof",
      fields: [
        { name: "roof_material", label: "Roof Material", widget: "multiselect", required: true, options: ["Asphalt Shingles", "Clay Tile", "Concrete Tile", "Metal", "Wood Shingles", "Slate", "Built-up", "Modified Bitumen", "EPDM", "TPO", "Other"] },
        { name: "roof_condition", label: "Overall Roof Condition", widget: "select", required: true, options: ["Good", "Fair", "Poor", "Unable to Inspect"] },
        { name: "gutters_downspouts", label: "Gutters & Downspouts", widget: "select", required: false, options: ["Present and Functional", "Present with Issues", "Not Present", "Unable to Inspect"] },
        { name: "inspection_method", label: "Inspection Method", widget: "select", required: true, options: ["Walked on Roof", "Visual from Ground", "Visual from Ladder", "Drone/Remote"] }
      ]
    },
    {
      name: "exterior",
      fields: [
        { name: "siding_material", label: "Siding Material", widget: "select", required: true, options: ["Vinyl", "Wood", "Brick", "Stone", "Stucco", "Fiber Cement", "Metal", "Other"] },
        { name: "exterior_condition", label: "Overall Exterior Condition", widget: "select", required: true, options: ["Good", "Fair", "Poor"] },
        { name: "grading_drainage", label: "Grading & Drainage", widget: "select", required: true, options: ["Adequate", "Marginal", "Poor", "Unable to Determine"] }
      ]
    },
    {
      name: "structure",
      fields: [
        { name: "foundation_type", label: "Foundation Type", widget: "select", required: true, options: ["Concrete Slab", "Crawl Space", "Full Basement", "Partial Basement", "Pier & Beam", "Other"] },
        { name: "foundation_material", label: "Foundation Material", widget: "select", required: true, options: ["Poured Concrete", "Concrete Block", "Stone", "Brick", "Wood", "Other"] },
        { name: "structural_condition", label: "Overall Structural Condition", widget: "select", required: true, options: ["Good", "Fair", "Poor", "Unable to Inspect"] }
      ]
    },
    {
      name: "heating",
      fields: [
        { name: "heating_type", label: "Heating System Type", widget: "select", required: true, options: ["Forced Air Gas", "Forced Air Electric", "Heat Pump", "Boiler", "Radiant", "None", "Other"] },
        { name: "energy_source", label: "Energy Source", widget: "select", required: true, options: ["Natural Gas", "Electric", "Propane", "Oil", "Other"] },
        { name: "heating_condition", label: "System Condition", widget: "select", required: true, options: ["Good", "Fair", "Poor", "Not Tested"] }
      ]
    },
    {
      name: "cooling",
      fields: [
        { name: "cooling_type", label: "Cooling System Type", widget: "select", required: true, options: ["Central Air", "Heat Pump", "Window Units", "Mini-Split", "Evaporative Cooler", "None", "Other"] },
        { name: "cooling_condition", label: "System Condition", widget: "select", required: true, options: ["Good", "Fair", "Poor", "Not Tested"] },
        { name: "temperature_differential", label: "Temperature Differential", widget: "number", required: false }
      ]
    },
    {
      name: "plumbing",
      fields: [
        { name: "water_supply_type", label: "Water Supply Type", widget: "select", required: true, options: ["Public", "Private Well", "Cistern", "Other"] },
        { name: "supply_piping", label: "Supply Piping Material", widget: "select", required: true, options: ["Copper", "PEX", "CPVC", "Galvanized", "PVC", "Polybutylene", "Other"] },
        { name: "drain_piping", label: "Drain Piping Material", widget: "select", required: true, options: ["PVC", "ABS", "Cast Iron", "Galvanized", "Clay", "Other"] },
        { name: "water_heater_type", label: "Water Heater Type", widget: "select", required: true, options: ["Gas Tank", "Electric Tank", "Gas Tankless", "Electric Tankless", "Heat Pump", "Solar", "Other"] }
      ]
    },
    {
      name: "electrical",
      fields: [
        { name: "service_size", label: "Service Size (Amps)", widget: "select", required: true, options: ["60", "100", "150", "200", "400", "Other"] },
        { name: "panel_type", label: "Main Panel Type", widget: "select", required: true, options: ["Circuit Breakers", "Fuses", "Mixed", "Other"] },
        { name: "wiring_type", label: "Branch Wiring Type", widget: "select", required: true, options: ["Romex/NM", "BX/AC", "EMT/Conduit", "Knob & Tube", "Aluminum", "Mixed", "Other"] },
        { name: "gfci_present", label: "GFCI Protection Present", widget: "select", required: true, options: ["Yes - Adequate", "Yes - Partial", "No", "Unable to Determine"] }
      ]
    },
    {
      name: "fireplace",
      fields: [
        { name: "fireplace_type", label: "Fireplace Type", widget: "select", required: false, options: ["Masonry", "Manufactured", "Gas Insert", "Electric Insert", "None Present", "Other"] },
        { name: "fireplace_condition", label: "Fireplace Condition", widget: "select", required: false, options: ["Good", "Fair", "Poor", "Not Inspected"] }
      ]
    },
    {
      name: "attic",
      fields: [
        { name: "attic_access", label: "Attic Access", widget: "select", required: true, options: ["Adequate", "Marginal", "Poor", "None"] },
        { name: "insulation_type", label: "Insulation Type", widget: "select", required: true, options: ["Fiberglass Batts", "Blown Fiberglass", "Blown Cellulose", "Foam", "Vermiculite", "None", "Other"] },
        { name: "insulation_level", label: "Insulation Level", widget: "select", required: true, options: ["Adequate", "Marginal", "Inadequate", "Unable to Determine"] },
        { name: "ventilation", label: "Attic Ventilation", widget: "select", required: true, options: ["Adequate", "Marginal", "Inadequate", "Unable to Determine"] }
      ]
    },
    {
      name: "interior",
      fields: [
        { name: "flooring_type", label: "Primary Flooring Type", widget: "select", required: true, options: ["Hardwood", "Laminate", "Tile", "Carpet", "Vinyl", "Concrete", "Mixed", "Other"] },
        { name: "window_type", label: "Window Type", widget: "select", required: true, options: ["Single Pane", "Double Pane", "Triple Pane", "Mixed", "Other"] },
        { name: "door_condition", label: "Door Condition", widget: "select", required: true, options: ["Good", "Fair", "Poor"] }
      ]
    },
    {
      name: "report_details",
      fields: [
        { name: "weather_conditions", label: "Weather Conditions", widget: "select", required: true, options: ["Clear", "Cloudy", "Rainy", "Snow", "Other"] },
        { name: "temperature", label: "Approximate Temperature (°F)", widget: "number", required: false },
        { name: "occupancy_status", label: "Property Occupancy", widget: "select", required: true, options: ["Occupied", "Vacant", "Partially Furnished", "Under Construction"] }
      ]
    },
    {
      name: "finalize",
      fields: [
        { name: "inspector_signature", label: "Inspector Signature", widget: "text", required: true },
        { name: "inspection_date", label: "Inspection Date", widget: "date", required: true },
        { name: "report_delivery_method", label: "Report Delivery Method", widget: "select", required: false, options: ["Email", "Portal", "Hard Copy", "Other"] }
      ]
    }
  ]
};