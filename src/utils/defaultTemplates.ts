import { SOP_SECTIONS } from "@/constants/sop";
import type { Report } from "@/lib/reportSchemas";
import type { ReportTemplate } from "@/integrations/supabase/reportTemplatesApi";

export interface DefaultTemplateConfig {
  name: string;
  description: string;
  sections: Array<{
    sectionKey: string;
    title: string;
    isCustom: boolean;
    isRequired: boolean;
    sortOrder: number;
  }>;
}

const createSectionConfig = (sectionKeys: string[]) => {
  return sectionKeys.map((key, index) => {
    const sopSection = SOP_SECTIONS.find(s => s.key === key);
    return {
      sectionKey: key,
      title: sopSection?.name || key,
      isCustom: false,
      isRequired: true,
      sortOrder: index,
    };
  });
};

export const DEFAULT_TEMPLATES: Record<Report["reportType"], DefaultTemplateConfig> = {
  home_inspection: {
    name: "Standard Home Inspection",
    description: "Comprehensive home inspection following InterNACHI standards",
    sections: createSectionConfig(SOP_SECTIONS.filter(s => s.key !== "report_details" && s.key !== "finalize").map(s => s.key)),
  },
  wind_mitigation: {
    name: "Standard Wind Mitigation",
    description: "Wind mitigation inspection for insurance discounts",
    sections: createSectionConfig(["roof", "exterior", "structure", "attic"]),
  },
  roof_certification_nationwide: {
    name: "Standard Roof Certification", 
    description: "Roof condition certification inspection",
    sections: createSectionConfig(["roof", "exterior", "attic"]),
  },
  fl_four_point_citizens: {
    name: "Standard Four Point Inspection",
    description: "Four point inspection covering HVAC, electrical, plumbing, and roof",
    sections: createSectionConfig(["roof", "heating", "cooling", "plumbing", "electrical"]),
  },
  manufactured_home_insurance_prep: {
    name: "Standard Manufactured Home Inspection",
    description: "Inspection tailored for manufactured and mobile homes",
    sections: createSectionConfig(SOP_SECTIONS.filter(s => s.key !== "report_details" && s.key !== "finalize").map(s => s.key)),
  },
  ca_wildfire_defensible_space: {
    name: "Standard CA Wildfire Inspection", 
    description: "California wildfire risk assessment inspection",
    sections: createSectionConfig(["roof", "exterior", "structure", "attic"]),
  },
  tx_coastal_windstorm_mitigation: {
    name: "Standard TX Windstorm Inspection",
    description: "Texas windstorm inspection for insurance certification", 
    sections: createSectionConfig(["roof", "exterior", "structure", "attic"]),
  },
  fl_wind_mitigation_oir_b1_1802: {
    name: "Standard FL Wind Mitigation",
    description: "Florida wind mitigation inspection per OIR-B1-1802",
    sections: createSectionConfig(["roof", "exterior", "structure", "attic"]),
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
    sections_config: config.sections,
  });
}