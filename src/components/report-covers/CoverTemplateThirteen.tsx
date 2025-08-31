import React from "react";
import {cn} from "@/lib/utils";
import {CoverTemplateProps} from "./types";
import {formatShortDate} from "../../utils/formatDate";
import {CalendarDays, MapPin, Wind} from "lucide-react";

/** ========= Wave Ribbon + Icon Chips (no overlays/z-index issues) ========= */
const DEFAULT_SCHEME = {
    primary: "220 85% 45%",
    secondary: "195 85% 42%",
    accent: "187 92% 50%",
};

const CoverTemplateThirteen: React.FC<CoverTemplateProps & { className?: string }> = ({
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
            className={cn("h-full flex flex-col bg-white text-slate-900", className)}
            style={
                {
                    ["--primary" as any]: scheme.primary,
                    ["--secondary" as any]: scheme.secondary,
                    ["--accent" as any]: scheme.accent,
                } as React.CSSProperties
            }
        >
            {/* Top ribbon (background-only; no positioned layers) */}
            <div
                className="w-full"
                style={{
                    background: `linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))`,
                }}
            >
                <div className="mx-auto max-w-6xl px-6 pt-10 pb-6 text-white">
                    {/* Org row */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-3">
                            {organizationLogo && (
                                <img
                                    src={organizationLogo}
                                    alt=""
                                    className="h-10 w-10 object-contain"
                                    style={{mixBlendMode: "normal"}}
                                />
                            )}
                            {organizationName && (
                                <span className="text-sm font-semibold tracking-wide uppercase text-white/90">
                  {organizationName}
                </span>
                            )}
                        </div>
                        <div className="ml-auto"/>
                    </div>

                    {/* Title */}
                    <h1 className="mt-4 text-3xl md:text-5xl font-bold drop-shadow-sm">{reportTitle}</h1>

                    {/* Icon chips */}
                    <div className="mt-4 flex flex-wrap gap-3 text-sm">
                        {inspectionDate && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1">
                <CalendarDays size={16}/>
                                {formatShortDate(inspectionDate)}
              </span>
                        )}
                        {clientAddress && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1">
                <MapPin size={16}/>
                                {clientAddress}
              </span>
                        )}
                        {weatherConditions && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1">
                <Wind size={16}/>
                                {weatherConditions}
              </span>
                        )}
                    </div>

                    {/* Cover image with subtle ring */}
                    <div className="mt-6">
                        <div className="relative rounded-2xl overflow-hidden shadow-lg ring-8 ring-white/15">
                            <div className="w-full h-40 md:h-56">
                                {coverImage ? (
                                    <img src={coverImage} alt="" className="w-full h-full object-cover"/>
                                ) : (
                                    <div className="w-full h-full bg-black/20"/>
                                )}
                            </div>
                            {/* soft overlay to normalize poor images */}
                            <div
                                className="absolute inset-0"
                                style={{backgroundColor: `hsl(var(--secondary) / 0.25)`}}
                            />
                        </div>
                    </div>
                </div>

                {/* Decorative wave separator (SVG as background only) */}
                <div className="w-full" aria-hidden="true">
                    <svg
                        viewBox="0 0 1440 120"
                        preserveAspectRatio="none"
                        className="block w-full h-12 text-white"
                        style={{display: "block"}}
                    >
                        <path
                            fill="currentColor"
                            d="M0,64 C180,96 360,0 540,16 C720,32 900,128 1080,112 C1260,96 1440,32 1440,32 L1440,0 L0,0 Z"
                            opacity="0.35"
                        />
                        <path
                            fill="currentColor"
                            d="M0,96 C180,128 360,48 540,64 C720,80 900,144 1080,128 C1260,112 1440,64 1440,64 L1440,0 L0,0 Z"
                            opacity="0.65"
                        />
                    </svg>
                </div>
            </div>

            {/* Main content */}
            <main className="flex-1">
                <div className="mx-auto max-w-6xl px-6 py-8">
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Client */}
                        <div className="rounded-xl border bg-white p-5 shadow-sm justify-start"
                             style={{borderColor: `hsl(${scheme.primary} / 0.15)`}}>
                            <div
                                className="text-xs font-semibold tracking-wide uppercase"
                                style={{color: `hsl(${scheme.primary})`}}
                            >
                                Client
                            </div>
                            <dl className="mt-2 grid grid-cols-[88px_1fr] gap-y-1.5 text-sm text-start">
                                {clientName && (
                                    <>
                                        <dt className="text-slate-500">Name</dt>
                                        <dd>{clientName}</dd>
                                    </>
                                )}
                                {clientPhone && (
                                    <>
                                        <dt className="text-slate-500">Phone</dt>
                                        <dd>{clientPhone}</dd>
                                    </>
                                )}
                                {clientEmail && (
                                    <>
                                        <dt className="text-slate-500">Email</dt>
                                        <dd>{clientEmail}</dd>
                                    </>
                                )}
                            </dl>
                        </div>

                        {/* Inspector */}
                        <div className="rounded-xl border bg-white p-5 shadow-sm"
                             style={{borderColor: `hsl(${scheme.accent} / 0.15)`}}>
                            <div
                                className="text-xs font-semibold tracking-wide uppercase"
                                style={{color: `hsl(${scheme.accent})`}}
                            >
                                Inspector
                            </div>
                            <dl className="mt-2 grid grid-cols-[88px_1fr] gap-y-1.5 text-sm text-start">
                                {inspectorName && (
                                    <>
                                        <dt className="text-slate-500">Name</dt>
                                        <dd>{inspectorName}</dd>
                                    </>
                                )}
                                {inspectorLicenseNumber && (
                                    <>
                                        <dt className="text-slate-500">License</dt>
                                        <dd>{inspectorLicenseNumber}</dd>
                                    </>
                                )}
                                {inspectorPhone && (
                                    <>
                                        <dt className="text-slate-500">Phone</dt>
                                        <dd>{inspectorPhone}</dd>
                                    </>
                                )}
                                {inspectorEmail && (
                                    <>
                                        <dt className="text-slate-500">Email</dt>
                                        <dd>{inspectorEmail}</dd>
                                    </>
                                )}
                            </dl>
                        </div>
                    </div>

                    {/* Meta strip */}
                    <div className="mt-6 text-sm text-center text-slate-700">
                        {inspectionDate && <p>Inspection Date: {formatShortDate(inspectionDate)}</p>}
                        {weatherConditions && <p>Weather: {weatherConditions}</p>}
                    </div>
                </div>
            </main>

            {/* Footer */}
            {(organizationAddress || organizationPhone || organizationEmail || organizationWebsite) && (
                <footer className="mt-auto px-6 pb-10 text-center text-sm">
                    {organizationName && <p className="font-semibold">{organizationName}</p>}
                    {organizationAddress && <p>{organizationAddress}</p>}
                    {(organizationPhone || organizationEmail || organizationWebsite) && (
                        <p className="mt-1 text-slate-700">
                            {organizationPhone && <span>{organizationPhone}</span>}
                            {organizationPhone && (organizationEmail || organizationWebsite) && <span> • </span>}
                            {organizationEmail && <span>{organizationEmail}</span>}
                            {organizationEmail && organizationWebsite && <span> • </span>}
                            {organizationWebsite && <span>{organizationWebsite}</span>}
                        </p>
                    )}
                </footer>
            )}
        </div>
    );
};

export default CoverTemplateThirteen;
