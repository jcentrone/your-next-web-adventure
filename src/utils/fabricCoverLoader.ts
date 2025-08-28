// src/utils/fabricCoverLoader.ts
import * as fabric from "fabric";

/** Options for loading & fitting */
export type CoverLoadOptions = {
    /** Log extra diagnostics */
    debug?: boolean;
    /** Default objectFit if not set on node (`contain` | `cover`) */
    defaultFit?: "contain" | "cover";
    /** Wrap each image in a frame group to force the box to match the placeholder */
    wrapInFrameGroup?: boolean;
};

/** Internal: unwrap { canvas: { objects: [...] } } payloads */
function unwrapDesignRoot(design: any) {
    if (
        design &&
        typeof design === "object" &&
        design.canvas &&
        typeof design.canvas === "object" &&
        Array.isArray(design.canvas.objects)
    ) {
        return design.canvas;
    }
    return design;
}

function getIntrinsicSize(o: any) {
    const el: any = o?.getElement?.() ?? o?._originalElement ?? o?._element ?? null;
    if (el) {
        const iw = el.naturalWidth ?? el.videoWidth ?? el.width ?? 0;
        const ih = el.naturalHeight ?? el.videoHeight ?? el.height ?? 0;
        if (iw > 0 && ih > 0) return {iw, ih, via: "element" as const};
    }
    const iw = typeof o.width === "number" ? o.width : 0;
    const ih = typeof o.height === "number" ? o.height : 0;
    if (iw > 0 && ih > 0) return {iw, ih, via: "fabric" as const};
    return {iw: 0, ih: 0, via: "none" as const};
}

async function waitForImagesReady(imgs: fabric.Object[], timeoutMs = 3000, stepMs = 50) {
    const start = performance.now();
    return new Promise<void>((resolve) => {
        const tick = () => {
            const ready = imgs.every((o: any) => {
                const el: any = o?.getElement?.() ?? o?._originalElement ?? o?._element ?? null;
                const iw = el?.naturalWidth ?? el?.videoWidth ?? el?.width ?? 0;
                const ih = el?.naturalHeight ?? el?.videoHeight ?? el?.height ?? 0;
                return iw > 0 && ih > 0;
            });
            if (ready || performance.now() - start > timeoutMs) return resolve();
            setTimeout(tick, stepMs);
        };
        tick();
    });
}

/** Compute scale + offsets for cover/contain */
function computeFit(iw: number, ih: number, frameW: number, frameH: number, fit: "cover" | "contain") {
    const sx = frameW / iw;
    const sy = frameH / ih;
    const scale = fit === "cover" ? Math.max(sx, sy) : Math.min(sx, sy);
    const drawnW = iw * scale;
    const drawnH = ih * scale;
    const offsetX = (frameW - drawnW) / 2;
    const offsetY = (frameH - drawnH) / 2;
    return {scale, drawnW, drawnH, offsetX, offsetY};
}

/**
 * Option A (default): Wrap the image in a frame group so the visual box == placeholder.
 * - Group has a transparent rect of frame size at (0,0)
 * - Image is a child, scaled and centered inside the group
 * - Group gets a clipPath for "cover" (for "contain" it doesn't matter but it's harmless)
 */
function wrapImageInFrameGroup(
    canvas: fabric.Canvas,
    img: any,
    frameLeft: number,
    frameTop: number,
    frameW: number,
    frameH: number,
    iw: number,
    ih: number,
    fit: "cover" | "contain",
    debug: boolean
) {
    const {scale, offsetX, offsetY} = computeFit(iw, ih, frameW, frameH, fit);

    // Create a transparent rect for the frame
    const rect = new fabric.Rect({
        left: 0,
        top: 0,
        width: frameW,
        height: frameH,
        fill: "rgba(0,0,0,0)",
        stroke: undefined,
        selectable: false,
        evented: false,
    });

    // Prepare the image as a child of the group (local coords)
    img.set({
        left: offsetX,
        top: offsetY,
        scaleX: scale,
        scaleY: scale,
        // Defensive: strip unwanted styles
        stroke: undefined,
        strokeWidth: 0,
        strokeDashArray: undefined,
        shadow: undefined,
        backgroundColor: undefined,
    });

    // Build a group: [frameRect, image]
    // Note: we clone the image node into the group to avoid mutating canvas children directly
    const group = new fabric.Group([rect, img], {
        left: frameLeft,
        top: frameTop,
        // keep it non-interactive for preview; change if you want resize handles
        selectable: false,
        evented: false,
    });

    // Clip to frame for "cover"
    group.clipPath = new fabric.Rect({
        left: 0,
        top: 0,
        width: frameW,
        height: frameH,
    });

    // Replace the original image with the group at the same z-index
    const all = canvas.getObjects();
    const idx = all.indexOf(img);
    canvas.remove(img);
    canvas.insertAt(group, Math.max(idx, 0), false);
    group.setCoords();

    if (debug) {
        console.log("[cover-fit] wrapped image into group", {
            idx,
            frame: {frameLeft, frameTop, frameW, frameH},
            fit,
            scale,
            childLeft: offsetX,
            childTop: offsetY,
        });
    }
}

/**
 * Option B: Directly fit the image (no wrapping). Bounding box will match the drawn bitmap,
 * not the original placeholder rectangle. Kept for completeness; not used if wrapInFrameGroup is true.
 */
