import React from "react";
import { cn } from "@/lib/utils";
import {CoverTemplateProps} from "./types";
import {formatShortDate} from "../../utils/formatDate";

/** ========= Dots / Halftone variant ========= */
const DEFAULT_SCHEME = {
    primary: "190 90% 32%",
    secondary: "195 85% 28%",
    accent: "38 95% 55%",
};

const CoverTemplateThirteen: React.FC<CoverTemplateProps> = ({
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
    const scheme = {
        primary: colorScheme?.primary ?? DEFAULT_SCHEME.primary,
        secondary: colorScheme?.secondary ?? DEFAULT_SCHEME.secondary,
        accent: colorScheme?.accent ?? DEFAULT_SCHEME.accent,
    };

    return (
        <div
            className={cn('h-full flex flex-col relative overflow-hidden', className)}
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
            {/* halftone cloud on the left */}
            <div
                className="pointer-events-none absolute -left-24 top-0 bottom-0 w-[55%] opacity-30"
                style={{
                    background:
                        "radial-gradient(6px 6px at 20% 20%, rgba(255,255,255,.6) 40%, transparent 41%) 0 0/22px 22px," +
                        "radial-gradient(8px 8px at 60% 40%, rgba(255,255,255,.45) 40%, transparent 41%) 0 0/30px 30px," +
                        "radial-gradient(4px 4px at 40% 70%, rgba(255,255,255,.35) 40%, transparent 41%) 0 0/18px 18px",
                }}
            />

            {/* Header */}
            <header className="px-6 pt-10 flex items-center gap-3">
                <div className="flex items-center gap-3">
                    {organizationLogo && <img src={organizationLogo} alt="" className="h-10 w-10 object-contain"/>}
                    {organizationName && <span
                        className="text-sm font-semibold tracking-wide uppercase text-white/90">{organizationName}</span>}
                </div>
                <div className="ml-auto"/>
            </header>

            {/* Title + banner */}
            <section className="px-6 mt-6">
                <h1 className="text-3xl md:text-5xl font-bold text-white drop-shadow-sm">{reportTitle}</h1>
                <div className="relative w-full h-40 md:h-56 rounded-xl overflow-hidden shadow-lg mt-4">
                    {coverImage ? <img src={coverImage} alt="" className="w-full h-full object-cover"/> :
                        <div className="w-full h-full bg-black/20"/>}
                    <div className="absolute inset-0" style={{backgroundColor: `hsl(var(--secondary) / 0.35)`}}/>
                </div>
            </section>

            {/* Cards */}
            <main className="flex-1 px-6 py-8 flex flex-col items-center">
                <div className="grid gap-6 md:grid-cols-2 w-full max-w-5xl">
                    <div className="bg-white/10 rounded-lg p-5">
                        <h2 className="font-semibold mb-2 uppercase tracking-wide"
                            style={{color: `hsl(var(--accent))`}}>Client</h2>
                        {clientName && <p className="text-white/90">Name: {clientName}</p>}
                        {clientPhone && <p className="text-white/90">Phone: {clientPhone}</p>}
                        {clientEmail && <p className="text-white/90">Email: {clientEmail}</p>}
                    </div>
                    <div className="bg-white/10 rounded-lg p-5">
                        <h2 className="font-semibold mb-2 uppercase tracking-wide"
                            style={{color: `hsl(var(--accent))`}}>Inspector</h2>
                        {inspectorName && <p className="text-white/90">Name: {inspectorName}</p>}
                        {inspectorLicenseNumber && <p className="text-white/90">License: {inspectorLicenseNumber}</p>}
                        {inspectorPhone && <p className="text-white/90">Phone: {inspectorPhone}</p>}
                        {inspectorEmail && <p className="text-white/90">Email: {inspectorEmail}</p>}
                    </div>
                </div>

                <div className="mt-6 text-sm text-center">
                    {inspectionDate && <p>Inspection Date: {formatShortDate(inspectionDate)}</p>}
                    {weatherConditions && <p>Weather: {weatherConditions}</p>}
                </div>
            </main>

            {/* Footer */}
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

export default CoverTemplateThirteen;
