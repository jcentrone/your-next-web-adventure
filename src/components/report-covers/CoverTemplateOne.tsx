import React from "react";
import {CoverTemplateProps} from "./types";
import {formatShortDate} from "../../utils/formatDate";

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
                                                            colorScheme,
                                                        }) => {
    // New defaults: Midnight Navy base with Coral accent
    const primaryColor = `hsl(${colorScheme?.primary ?? "222 73% 24%"})`;   // navy
    const secondaryColor = `hsl(${colorScheme?.secondary ?? "222 73% 18%"})`; // deeper navy (kept if you want to use it elsewhere)
    const accentColor = `hsl(${colorScheme?.accent ?? "17 89% 55%"})`;       // coral

    return (
        <div
            className="h-full flex flex-col p-10"
            style={{background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`, color: "white"}}
        >
            {/* Top section */}
            <div className="flex flex-col items-center text-center space-y-6">
                {coverImage && (
                    <img
                        src={coverImage}
                        alt=""
                        className="w-full max-h-64 object-cover rounded border-4 border-white/20"
                    />
                )}
                <h1 className="text-4xl font-bold text-white drop-shadow-lg">{reportTitle}</h1>
                {organizationLogo && (
                    <img src={organizationLogo} alt="" className="h-20 object-contain bg-white/10 p-2 rounded"/>
                )}
                <div className="text-sm text-white/90">
                    {organizationName && <p className="font-semibold text-white">{organizationName}</p>}
                    {organizationAddress && <p>{organizationAddress}</p>}
                    {organizationPhone && <p>{organizationPhone}</p>}
                    {organizationEmail && <p>{organizationEmail}</p>}
                    {organizationWebsite && <p>{organizationWebsite}</p>}
                </div>
            </div>

            {/* Bottom section */}
            <div className="mt-[120px] w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl text-left text-sm mx-auto">
                    <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                        <h2 className="font-semibold mb-2 text-white">Inspector</h2>
                        {inspectorName && <p className="text-white/90">Name: {inspectorName}</p>}
                        {inspectorLicenseNumber && <p className="text-white/90">License: {inspectorLicenseNumber}</p>}
                        {inspectorPhone && <p className="text-white/90">Phone: {inspectorPhone}</p>}
                        {inspectorEmail && <p className="text-white/90">Email: {inspectorEmail}</p>}
                    </div>
                    <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                        <h2 className="font-semibold mb-2 text-white">Client</h2>
                        {clientName && <p className="text-white/90">Name: {clientName}</p>}
                        {clientAddress && <p className="text-white/90">Address: {clientAddress}</p>}
                        {clientPhone && <p className="text-white/90">Phone: {clientPhone}</p>}
                        {clientEmail && <p className="text-white/90">Email: {clientEmail}</p>}
                    </div>
                </div>

                <div className="text-sm text-center mt-6 bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                    {inspectionDate &&
                        <p className="text-white/90">Inspection Date: {formatShortDate(inspectionDate)}</p>}
                    {weatherConditions && <p className="text-white/90">Weather: {weatherConditions}</p>}
                </div>
            </div>
        </div>
    );
};

export default CoverTemplateOne;
