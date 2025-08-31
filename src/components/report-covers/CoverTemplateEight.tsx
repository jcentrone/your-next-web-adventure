import React from "react";
import {CoverTemplateProps} from "./types";
import {formatShortDate} from "../../utils/formatDate";

// Geometric template with diagonal stripes

const CoverTemplateEight: React.FC<CoverTemplateProps> = ({
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
    const primaryColor = colorScheme ? `hsl(${colorScheme.primary})` : "hsl(340 80% 50%)";
    const secondaryColor = colorScheme ? `hsl(${colorScheme.secondary})` : "hsl(340 80% 40%)";
    const accentColor = colorScheme ? `hsl(${colorScheme.accent})` : "hsl(340 80% 60%)";

    return (
        <div className="h-full flex flex-col text-white" style={{backgroundColor: primaryColor}}>
            <div className="relative flex-1 p-10 flex flex-col items-center text-center">
                <div
                    className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage:
                            "repeating-linear-gradient(45deg, white 0, white 20px, transparent 20px, transparent 40px)",
                    }}
                />
                {coverImage && (
                    <img
                        src={coverImage}
                        alt=""
                        className="w-full max-h-64 object-cover rounded border-4 border-white/20"
                    />
                )}
                <div className={"flex flex-col relative inset-0 z-20"}>

                    <h1 className="z-20 mt-6 text-4xl font-bold drop-shadow-lg">{reportTitle}</h1>
                    {organizationLogo && (
                        <img src={organizationLogo} alt=""
                             className="w-fit mx-auto h-16 mt-4 object-contain bg-white/100 p-2 rounded"/>
                    )}
                    <div className="mt-2 text-sm space-y-1">
                        {organizationName && <p className="font-semibold">{organizationName}</p>}
                        {organizationAddress && <p>{organizationAddress}</p>}
                        {organizationPhone && <p>{organizationPhone}</p>}
                        {organizationEmail && <p>{organizationEmail}</p>}
                        {organizationWebsite && <p>{organizationWebsite}</p>}
                    </div>
                </div>
            </div>

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

export default CoverTemplateEight;
