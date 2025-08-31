import React from "react";
import {CoverTemplateProps} from "./types";
import {formatShortDate} from "../../utils/formatDate";

/** ========= Template 3 (aligned to Template 2 color-structure) ========= */
// Default palette (HSL *without* the `hsl()` wrapper)
const DEFAULT_SCHEME = {
    primary: "199 89% 48%",   // teal/cyan
    secondary: "215 19% 35%", // deeper cyan
    accent: "23 92% 54%",     // warm amber
};

const CoverTemplateThree: React.FC<CoverTemplateProps & { className?: string }> = ({
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
                                                                                       className,
                                                                                   }) => {
    const year = inspectionDate ? new Date(inspectionDate).getFullYear() : undefined;

    // Merge provided colors with defaults (same as Template Two)
    const scheme = {
        primary: colorScheme?.primary ?? DEFAULT_SCHEME.primary,
        secondary: colorScheme?.secondary ?? DEFAULT_SCHEME.secondary,
        accent: colorScheme?.accent ?? DEFAULT_SCHEME.accent,
    };

    return (
        <div
            className={["h-full flex flex-col", className || ""].join(" ")}
            style={
                {
                    ["--primary" as any]: scheme.primary,
                    ["--secondary" as any]: scheme.secondary,
                    ["--accent" as any]: scheme.accent,
                    background: `linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))`,
                    color: "white",
                } as React.CSSProperties
            }
        >
            {/* Header: logo + title/brand */}
            <header className="px-6 pt-10 flex items-center gap-3">
                <div className="flex items-center gap-3">
                    {organizationLogo && (
                        <img src={organizationLogo} alt="" className="h-10 w-10 object-contain"/>
                    )}
                    {organizationName && (
                        <span className="text-sm font-semibold tracking-wide uppercase text-white/90">
              {organizationName}
            </span>
                    )}
                </div>
                <div className="ml-auto">
                    {year && (
                        <span className="px-3 py-1 rounded-full text-sm font-semibold bg-white/15">
              {year}
            </span>
                    )}
                </div>
            </header>

            {/* Title + hero image (same content layout as your previous T3, but styled like T2) */}
            <section className="px-6 mt-6 grid gap-8 md:grid-cols-[1.25fr_1fr] items-center">
                <div>
                    <h1 className="text-3xl md:text-5xl font-bold text-white drop-shadow-sm">
                        {reportTitle}
                    </h1>
                    <div className="mt-4 flex flex-wrap gap-2 text-sm">
                        {inspectionDate && (
                            <span className="px-2 py-1 rounded bg-white/15">
                Date: {formatShortDate(inspectionDate)}
              </span>
                        )}
                        {weatherConditions && (
                            <span className="px-2 py-1 rounded bg-white/15">
                Weather: {weatherConditions}
              </span>
                        )}
                        {clientAddress && (
                            <span className="px-2 py-1 rounded bg-white/15">
                Property: {clientAddress}
              </span>
                        )}
                    </div>
                </div>

                {/* Compact image card with a subtle tint overlay pulled from --secondary */}
                <div className="justify-self-end">
                    <div
                        className="relative rounded-2xl overflow-hidden shadow-xl w-[320px] h-[220px] md:w-[360px] md:h-[240px] bg-black/20">
                        {coverImage ? (
                            <img src={coverImage} alt="" className="w-full h-full object-cover"/>
                        ) : (
                            <div className="w-full h-full"/>
                        )}
                        <div
                            className="absolute inset-0"
                            style={{backgroundColor: `hsl(var(--secondary) / 0.35)`}}
                        />
                        <div className="absolute inset-0 ring-8 ring-white/20"/>
                    </div>
                </div>
            </section>

            {/* Details cards */}
            <main className="flex-1 px-6 py-8 flex flex-col items-center">
                <div className="grid gap-6 md:grid-cols-2 w-full max-w-5xl">
                    {/* Client */}
                    <div className="bg-white/10 rounded-lg p-5">
                        <h2
                            className="font-semibold mb-2 uppercase tracking-wide"
                            style={{color: `hsl(var(--accent))`}}
                        >
                            Client
                        </h2>
                        {clientName && <p className="text-white/90">Name: {clientName}</p>}
                        {clientPhone && <p className="text-white/90">Phone: {clientPhone}</p>}
                        {clientEmail && <p className="text-white/90">Email: {clientEmail}</p>}
                    </div>

                    {/* Inspector */}
                    <div className="bg-white/10 rounded-lg p-5">
                        <h2
                            className="font-semibold mb-2 uppercase tracking-wide"
                            style={{color: `hsl(var(--accent))`}}
                        >
                            Inspector
                        </h2>
                        {inspectorName && <p className="text-white/90">Name: {inspectorName}</p>}
                        {inspectorLicenseNumber && (
                            <p className="text-white/90">License: {inspectorLicenseNumber}</p>
                        )}
                        {inspectorPhone && <p className="text-white/90">Phone: {inspectorPhone}</p>}
                        {inspectorEmail && <p className="text-white/90">Email: {inspectorEmail}</p>}
                    </div>
                </div>

                <div className="mt-6 text-sm text-center">
                    {inspectionDate && <p>Inspection Date: {formatShortDate(inspectionDate)}</p>}
                    {weatherConditions && <p>Weather: {weatherConditions}</p>}
                </div>
            </main>

            {/* Footer: org details pinned near bottom (same pattern as Template Two) */}
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

export default CoverTemplateThree;
