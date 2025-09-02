import type { Report } from "@/lib/reportSchemas";

export const REPORT_TYPE_LABELS: Record<Report["reportType"], string> = {
  home_inspection: "Home Inspection",
  wind_mitigation: "Uniform Mitigation",
  fl_wind_mitigation_oir_b1_1802: "FL Wind Mitigation",
  fl_four_point_citizens: "FL 4-Point",
  tx_coastal_windstorm_mitigation: "TX Windstorm Mitigation",
  ca_wildfire_defensible_space: "CA Wildfire Assessment",
  roof_certification_nationwide: "Roof Certification",
  manufactured_home_insurance_prep: "Manufactured Home Inspection",
};
