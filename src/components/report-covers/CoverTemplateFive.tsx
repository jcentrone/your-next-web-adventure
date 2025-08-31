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
                                                             colorScheme,
                                                         }) => {
    const primaryColor = colorScheme ? `hsl(${colorScheme.primary})` : 'hsl(210 100% 50%)';
    const secondaryColor = colorScheme ? `hsl(${colorScheme.secondary})` : 'hsl(210 100% 40%)';
    const accentColor = colorScheme ? `hsl(${colorScheme.accent})` : 'hsl(210 100% 60%)';
    const primarySoft = colorScheme ? `hsl(${colorScheme.primary} / 0.05)` : 'hsl(210 100% 50% / 0.05)';

    return (
    <div className="h-full grid lg:grid-cols-[320px_1fr]">
        <aside
            className="text-white p-8 flex flex-col items-center justify-center"
            style={{ background: `linear-gradient(180deg, ${primaryColor}, ${secondaryColor})` }}
        >
            {organizationLogo && <img src={organizationLogo} alt="" className="h-24 mb-4 object-contain"/>}
            <h2 className="text-xl font-semibold text-center" style={{ color: 'white' }}>{organizationName}</h2>
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
                <h1 className="text-3xl font-bold" style={{ color: primaryColor }}>{reportTitle}</h1>
                <div className="grid md:grid-cols-1 gap-6">
                    <div className="border rounded p-4" style={{ backgroundColor: primarySoft, borderColor: primaryColor }}>
                        <h3 className="font-semibold mb-2" style={{ color: accentColor }}>Inspector</h3>
                        {inspectorName && <p>Name: {inspectorName}</p>}
                        {inspectorLicenseNumber && <p>License: {inspectorLicenseNumber}</p>}
                        {inspectorPhone && <p>Phone: {inspectorPhone}</p>}
                        {inspectorEmail && <p>Email: {inspectorEmail}</p>}
                    </div>
                    <div className="border rounded p-4" style={{ backgroundColor: primarySoft, borderColor: primaryColor }}>
                        <h3 className="font-semibold mb-2" style={{ color: accentColor }}>Client</h3>
                        {clientName && <p>Name: {clientName}</p>}
                        {clientAddress && <p>Address: {clientAddress}</p>}
                        {clientPhone && <p>Phone: {clientPhone}</p>}
                        {clientEmail && <p>Email: {clientEmail}</p>}
                    </div>
                </div>

                <div className="text-sm" style={{ color: secondaryColor }}>
                    {inspectionDate && <p>Inspection Date: {formatShortDate(inspectionDate)}</p>}
                    {weatherConditions && <p>Weather: {weatherConditions}</p>}
                </div>
            </div>
        </main>
    </div>
    );
};

export default CoverTemplateFive;
