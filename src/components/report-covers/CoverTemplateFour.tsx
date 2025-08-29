import React from "react";
import {CoverTemplateProps} from "./types";

const CoverTemplateFour: React.FC<CoverTemplateProps> = ({
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg overflow-hidden">
            {coverImage && (
                <img src={coverImage} alt="" className="w-full h-60 object-cover"/>
            )}

            <div className="p-8">
                <div className="flex items-center gap-4 mb-4">
                    {organizationLogo && <img src={organizationLogo} alt="" className="h-12 object-contain"/>}
                    <div>
                        <h1 className="text-3xl font-bold">{reportTitle}</h1>
                        {organizationName && <p className="text-sm text-gray-500">{organizationName}</p>}
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="border rounded-lg p-4">
                        <h2 className="font-semibold mb-2 text-gray-700">Inspector</h2>
                        {inspectorName && <p>Name: {inspectorName}</p>}
                        {inspectorLicenseNumber && <p>License: {inspectorLicenseNumber}</p>}
                        {inspectorPhone && <p>Phone: {inspectorPhone}</p>}
                        {inspectorEmail && <p>Email: {inspectorEmail}</p>}
                    </div>
                    <div className="border rounded-lg p-4">
                        <h2 className="font-semibold mb-2 text-gray-700">Client</h2>
                        {clientName && <p>Name: {clientName}</p>}
                        {clientAddress && <p>Address: {clientAddress}</p>}
                        {clientPhone && <p>Phone: {clientPhone}</p>}
                        {clientEmail && <p>Email: {clientEmail}</p>}
                    </div>
                </div>

                <div className="mt-6 text-sm text-gray-600">
                    {inspectionDate && <p>Inspection Date: {inspectionDate}</p>}
                    {weatherConditions && <p>Weather: {weatherConditions}</p>}
                </div>

                <div className="mt-6 text-sm text-gray-700">
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
    </div>
);

export default CoverTemplateFour;
