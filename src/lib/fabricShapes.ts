import {
    Canvas as FabricCanvas,
    Circle,
    Path,
    Group,
    Image as FabricImage,
    Line,
    loadSVGFromString,
    Polygon,
    Rect,
    Textbox,
    util as FabricUtil,
    FabricObject
} from "fabric";

export type Palette = { colors: string[] };

export function enableScalingHandles(obj: FabricObject) {
    obj.setControlsVisibility?.({
        tl: true,
        tr: true,
        bl: true,
        br: true,
        ml: true,
        mr: true,
        mt: true,
        mb: true,
        mtr: true,
    });
    (obj as any).lockUniScaling = false;
    (obj as any).set?.("lockAspectRatio", (obj as any).lockAspectRatio ?? false);
    return obj;
}

export function addRect(canvas: FabricCanvas, palette: Palette, x = 100, y = 100) {
    const rect = new Rect({
        left: x, top: y, width: 100, height: 100,
        fill: palette.colors[0], stroke: palette.colors[1] || palette.colors[0],
        visible: true,
        name: "Rectangle"
    });
    enableScalingHandles(rect);
    canvas.add(rect);
    canvas.setActiveObject(rect);
    canvas.requestRenderAll();
    return rect;
}

export function addCircle(canvas: FabricCanvas, palette: Palette, x = 100, y = 100) {
    const circle = new Circle({
        left: x, top: y, radius: 50,
        fill: palette.colors[0],
        stroke: palette.colors[1] || palette.colors[0], strokeWidth: 2,
        visible: true,
        name: "Circle"
    });
    enableScalingHandles(circle);
    canvas.add(circle);
    canvas.setActiveObject(circle);
    canvas.requestRenderAll();
    return circle;
}

export function addStar(canvas: FabricCanvas, palette: Palette, x = 100, y = 100) {
    const points: { x: number; y: number }[] = [];
    const outer = 50, inner = 20;
    for (let i = 0; i < 10; i++) {
        const a = (Math.PI / 5) * i;
        const r = i % 2 === 0 ? outer : inner;
        points.push({x: 50 + r * Math.sin(a), y: 50 - r * Math.cos(a)});
    }
    const star = new Polygon(points, {
        left: x, top: y, fill: palette.colors[0],
        stroke: palette.colors[1] || palette.colors[0], strokeWidth: 2,
        visible: true,
        name: "Star"
    });
    enableScalingHandles(star);
    canvas.add(star);
    canvas.setActiveObject(star);
    canvas.requestRenderAll();
    return star;
}

export function addTriangle(canvas: FabricCanvas, palette: Palette, x = 100, y = 100) {
    const tri = new Polygon(
        [{x: 50, y: 0}, {x: 100, y: 100}, {x: 0, y: 100}],
        {left: x, top: y, fill: palette.colors[0], stroke: palette.colors[1] || palette.colors[0], strokeWidth: 2, visible: true, name: "Triangle"}
    );
    enableScalingHandles(tri);
    canvas.add(tri);
    canvas.setActiveObject(tri);
    canvas.requestRenderAll();
    return tri;
}

export function addPolygon(canvas: FabricCanvas, palette: Palette, sides = 5, radius = 50, x = 100, y = 100) {
    const pts = Array.from({length: sides}, (_, i) => {
        const a = (i / sides) * Math.PI * 2;
        return {x: 50 + radius * Math.cos(a), y: 50 + radius * Math.sin(a)};
    });
    const poly = new Polygon(pts, {
        left: x, top: y, fill: palette.colors[0],
        stroke: palette.colors[1] || palette.colors[0], strokeWidth: 2,
        visible: true,
        name: "Polygon"
    });
    enableScalingHandles(poly);
    canvas.add(poly);
    canvas.setActiveObject(poly);
    canvas.requestRenderAll();
    return poly;
}

export function addArrow(canvas: FabricCanvas, palette: Palette, x = 100, y = 100) {
    const line = new Line([0, 0, 80, 0], {stroke: palette.colors[1] || palette.colors[0], strokeWidth: 2});
    const head = new Polygon([{x: 80, y: 0}, {x: 60, y: -10}, {x: 60, y: 10}], {
        fill: palette.colors[1] || palette.colors[0], stroke: palette.colors[1] || palette.colors[0], strokeWidth: 2
    });
    const g = new Group([line, head], {left: x, top: y, visible: true});
    g.set({name: "Arrow"});
    enableScalingHandles(g);
    canvas.add(g);
    canvas.setActiveObject(g);
    canvas.requestRenderAll();
    return g;
}

