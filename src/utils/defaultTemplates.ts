import { getSectionsForReportType } from "@/constants/reportSections";
import type { Report } from "@/lib/reportSchemas";
import type { ReportTemplate } from "@/integrations/supabase/reportTemplatesApi";

export interface DefaultTemplateConfig {
  name: string;
  description: string;
  sections_config: ReportTemplate["sections_config"];
}

/**
 * Helper function to create section config from report type
 */
function createSectionConfig(reportType: Report["reportType"]): ReportTemplate["sections_config"] {
  const sections = getSectionsForReportType(reportType);
  return sections.map((section) => ({
    sectionKey: section.key,
    title: section.name,
    isCustom: false,
    isRequired: section.isRequired ?? true,
    sortOrder: section.sortOrder,
  }));
}

const DEFAULT_TEMPLATES: Record<Report["reportType"], DefaultTemplateConfig> = {
  home_inspection: {
    name: "Standard Home Inspection",
    description: "InterNACHI Standards of Practice home inspection template",
    sections_config: createSectionConfig("home_inspection"),
  },
  wind_mitigation: {
    name: "Standard Wind Mitigation",
    description: "Uniform mitigation verification inspection template",
    sections_config: createSectionConfig("wind_mitigation"),
  },
  fl_wind_mitigation_oir_b1_1802: {
    name: "FL Wind Mitigation (OIR-B1-1802)",
    description: "Florida Office of Insurance Regulation wind mitigation form",
    sections_config: createSectionConfig("fl_wind_mitigation_oir_b1_1802"),
  },
  fl_four_point_citizens: {
    name: "FL 4-Point Inspection",
    description: "Florida 4-point inspection for insurance underwriting",
    sections_config: createSectionConfig("fl_four_point_citizens"),
  },
  tx_coastal_windstorm_mitigation: {
    name: "TX Windstorm Mitigation",
    description: "Texas coastal windstorm mitigation inspection",
    sections_config: createSectionConfig("tx_coastal_windstorm_mitigation"),
  },
  ca_wildfire_defensible_space: {
    name: "CA Wildfire Assessment",
    description: "California wildfire defensible space assessment",
    sections_config: createSectionConfig("ca_wildfire_defensible_space"),
  },
  roof_certification_nationwide: {
    name: "Roof Certification",
    description: "Roof certification inspection template",
    sections_config: createSectionConfig("roof_certification_nationwide"),
  },
  manufactured_home_insurance_prep: {
    name: "Manufactured Home Inspection",
    description: "Manufactured/mobile home insurance preparation inspection",
    sections_config: createSectionConfig("manufactured_home_insurance_prep"),
  },
};

export async function createDefaultTemplate(
  reportType: Report["reportType"],
  userId: string,
  createTemplateFunction: (templateData: {
    name: string;
    description?: string;
    report_type: Report["reportType"];
    sections_config?: ReportTemplate["sections_config"];
  }) => Promise<void>
) {
  const config = DEFAULT_TEMPLATES[reportType];
  
  if (!config) {
    throw new Error(`No default template configuration found for report type: ${reportType}`);
  }

  await createTemplateFunction({
    name: config.name,
    description: config.description,
    report_type: reportType,
    sections_config: config.sections_config,
  });
}