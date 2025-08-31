import React from "react";
import {CoverTemplateProps} from "./types";
import {formatShortDate} from "../../utils/formatDate";

// Geometric template with layered decorations (behind content)
const CoverTemplateSix: React.FC<CoverTemplateProps> = ({
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
    const primaryColor = colorScheme ? `hsl(${colorScheme.primary})` : "hsl(24 85% 55%)";
    const secondaryColor = colorScheme ? `hsl(${colorScheme.secondary})` : "hsl(24 85% 45%)";
    const accentColor = colorScheme ? `hsl(${colorScheme.accent})` : "hsl(24 85% 65%)";

    return (
        <div className="h-full flex flex-col text-white relative" style={{backgroundColor: primaryColor}}>
            {/* DECORATION LAYER — now behind content */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                {/* corner diamonds */}
                <div className="absolute w-64 h-64 bg-white/10 rotate-45 -left-16 -top-16"/>
                <div className="absolute w-48 h-48 bg-white/10 rotate-45 -left-24 top-96"/>
                <div className="absolute w-32 h-32 bg-white/10 rotate-45 left-10 -bottom-10"/>

                {/* circular ring */}
                <div className="absolute -right-20 top-60 w-72 h-72 rounded-full border-[14px] border-white/10"/>

                {/* diagonal ribbon (subtle) */}
                <div
                    className="absolute right-[-10%] bottom-[-6%] w-[55%] h-40"
                    style={{
                        backgroundColor: "rgba(255,255,255,0.1)",
                        clipPath: "polygon(0 100%, 100% 0, 100% 100%)",
                    }}
                />

                {/* dotted pattern on left half */}
                <div
                    className="absolute left-0 top-0 w-1/2 h-full opacity-20"
                    style={{
                        backgroundImage:
                            "radial-gradient(rgba(255,255,255,0.20) 1px, transparent 1px)",
                        backgroundSize: "12px 12px",
                    }}
                />
            </div>

            {/* CONTENT LAYER */}
            <div className="relative z-10 flex-1 p-10 flex flex-col items-center text-center">
                {coverImage && (
                    <img
                        src={coverImage}
                        alt=""
                        className="w-full max-h-64 object-cover rounded border-4 border-white/20 shadow-lg"
                    />
                )}

                <h1 className="mt-6 text-4xl font-bold drop-shadow-lg">{reportTitle}</h1>

                {organizationLogo && (
                    <img
                        src={organizationLogo}
                        alt=""
                        className="h-16 mt-4 object-contain bg-white/10 p-2 rounded"
                    />
                )}

                <div className="mt-2 text-sm space-y-1">
                    {organizationName && <p className="font-semibold">{organizationName}</p>}
                    {organizationAddress && <p>{organizationAddress}</p>}
                    {organizationPhone && <p>{organizationPhone}</p>}
                    {organizationEmail && <p>{organizationEmail}</p>}
                    {organizationWebsite && <p>{organizationWebsite}</p>}
                </div>
            </div>

            {/* INFO STRIP */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8" style={{backgroundColor: secondaryColor}}>
                <div>
                    <h2 className="font-semibold mb-2" style={{color: accentColor}}>Inspector</h2>
                    {inspectorName && <p>Name: {inspectorName}</p>}
                    {inspectorLicenseNumber && <p>License: {inspectorLicenseNumber}</p>}
                    {inspectorPhone && <p>Phone: {inspectorPhone}</p>}
                    {inspectorEmail && <p>Email: {inspectorEmail}</p>}
                </div>
                <div>
                    <h2 className="font-semibold mb-2" style={{color: accentColor}}>Client</h2>
                    {clientName && <p>Name: {clientName}</p>}
                    {clientAddress && <p>Address: {clientAddress}</p>}
                    {clientPhone && <p>Phone: {clientPhone}</p>}
                    {clientEmail && <p>Email: {clientEmail}</p>}
                </div>
            </div>

            <div className="text-sm text-center p-4" style={{backgroundColor: accentColor}}>
                {inspectionDate && <p>Inspection Date: {formatShortDate(inspectionDate)}</p>}
                {weatherConditions && <p>Weather: {weatherConditions}</p>}
            </div>
        </div>
    );
};

export default CoverTemplateSix;
