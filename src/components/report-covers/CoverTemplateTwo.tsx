import React from "react";
import {CoverTemplateProps} from "./types";
import {formatShortDate} from "../../utils/formatDate";

/** ========= Template 2 (reworked): compact banner image, full-page layout ========= */
// Default palette (HSL *without* the `hsl()` wrapper)
const DEFAULT_SCHEME = {
    // teal → deep cyan gradient
    primary: "190 90% 32%",   // teal/cyan
    secondary: "195 85% 28%", // deeper cyan
    accent: "38 95% 55%",     // warm amber for headings
};

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
                                                            colorScheme,
                                                        }) => {
    // Merge provided colors with defaults
    const scheme = {
        primary: colorScheme?.primary ?? DEFAULT_SCHEME.primary,
        secondary: colorScheme?.secondary ?? DEFAULT_SCHEME.secondary,
        accent: colorScheme?.accent ?? DEFAULT_SCHEME.accent,
    };

    return (
        <div
            className="h-full flex flex-col"
            style={
                {
                    // expose as CSS vars for consistent usage
                    ["--primary" as any]: scheme.primary,
                    ["--secondary" as any]: scheme.secondary,
                    ["--accent" as any]: scheme.accent,
                    background: `linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))`,
                    color: "white",
                } as React.CSSProperties
            }
        >
            {/* Header: logo + title */}
            <header className="px-6 pt-10 flex flex-col items-center text-center">
                {organizationLogo && (
                    <img src={organizationLogo} alt="" className="h-16 md:h-20 mb-4 object-contain"/>
                )}
                <h1 className="text-3xl md:text-5xl font-bold">{reportTitle}</h1>
            </header>

            {/* Compact banner image (smaller than full-bleed) */}
            <section className="px-6 mt-6">
                <div className="relative w-full h-40 md:h-56 rounded-xl overflow-hidden shadow-lg">
                    {coverImage ? (
                        <img src={coverImage} alt="" className="w-full h-full object-cover"/>
                    ) : (
                        <div className="w-full h-full bg-black/20"/>
                    )}
                    {/* Subtle overlay to normalize poor images */}
                    <div
                        className="absolute inset-0"
                        style={{backgroundColor: `hsl(var(--secondary) / 0.35)`}}
                    />
                </div>
            </section>

            {/* Main content grows to fill page height so no large blank area at bottom */}
            <main className="flex-1 px-6 py-8 flex flex-col items-center">
                <div className="grid gap-6 md:grid-cols-2 w-full max-w-5xl">
                    <div className="bg-white/10 rounded-lg p-5">
                        <h2
                            className="font-semibold mb-2 uppercase tracking-wide"
                            style={{color: `hsl(var(--accent))`}}
                        >
                            Inspector
                        </h2>
                        {inspectorName && <p>Name: {inspectorName}</p>}
                        {inspectorLicenseNumber && <p>License: {inspectorLicenseNumber}</p>}
                        {inspectorPhone && <p>Phone: {inspectorPhone}</p>}
                        {inspectorEmail && <p>Email: {inspectorEmail}</p>}
                    </div>
                    <div className="bg-white/10 rounded-lg p-5">
                        <h2
                            className="font-semibold mb-2 uppercase tracking-wide"
                            style={{color: `hsl(var(--accent))`}}
                        >
                            Client
                        </h2>
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
            </main>

            {/* Footer: org details pinned near bottom */}
            <footer className="px-6 pb-10 text-center text-sm">
                {organizationName && <p className="font-semibold">{organizationName}</p>}
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
            </footer>
        </div>
    );
};

export default CoverTemplateTwo;
