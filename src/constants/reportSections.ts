import type { Report } from "@/lib/reportSchemas";
import { getReportCategory, type ReportCategory } from "./reportCategories";

export interface ReportSectionDefinition {
  key: string;
  name: string;
  description?: string;
  isRequired?: boolean;
  sortOrder: number;
  category?: ReportCategory;
}

export const REPORT_SECTIONS: Record<Report["reportType"], ReportSectionDefinition[]> = {
  home_inspection: [
    { key: "roof", name: "Roof", isRequired: true, sortOrder: 1 },
    { key: "exterior", name: "Exterior", isRequired: true, sortOrder: 2 },
    { key: "structure", name: "Foundation / Structure", isRequired: true, sortOrder: 3 },
    { key: "heating", name: "Heating", isRequired: true, sortOrder: 4 },
    { key: "cooling", name: "Cooling", isRequired: true, sortOrder: 5 },
    { key: "plumbing", name: "Plumbing", isRequired: true, sortOrder: 6 },
    { key: "electrical", name: "Electrical", isRequired: true, sortOrder: 7 },
    { key: "fireplace", name: "Fireplace", isRequired: false, sortOrder: 8 },
    { key: "attic", name: "Attic & Ventilation", isRequired: true, sortOrder: 9 },
    { key: "interior", name: "Doors / Windows / Interior", isRequired: true, sortOrder: 10 },
    { key: "report_details", name: "Report Details", isRequired: true, sortOrder: 11 },
    { key: "finalize", name: "Finalize", isRequired: true, sortOrder: 12 },
  ],

  fl_four_point_citizens: [
    { key: "general", name: "General Information", isRequired: true, sortOrder: 1 },
    { key: "roof", name: "Roof", isRequired: true, sortOrder: 2 },
    { key: "electrical", name: "Electrical", isRequired: true, sortOrder: 3 },
    { key: "plumbing", name: "Plumbing", isRequired: true, sortOrder: 4 },
    { key: "hvac", name: "HVAC", isRequired: true, sortOrder: 5 },
    { key: "photos_signatures", name: "Photos & Signatures", isRequired: true, sortOrder: 6 },
  ],

  wind_mitigation: [
    { key: "building_code", name: "Building Code Compliance", isRequired: true, sortOrder: 1 },
    { key: "roof_covering", name: "Roof Covering", isRequired: true, sortOrder: 2 },
    { key: "roof_deck_attachment", name: "Roof Deck Attachment", isRequired: true, sortOrder: 3 },
    { key: "roof_to_wall_attachment", name: "Roof to Wall Attachment", isRequired: true, sortOrder: 4 },
    { key: "roof_geometry", name: "Roof Geometry", isRequired: true, sortOrder: 5 },
    { key: "secondary_water_resistance", name: "Secondary Water Resistance", isRequired: true, sortOrder: 6 },
    { key: "opening_protection", name: "Opening Protection", isRequired: true, sortOrder: 7 },
  ],

  fl_wind_mitigation_oir_b1_1802: [
    { key: "building_code", name: "Building Code Compliance", isRequired: true, sortOrder: 1 },
    { key: "roof_covering", name: "Roof Covering", isRequired: true, sortOrder: 2 },
    { key: "roof_deck_attachment", name: "Roof Deck Attachment", isRequired: true, sortOrder: 3 },
    { key: "roof_to_wall_attachment", name: "Roof to Wall Attachment", isRequired: true, sortOrder: 4 },
    { key: "roof_geometry", name: "Roof Geometry", isRequired: true, sortOrder: 5 },
    { key: "secondary_water_resistance", name: "Secondary Water Resistance", isRequired: true, sortOrder: 6 },
    { key: "opening_protection", name: "Opening Protection", isRequired: true, sortOrder: 7 },
  ],

  tx_coastal_windstorm_mitigation: [
    { key: "property", name: "Property Information", isRequired: true, sortOrder: 1 },
    { key: "roof_covering_deck", name: "Roof Covering & Deck", isRequired: true, sortOrder: 2 },
    { key: "roof_to_wall", name: "Roof to Wall Connection", isRequired: true, sortOrder: 3 },
    { key: "opening_protection", name: "Opening Protection", isRequired: true, sortOrder: 4 },
    { key: "ancillary", name: "Ancillary Features", isRequired: false, sortOrder: 5 },
    { key: "photos", name: "Photos", isRequired: true, sortOrder: 6 },
  ],

  ca_wildfire_defensible_space: [
    { key: "structure_materials", name: "Structure Materials", isRequired: true, sortOrder: 1 },
    { key: "zone0_ember_resistant", name: "Zone 0 (Ember Resistant)", isRequired: true, sortOrder: 2 },
    { key: "zone1_and_2_defensible_space", name: "Zone 1 & 2 (Defensible Space)", isRequired: true, sortOrder: 3 },
    { key: "access_and_water", name: "Access & Water", isRequired: true, sortOrder: 4 },
    { key: "photos", name: "Photos", isRequired: true, sortOrder: 5 },
  ],

  roof_certification_nationwide: [
    { key: "structure_materials", name: "Structure Materials", isRequired: true, sortOrder: 1 },
    { key: "zone0_ember_resistant", name: "Zone 0 (Ember Resistant)", isRequired: true, sortOrder: 2 },
    { key: "zone1_and_2_defensible_space", name: "Zone 1 & 2 (Defensible Space)", isRequired: true, sortOrder: 3 },
    { key: "access_and_water", name: "Access & Water", isRequired: true, sortOrder: 4 },
    { key: "photos", name: "Photos", isRequired: true, sortOrder: 5 },
  ],

  manufactured_home_insurance_prep: [
    { key: "home_identifiers", name: "Home Identifiers", isRequired: true, sortOrder: 1 },
    { key: "foundation_tie_down", name: "Foundation & Tie-Down", isRequired: true, sortOrder: 2 },
    { key: "electrical_heating_cooling", name: "Electrical, Heating & Cooling", isRequired: true, sortOrder: 3 },
    { key: "plumbing", name: "Plumbing", isRequired: true, sortOrder: 4 },
    { key: "general_condition", name: "General Condition", isRequired: true, sortOrder: 5 },
    { key: "photos_signatures", name: "Photos & Signatures", isRequired: true, sortOrder: 6 },
  ],
};

/**
 * Get sections for a specific report type
 */
export function getSectionsForReportType(reportType: Report["reportType"]): ReportSectionDefinition[] {
  return REPORT_SECTIONS[reportType] || [];
}

/**
 * Get all available section keys for a report type
 */
export function getSectionKeys(reportType: Report["reportType"]): string[] {
  return getSectionsForReportType(reportType).map(section => section.key);
}

/**
 * Get section definition by key and report type
 */
export function getSectionDefinition(
  reportType: Report["reportType"], 
  sectionKey: string
): ReportSectionDefinition | undefined {
  return getSectionsForReportType(reportType).find(section => section.key === sectionKey);
}