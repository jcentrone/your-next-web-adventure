import React, {useEffect, useRef} from "react";
import {Canvas as FabricCanvas} from "fabric";

interface CanvasWorkspaceProps {
    canvasRef: React.RefObject<HTMLCanvasElement>;
    canvas: FabricCanvas | null;
    zoom: number;
    showGrid: boolean;
    showRulers: boolean;
    onDropElement?: (item: {type: string; data: unknown; x: number; y: number}) => void;
}

export function CanvasWorkspace({
                                    canvasRef,
                                    canvas,
                                    zoom,
                                    showGrid,
                                    showRulers,
                                    onDropElement,
                                }: CanvasWorkspaceProps) {
    const workspaceRef = useRef<HTMLDivElement>(null);

    // Canvas base size (Letter, portrait) -> 8.5" x 11" at 96 DPI (816 x 1056)
    const PAGE_W_IN = 8.5;
    const PAGE_H_IN = 11;

    const width = canvas?.getWidth() ?? 0;    // includes zoom
    const height = canvas?.getHeight() ?? 0;  // includes zoom

    // Derive base (unzoomed) size so this keeps working if you change zoom or DPI
    const baseWidth = width / Math.max(zoom, 0.0001);
    const baseHeight = height / Math.max(zoom, 0.0001);

    // Pixels per inch along each axis (works even if you change base canvas size)
    const pxPerInchX = baseWidth > 0 ? baseWidth / PAGE_W_IN : 96;
    const pxPerInchY = baseHeight > 0 ? baseHeight / PAGE_H_IN : 96;

    // Ruler settings: 1/4" minor ticks, label every 1"
    const MINOR_IN = 0.25;
    const MAJOR_EVERY_IN = 1;

    // Screen pixels for each minor tick (account for zoom)
    const hStepScreen = pxPerInchX * MINOR_IN * zoom;
    const vStepScreen = pxPerInchY * MINOR_IN * zoom;

    // How many ticks to draw
    const horizontalTicks = Math.max(
        0,
        Math.ceil((PAGE_W_IN / MINOR_IN)) + 1
    );
    const verticalTicks = Math.max(
        0,
        Math.ceil((PAGE_H_IN / MINOR_IN)) + 1
    );

    useEffect(() => {
        if (!canvas) return;

        canvas.setDimensions({
            width: 816 * zoom,
            height: 1056 * zoom,
        });
        canvas.setZoom(zoom);
        canvas.renderAll();
    }, [canvas, zoom]);

    return (
        <div className="flex-1 relative bg-muted/50 ">
            <div className="flex items-start justify-center min-h-full py-8">
                {/* Add left/top padding to make room for rulers */}
                <div
                    ref={workspaceRef}
                    className={showRulers ? "relative m-8 pl-8 pt-8 " : "relative m-8 pt-16"}
                >
                    {showRulers && (
                        <>
                            {/* Horizontal Ruler */}
                            <div
                                className="absolute top-0 left-0 right-0 h-8 bg-gray-200 border-b border-gray-300 z-20 pointer-events-none">
                                <div className="relative h-full">
                                    {Array.from({length: horizontalTicks}).map((_, i) => {
                                        const inches = i * MINOR_IN;
                                        const x = i * hStepScreen; // screen px
                                        const isMajor = Math.abs(inches % MAJOR_EVERY_IN) < 1e-6;
                                        return (
                                            <div
                                                key={`h-${i}`}
                                                className="absolute top-0 h-full border-l border-gray-300/60"
                                                style={{left: `${x}px`}}
                                            >
                                                {isMajor && (
                                                    <span className="absolute top-1 left-1 text-xs text-gray-600">
                            {Math.round(inches)}″
                          </span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Vertical Ruler */}
                            <div
                                className="absolute top-0 left-0 bottom-0 w-8 bg-gray-200 border-r border-gray-300 z-20 pointer-events-none">
                                <div className="relative w-full h-full">
                                    {Array.from({length: verticalTicks}).map((_, i) => {
                                        const inches = i * MINOR_IN;
                                        const y = i * vStepScreen; // screen px
                                        const isMajor = Math.abs(inches % MAJOR_EVERY_IN) < 1e-6;
                                        return (
                                            <div
                                                key={`v-${i}`}
                                                className="absolute left-0 w-full border-t border-gray-300/60"
                                                style={{top: `${y}px`}}
                                            >
                                                {isMajor && (
                                                    <span
                                                        className="absolute top-1 left-1 text-xs text-gray-600 transform -rotate-90 origin-top-left">
                            {Math.round(inches)}″
                          </span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Corner block */}
                            <div
                                className="absolute top-0 left-0 w-8 h-8 bg-gray-200 border-r border-b border-gray-300 z-30 pointer-events-none"/>
                        </>
                    )}

                    {/* Canvas Container */}
                    <div className="relative inline-block">
                        <div className="relative bg-white shadow-lg">
                            <canvas
                                ref={canvasRef}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    if (!canvasRef.current) return;
                                    const data = e.dataTransfer.getData("application/x-cover-element");
                                    if (!data) return;
                                    let payload: unknown;
                                    try {
                                        payload = JSON.parse(data);
                                    } catch {
                                        return;
                                    }
                                    if (typeof payload !== "object" || payload === null || !("type" in payload)) return;
                                    const rect = canvasRef.current.getBoundingClientRect();
                                    const x = (e.clientX - rect.left) / zoom;
                                    const y = (e.clientY - rect.top) / zoom;
                                    const {type, ...rest} = payload as {type: string} & Record<string, unknown>;
                                    onDropElement?.({type, data: rest, x, y});
                                }}
                            />

                            {/* Grid overlay (on top of canvas) */}
                            {showGrid && (
                                <div
                                    className="pointer-events-none absolute inset-0 z-10"
                                    style={{
                                        backgroundSize: `${hStepScreen}px ${vStepScreen}px`,
                                        backgroundImage:
                                            "linear-gradient(to right, rgba(0,0,0,0.12) 1px, transparent 1px)," +
                                            "linear-gradient(to bottom, rgba(0,0,0,0.12) 1px, transparent 1px)",
                                    }}
                                />
                            )}
                        </div>

                        <div className="absolute -bottom-6 left-0 text-xs text-muted-foreground">
                            8.5 × 11″
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
