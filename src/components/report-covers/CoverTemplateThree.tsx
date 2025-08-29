import React from "react";
import {CoverTemplateProps} from "./types";

const CoverTemplateThree: React.FC<CoverTemplateProps> = ({
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
    <div className="grid md:grid-cols-2 min-h-screen">
        <div className="h-64 md:h-auto">
            {coverImage ? (
                <img src={coverImage} alt="" className="w-full h-full object-cover"/>
            ) : (
                <div className="w-full h-full bg-gray-200"/>
            )}
        </div>

        <div className="bg-slate-900 text-white flex flex-col p-8 md:p-12">
            <div className="flex items-center gap-4 mb-6">
                {organizationLogo && <img src={organizationLogo} alt="" className="h-12 object-contain"/>}
                <div>
                    <h1 className="text-3xl font-bold">{reportTitle}</h1>
                    {organizationName && <p className="text-sm opacity-90">{organizationName}</p>}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white/10 rounded p-4">
                    <h2 className="font-semibold mb-2">Inspector</h2>
                    {inspectorName && <p>Name: {inspectorName}</p>}
                    {inspectorLicenseNumber && <p>License: {inspectorLicenseNumber}</p>}
                    {inspectorPhone && <p>Phone: {inspectorPhone}</p>}
                    {inspectorEmail && <p>Email: {inspectorEmail}</p>}
                </div>
                <div className="bg-white/10 rounded p-4">
                    <h2 className="font-semibold mb-2">Client</h2>
                    {clientName && <p>Name: {clientName}</p>}
                    {clientAddress && <p>Address: {clientAddress}</p>}
                    {clientPhone && <p>Phone: {clientPhone}</p>}
                    {clientEmail && <p>Email: {clientEmail}</p>}
                </div>
            </div>

            <div className="mt-6 text-sm">
                {inspectionDate && <p>Inspection Date: {inspectionDate}</p>}
                {weatherConditions && <p>Weather: {weatherConditions}</p>}
            </div>

            <div className="mt-auto pt-8 text-sm opacity-90">
                {organizationAddress && <p>{organizationAddress}</p>}
                {(organizationPhone || organizationEmail || organizationWebsite) && (
                    <p className="mt-1">
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

export default CoverTemplateThree;
