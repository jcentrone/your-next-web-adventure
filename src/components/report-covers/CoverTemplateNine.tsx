import React from "react";
import { CoverTemplateProps } from "./types";
import { formatShortDate } from "../../utils/formatDate";

// Free-flow template with wave overlays

const CoverTemplateNine: React.FC<CoverTemplateProps> = ({
  reportTitle,
  coverImage,
  organizationName,
  organizationAddress,
  organizationPhone,
  organizationEmail,
  organizationWebsite,
  organizationLogo,
  inspectorName,
  inspectorLicenseNumber,
  inspectorPhone,
  inspectorEmail,
  clientName,
  clientAddress,
  clientEmail,
  clientPhone,
  inspectionDate,
  weatherConditions,
  colorScheme,
}) => {
  const primaryColor = colorScheme ? `hsl(${colorScheme.primary})` : "hsl(190 80% 40%)";
  const secondaryColor = colorScheme ? `hsl(${colorScheme.secondary})` : "hsl(190 80% 30%)";
  const accentColor = colorScheme ? `hsl(${colorScheme.accent})` : "hsl(190 80% 50%)";

  return (
    <div className="h-full flex flex-col text-white" style={{ backgroundColor: primaryColor }}>
      <div className="relative flex-1 p-10 flex flex-col items-center text-center overflow-hidden">
        <svg className="absolute top-0 left-0 w-full" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path fill={secondaryColor} d="M0,32L48,58.7C96,85,192,139,288,165.3C384,192,480,192,576,186.7C672,181,768,171,864,165.3C960,160,1056,160,1152,154.7C1248,149,1344,139,1392,133.3L1440,128L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z" />
        </svg>
        <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path fill={secondaryColor} d="M0,288L48,272C96,256,192,224,288,197.3C384,171,480,149,576,133.3C672,117,768,107,864,128C960,149,1056,203,1152,229.3C1248,256,1344,256,1392,256L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" />
        </svg>
        {coverImage && (
          <img
            src={coverImage}
            alt=""
            className="w-full max-h-64 object-cover rounded border-4 border-white/20 z-10"
          />
        )}
        <h1 className="mt-6 text-4xl font-bold drop-shadow-lg z-10">{reportTitle}</h1>
        {organizationLogo && (
          <img src={organizationLogo} alt="" className="h-16 mt-4 object-contain bg-white/10 p-2 rounded z-10" />
        )}
        <div className="mt-2 text-sm space-y-1 z-10">
          {organizationName && <p className="font-semibold">{organizationName}</p>}
          {organizationAddress && <p>{organizationAddress}</p>}
          {organizationPhone && <p>{organizationPhone}</p>}
          {organizationEmail && <p>{organizationEmail}</p>}
          {organizationWebsite && <p>{organizationWebsite}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8" style={{ backgroundColor: secondaryColor }}>
        <div>
          <h2 className="font-semibold mb-2" style={{ color: accentColor }}>Inspector</h2>
          {inspectorName && <p>Name: {inspectorName}</p>}
          {inspectorLicenseNumber && <p>License: {inspectorLicenseNumber}</p>}
          {inspectorPhone && <p>Phone: {inspectorPhone}</p>}
          {inspectorEmail && <p>Email: {inspectorEmail}</p>}
        </div>
        <div>
          <h2 className="font-semibold mb-2" style={{ color: accentColor }}>Client</h2>
          {clientName && <p>Name: {clientName}</p>}
          {clientAddress && <p>Address: {clientAddress}</p>}
          {clientPhone && <p>Phone: {clientPhone}</p>}
          {clientEmail && <p>Email: {clientEmail}</p>}
        </div>
      </div>

      <div className="text-sm text-center p-4" style={{ backgroundColor: accentColor }}>
        {inspectionDate && <p>Inspection Date: {formatShortDate(inspectionDate)}</p>}
        {weatherConditions && <p>Weather: {weatherConditions}</p>}
      </div>
    </div>
  );
};

export default CoverTemplateNine;
