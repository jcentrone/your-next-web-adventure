import React from "react";
import {CoverTemplateProps} from "./types";
import {formatShortDate} from "../../utils/formatDate";

/** Light abstract circles + hero image; org details moved to footer */
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
                                                                                       className,
                                                                                   }) => {
    const year = inspectionDate ? new Date(inspectionDate).getFullYear() : undefined;

    return (
        <div
            className={[
                "relative isolate bg-white text-slate-900",
                "h-full min-h-full overflow-hidden",
                className || "",
            ].join(" ")}
        >
            {/* decor */}
            <div
                className="pointer-events-none absolute -right-1/3 -top-1/3 w-[900px] h-[900px] rounded-full bg-gradient-to-tr from-sky-200 via-cyan-200 to-white"/>
            <div
                className="pointer-events-none absolute -right-10 top-10 w-[280px] h-[280px] rounded-full border-[24px] border-sky-400/20"/>

            {/* page container */}
            <div className="relative z-10 mx-auto max-w-6xl p-6 md:p-10 flex flex-col min-h-full">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-3">
                        {organizationLogo && <img src={organizationLogo} alt="" className="h-10 w-10 object-contain"/>}
                        {organizationName && (
                            <span className="text-sm font-semibold tracking-wide uppercase text-slate-600">
                {organizationName}
              </span>
                        )}
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                        {year && (
                            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-sm font-semibold">
                {year}
              </span>
                        )}
                    </div>
                </div>

                {/* Title + hero image */}
                <div className="mt-6 grid gap-8 md:grid-cols-[1.25fr_1fr] items-center">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">{reportTitle}</h1>
                        <div className="mt-4 flex flex-wrap gap-2 text-sm text-slate-600">
                            {inspectionDate && (
                                <span className="px-2 py-1 rounded bg-slate-100">
                  Date: {formatShortDate(inspectionDate)}
                </span>
                            )}
                            {weatherConditions && (
                                <span className="px-2 py-1 rounded bg-slate-100">Weather: {weatherConditions}</span>
                            )}
                            {clientAddress && (
                                <span className="px-2 py-1 rounded bg-slate-100">Property: {clientAddress}</span>
                            )}
                        </div>
                    </div>

                    <div className="justify-self-end">
                        <div
                            className="relative rounded-2xl overflow-hidden shadow-xl w-[320px] h-[220px] md:w-[360px] md:h-[240px] bg-slate-200">
                            {coverImage && <img src={coverImage} alt="" className="w-full h-full object-cover"/>}
                            <div className="absolute inset-0 ring-8 ring-white/80"/>
                        </div>
                    </div>
                </div>

                {/* Cards (Client & Inspector only) */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Client */}
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="text-xs font-semibold tracking-wide text-sky-700 uppercase">Client</div>
                        <dl className="mt-2 grid grid-cols-[88px_1fr] gap-y-1.5 text-sm">
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
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="text-xs font-semibold tracking-wide text-emerald-700 uppercase">Inspector</div>
                        <dl className="mt-2 grid grid-cols-[88px_1fr] gap-y-1.5 text-sm">
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

                {/* spacer pushes footer down */}
                <div className="flex-1"/>

                {/* Footer: Organization details */}
                {(organizationAddress || organizationPhone || organizationEmail || organizationWebsite) && (
                    <footer className="mt-10 border-t border-slate-200 pt-4">
                        <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
                            {organizationAddress && (
                                <span className="px-3 py-1 rounded-full bg-slate-100">{organizationAddress}</span>
                            )}
                            {organizationPhone && (
                                <span className="px-3 py-1 rounded-full bg-slate-100">{organizationPhone}</span>
                            )}
                            {organizationEmail && (
                                <span className="px-3 py-1 rounded-full bg-slate-100">{organizationEmail}</span>
                            )}
                            {organizationWebsite && (
                                <span className="px-3 py-1 rounded-full bg-slate-100">{organizationWebsite}</span>
                            )}
                        </div>
                    </footer>
                )}
            </div>
        </div>
    );
};

export default CoverTemplateThree;
