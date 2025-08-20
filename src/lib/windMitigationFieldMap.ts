// src/utils/windMitigationFieldMap.ts
export const WIND_MITIGATION_FIELD_MAP: Record<string, string> = {
    // --- Owner Info ---
    clientName: "Owner Name",
    address: "Address",
    // phoneHome: "Home Phone",
    // phoneWork: "Work Phone",
    // phoneCell: "Cell Phone",
    // email: "Email",
    // insuranceCompany: "Insurance Company",
    // policyNumber: "Policy",

    // --- Inspection Info ---
    inspectionDate: "Inspection Date",
    stories: "# of Stories",

    // -- Building Cde (Q1) ---
    "reportData.1_building_code.selectedOption": "Building Code",
    "report_data.1_building_code.fields.year_built": "Year of Home",


    // --- Roof Covering Types (Q2) ---
    "report_data.2_roof_covering.coverings.asphalt_fiberglass_shingle.selected": "1 AsphaltFiberglass Shingle",
    "report_data.2_roof_covering.coverings.concrete_clay_tile.selected": "2 ConcreteClay Tile",
    "report_data.2_roof_covering.coverings.metal.selected": "3 Metal",
    "report_data.2_roof_covering.coverings.built_up.selected": "4 Built Up",
    "report_data.2_roof_covering.coverings.membrane.selected": "5 Membrane",
    "report_data.2_roof_covering.coverings.other.selected": "6 Other",

    // --- Roof Covering Compliance Details ---
    "report_data.2_roof_covering.coverings.asphalt_fiberglass_shingle.no_information_provided_for_compliance": "shingleNoCompliance",
    "report_data.2_roof_covering.coverings.concrete_clay_tile.no_information_provided_for_compliance": "clayNoCompliance",
    "report_data.2_roof_covering.coverings.metal.no_information_provided_for_compliance": "metalNoCompliance",
    "report_data.2_roof_covering.coverings.built_up.no_information_provided_for_compliance": "builtUpNoCompliance",
    "report_data.2_roof_covering.coverings.membrane.no_information_provided_for_compliance": "membraneNoCompliance",
    "report_data.2_roof_covering.coverings.other.no_information_provided_for_compliance": "otherNoCompliance",

    // Optional extra compliance metadata
    "report_data.2_roof_covering.coverings.asphalt_fiberglass_shingle.permit_application_date": "asphaltPermitDate",
    "report_data.2_roof_covering.coverings.asphalt_fiberglass_shingle.fbc_or_mdc_product_approval_number": "asphaltApprovalNumber",
    "report_data.2_roof_covering.coverings.asphalt_fiberglass_shingle.year_of_original_install_or_replacement": "asphaltYearInstalled",

    // --- Building Code Compliance (Q1) ---
    "report_data.1_building_code.selectedOption": "buildingCodeA", // or A/B/C mapping

    // --- Roof Covering Methods ---
    "report_data.2_roof_covering.overall_compliance": "roofCoveringA",

    // --- Roof Deck Attachments (Q3) ---
    "report_data.3_roof_deck_attachment.selectedOption": "roofDeckA",
    "report_data.3_roof_deck_attachment.fields": "roofDeckB",

    // --- Roof Geometry (Q5) ---
    "report_data.5_roof_geometry.selectedOption": "roofGeometryA",
    "report_data.5_roof_geometry.fields.total_roof_system_perimeter_ft": "roofGeometryB",
    "report_data.5_roof_geometry.fields.non_hip_feature_total_length_ft": "roofGeometryC",

    // --- Roof to Wall Attachment (Q4) ---
    "report_data.4_roof_to_wall_attachment.selectedOption": "roofWallA",
    "report_data.4_roof_to_wall_attachment.fields": "roofWallB",

    // --- Secondary Water Resistance (Q6) ---
    "report_data.6_secondary_water_resistance.selectedOption": "swrA",

    // --- Opening Protection (Q7) ---
    "report_data.7_opening_protection.glazedOverall": "oplA",
    "report_data.7_opening_protection.nonGlazedSubclass": "oplB",
    "report_data.7_opening_protection.openingProtection.windows_or_entry_doors_glazed": "oplA1",
    "report_data.7_opening_protection.openingProtection.garage_doors_glazed": "oplA2",
    "report_data.7_opening_protection.openingProtection.skylights_glazed": "oplA3",
    "report_data.7_opening_protection.openingProtection.glass_block_glazed": "oplB1",
    "report_data.7_opening_protection.openingProtection.entry_doors_non_glazed": "oplB2",
    "report_data.7_opening_protection.openingProtection.garage_doors_non_glazed": "oplB3",

    // --- Inspector Comments ---
    inspectorComments: "Inspector Comments",

    // --- Inspector License Types ---
    inspectorLicenseType1: "inspectorLicenseType1",
    inspectorLicenseType2: "inspectorLicenseType2",
    inspectorLicenseType3: "inspectorLicenseType3",
    inspectorLicenseType4: "inspectorLicenseType4",
    inspectorLicenseType5: "inspectorLicenseType5",
    inspectorLicenseType6: "inspectorLicenseType6",
};
