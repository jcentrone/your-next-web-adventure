import React from "react";
import { CoverTemplateProps } from "./types";

const CoverTemplateOne: React.FC<CoverTemplateProps> = ({
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
}) => (
  <div className="flex flex-col items-center text-center p-10 space-y-6">
    {coverImage && (
      <img
        src={coverImage}
        alt=""
        className="w-full max-h-64 object-cover rounded"
      />
    )}
    <h1 className="text-4xl font-bold">{reportTitle}</h1>
    {organizationLogo && (
      <img
        src={organizationLogo}
        alt=""
        className="h-20 object-contain"
      />
    )}
    <div className="text-sm">
      {organizationName && <p className="font-semibold">{organizationName}</p>}
      {organizationAddress && <p>{organizationAddress}</p>}
      {organizationPhone && <p>{organizationPhone}</p>}
      {organizationEmail && <p>{organizationEmail}</p>}
      {organizationWebsite && <p>{organizationWebsite}</p>}
    </div>
    <div className="grid grid-cols-2 gap-8 w-full max-w-3xl text-left text-sm">
      <div>
        <h2 className="font-semibold mb-2 text-center">Inspector</h2>
        {inspectorName && <p>Name: {inspectorName}</p>}
        {inspectorLicenseNumber && <p>License: {inspectorLicenseNumber}</p>}
        {inspectorPhone && <p>Phone: {inspectorPhone}</p>}
        {inspectorEmail && <p>Email: {inspectorEmail}</p>}
      </div>
      <div>
        <h2 className="font-semibold mb-2 text-center">Client</h2>
        {clientName && <p>Name: {clientName}</p>}
        {clientAddress && <p>Address: {clientAddress}</p>}
        {clientPhone && <p>Phone: {clientPhone}</p>}
        {clientEmail && <p>Email: {clientEmail}</p>}
      </div>
    </div>
    <div className="text-sm">
      {inspectionDate && <p>Inspection Date: {inspectionDate}</p>}
      {weatherConditions && <p>Weather: {weatherConditions}</p>}
    </div>
  clientName,
  coverImage,
  organizationName,
}) => (
  <div className="flex flex-col items-center justify-center text-center p-10">
    {coverImage && <img src={coverImage} alt="" className="max-h-96 mb-6 object-contain rounded" />}
    <h1 className="text-4xl font-bold mb-2">{reportTitle}</h1>
    {clientName && <p className="text-xl mb-4">{clientName}</p>}
    {organizationName && <p className="text-sm text-muted-foreground">{organizationName}</p>}
  </div>
);

export default CoverTemplateOne;
