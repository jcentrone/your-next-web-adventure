import type { Report } from "@/lib/reportSchemas";
import type { CoverTemplateId } from "@/constants/coverTemplates";
import type { PreviewTemplateId } from "@/constants/previewTemplates";

export interface SampleOrganization {
  id: string;
  name: string;
  logo_url: string | null;
  address: string;
  phone: string;
  email: string;
  website: string;
  primary_color: string;
  secondary_color: string;
}

export interface SampleInspector {
  id: string;
  name: string;
  license_number: string;
  phone: string;
  email: string;
}

export interface SampleClient {
  id: string;
  name: string;
  address: string;
  email: string;
  phone: string;
}

export interface SampleProperty {
  address: string;
  inspection_date: string;
  weather_conditions: string;
}

export interface SampleReport {
  id: string;
  reportType: Report["reportType"];
  title: string;
  organization: SampleOrganization;
  inspector: SampleInspector;
  client: SampleClient;
  property: SampleProperty;
  coverTemplate: CoverTemplateId;
  previewTemplate: PreviewTemplateId;
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

const SAMPLE_ORGANIZATIONS: SampleOrganization[] = [
  {
    id: "premier",
    name: "Premier Property Inspections",
    logo_url: "/HomeReportPro_Logo-transparent.png",
    address: "123 Business Park Dr, Miami, FL 33101",
    phone: "(305) 555-0123",
    email: "info@premierproperty.com",
    website: "www.premierproperty.com",
    primary_color: "#1e3a8a",
    secondary_color: "#3b82f6"
  },
  {
    id: "coastal",
    name: "Coastal Home Services",
    logo_url: "/HomeReportPro_Logo-transparent.png",
    address: "456 Ocean View Blvd, Tampa, FL 33602",
    phone: "(813) 555-0456",
    email: "contact@coastalhome.com",
    website: "www.coastalhome.com",
    primary_color: "#166534",
    secondary_color: "#22c55e"
  },
  {
    id: "mountain",
    name: "Mountain View Inspectors",
    logo_url: "/HomeReportPro_Logo-transparent.png",
    address: "789 Summit Ave, Denver, CO 80202",
    phone: "(303) 555-0789",
    email: "hello@mountainview.com",
    website: "www.mountainview.com",
    primary_color: "#7c3aed",
    secondary_color: "#c4b5fd"
  }
];

const SAMPLE_INSPECTORS: SampleInspector[] = [
  {
    id: "john_smith",
    name: "John Smith",
    license_number: "HI-12345",
    phone: "(305) 555-0100",
    email: "john@premierproperty.com"
  },
  {
    id: "sarah_johnson",
    name: "Sarah Johnson",
    license_number: "HI-67890",
    phone: "(813) 555-0200",
    email: "sarah@coastalhome.com"
  },
  {
    id: "mike_anderson",
    name: "Mike Anderson",
    license_number: "HI-24680",
    phone: "(303) 555-0300",
    email: "mike@mountainview.com"
  }
];

const SAMPLE_CLIENTS: SampleClient[] = [
  {
    id: "client1",
    name: "Robert & Lisa Thompson",
    address: "1234 Maple Street, Orlando, FL 32801",
    email: "robert.thompson@email.com",
    phone: "(407) 555-1234"
  },
  {
    id: "client2",
    name: "David Martinez",
    address: "5678 Oak Avenue, Jacksonville, FL 32202",
    email: "david.martinez@email.com",
    phone: "(904) 555-5678"
  },
  {
    id: "client3",
    name: "Jennifer & Mark Davis",
    address: "9012 Pine Road, Fort Lauderdale, FL 33301",
    email: "jennifer.davis@email.com",
    phone: "(954) 555-9012"
  }
];

const SAMPLE_PROPERTIES: SampleProperty[] = [
  {
    address: "1234 Maple Street, Orlando, FL 32801",
    inspection_date: "March 15, 2024",
    weather_conditions: "Clear, 75°F"
  },
  {
    address: "5678 Oak Avenue, Jacksonville, FL 32202",
    inspection_date: "March 18, 2024",
    weather_conditions: "Partly Cloudy, 78°F"
  },
  {
    address: "9012 Pine Road, Fort Lauderdale, FL 33301",
    inspection_date: "March 22, 2024",
    weather_conditions: "Sunny, 82°F"
  }
];

export const SAMPLE_REPORTS: SampleReport[] = [
  // Home Inspection Templates
  {
    id: "home-1",
    reportType: "home_inspection",
    title: "Comprehensive Home Inspection Report",
    organization: SAMPLE_ORGANIZATIONS[0],
    inspector: SAMPLE_INSPECTORS[0],
    client: SAMPLE_CLIENTS[0],
    property: SAMPLE_PROPERTIES[0],
    coverTemplate: "templateOne",
    previewTemplate: "classic",
    colorScheme: {
      primary: "#1e3a8a",
      secondary: "#3b82f6",
      accent: "#fcd34d"
    }
  },
  {
    id: "home-2",
    reportType: "home_inspection",
    title: "Home Inspection Report",
    organization: SAMPLE_ORGANIZATIONS[1],
    inspector: SAMPLE_INSPECTORS[1],
    client: SAMPLE_CLIENTS[1],
    property: SAMPLE_PROPERTIES[1],
    coverTemplate: "templateFive",
    previewTemplate: "modern",
    colorScheme: {
      primary: "#166534",
      secondary: "#22c55e",
      accent: "#d9f99d"
    }
  },
  {
    id: "home-3",
    reportType: "home_inspection",
    title: "Residential Property Inspection",
    organization: SAMPLE_ORGANIZATIONS[2],
    inspector: SAMPLE_INSPECTORS[2],
    client: SAMPLE_CLIENTS[2],
    property: SAMPLE_PROPERTIES[2],
    coverTemplate: "templateNine",
    previewTemplate: "minimal",
    colorScheme: {
      primary: "#7c3aed",
      secondary: "#c4b5fd",
      accent: "#f9a8d4"
    }
  },
  // Wind Mitigation Templates
  {
    id: "wind-1",
    reportType: "wind_mitigation",
    title: "Uniform Mitigation Verification",
    organization: SAMPLE_ORGANIZATIONS[0],
    inspector: SAMPLE_INSPECTORS[0],
    client: SAMPLE_CLIENTS[0],
    property: SAMPLE_PROPERTIES[0],
    coverTemplate: "templateThree",
    previewTemplate: "classic",
    colorScheme: {
      primary: "#f97316",
      secondary: "#fb923c",
      accent: "#f43f5e"
    }
  },
  {
    id: "wind-2",
    reportType: "fl_wind_mitigation_oir_b1_1802",
    title: "Florida Wind Mitigation Report",
    organization: SAMPLE_ORGANIZATIONS[1],
    inspector: SAMPLE_INSPECTORS[1],
    client: SAMPLE_CLIENTS[1],
    property: SAMPLE_PROPERTIES[1],
    coverTemplate: "templateSeven",
    previewTemplate: "modern",
    colorScheme: {
      primary: "#be123c",
      secondary: "#fda4af",
      accent: "#f87171"
    }
  },
  // 4-Point Inspection
  {
    id: "fourpoint-1",
    reportType: "fl_four_point_citizens",
    title: "Four Point Inspection Report",
    organization: SAMPLE_ORGANIZATIONS[2],
    inspector: SAMPLE_INSPECTORS[2],
    client: SAMPLE_CLIENTS[2],
    property: SAMPLE_PROPERTIES[2],
    coverTemplate: "templateEleven",
    previewTemplate: "classic",
    colorScheme: {
      primary: "#0f172a",
      secondary: "#334155",
      accent: "#64748b"
    }
  },
  // Wildfire Assessment
  {
    id: "wildfire-1",
    reportType: "ca_wildfire_defensible_space",
    title: "Wildfire Defensible Space Assessment",
    organization: SAMPLE_ORGANIZATIONS[0],
    inspector: SAMPLE_INSPECTORS[0],
    client: SAMPLE_CLIENTS[0],
    property: { ...SAMPLE_PROPERTIES[0], address: "1234 Forest Lane, Sacramento, CA 95814" },
    coverTemplate: "templateFifteen",
    previewTemplate: "modern",
    colorScheme: {
      primary: "#f97316",
      secondary: "#fb923c",
      accent: "#fed7aa"
    }
  },
  // Roof Certification
  {
    id: "roof-1",
    reportType: "roof_certification_nationwide",
    title: "Roof Certification Report",
    organization: SAMPLE_ORGANIZATIONS[1],
    inspector: SAMPLE_INSPECTORS[1],
    client: SAMPLE_CLIENTS[1],
    property: SAMPLE_PROPERTIES[1],
    coverTemplate: "templateSix",
    previewTemplate: "minimal",
    colorScheme: {
      primary: "#1e40af",
      secondary: "#60a5fa",
      accent: "#dbeafe"
    }
  }
];

export const getReportsByType = (reportType: Report["reportType"]) => {
  return SAMPLE_REPORTS.filter(report => report.reportType === reportType);
};

export const getAllReportTypes = () => {
  return Array.from(new Set(SAMPLE_REPORTS.map(report => report.reportType)));
};