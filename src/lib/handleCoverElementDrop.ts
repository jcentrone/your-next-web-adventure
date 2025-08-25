import { Canvas as FabricCanvas } from "fabric";
import { ColorPalette } from "@/constants/colorPalettes";
import {
    addRect as fabricAddRect,
    addCircle as fabricAddCircle,
    addStar as fabricAddStar,
    addTriangle as fabricAddTriangle,
    addPolygon as fabricAddPolygon,
    addArrow as fabricAddArrow,
    addBidirectionalArrow as fabricAddBidirectionalArrow,
    addText as fabricAddText,
    addOpenmojiClipart,
} from "@/lib/fabricShapes";

interface DropPayload {
    type: string;
    data: { url?: string; name?: string; hex?: string } | undefined;
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
        case "image":
            if (data?.url) handlers.addImage?.(data.url, x, y);
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