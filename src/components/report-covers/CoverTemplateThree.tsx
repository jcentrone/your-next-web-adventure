import React from "react";
import {CoverTemplateProps} from "./types";
import {formatShortDate} from "../../utils/formatDate";

/** Light background (white by default), soft decorations, footer org details */
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

    // Light, friendly defaults (you can still override via colorScheme)
    const primary = colorScheme?.primary ?? "199 89% 48%";   // sky-ish blue
    const secondary = colorScheme?.secondary ?? "215 19% 35%"; // slate-ish neutral
    const accent = colorScheme?.accent ?? "23 92% 54%";      // warm orange

    const primaryColor = `hsl(${primary})`;
    const secondaryColor = `hsl(${secondary})`;
    const accentColor = `hsl(${accent})`;

    // very subtle tints for chips/borders/decor
    const primarySoft = `hsl(${primary} / 0.10)`;
    const primaryTrans = `hsl(${primary} / 0.10)`; // even softer than before
    const accentTrans = `hsl(${accent}  / 0.10)`;

    return (
        <div
            className={[
                className || "",
                // Default to white; pass className="bg-slate-50" for a very light silver canvas.
                "relative isolate bg-white text-slate-900",
                "h-full min-h-full overflow-hidden",
            ].join(" ")}
        >
            {/* ultra-soft decor kept away from text areas */}
            <div
                className="pointer-events-none absolute -right-1/3 -top-1/3 w-[900px] h-[900px] rounded-full"
                style={{background: `radial-gradient(circle at center, ${primaryTrans}, ${accentTrans}, transparent 70%)`}}
            />
            <div
                className="pointer-events-none absolute -right-10 top-10 w-[280px] h-[280px] rounded-full border-[24px]"
                style={{borderColor: primaryTrans}}
            />

            {/* page container */}
            <div className="relative z-10 mx-auto max-w-6xl p-6 md:p-10 flex flex-col min-h-full">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-3">
                        {organizationLogo && <img src={organizationLogo} alt="" className="h-10 w-10 object-contain"/>}
                        {organizationName && (
                            <span
                                className="text-sm font-semibold tracking-wide uppercase"
                                style={{color: secondaryColor}}
                            >
                {organizationName}
              </span>
                        )}
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                        {year && (
                            <span
                                className="px-3 py-1 rounded-full text-sm font-semibold"
                                style={{backgroundColor: primarySoft, color: primaryColor}}
                            >
                {year}
              </span>
                        )}
                    </div>
                </div>

                {/* Title + hero image */}
                <div className="mt-6 grid gap-8 md:grid-cols-[1.25fr_1fr] items-center">
                    <div>
                        <h1
                            className="text-4xl md:text-5xl font-extrabold leading-tight"
                            style={{color: primaryColor}}
                        >
                            {reportTitle}
                        </h1>
                        <div className="mt-4 flex flex-wrap gap-2 text-sm" style={{color: secondaryColor}}>
                            {inspectionDate && (
                                <span className="px-2 py-1 rounded" style={{backgroundColor: primarySoft}}>
                  Date: {formatShortDate(inspectionDate)}
                </span>
                            )}
                            {weatherConditions && (
                                <span className="px-2 py-1 rounded" style={{backgroundColor: primarySoft}}>
                  Weather: {weatherConditions}
                </span>
                            )}
                            {clientAddress && (
                                <span className="px-2 py-1 rounded" style={{backgroundColor: primarySoft}}>
                  Property: {clientAddress}
                </span>
                            )}
                        </div>
                    </div>

                    <div className="justify-self-end">
                        <div
                            className="relative rounded-2xl overflow-hidden shadow-xl w-[320px] h-[220px] md:w-[360px] md:h-[240px] bg-slate-100">
                            {coverImage && <img src={coverImage} alt="" className="w-full h-full object-cover"/>}
                            {/* lighter ring on light background */}
                            <div className="absolute inset-0 ring-8 ring-white/90"/>
                        </div>
                    </div>
                </div>

                {/* Cards (Client & Inspector only) */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Client */}
                    <div className="rounded-xl border bg-white p-5 shadow-sm" style={{borderColor: primarySoft}}>
                        <div className="text-xs font-semibold tracking-wide uppercase"
                             style={{color: primaryColor}}>Client
                        </div>
                        <dl className="mt-2 grid grid-cols-[88px_1fr] gap-y-1.5 text-sm">
                            {clientName && (<>
                                <dt className="text-slate-500">Name</dt>
                                <dd>{clientName}</dd>
                            </>)}
                            {clientPhone && (<>
                                <dt className="text-slate-500">Phone</dt>
                                <dd>{clientPhone}</dd>
                            </>)}
                            {clientEmail && (<>
                                <dt className="text-slate-500">Email</dt>
                                <dd>{clientEmail}</dd>
                            </>)}
                        </dl>
                    </div>

                    {/* Inspector */}
                    <div className="rounded-xl border bg-white p-5 shadow-sm" style={{borderColor: primarySoft}}>
                        <div className="text-xs font-semibold tracking-wide uppercase"
                             style={{color: accentColor}}>Inspector
                        </div>
                        <dl className="mt-2 grid grid-cols-[88px_1fr] gap-y-1.5 text-sm">
                            {inspectorName && (<>
                                <dt className="text-slate-500">Name</dt>
                                <dd>{inspectorName}</dd>
                            </>)}
                            {inspectorLicenseNumber && (<>
                                <dt className="text-slate-500">License</dt>
                                <dd>{inspectorLicenseNumber}</dd>
                            </>)}
                            {inspectorPhone && (<>
                                <dt className="text-slate-500">Phone</dt>
                                <dd>{inspectorPhone}</dd>
                            </>)}
                            {inspectorEmail && (<>
                                <dt className="text-slate-500">Email</dt>
                                <dd>{inspectorEmail}</dd>
                            </>)}
                        </dl>
                    </div>
                </div>

                {/* spacer pushes footer down */}
                <div className="flex-1"/>

                {/* Footer: Organization details */}
                {(organizationAddress || organizationPhone || organizationEmail || organizationWebsite) && (
                    <footer className="mt-10 pt-4" style={{borderTop: `1px solid ${primarySoft}`}}>
                        <div
                            className="flex flex-wrap items-center justify-center gap-2 text-sm"
                            style={{color: secondaryColor}}
                        >
                            {organizationAddress && (
                                <span className="px-3 py-1 rounded-full" style={{backgroundColor: primarySoft}}>
                  {organizationAddress}
                </span>
                            )}
                            {organizationPhone && (
                                <span className="px-3 py-1 rounded-full" style={{backgroundColor: primarySoft}}>
                  {organizationPhone}
                </span>
                            )}
                            {organizationEmail && (
                                <span className="px-3 py-1 rounded-full" style={{backgroundColor: primarySoft}}>
                  {organizationEmail}
                </span>
                            )}
                            {organizationWebsite && (
                                <span className="px-3 py-1 rounded-full" style={{backgroundColor: primarySoft}}>
                  {organizationWebsite}
                </span>
                            )}
                        </div>
                    </footer>
                )}
            </div>
        </div>
    );
};

export default CoverTemplateThree;