function fitImageDirect(img: any, frameLeft: number, frameTop: number, frameW: number, frameH: number, iw: number, ih: number, fit: "cover" | "contain", debug: boolean) {
    const {scale, drawnW, drawnH, offsetX, offsetY} = computeFit(iw, ih, frameW, frameH, fit);
    img.set({
        scaleX: scale,
        scaleY: scale,
        left: frameLeft + offsetX,
        top: frameTop + offsetY,
        crossOrigin: img.crossOrigin ?? "anonymous",
        stroke: undefined,
        strokeWidth: 0,
        strokeDashArray: undefined,
        shadow: undefined,
        backgroundColor: undefined,
    });

    if (fit === "cover") {
        img.set({
            clipPath: new fabric.Rect({
                left: frameLeft,
                top: frameTop,
                width: frameW,
                height: frameH,
                absolutePositioned: true,
            }),
        });
    } else if (img.clipPath) {
        img.set({clipPath: undefined});
    }

    // cleanup meta
    delete img._frameW;
    delete img._frameH;
    delete img._frameLeft;
    delete img._frameTop;

    img.setCoords();

    if (debug) {
        console.log("[cover-fit] direct fit", {
            fit,
            scale,
            drawnW,
            drawnH,
            left: img.left,
            top: img.top,
            getScaledW: img.getScaledWidth?.(),
            getScaledH: img.getScaledHeight?.(),
            clipped: !!img.clipPath,
        });
    }
}

/**
 * Load a (possibly wrapped) Fabric JSON into a canvas and fit image nodes
 * to their placeholder frames saved as data.__frame (and legacy _frame*).
 */
export async function loadCoverDesignToCanvas(
    canvas: fabric.Canvas,
    designJson: any,
    opts: CoverLoadOptions = {}
): Promise<void> {
    const {debug = false, defaultFit = "contain", wrapInFrameGroup = true} = opts;
    const root = unwrapDesignRoot(designJson);

    if (debug) {
        console.groupCollapsed("[cover-fit] preparing loadFromJSON");
        console.log("  payloadRoot keys:", Object.keys(root || {}));
        console.log("  objects length:", Array.isArray(root?.objects) ? root.objects.length : 0);
        console.groupEnd();
    }

    return new Promise<void>((resolve, reject) => {
        try {
            canvas.loadFromJSON(
                root as any,
                async () => {
                    const objs = canvas.getObjects();
                    const imgs = objs.filter((o: any) => (o?.type?.toLowerCase?.() ?? "") === "image");
                    if (debug) {
                        console.groupCollapsed(
                            `[cover-fit] loadFromJSON callback: objs=${objs.length}, images=${imgs.length}, canvas {w=${canvas.getWidth()}, h=${canvas.getHeight()}, zoom=${canvas.getZoom()}}`
                        );
                        console.log("  types:", objs.map((o: any) => o?.type));
                        console.groupEnd();
                    }

                    // Wait until <img> elements have dimensions
                    await waitForImagesReady(imgs);

                    imgs.forEach((img: any) => {
                        if (img?.data?.__fitDone) return;
                        // Frame from data first (authoritative), then legacy
                        const frame = img?.data?.__frame || {};
                        const frameW = Number.isFinite(frame.width) ? frame.width : (Number.isFinite(img._frameW) ? img._frameW : (img.width ?? 0));
                        const frameH = Number.isFinite(frame.height) ? frame.height : (Number.isFinite(img._frameH) ? img._frameH : (img.height ?? 0));
                        const frameLeft = Number.isFinite(frame.left) ? frame.left : (Number.isFinite(img._frameLeft) ? img._frameLeft : (img.left ?? 0));
                        const frameTop = Number.isFinite(frame.top) ? frame.top : (Number.isFinite(img._frameTop) ? img._frameTop : (img.top ?? 0));

                        const {iw, ih, via} = getIntrinsicSize(img);
                        const fit: "cover" | "contain" = String(
                            img?.data?.objectFit || (img as any).objectFit || img?.metadata?.objectFit || defaultFit
                        ).toLowerCase() as any;

                        if (debug) {
                            console.log("[cover-fit] BEFORE →", {
                                frameVia: img?.data?.__frame ? "data.__frame" : (Number.isFinite(img._frameW) ? "_frame*" : "node"),
                                sizeVia: via,
                                frame: {frameLeft, frameTop, frameW, frameH},
                                intrinsic: {iw, ih},
                                fit,
                                left: img.left,
                                top: img.top,
                                scaleX: img.scaleX,
                                scaleY: img.scaleY,
                                getScaledW: img.getScaledWidth?.(),
                                getScaledH: img.getScaledHeight?.(),
                            });
                        }

                        if (!(frameW > 0 && frameH > 0 && iw > 0 && ih > 0)) {
                            if (debug) console.warn("[cover-fit] ⚠️ invalid sizes, skipping", {
                                frameW,
                                frameH,
                                iw,
                                ih,
                                via
                            });
                            return;
                        }

                        if (wrapInFrameGroup) {
                            wrapImageInFrameGroup(canvas, img, frameLeft, frameTop, frameW, frameH, iw, ih, fit, debug);
                        } else {
                            fitImageDirect(img, frameLeft, frameTop, frameW, frameH, iw, ih, fit, debug);
                        }
                        img.data = img.data || {};
                        img.data.__fitDone = true;
                    });

                    canvas.requestRenderAll();
                    resolve();
                },
                // reviver: ensure crossOrigin (prevents tainting)
                (serialized: any, obj: fabric.Object) => {
                    if ((obj as any)?.type === "image") {
                        (obj as any).set("crossOrigin", (obj as any).crossOrigin ?? "anonymous");
                        if (debug) console.log("[cover-fit] reviver(image): ensured crossOrigin=anonymous");
                    }
                }
            );
        } catch (err) {
            reject(err);
        }
    });
}
