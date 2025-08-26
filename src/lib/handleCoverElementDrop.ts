import { Canvas as FabricCanvas, Image as FabricImage } from "fabric";
import { ColorPalette } from "@/constants/colorPalettes";
import {
    addRect as fabricAddRect,
    addCircle as fabricAddCircle,
    addStar as fabricAddStar,
    addTriangle as fabricAddTriangle,
    addPolygon as fabricAddPolygon,
    addArrow as fabricAddArrow,
    addBidirectionalArrow as fabricAddBidirectionalArrow,
    addFreeformPath as fabricAddFreeformPath,
    addBezierCurve as fabricAddBezierCurve,
    addText as fabricAddText,
    addOpenmojiClipart,
} from "@/lib/fabricShapes";

interface DropPayload {
    type: string;
    data: { url?: string; name?: string; hex?: string; label?: string; token?: string } | undefined;
    x: number;
    y: number;
}

interface ExtraHandlers {
    addImage?: (url: string, x: number, y: number) => void;
    addIcon?: (name: string, x: number, y: number) => void;
}

export function handleCoverElementDrop(
    canvas: FabricCanvas | null,
    palette: ColorPalette,
    {type, data, x, y}: DropPayload,
    handlers: ExtraHandlers,
    pushHistory?: () => void,
) {
    if (!canvas) return;
    console.log('Dropping element', { type, data, x, y });

    switch (type) {
        case "text":
            fabricAddText(canvas, palette, "Add your text here", x, y);
            pushHistory?.();
            break;
        case "rectangle":
            fabricAddRect(canvas, palette, x, y);
            pushHistory?.();
            break;
        case "circle":
            fabricAddCircle(canvas, palette, x, y);
            pushHistory?.();
            break;
        case "star":
            fabricAddStar(canvas, palette, x, y);
            pushHistory?.();
            break;
        case "triangle":
            fabricAddTriangle(canvas, palette, x, y);
            pushHistory?.();
            break;
        case "polygon":
            fabricAddPolygon(canvas, palette, 5, 50, x, y);
            pushHistory?.();
            break;
        case "arrow":
            fabricAddArrow(canvas, palette, x, y);
            pushHistory?.();
            break;
        case "bidirectionalArrow":
            fabricAddBidirectionalArrow(canvas, palette, x, y);
            pushHistory?.();
            break;
        case "freeformPath":
            fabricAddFreeformPath(canvas, palette, () => pushHistory?.());
            break;
        case "bezierCurve":
            fabricAddBezierCurve(canvas, palette, x, y);
            pushHistory?.();
            break;
        case "image":
            if (data?.url) {
                handlers.addImage?.(data.url, x, y);
                console.log('Image added', { url: data.url, x, y });
                pushHistory?.();
            }
            break;
        case "image-field":
            const transparentPng =
                "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAoMBgD1Q9FAAAAAASUVORK5CYII=";
            FabricImage.fromURL(transparentPng, (img) => {
                img.set({
                    left: x,
                    top: y,
                    mergeField: "report.coverImage",
                    stroke: "#888",
                    strokeWidth: 2,
                    strokeDashArray: [6, 4],
                    backgroundColor: "#f3f4f6",
                } as any);
                img.scaleToWidth(200);
                img.scaleToHeight(200);
                canvas.add(img);
                canvas.setActiveObject(img);
                pushHistory?.();
            });
            break;
        case "merge-field":
            if (data?.label && data?.token) {
                fabricAddText(canvas, palette, `${data.label}: ${data.token}`, x, y);
                pushHistory?.();
            }
            break;
        case "icon":
            if (data?.name) handlers.addIcon?.(data.name, x, y);
            break;
        case "clipart":
            if (data?.hex)
                addOpenmojiClipart(canvas, palette, data.hex, x, y).then(() => {
                    pushHistory?.();
                });
            break;
        default:
            break;
    }
}

export type { DropPayload };