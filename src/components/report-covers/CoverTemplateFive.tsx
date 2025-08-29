import React from "react";
import {CoverTemplateProps} from "./types";
import { formatShortDate } from "../../utils/formatDate";

const CoverTemplateFive: React.FC<CoverTemplateProps> = ({
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
    <div className="h-full grid lg:grid-cols-[320px_1fr]">
        <aside className="bg-emerald-700 text-white p-8 flex flex-col items-center justify-center">
            {organizationLogo && <img src={organizationLogo} alt="" className="h-24 mb-4 object-contain"/>}
            <h2 className="text-xl font-semibold text-center">{organizationName}</h2>
            <div className="mt-4 text-sm text-center opacity-90 space-y-1">
                {organizationAddress && <p>{organizationAddress}</p>}
                {organizationPhone && <p>{organizationPhone}</p>}
                {organizationEmail && <p>{organizationEmail}</p>}
                {organizationWebsite && <p>{organizationWebsite}</p>}
            </div>
        </aside>

        <main className="flex flex-col">
            <div className="h-64 lg:h-2/3">
                {coverImage ? (
                    <img src={coverImage} alt="" className="w-full h-full object-cover"/>
                ) : (
                    <div className="w-full h-full bg-gray-200"/>
                )}
            </div>

            <div className="p-8 grid gap-6">
                <h1 className="text-3xl font-bold">{reportTitle}</h1>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 border rounded p-4">
                        <h3 className="font-semibold mb-2">Inspector</h3>
                        {inspectorName && <p>Name: {inspectorName}</p>}
                        {inspectorLicenseNumber && <p>License: {inspectorLicenseNumber}</p>}
                        {inspectorPhone && <p>Phone: {inspectorPhone}</p>}
                        {inspectorEmail && <p>Email: {inspectorEmail}</p>}
                    </div>
                    <div className="bg-gray-50 border rounded p-4">
                        <h3 className="font-semibold mb-2">Client</h3>
                        {clientName && <p>Name: {clientName}</p>}
                        {clientAddress && <p>Address: {clientAddress}</p>}
                        {clientPhone && <p>Phone: {clientPhone}</p>}
                        {clientEmail && <p>Email: {clientEmail}</p>}
                    </div>
                </div>

                <div className="text-sm text-gray-700">
                    {inspectionDate && <p>Inspection Date: {formatShortDate(inspectionDate)}</p>}
                    {weatherConditions && <p>Weather: {weatherConditions}</p>}
                </div>
            </div>
        </main>
    </div>
);

export default CoverTemplateFive;
