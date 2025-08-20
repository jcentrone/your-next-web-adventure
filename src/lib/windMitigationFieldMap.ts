// Wind Mitigation PDF Field Mapping
export const WIND_MITIGATION_FIELD_MAP: Record<string, string> = {
    // --- Owner Info ---
    clientName: "Owner Name",
    address: "Address",
    phoneHome: "Home Phone",
    phoneWork: "Work Phone",
    phoneCell: "Cell Phone",
    email: "Email",
    insuranceCompany: "Insurance Company",
    policyNumber: "Policy",
    
    // --- Inspection Info ---
    inspectionDate: "Inspection Date",
    
    // --- Building Code (Q1) ---
    "reportData.1_building_code.selectedOption": "Building Code",
    "reportData.1_building_code.fields.year_built": "Year of Home",

    // --- Roof Covering Types (Q2) ---
    "reportData.2_roof_covering.coverings.asphalt_fiberglass_shingle.selected": "1 AsphaltFiberglass Shingle",
    "reportData.2_roof_covering.coverings.concrete_clay_tile.selected": "2 ConcreteClay Tile",
    "reportData.2_roof_covering.coverings.metal.selected": "3 Metal",
    "reportData.2_roof_covering.coverings.built_up.selected": "4 Built Up",
    "reportData.2_roof_covering.coverings.membrane.selected": "5 Membrane",
    "reportData.2_roof_covering.coverings.other.selected": "6 Other",

    // --- Roof Covering Compliance Details ---
    "reportData.2_roof_covering.coverings.asphalt_fiberglass_shingle.no_information_provided_for_compliance": "shingleNoCompliance",
    "reportData.2_roof_covering.coverings.concrete_clay_tile.no_information_provided_for_compliance": "clayNoCompliance",
    "reportData.2_roof_covering.coverings.metal.no_information_provided_for_compliance": "metalNoCompliance",
    "reportData.2_roof_covering.coverings.built_up.no_information_provided_for_compliance": "builtUpNoCompliance",
    "reportData.2_roof_covering.coverings.membrane.no_information_provided_for_compliance": "membraneNoCompliance",
    "reportData.2_roof_covering.coverings.other.no_information_provided_for_compliance": "otherNoCompliance",

    // --- Roof Covering Methods ---
    "reportData.2_roof_covering.overall_compliance": "roofCoveringA",

    // --- Roof Deck Attachments (Q3) ---
    "reportData.3_roof_deck_attachment.selectedOption": "roofDeckA",

    // --- Roof to Wall Attachment (Q4) ---
    "reportData.4_roof_to_wall_attachment.selectedOption": "roofWallA",

    // --- Roof Geometry (Q5) ---
    "reportData.5_roof_geometry.selectedOption": "roofGeometryA",
    "reportData.5_roof_geometry.fields.total_roof_system_perimeter_ft": "roofGeometryB",
    "reportData.5_roof_geometry.fields.non_hip_feature_total_length_ft": "roofGeometryC",

    // --- Secondary Water Resistance (Q6) ---
    "reportData.6_secondary_water_resistance.selectedOption": "swrA",

    // --- Opening Protection (Q7) ---
    "reportData.7_opening_protection.glazedOverall": "oplA",
    "reportData.7_opening_protection.nonGlazedSubclass": "oplB",
    "reportData.7_opening_protection.openingProtection.windows_or_entry_doors_glazed": "oplA1",
    "reportData.7_opening_protection.openingProtection.garage_doors_glazed": "oplA2",
    "reportData.7_opening_protection.openingProtection.skylights_glazed": "oplA3",
    "reportData.7_opening_protection.openingProtection.glass_block_glazed": "oplB1",
    "reportData.7_opening_protection.openingProtection.entry_doors_non_glazed": "oplB2",
    "reportData.7_opening_protection.openingProtection.garage_doors_non_glazed": "oplB3",

};
