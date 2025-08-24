import {
    Canvas as FabricCanvas,
    Circle,
    Group,
    Image as FabricImage,
    Line,
    loadSVGFromString,
    Polygon,
    Rect,
    Textbox,
    util as FabricUtil
} from "fabric";

export type Palette = { colors: string[] };

export function addRect(canvas: FabricCanvas, palette: Palette, x = 100, y = 100) {
    const rect = new Rect({
        left: x, top: y, width: 100, height: 100,
        fill: palette.colors[0], stroke: palette.colors[1] || palette.colors[0],
        visible: true
    });
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
        visible: true
    });
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
        visible: true
    });
    canvas.add(star);
    canvas.setActiveObject(star);
    canvas.requestRenderAll();
    return star;
}

export function addTriangle(canvas: FabricCanvas, palette: Palette, x = 100, y = 100) {
    const tri = new Polygon(
        [{x: 50, y: 0}, {x: 100, y: 100}, {x: 0, y: 100}],
        {left: x, top: y, fill: palette.colors[0], stroke: palette.colors[1] || palette.colors[0], strokeWidth: 2, visible: true}
    );
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
        visible: true
    });
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
    canvas.add(g);
    canvas.setActiveObject(g);
    canvas.requestRenderAll();
    return g;
}

export function addText(canvas: FabricCanvas, palette: Palette, text = "Text", x = 120, y = 120) {
    const tb = new Textbox(text, {left: x, top: y, fontSize: 24, fill: palette.colors[3] || palette.colors[0], visible: true});
    canvas.add(tb);
    canvas.setActiveObject(tb);
    canvas.requestRenderAll();
    return tb;
}

export async function addImageFromUrl(canvas: FabricCanvas, url: string, x = 150, y = 150) {
    const img = await FabricImage.fromURL(url);
    img.set({left: x, top: y, scaleX: 0.5, scaleY: 0.5, visible: true});
    canvas.add(img);
    canvas.setActiveObject(img);
    canvas.requestRenderAll();
    return img;
}

/** Slim icon loader (runtime fetch) to avoid bundling all lucide icons */
export async function addLucideIconByName(canvas: FabricCanvas, name: string, stroke = "#000", x = 100, y = 100) {
    try {
        const res = await fetch(`https://unpkg.com/lucide-static/icons/${name}.svg`);
        if (!res.ok) return;
        const svg = await res.text();
        await new Promise<void>(resolve => {
            loadSVGFromString(svg, (objects, options) => {
                if (objects) {
                    // In Fabric.js v6, objects is the parsed SVG group already
                    const obj = objects as any;
                    obj.set({left: x, top: y, stroke, fill: "none", visible: true});
                    canvas.add(obj);
                    canvas.setActiveObject(obj);
                    canvas.requestRenderAll();
                }
                resolve();
            });
        });
    } catch {
    }
}