// Sample report content for realistic previews
export interface SampleSection {
  id: string;
  title: string;
  content: string;
  findings: SampleFinding[];
}

export interface SampleFinding {
  id: string;
  title: string;
  description: string;
  severity: "minor" | "major" | "safety";
  recommendation: string;
  photos?: string[];
}

// Common findings for different report types
export const HOME_INSPECTION_FINDINGS: SampleFinding[] = [
  {
    id: "elec-1",
    title: "GFCI Protection Missing",
    description: "Ground Fault Circuit Interrupter (GFCI) protection is missing at bathroom outlets. This is a safety concern as GFCI protection is required in wet locations to prevent electrical shock.",
    severity: "safety",
    recommendation: "Install GFCI outlets or GFCI circuit breakers for bathroom circuits. Recommend evaluation by a qualified electrician.",
    photos: ["sample-gfci.jpg"]
  },
  {
    id: "plumb-1", 
    title: "Minor Leak at Kitchen Sink",
    description: "A small leak was observed at the supply line connection under the kitchen sink. The leak appears to be at a compression fitting.",
    severity: "minor",
    recommendation: "Tighten or replace the compression fitting. Monitor for continued leakage. Contact a qualified plumber if leak persists.",
    photos: ["sample-leak.jpg"]
  },
  {
    id: "hvac-1",
    title: "Dirty Air Filter",
    description: "The air filter for the HVAC system is dirty and should be replaced. A dirty filter reduces system efficiency and can lead to premature equipment failure.",
    severity: "minor", 
    recommendation: "Replace air filter. Establish regular filter replacement schedule (typically every 1-3 months depending on usage).",
    photos: ["sample-filter.jpg"]
  },
  {
    id: "ext-1",
    title: "Caulking Deteriorated",
    description: "Caulking around exterior windows and doors shows signs of deterioration with some gaps present. This may allow water intrusion.",
    severity: "minor",
    recommendation: "Remove old caulk and re-caulk around window and door frames. Use high-quality exterior-grade caulk.",
    photos: ["sample-caulk.jpg"]
  }
];

export const WIND_MITIGATION_FINDINGS: SampleFinding[] = [
  {
    id: "wind-1",
    title: "Roof to Wall Attachment - Clips",
    description: "Roof to wall attachment is achieved using standard clips. Visible clips meet or exceed current building code requirements.",
    severity: "minor",
    recommendation: "No action required. Documentation provided for insurance purposes.",
    photos: ["sample-clips.jpg"]
  },
  {
    id: "wind-2",
    title: "Opening Protection - Impact Resistant",
    description: "Windows and doors have impact-resistant glass or shutters installed. Impact labeling verified on multiple units.",
    severity: "minor",
    recommendation: "Maintain existing protection. Keep documentation of impact ratings for insurance records.",
    photos: ["sample-impact-glass.jpg"]
  }
];

export const FOUR_POINT_FINDINGS: SampleFinding[] = [
  {
    id: "4pt-1",
    title: "Electrical Panel - Federal Pacific",
    description: "The main electrical panel is a Federal Pacific Electric (FPE) panel manufactured circa 1975. These panels have known issues with breaker reliability.",
    severity: "major",
    recommendation: "Consider replacement of electrical panel. Consult with qualified electrician and insurance carrier regarding coverage.",
    photos: ["sample-fpe-panel.jpg"]
  },
  {
    id: "4pt-2",
    title: "Plumbing - Polybutylene Supply Lines",
    description: "Polybutylene supply lines observed. These gray plastic pipes were installed from 1978-1995 and are known to be prone to failure.",
    severity: "major", 
    recommendation: "Consider replacement of polybutylene plumbing. Consult with insurance carrier regarding coverage implications.",
    photos: ["sample-polybutylene.jpg"]
  }
];

// Sample sections for different report types
export const HOME_INSPECTION_SECTIONS: SampleSection[] = [
  {
    id: "summary",
    title: "Executive Summary",
    content: "This report summarizes the findings of a visual inspection of the property performed in accordance with the InterNACHI Standards of Practice. The inspection was limited to readily accessible areas and components.",
    findings: []
  },
  {
    id: "electrical",
    title: "Electrical System",
    content: "The electrical system was evaluated for general safety and functionality. The main electrical panel, visible wiring, outlets, switches, and fixtures were examined.",
    findings: HOME_INSPECTION_FINDINGS.filter(f => f.id.startsWith("elec"))
  },
  {
    id: "plumbing", 
    title: "Plumbing System",
    content: "The plumbing system was evaluated including supply lines, drain lines, fixtures, and water pressure. The inspection was limited to visible and accessible components.",
    findings: HOME_INSPECTION_FINDINGS.filter(f => f.id.startsWith("plumb"))
  },
  {
    id: "hvac",
    title: "Heating, Ventilation & Air Conditioning",
    content: "The HVAC system was evaluated for general operation and safety. Components inspected include the heating/cooling unit, ductwork, filters, and thermostat.",
    findings: HOME_INSPECTION_FINDINGS.filter(f => f.id.startsWith("hvac"))
  },
  {
    id: "exterior",
    title: "Exterior",
    content: "The exterior of the property was evaluated including siding, trim, windows, doors, roof, gutters, and general site conditions.",
    findings: HOME_INSPECTION_FINDINGS.filter(f => f.id.startsWith("ext"))
  }
];

export const WIND_MITIGATION_SECTIONS: SampleSection[] = [
  {
    id: "roof-wall",
    title: "Roof to Wall Attachment",
    content: "Documentation of the method used to attach the roof structure to the walls of the building.",
    findings: WIND_MITIGATION_FINDINGS.filter(f => f.id === "wind-1")
  },
  {
    id: "openings",
    title: "Opening Protection", 
    content: "Evaluation of protection for windows, doors, and other openings against wind-borne debris.",
    findings: WIND_MITIGATION_FINDINGS.filter(f => f.id === "wind-2")
  }
];

export const FOUR_POINT_SECTIONS: SampleSection[] = [
  {
    id: "electrical-4pt",
    title: "Electrical System",
    content: "Evaluation of the main electrical panel, service entrance, and general electrical system condition and age.",
    findings: FOUR_POINT_FINDINGS.filter(f => f.id === "4pt-1")
  },
  {
    id: "plumbing-4pt",
    title: "Plumbing System", 
    content: "Assessment of plumbing materials, age, and condition including supply lines, drain lines, and fixtures.",
    findings: FOUR_POINT_FINDINGS.filter(f => f.id === "4pt-2")
  }
];

// Get sections by report type
export const getSectionsByReportType = (reportType: string): SampleSection[] => {
  switch (reportType) {
    case "home_inspection":
      return HOME_INSPECTION_SECTIONS;
    case "wind_mitigation":
    case "fl_wind_mitigation_oir_b1_1802":
      return WIND_MITIGATION_SECTIONS;
    case "fl_four_point_citizens":
      return FOUR_POINT_SECTIONS;
    default:
      return HOME_INSPECTION_SECTIONS;
  }
};