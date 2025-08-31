import React from "react";
import {CoverTemplateProps} from "./types";
import {formatShortDate} from "../../utils/formatDate";

/** ========= Panel Card variant ========= */
const DEFAULT_SCHEME = {
    primary: "190 90% 32%",
    secondary: "195 85% 28%",
    accent: "38 95% 55%",
};

const CoverTemplateSixteen: React.FC<CoverTemplateProps> = ({
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
                    ["--primary" as any]: scheme.primary,
                    ["--secondary" as any]: scheme.secondary,
                    ["--accent" as any]: scheme.accent,
                    background: `linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))`,
                    color: "white",
                } as React.CSSProperties
            }
        >
            {/* Floating white panel */}
            <div
                className="mx-auto max-w-5xl w-full bg-white text-slate-900 rounded-2xl shadow-2xl mt-10 mb-8 overflow-hidden">
                {/* header strip */}
                <div className="h-2"
                     style={{background: `linear-gradient(90deg, hsl(var(--accent)), hsl(var(--primary)))`}}/>

                {/* content */}
                <div className="p-6 md:p-8">
                    <div className="flex items-center gap-3">
                        {organizationLogo && <img src={organizationLogo} alt="" className="h-10 w-10 object-contain"/>}
                        {organizationName && <span className="text-sm font-semibold tracking-wide uppercase"
                                                   style={{color: `hsl(var(--secondary))`}}>{organizationName}</span>}
                    </div>

                    {/* title + banner */}
                    <div className="mt-6 grid gap-6 md:grid-cols-[1.25fr_1fr] items-center">
                        <div>
                            <h1 className="text-3xl md:text-5xl font-extrabold"
                                style={{color: `hsl(var(--primary))`}}>{reportTitle}</h1>
                            <div className="mt-3 flex flex-wrap gap-2 text-sm" style={{color: `hsl(var(--secondary))`}}>
                                {inspectionDate && <span
                                    className="px-2 py-1 rounded bg-slate-100">Date: {formatShortDate(inspectionDate)}</span>}
                                {weatherConditions && <span
                                    className="px-2 py-1 rounded bg-slate-100">Weather: {weatherConditions}</span>}
                                {clientAddress &&
                                    <span className="px-2 py-1 rounded bg-slate-100">Property: {clientAddress}</span>}
                            </div>
                        </div>
                        <div className="justify-self-end">
                            <div
                                className="relative rounded-xl overflow-hidden shadow-xl w-[320px] h-[220px] md:w-[360px] md:h-[240px] bg-slate-200">
                                {coverImage && <img src={coverImage} alt="" className="w-full h-full object-cover"/>}
                                <div className="absolute inset-0 ring-8 ring-white/80"/>
                            </div>
                        </div>
                    </div>

                    {/* cards */}
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="rounded-xl border border-slate-200 bg-white p-5">
                            <h2 className="font-semibold mb-2 uppercase tracking-wide"
                                style={{color: `hsl(var(--accent))`}}>Client</h2>
                            {clientName && <p>Name: {clientName}</p>}
                            {clientPhone && <p>Phone: {clientPhone}</p>}
                            {clientEmail && <p>Email: {clientEmail}</p>}
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-white p-5">
                            <h2 className="font-semibold mb-2 uppercase tracking-wide"
                                style={{color: `hsl(var(--accent))`}}>Inspector</h2>
                            {inspectorName && <p>Name: {inspectorName}</p>}
                            {inspectorLicenseNumber && <p>License: {inspectorLicenseNumber}</p>}
                            {inspectorPhone && <p>Phone: {inspectorPhone}</p>}
                            {inspectorEmail && <p>Email: {inspectorEmail}</p>}
                        </div>
                    </div>

                    {/* footer inside panel */}
                    <div className="text-center text-sm mt-8">
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
                    </div>
                </div>
            </div>

            {/* small bottom padding so the gradient peeks through */}
            <div className="px-6 pb-6 text-sm text-center text-white/80"></div>
        </div>
    );
};

export default CoverTemplateSixteen;
