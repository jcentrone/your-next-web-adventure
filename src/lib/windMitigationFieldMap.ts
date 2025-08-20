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
    
    // --- Roof Covering Types (Q2) ---
    "reportData.2_roof_covering.coverings.asphalt_fiberglass_shingle.selected": "1 AsphaltFiberglass Shingle",
    "reportData.2_roof_covering.coverings.concrete_clay_tile.selected": "2 ConcreteClay Tile",
    "reportData.2_roof_covering.coverings.metal.selected": "3 Metal",
    "reportData.2_roof_covering.coverings.built_up.selected": "4 Built Up",
    "reportData.2_roof_covering.coverings.membrane.selected": "5 Membrane",
    "reportData.2_roof_covering.coverings.other.selected": "6 Other",

    // --- Roof Covering Compliance Details ---
    // Asphalt/Fiberglass Shingle
    "reportData.2_roof_covering.coverings.asphalt_fiberglass_shingle.permit_application_date": "shinglePermitDate",
    "reportData.2_roof_covering.coverings.asphalt_fiberglass_shingle.fbc_or_mdc_product_approval_number": "shingleFbcMdcNumb",
    "reportData.2_roof_covering.coverings.asphalt_fiberglass_shingle.year_of_original_install_or_replacement": "shingleInstallReplaceDate",
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
    // Opening Protection Levels per Opening Type
    "reportData.7_opening_protection.openingProtection.windows_or_entry_doors_glazed.NA": "windowDoorNA",
    "reportData.7_opening_protection.openingProtection.windows_or_entry_doors_glazed.A": "windowDoorA",
    "reportData.7_opening_protection.openingProtection.windows_or_entry_doors_glazed.B": "windowDoorB",
    "reportData.7_opening_protection.openingProtection.windows_or_entry_doors_glazed.C": "windowDoorC",
    "reportData.7_opening_protection.openingProtection.windows_or_entry_doors_glazed.D": "windowDoorD",
    "reportData.7_opening_protection.openingProtection.windows_or_entry_doors_glazed.N": "windowDoorN1",
    "reportData.7_opening_protection.openingProtection.windows_or_entry_doors_glazed.X": "windowDoorX",

    "reportData.7_opening_protection.openingProtection.garage_doors_glazed.NA": "garageNA",
    "reportData.7_opening_protection.openingProtection.garage_doors_glazed.A": "garageA",
    "reportData.7_opening_protection.openingProtection.garage_doors_glazed.B": "garageB",
    "reportData.7_opening_protection.openingProtection.garage_doors_glazed.C": "garageC",
    "reportData.7_opening_protection.openingProtection.garage_doors_glazed.D": "garageD",
    "reportData.7_opening_protection.openingProtection.garage_doors_glazed.N": "garageN1",
    "reportData.7_opening_protection.openingProtection.garage_doors_glazed.X": "garageX",

    "reportData.7_opening_protection.openingProtection.skylights_glazed.NA": "skylightsNA",
    "reportData.7_opening_protection.openingProtection.skylights_glazed.A": "skylightsA",
    "reportData.7_opening_protection.openingProtection.skylights_glazed.B": "skylightsB",
    "reportData.7_opening_protection.openingProtection.skylights_glazed.C": "skylightsC",
    "reportData.7_opening_protection.openingProtection.skylights_glazed.D": "skylightsD",
    "reportData.7_opening_protection.openingProtection.skylights_glazed.N": "skylightsN1",
    "reportData.7_opening_protection.openingProtection.skylights_glazed.X": "skylightsX",

    "reportData.7_opening_protection.openingProtection.glass_block_glazed.NA": "glassBlockNA",
    "reportData.7_opening_protection.openingProtection.glass_block_glazed.A": "glassBlockA",
    "reportData.7_opening_protection.openingProtection.glass_block_glazed.B": "glassBlockB",
    "reportData.7_opening_protection.openingProtection.glass_block_glazed.C": "glassBlockC",
    "reportData.7_opening_protection.openingProtection.glass_block_glazed.D": "glassBlockD",
    "reportData.7_opening_protection.openingProtection.glass_block_glazed.N": "glassBlockN1",
    "reportData.7_opening_protection.openingProtection.glass_block_glazed.X": "glassBlockX",

    "reportData.7_opening_protection.openingProtection.entry_doors_non_glazed.NA": "ng_entryDoorsNA",
    "reportData.7_opening_protection.openingProtection.entry_doors_non_glazed.A": "ng_entryDoorsA",
    "reportData.7_opening_protection.openingProtection.entry_doors_non_glazed.B": "ng_entryDoorsB",
    "reportData.7_opening_protection.openingProtection.entry_doors_non_glazed.C": "ng_entryDoorsC",
    "reportData.7_opening_protection.openingProtection.entry_doors_non_glazed.D": "ng_entryDoorsD",
    "reportData.7_opening_protection.openingProtection.entry_doors_non_glazed.N": "ng_entryDoorsN1",
    "reportData.7_opening_protection.openingProtection.entry_doors_non_glazed.X": "ng_entryDoorsX",

    "reportData.7_opening_protection.openingProtection.garage_doors_non_glazed.NA": "ng_garageDoorsNA",
    "reportData.7_opening_protection.openingProtection.garage_doors_non_glazed.A": "ng_garageDoorsA",
    "reportData.7_opening_protection.openingProtection.garage_doors_non_glazed.B": "ng_garageDoorsB",
    "reportData.7_opening_protection.openingProtection.garage_doors_non_glazed.C": "ng_garageDoorsC",
    "reportData.7_opening_protection.openingProtection.garage_doors_non_glazed.D": "ng_garageDoorsD",
    "reportData.7_opening_protection.openingProtection.garage_doors_non_glazed.N": "ng_garageDoorsN1",
    "reportData.7_opening_protection.openingProtection.garage_doors_non_glazed.X": "ng_garageDoorsX",

};
