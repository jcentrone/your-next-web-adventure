import React from "react";
import { cn } from "@/lib/utils";
import {CoverTemplateProps} from "./types";
import {formatShortDate} from "../../utils/formatDate";

/** ========= Hexagon motif ========= */
const DEFAULT_SCHEME = {
    primary: "190 90% 32%",
    secondary: "195 85% 28%",
    accent: "38 95% 55%",
};

const CoverTemplateTwelve: React.FC<CoverTemplateProps> = ({
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

    const hexClip = "polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)";

    return (
        <div
            className={cn('h-full flex flex-col relative', className)}
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
            {/* floating hexes */}
            <div className="pointer-events-none absolute -right-10 top-8 w-40 h-40 opacity-30"
                 style={{clipPath: hexClip, background: `hsl(var(--accent) / 0.4)`}}/>
            <div className="pointer-events-none absolute right-24 top-24 w-28 h-28 opacity-20"
                 style={{clipPath: hexClip, background: `hsl(var(--primary) / 0.4)`}}/>

            {/* Header */}
            <header className="px-6 pt-10 flex flex-col items-center text-center">
                {organizationLogo && <img src={organizationLogo} alt="" className="h-16 md:h-20 mb-4 object-contain"/>}
                <h1 className="text-3xl md:text-5xl font-bold">{reportTitle}</h1>
            </header>

            {/* Hex image */}
            <section className="px-6 mt-6 flex justify-center">
                <div className="relative w-[320px] h-[280px] md:w-[380px] md:h-[330px]" style={{clipPath: hexClip}}>
                    {coverImage ? (
                        <img src={coverImage} alt="" className="w-full h-full object-cover"/>
                    ) : (
                        <div className="w-full h-full bg-black/20"/>
                    )}
                    <div className="absolute inset-0" style={{backgroundColor: `hsl(var(--secondary) / 0.35)`}}/>
                    {/* hex border ring */}
                    <div className="absolute -inset-2" style={{
                        clipPath: hexClip,
                        background: "transparent",
                        boxShadow: "0 0 0 10px rgba(255,255,255,0.2) inset"
                    }}/>
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

export default CoverTemplateTwelve;