export function addBidirectionalArrow(canvas: FabricCanvas, palette: Palette, x = 100, y = 100) {
    const line = new Line([0, 0, 80, 0], {stroke: palette.colors[1] || palette.colors[0], strokeWidth: 2});
    const headR = new Polygon([{x: 80, y: 0}, {x: 60, y: -10}, {x: 60, y: 10}], {
        fill: palette.colors[1] || palette.colors[0], stroke: palette.colors[1] || palette.colors[0], strokeWidth: 2
    });
    const headL = new Polygon([{x: 0, y: 0}, {x: 20, y: -10}, {x: 20, y: 10}], {
        fill: palette.colors[1] || palette.colors[0], stroke: palette.colors[1] || palette.colors[0], strokeWidth: 2
    });
    const g = new Group([line, headL, headR], {left: x, top: y, visible: true});
    g.set({name: "Bidirectional Arrow"});
    enableScalingHandles(g);
    canvas.add(g);
    canvas.setActiveObject(g);
    canvas.requestRenderAll();
    return g;
}

export function addFreeformPath(
    canvas: FabricCanvas,
    palette: Palette,
    pushHistory?: () => void,
) {
    if (!canvas) return;

    canvas.isDrawingMode = true;
    const brush = canvas.freeDrawingBrush;
    if (brush) {
        brush.color = palette.colors[1] || palette.colors[0];
        // @ts-expect-error brush type may not define width
        brush.width = 2;
    }

    const handleCreated = (e: { path: Path }) => {
        const path = e.path;
        path.set({
            fill: "transparent",
            stroke: palette.colors[1] || palette.colors[0],
            strokeWidth: 2,
            visible: true,
            name: "Freeform Path",
        });
        enableScalingHandles(path);
        canvas.isDrawingMode = false;
        canvas.setActiveObject(path);
        canvas.off("path:created", handleCreated);
        canvas.requestRenderAll();
        pushHistory?.();
    };

    canvas.on("path:created", handleCreated);
}

export function addBezierCurve(
    canvas: FabricCanvas,
    palette: Palette,
    x = 100,
    y = 100,
) {
    const path = new Path("M 0 100 C 50 0 150 0 200 100", {
        left: x,
        top: y,
        stroke: palette.colors[1] || palette.colors[0],
        strokeWidth: 2,
        fill: "transparent",
        visible: true,
        name: "Bezier Curve",
    });
    enableScalingHandles(path);
    canvas.add(path);
    canvas.setActiveObject(path);
    canvas.requestRenderAll();
    return path;
}

export function addText(canvas: FabricCanvas, palette: Palette, text = "Text", x = 120, y = 120) {
    const tb = new Textbox(text, {left: x, top: y, fontSize: 24, fill: palette.colors[3] || palette.colors[0], visible: true, name: text});
    enableScalingHandles(tb);
    canvas.add(tb);
    canvas.setActiveObject(tb);
    canvas.requestRenderAll();
    return tb;
}

export async function addImageFromUrl(canvas: FabricCanvas, url: string, x = 150, y = 150) {
    const img = await FabricImage.fromURL(url);
    img.set({left: x, top: y, scaleX: 0.5, scaleY: 0.5, visible: true, name: "Image"});
    enableScalingHandles(img);
    canvas.add(img);
    canvas.setActiveObject(img);
    canvas.requestRenderAll();
    return img;
}

/** Slim icon loader (runtime fetch) to avoid bundling all lucide icons */
export async function addLucideIconByName(canvas: FabricCanvas, name: string, stroke = "#000", x = 100, y = 100) {
    try {
        const iconName = name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
        const res = await fetch(`https://unpkg.com/lucide-static@latest/icons/${iconName}.svg`);
        if (!res.ok) return;
        const svg = await res.text();
        const { objects, options } = await loadSVGFromString(svg);
        const obj = Array.isArray(objects)
            ? FabricUtil.groupSVGElements(objects, options)
            : (objects as FabricObject);

        obj.set({left: x, top: y, stroke, fill: "none", visible: true, name});
        enableScalingHandles(obj);
        canvas.add(obj);
        canvas.setActiveObject(obj);
        canvas.requestRenderAll();
    // eslint-disable-next-line no-empty
    } catch {
    }
}

export async function addOpenmojiClipart(
    canvas: FabricCanvas,
    palette: Palette,
    hex: string,
    x = 100,
    y = 100,
) {
    try {
        const res = await fetch(
            `https://cdn.jsdelivr.net/npm/openmoji@16.0.0/color/svg/${hex}.svg`,
        );
        if (!res.ok) return;
        const svg = await res.text();
        const stroke = palette.colors[1] || palette.colors[0];
        const { objects, options } = await loadSVGFromString(svg);
        const obj = Array.isArray(objects)
            ? FabricUtil.groupSVGElements(objects, options)
            : (objects as FabricObject);

        obj.set({left: x, top: y, scaleX: 0.5, scaleY: 0.5, visible: true, name: "Clipart"});
        obj.set({stroke});
        enableScalingHandles(obj);
        (obj as FabricObject & { _objects?: FabricObject[] })._objects?.forEach((o) =>
            o.set({stroke}),
        );
        canvas.add(obj);
        canvas.setActiveObject(obj);
        canvas.requestRenderAll();
    // eslint-disable-next-line no-empty
    } catch {
    }
}
