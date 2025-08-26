import React, {useEffect, useRef} from "react";
import {Canvas as FabricCanvas} from "fabric";

interface CanvasWorkspaceProps {
    canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
    canvas: FabricCanvas | null;
    zoom: number;
    showGrid: boolean;
    showRulers: boolean;
    onDropElement?: (item: { type: string; data: unknown; x: number; y: number }) => void;
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

    // Canvas dimensions remain constant; zoom is handled via CSS transforms
    const CANVAS_WIDTH = 816;
    const CANVAS_HEIGHT = 1056;
    const baseWidth = CANVAS_WIDTH;
    const baseHeight = CANVAS_HEIGHT;

    const RULER_SIZE = 32;

    // Pixels per inch along each axis (works even if you change base canvas size)
    const pxPerInchX = baseWidth / PAGE_W_IN;
    const pxPerInchY = baseHeight / PAGE_H_IN;

    // Ruler settings: 1/4" minor ticks, label every 1"
    const MINOR_IN = 0.25;
    const MAJOR_EVERY_IN = 1;

    // Ensure grid lines and ruler ticks share the exact same step and origin.
    // Offset by 0.5px so 1px lines sit on device pixels and look crisp.
    const PIXEL_OFFSET = 0.5;

    // Base pixel distance for each minor tick (zoom is handled via CSS transforms)
    const hStep = pxPerInchX * MINOR_IN;
    const vStep = pxPerInchY * MINOR_IN;

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

