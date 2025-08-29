import React from "react";
import { CoverTemplateProps } from "./types";
import { formatShortDate } from "../../utils/formatDate";

/** ========= Template 2: Full-bleed background with overlay ========= */
const CoverTemplateTwo: React.FC<CoverTemplateProps> = ({
  reportTitle,
  coverImage,
  organizationLogo,
  organizationName,
  organizationAddress,
  organizationPhone,
  organizationEmail,
  organizationWebsite,
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
}) => (
  <div
    className="relative w-full h-screen"
    style={{
      backgroundImage: coverImage ? `url(${coverImage})` : undefined,
      backgroundSize: "cover",
      backgroundPosition: "center",
    }}
  >
    <div className="absolute inset-0 bg-black/60" />
    <div className="relative z-10 h-full flex flex-col items-center justify-center text-white px-6">
      {organizationLogo && (
        <img src={organizationLogo} alt="" className="h-20 mb-4 object-contain" />
      )}
      <h1 className="text-4xl md:text-5xl font-bold text-center">{reportTitle}</h1>

      <div className="mt-6 grid gap-6 md:grid-cols-2 w-full max-w-4xl">
        <div className="bg-white/10 rounded-lg p-4">
          <h2 className="font-semibold mb-2 uppercase tracking-wide">Inspector</h2>
          {inspectorName && <p>Name: {inspectorName}</p>}
          {inspectorLicenseNumber && <p>License: {inspectorLicenseNumber}</p>}
          {inspectorPhone && <p>Phone: {inspectorPhone}</p>}
          {inspectorEmail && <p>Email: {inspectorEmail}</p>}
        </div>
        <div className="bg-white/10 rounded-lg p-4">
          <h2 className="font-semibold mb-2 uppercase tracking-wide">Client</h2>
          {clientName && <p>Name: {clientName}</p>}
          {clientAddress && <p>Address: {clientAddress}</p>}
          {clientPhone && <p>Phone: {clientPhone}</p>}
          {clientEmail && <p>Email: {clientEmail}</p>}
        </div>
      </div>

      <div className="mt-6 text-sm text-center">
        {inspectionDate && <p>Inspection Date: {formatShortDate(inspectionDate)}</p>}
        {weatherConditions && <p>Weather: {weatherConditions}</p>}
      </div>

      <div className="mt-8 text-center text-sm">
        {organizationName && <p className="font-semibold">{organizationName}</p>}
        {organizationAddress && <p>{organizationAddress}</p>}
        {(organizationPhone || organizationEmail || organizationWebsite) && (
          <p>
            {organizationPhone && <span>{organizationPhone}</span>}
            {organizationPhone && (organizationEmail || organizationWebsite) && <span> • </span>}
            {organizationEmail && <span>{organizationEmail}</span>}
            {organizationEmail && organizationWebsite && <span> • </span>}
            {organizationWebsite && <span>{organizationWebsite}</span>}
          </p>
        )}
      </div>
    </div>
  </div>
);

export default CoverTemplateTwo;
