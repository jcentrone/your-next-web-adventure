import React from "react";
import {CoverTemplateProps} from "./types";
import { formatShortDate } from "../../utils/formatDate";

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
                                                             colorScheme,
                                                         }) => {
    const primaryColor = colorScheme ? `hsl(${colorScheme.primary})` : 'hsl(210 100% 50%)';
    const secondaryColor = colorScheme ? `hsl(${colorScheme.secondary})` : 'hsl(210 100% 40%)';
    const accentColor = colorScheme ? `hsl(${colorScheme.accent})` : 'hsl(210 100% 60%)';
    const primarySoft = colorScheme ? `hsl(${colorScheme.primary} / 0.1)` : 'hsl(210 100% 50% / 0.1)';

    return (
    <div className="h-full flex items-center justify-center p-6" style={{ backgroundColor: primarySoft }}>
        <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg overflow-hidden">
            {coverImage && (
                <img src={coverImage} alt="" className="w-full h-60 object-cover"/>
            )}

            <div className="p-8">
                <div className="flex items-center gap-4 mb-4">
                    {organizationLogo && <img src={organizationLogo} alt="" className="h-12 object-contain"/>}
                    <div>
                        <h1 className="text-3xl font-bold" style={{ color: primaryColor }}>{reportTitle}</h1>
                        {organizationName && <p className="text-sm" style={{ color: secondaryColor }}>{organizationName}</p>}
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="border rounded-lg p-4" style={{ borderColor: primaryColor }}>
                        <h2 className="font-semibold mb-2" style={{ color: accentColor }}>Inspector</h2>
                        {inspectorName && <p>Name: {inspectorName}</p>}
                        {inspectorLicenseNumber && <p>License: {inspectorLicenseNumber}</p>}
                        {inspectorPhone && <p>Phone: {inspectorPhone}</p>}
                        {inspectorEmail && <p>Email: {inspectorEmail}</p>}
                    </div>
                    <div className="border rounded-lg p-4" style={{ borderColor: primaryColor }}>
                        <h2 className="font-semibold mb-2" style={{ color: accentColor }}>Client</h2>
                        {clientName && <p>Name: {clientName}</p>}
                        {clientAddress && <p>Address: {clientAddress}</p>}
                        {clientPhone && <p>Phone: {clientPhone}</p>}
                        {clientEmail && <p>Email: {clientEmail}</p>}
                    </div>
                </div>

                <div className="mt-6 text-sm" style={{ color: secondaryColor }}>
                    {inspectionDate && <p>Inspection Date: {formatShortDate(inspectionDate)}</p>}
                    {weatherConditions && <p>Weather: {weatherConditions}</p>}
                </div>

                <div className="mt-6 text-sm" style={{ color: secondaryColor }}>
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
};

export default CoverTemplateFour;
