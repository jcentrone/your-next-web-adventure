export interface CoverTemplateProps {
  className?: string;
  organizationName?: string;
  organizationAddress?: string;
  organizationPhone?: string;
  organizationEmail?: string;
  organizationWebsite?: string;
  organizationLogo?: string;
  inspectorName?: string;
  inspectorLicenseNumber?: string;
  inspectorPhone?: string;
  inspectorEmail?: string;
  clientName?: string;
  clientAddress?: string;
  clientEmail?: string;
  clientPhone?: string;
  inspectionDate?: string;
  weatherConditions?: string;
  coverImage?: string;
  reportTitle: string;
  colorScheme?: {
    primary: string;
    secondary: string;
    accent: string;
  };
}
