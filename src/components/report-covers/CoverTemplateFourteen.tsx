import React from "react";
import { cn } from "@/lib/utils";
import {CoverTemplateProps} from "./types";
import {formatShortDate} from "../../utils/formatDate";

/** ========= Geometric shards ========= */
const DEFAULT_SCHEME = {
    primary: "190 90% 32%",
    secondary: "195 85% 28%",
    accent: "38 95% 55%",
};

const CoverTemplateFourteen: React.FC<CoverTemplateProps> = ({
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
            {/* angular accents */}
            <div className="pointer-events-none absolute -right-24 -top-10 w-80 h-80 rotate-6"
                 style={{
                     background: `hsl(var(--accent) / 0.35)`,
                     clipPath: "polygon(0 0, 100% 10%, 80% 100%, 0% 80%)"
                 }}/>
            <div className="pointer-events-none absolute right-20 -top-8 w-56 h-56 rotate-12"
                 style={{
                     background: `hsl(var(--primary) / 0.35)`,
                     clipPath: "polygon(10% 0, 100% 0, 70% 100%, 0 70%)"
                 }}/>

            {/* Header */}
            <header className="px-6 pt-10 flex flex-col items-center text-center">
                {organizationLogo && <img src={organizationLogo} alt="" className="h-16 md:h-20 mb-4 object-contain"/>}
                <h1 className="text-3xl md:text-5xl font-bold">{reportTitle}</h1>
            </header>

            {/* Banner with simple wire triangles */}
            <section className="px-6 mt-6">
                <div className="relative w-full h-40 md:h-56 rounded-xl overflow-hidden shadow-lg">
                    {coverImage ? <img src={coverImage} alt="" className="w-full h-full object-cover"/> :
                        <div className="w-full h-full bg-black/20"/>}
                    <div className="absolute inset-0" style={{backgroundColor: `hsl(var(--secondary) / 0.35)`}}/>
                    {/* wire lines */}
                    <svg className="absolute inset-0 opacity-40" xmlns="http://www.w3.org/2000/svg">
                        <polyline points="20,180 120,40 240,160 360,30 480,140 620,40" fill="none" stroke="white"
                                  strokeWidth="1.5"/>
                    </svg>
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

export default CoverTemplateFourteen;
