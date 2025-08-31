import React from "react";
import {cn} from "@/lib/utils";
import {CoverTemplateProps} from "./types";
import {formatShortDate} from "../../utils/formatDate";

/** ========= Hexagon motif (SVG, fluid background pattern) ========= */
const DEFAULT_SCHEME = {
    primary: "238 75% 45%",
    secondary: "270 70% 42%",
    accent: "286 85% 60%",
};

/* ---- Reusable SVG helpers (with bleed so strokes don't clip) ---- */
const HEX_POINTS = "250,67 750,67 1000,500 750,933 250,933 0,500";

function HexOutline({
                        size = 160,
                        stroke = "hsl(var(--accent))",
                        strokeWidth = 8,
                        className,
                        style,
                        rotate = 0,
                        bleed = 24,
                        opacity = 1,
                    }: {
    size?: number;
    stroke?: string;
    strokeWidth?: number;
    className?: string;
    style?: React.CSSProperties;
    rotate?: number;
    bleed?: number;
    opacity?: number;
}) {
    return (
        <svg
            width={size}
            height={size}
            viewBox={`${-bleed} ${-bleed} ${1000 + 2 * bleed} ${1000 + 2 * bleed}`}
            className={className}
            style={{overflow: "visible", opacity, ...style}}
        >
            <g transform={`rotate(${rotate}, 500, 500)`}>
                <polygon
                    points={HEX_POINTS}
                    fill="transparent"
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                />
            </g>
        </svg>
    );
}

function HexRingInset({
                          size = 220,
                          ringColor = "rgba(255,255,255,0.18)",
                          ringWidth = 12,
                          insetFill = "hsl(var(--accent) / 0.26)",
                          insetScale = 0.86,
                          rotate = 0,
                          className,
                          style,
                          bleed = 24,
                          opacity = 1,
                      }: {
    size?: number;
    ringColor?: string;
    ringWidth?: number;
    insetFill?: string;
    insetScale?: number;
    rotate?: number;
    className?: string;
    style?: React.CSSProperties;
    bleed?: number;
    opacity?: number;
}) {
    return (
        <svg
            width={size}
            height={size}
            viewBox={`${-bleed} ${-bleed} ${1000 + 2 * bleed} ${1000 + 2 * bleed}`}
            className={className}
            style={{overflow: "visible", opacity, ...style}}
        >
            <g transform={`rotate(${rotate}, 500, 500)`}>
                <polygon
                    points={HEX_POINTS}
                    fill="transparent"
                    stroke={ringColor}
                    strokeWidth={ringWidth}
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                />
                <g transform={`translate(500,500) scale(${insetScale}) translate(-500,-500)`}>
                    <polygon points={HEX_POINTS} fill={insetFill}/>
                </g>
            </g>
        </svg>
    );
}

function HexPhoto({
                      src,
                      size = 360,
                      ringColor = "rgba(255,255,255,0.18)",
                      ringWidth = 16,
                      tint = "hsl(var(--secondary) / 0.16)",
                      className,
                      bleed = 24,
                  }: {
    src?: string;
    size?: number;
    ringColor?: string;
    ringWidth?: number;
    tint?: string;
    className?: string;
    bleed?: number;
}) {
    const clipId = React.useId();
    return (
        <svg
            width={size}
            height={size}
            viewBox={`${-bleed} ${-bleed} ${1000 + 2 * bleed} ${1000 + 2 * bleed}`}
            className={className}
            style={{overflow: "visible"}}
            role="img"
            aria-label="Cover image"
        >
            <defs>
                <clipPath id={`${clipId}-hex`}>
                    <polygon points={HEX_POINTS}/>
                </clipPath>
            </defs>

            {src ? (
                <image
                    href={src}
                    x="0"
                    y="0"
                    width="1000"
                    height="1000"
                    preserveAspectRatio="xMidYMid slice"
                    clipPath={`url(#${clipId}-hex)`}
                />
            ) : (
                <rect width="1000" height="1000" clipPath={`url(#${clipId}-hex)`} fill="rgba(0,0,0,0.2)"/>
            )}

            <rect width="1000" height="1000" clipPath={`url(#${clipId}-hex)`} fill={tint}/>
            <polygon
                points={HEX_POINTS}
                fill="transparent"
                stroke={ringColor}
                strokeWidth={ringWidth}
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
            />
        </svg>
    );
}

/* ---- The template ---- */

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

    return (
        <div
            className={cn("h-full flex flex-col relative", className)}
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
            {/* FLUID BACKGROUND PATTERN (SVG hex “stream”) */}
            <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                {/* A gentle stream of thin wire hexes from top-left → bottom-right */}
                {[
                    {size: 140, x: 36, y: 80, rot: 8, op: 0.25},
                    {size: 110, x: 120, y: 220, rot: -6, op: 0.22},
                    {size: 90, x: 220, y: 360, rot: 4, op: 0.2},
                    {size: 120, x: 360, y: 520, rot: -10, op: 0.22},
                    {size: 100, x: 520, y: 660, rot: 6, op: 0.2},
                    {size: 130, x: 720, y: 760, rot: -8, op: 0.22},
                ].map((h, i) => (
                    <HexOutline
                        key={i}
                        size={h.size}
                        stroke="hsl(var(--accent) / 0.55)"
                        strokeWidth={6}
                        rotate={h.rot}
                        opacity={h.op}
                        className="absolute"
                        style={{left: h.x, top: h.y}}
                    />
                ))}

                {/* A couple of bolder accents to anchor the flow */}
                <HexRingInset
                    size={240}
                    insetScale={0.84}
                    rotate={10}
                    className="absolute"
                    style={{right: -24, top: 48}}
                    ringColor="rgba(255,255,255,0.20)"
                    insetFill="hsl(var(--accent) / 0.26)"
                    ringWidth={12}
                    opacity={1}
                />
                <HexRingInset
                    size={180}
                    insetScale={0.84}
                    rotate={-8}
                    className="absolute"
                    style={{left: -18, bottom: 36}}
                    ringColor="hsl(var(--primary) / 0.28)"
                    insetFill="hsl(var(--secondary) / 0.22)"
                    ringWidth={10}
                    opacity={1}
                />
            </div>

            {/* CONTENT */}
            <header className="relative px-6 pt-10 flex flex-col items-center text-center isolate">
                {organizationLogo && (
                    <img src={organizationLogo} alt="" className="z-40 h-16 md:h-20 mb-4 object-contain"/>
                )}
                <h1 className="text-3xl md:text-5xl font-bold">{reportTitle}</h1>
            </header>

            {/* Hex cover image (center) */}
            <section className="relative z-10 px-6 mt-6 flex justify-center">
                <HexPhoto
                    src={coverImage}
                    size={360}
                    ringColor="rgba(255,255,255,0.18)"
                    ringWidth={14}
                    tint="hsl(var(--secondary) / 0.16)"
                    className="drop-shadow-xl"
                />
            </section>

            {/* Cards */}
            <main className="relative z-10 flex-1 px-6 py-8 flex flex-col items-center">
                <div className="grid gap-6 md:grid-cols-2 w-full max-w-5xl">
                    <div className="bg-white/15 rounded-lg p-5 backdrop-blur-[2px] shadow-sm">
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
                    <div className="bg-white/15 rounded-lg p-5 backdrop-blur-[2px] shadow-sm">
                        <h2
                            className="font-semibold mb-2 uppercase tracking-wide"
                            style={{color: `hsl(var(--accent))`}}
                        >
                            Inspector
                        </h2>
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
            <footer className="relative z-10 px-6 pb-10 text-center text-sm">
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
