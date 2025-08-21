// Wind Mitigation PDF Field Mapping
export const WIND_MITIGATION_FIELD_MAP: Record<string, string> = {
    // --- Owner Info ---
    clientName: "Owner Name",
    street: "Address",
    city: "City",
    zip: "zipCode",
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
    // --- Clay/Concrete Tile ---
    "reportData.2_roof_covering.coverings.concrete_clay_tile.permit_application_date": "clayTilePermitDate",
    "reportData.2_roof_covering.coverings.concrete_clay_tile.fbc_or_mdc_product_approval_number": "clayTileFbcMbcNumb",
    "reportData.2_roof_covering.coverings.concrete_clay_tile.year_of_original_install_or_replacement": "clayInstallReplaceDate",
    "reportData.2_roof_covering.coverings.concrete_clay_tile.no_information_provided_for_compliance": "clayNoCompliance",
    // --- Metal ---
    "reportData.2_roof_covering.coverings.metal.permit_application_date": "metalPermitDate",
    "reportData.2_roof_covering.coverings.metal.fbc_or_mdc_product_approval_number": "metalFbcMbcNumb",
    "reportData.2_roof_covering.coverings.metal.year_of_original_install_or_replacement": "metalInstallReplaceDate",
    "reportData.2_roof_covering.coverings.metal.no_information_provided_for_compliance": "metalNoCompliance",

    // --- Built-Up ---
    "reportData.2_roof_covering.coverings.built_up.permit_application_date": "builtUpPermitDate",
    "reportData.2_roof_covering.coverings.built_up.fbc_or_mdc_product_approval_number": "builtUpFbcMdcNumb",
    "reportData.2_roof_covering.coverings.built_up.year_of_original_install_or_replacement": "builtUpInstallReplaceDate",
    "reportData.2_roof_covering.coverings.built_up.no_information_provided_for_compliance": "builtUpNoCompliance",

    // --- Membrane ---
    "reportData.2_roof_covering.coverings.membrane.permit_application_date": "membranePermitDate",
    "reportData.2_roof_covering.coverings.membrane.fbc_or_mdc_product_approval_number": "membraneFbcMdcNumb",
    "reportData.2_roof_covering.coverings.membrane.year_of_original_install_or_replacement": "membraneInstallReplaceDate",
    "reportData.2_roof_covering.coverings.membrane.no_information_provided_for_compliance": "membraneNoCompliance",

    // --- Other ---
    "reportData.2_roof_covering.coverings.other.permit_application_date": "otherPermitDate",
    "reportData.2_roof_covering.coverings.other.fbc_or_mdc_product_approval_number": "otherFbcMdcNumb",
    "reportData.2_roof_covering.coverings.other.year_of_original_install_or_replacement": "otherInstallReplaceDate",
    "reportData.2_roof_covering.coverings.other.no_information_provided_for_compliance": "otherNoCompliance",
    "reportData.2_roof_covering.coverings.other.description": "otherRoofCoveringType",
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
