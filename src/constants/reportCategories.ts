import type { Report } from "@/lib/reportSchemas";

export type ReportCategory = "defect_based" | "form_based";

export const DEFECT_BASED_REPORTS: Report["reportType"][] = [
  "home_inspection"
];

export const FORM_BASED_REPORTS: Report["reportType"][] = [
  "fl_four_point_citizens",
  "wind_mitigation", 
  "fl_wind_mitigation_oir_b1_1802",
  "tx_coastal_windstorm_mitigation",
  "ca_wildfire_defensible_space",
  "roof_certification_nationwide",
  "manufactured_home_insurance_prep"
];

export const REPORT_CATEGORY_LABELS: Record<ReportCategory, string> = {
  defect_based: "Defect-Based Reports",
  form_based: "Form-Based Reports"
};

export const REPORT_CATEGORY_DESCRIPTIONS: Record<ReportCategory, string> = {
  defect_based: "Traditional inspection reports with observations, defects, and recommendations",
  form_based: "Structured forms with specific questions and data collection fields"
};

/**
 * Get the category for a specific report type
 */
export function getReportCategory(reportType: Report["reportType"]): ReportCategory {
  if (DEFECT_BASED_REPORTS.includes(reportType)) {
    return "defect_based";
  }
  return "form_based";
}

/**
 * Check if a report type is defect-based
 */
export function isDefectBasedReport(reportType: Report["reportType"]): boolean {
  return DEFECT_BASED_REPORTS.includes(reportType);
}

/**
 * Check if a report type is form-based
 */
export function isFormBasedReport(reportType: Report["reportType"]): boolean {
  return FORM_BASED_REPORTS.includes(reportType);
}

/**
 * Get all report types for a specific category
 */
export function getReportTypesByCategory(category: ReportCategory): Report["reportType"][] {
  return category === "defect_based" ? DEFECT_BASED_REPORTS : FORM_BASED_REPORTS;
}