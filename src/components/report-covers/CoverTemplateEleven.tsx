import React from "react";
import { cn } from "@/lib/utils";
import {CoverTemplateProps} from "./types";
import {formatShortDate} from "../../utils/formatDate";
import {BadgeCheck, Calendar, Mail, MapPin, Phone, ThermometerSun, User} from "lucide-react";

/** ========= Icon-forward variant ========= */
const DEFAULT_SCHEME = {
    primary: "0 75% 60%",
    secondary: "17 100% 76%",
    accent: "38 95% 55%",
};

const CoverTemplateEleven: React.FC<CoverTemplateProps> = ({
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
            className={cn('h-full flex flex-col', className)}
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
            {/* Header */}
            <header className="px-6 pt-10 flex items-center gap-3">
                <div className="flex items-center gap-3">
                    {organizationLogo && <img src={organizationLogo} alt="" className="h-10 w-10 object-contain"/>}
                    {organizationName && <span
                        className="text-sm font-semibold tracking-wide uppercase text-white/90">{organizationName}</span>}
                </div>
                <div className="ml-auto flex flex-wrap gap-2 text-sm">
                    {inspectionDate && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white/15">
              <Calendar size={14}/> {formatShortDate(inspectionDate)}
            </span>
                    )}
                    {weatherConditions && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white/15">
              <ThermometerSun size={14}/> {weatherConditions}
            </span>
                    )}
                    {clientAddress && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white/15">
              <MapPin size={14}/> {clientAddress}
            </span>
                    )}
                </div>
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
                        <h2 className="font-semibold mb-3 uppercase tracking-wide"
                            style={{color: `hsl(var(--accent))`}}>
                            <span className="inline-flex items-center gap-2"><User size={16}/> Client</span>
                        </h2>
                        {clientName &&
                            <p className="text-white/90"><User className="inline mr-1" size={14}/> {clientName}</p>}
                        {clientPhone &&
                            <p className="text-white/90"><Phone className="inline mr-1" size={14}/> {clientPhone}</p>}
                        {clientEmail &&
                            <p className="text-white/90"><Mail className="inline mr-1" size={14}/> {clientEmail}</p>}
                    </div>

                    <div className="bg-white/10 rounded-lg p-5">
                        <h2 className="font-semibold mb-3 uppercase tracking-wide"
                            style={{color: `hsl(var(--accent))`}}>
                            <span className="inline-flex items-center gap-2"><BadgeCheck size={16}/> Inspector</span>
                        </h2>
                        {inspectorName &&
                            <p className="text-white/90"><User className="inline mr-1" size={14}/> {inspectorName}</p>}
                        {inspectorLicenseNumber && <p className="text-white/90"><BadgeCheck className="inline mr-1"
                                                                                            size={14}/> {inspectorLicenseNumber}
                        </p>}
                        {inspectorPhone &&
                            <p className="text-white/90"><Phone className="inline mr-1" size={14}/> {inspectorPhone}
                            </p>}
                        {inspectorEmail &&
                            <p className="text-white/90"><Mail className="inline mr-1" size={14}/> {inspectorEmail}</p>}
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

export default CoverTemplateEleven;