        canvas.setDimensions({width: CANVAS_WIDTH, height: CANVAS_HEIGHT});
        canvas.renderAll();
    }, [canvas]);


    // CanvasWorkspace.tsx
    useEffect(() => {
        if (!canvas || !canvasRef.current) return;

        // Fabric v5/v6: prefer upperCanvasEl; fallback to getSelectionElement()
        const upper: HTMLCanvasElement =
            (canvas as any).upperCanvasEl ??
            (canvas.getSelectionElement && canvas.getSelectionElement());

        if (!upper) return;

        const onDragOver = (e: DragEvent) => {
            e.preventDefault();
            console.log("dragover");
            // optional UX hint
            if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
        };

        const onDrop = (e: DragEvent) => {
            e.preventDefault();
            if (!canvas) return;

            const raw =
                e.dataTransfer?.getData("application/x-cover-element") ||
                e.dataTransfer?.getData("text/plain") || "";
            if (!raw) return;

            let payload: any;
            try {
                payload = JSON.parse(raw);
            } catch {
                return;
            }
            const { type, data: payloadData } = payload;

            const pt = canvas.getPointer(e as unknown as MouseEvent);
            console.log({ type, payloadData, x: pt.x, y: pt.y });
            onDropElement?.({ type, data: payloadData, x: pt.x, y: pt.y });
        };

        // const onDrop = (e: DragEvent) => {
        //     e.preventDefault();
        //     if (!canvas) return;
        //
        //     // TEMP: ignore payload; just draw something visible
        //     const test = new Rect({left: 100, top: 100, width: 80, height: 40, fill: "magenta"});
        //     canvas.add(test);
        //     canvas.setActiveObject(test);
        //     canvas.requestRenderAll();
        // };

        upper.addEventListener("dragover", onDragOver);
        upper.addEventListener("drop", onDrop);
        return () => {
            upper.removeEventListener("dragover", onDragOver);
            upper.removeEventListener("drop", onDrop);
        };
    }, [canvas, onDropElement, canvasRef]);


    return (
        <div className="flex-1 relative bg-muted/50 ">
            <div className="flex items-center justify-center min-h-full py-6">
                {/* Add left/top padding to make room for rulers */}
                <div
                    ref={workspaceRef}
                    className={showRulers ? "relative m-8 pl-8 pt-8 " : "relative m-8 pt-16"}
                >
                    {showRulers && (
                        <>
                            {/* Horizontal Ruler */}
                            <div
                                className="absolute top-0 right-0 h-8 bg-gray-200 border-b border-gray-300 z-20 pointer-events-none"
                                style={{
                                    left: RULER_SIZE,
                                    width: CANVAS_WIDTH,
                                    transform: `scaleX(${zoom})`,
                                    transformOrigin: "top left",
                                }}
                            >
                                <div className="relative h-full">
                                    {Array.from({length: horizontalTicks}).map((_, i) => {
                                        const inches = i * MINOR_IN;
                                        const x = i * hStep; // base pixels
                                        const isMajor = Math.abs(inches % MAJOR_EVERY_IN) < 1e-6;
                                        const color = isMajor ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.25)";
                                        const height = isMajor ? "100%" : "50%";
                                        const tickWidth = isMajor ? 2 : 1;
                                        const transform = isMajor ? "translateX(-1px)" : undefined;
                                        return (
                                            <div
                                                key={`h-${i}`}
                                                className="absolute bottom-0"
                                                style={{
                                                    left: x + PIXEL_OFFSET,
                                                    height,
                                                    borderLeft: `${tickWidth}px solid ${color}`,
                                                    transform,
                                                }}
                                            >
                                                {isMajor && (
                                                    <span className="absolute top-full mt-0.5 left-1 text-xs text-gray-600">
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
                                className="absolute left-0 bottom-0 w-8 bg-gray-200 border-r border-gray-300 z-20 pointer-events-none"
                                style={{
                                    top: RULER_SIZE,
                                    height: CANVAS_HEIGHT,
                                    transform: `scaleY(${zoom})`,
                                    transformOrigin: "top left",
                                }}
                            >
                                <div className="relative w-full h-full">
                                    {Array.from({length: verticalTicks}).map((_, i) => {
                                        const inches = i * MINOR_IN;
                                        const y = i * vStep; // base pixels
                                        const isMajor = Math.abs(inches % MAJOR_EVERY_IN) < 1e-6;
                                        const color = isMajor ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.25)";
                                        const width = isMajor ? "100%" : "50%";
                                        const height = isMajor ? 2 : 1;
                                        const transform = isMajor ? "translateY(-1px)" : undefined;
                                        return (
                                            <div
                                                key={`v-${i}`}
                                                className="absolute left-0"
                                                style={{
                                                    top: y + PIXEL_OFFSET,
                                                    width,
                                                    borderTop: `${height}px solid ${color}`,
                                                    transform,
                                                }}
                                            >
                                                {isMajor && (
                                                    <span
                                                        className="absolute top-1 left-1 text-xs text-gray-600 transform -rotate-90 origin-top-left"
                                                    >
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
                                className="absolute top-0 left-0 w-8 h-8 bg-gray-200 border-r border-b border-gray-300 z-30 pointer-events-none"
                            />
                        </>
                    )}

                    {/* Canvas Container */}
                    <div
                        className="relative inline-block"
                        style={{
                            width: CANVAS_WIDTH * zoom,
                            height: CANVAS_HEIGHT * zoom,
                        }}
                    >
                        <div
                            className="relative bg-white shadow-lg"
                            style={{
                                width: CANVAS_WIDTH,
                                height: CANVAS_HEIGHT,
                                transform: `scale(${zoom})`,
                                transformOrigin: "top left",
                            }}
                        >
                            <canvas
                                ref={canvasRef}
                                style={{width: CANVAS_WIDTH, height: CANVAS_HEIGHT}}
                            />

                            {/* Grid overlay (on top of canvas) */}
                            {showGrid && (
                                <div
                                    className="pointer-events-none absolute top-0 left-0 z-10"
                                    style={{
                                        width: CANVAS_WIDTH,
                                        height: CANVAS_HEIGHT,
                                        backgroundSize: `${hStep}px ${vStep}px`,
                                        backgroundPosition: `${PIXEL_OFFSET}px ${PIXEL_OFFSET}px`,
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
