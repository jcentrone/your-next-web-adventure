import { useEffect, useRef, useState } from "react";
import {
  Canvas as FabricCanvas,
  Rect,
  Textbox,
  Image as FabricImage,
  Group,
  Line,
  FabricObject,
} from "fabric";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const TEMPLATES: Record<string, string> = {
  default: "#ffffff",
  blue: "#ebf8ff",
};

const GRID_SIZE = 20;

type CanvasObject = Rect | Textbox | FabricImage | Group;

export default function CoverPageEditorPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<FabricCanvas | null>(null);
  const [selected, setSelected] = useState<CanvasObject | null>(null);
  const [zoom, setZoom] = useState(1);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [template, setTemplate] = useState<keyof typeof TEMPLATES>("default");

  const pushHistory = () => {
    if (!canvas) return;
    const json = JSON.stringify(canvas.toJSON());
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(json);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  useEffect(() => {
    const canvasElement = canvasRef.current;
    if (!canvasElement) return;
      const c = new FabricCanvas(canvasElement, {
        width: 800,
        height: 1000,
        backgroundColor: TEMPLATES[template],
      });
      setCanvas(c);

    // grid background
    const gridBg = document.createElement("div");
    gridBg.style.position = "absolute";
    gridBg.style.left = "0";
    gridBg.style.top = "0";
    gridBg.style.width = "800px";
    gridBg.style.height = "1000px";
    gridBg.style.pointerEvents = "none";
    gridBg.style.backgroundSize = `${GRID_SIZE}px ${GRID_SIZE}px`;
    gridBg.style.backgroundImage =
      "linear-gradient(to right, #e5e7eb 1px, transparent 1px)," +
      "linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)";
    canvasElement.parentElement?.appendChild(gridBg);
    pushHistory();

    c.on("selection:cleared", () => setSelected(null));
    c.on("selection:updated", (e) => setSelected(e.selected?.[0] as CanvasObject));
    c.on("selection:created", (e) => setSelected(e.selected?.[0] as CanvasObject));

    c.on("object:modified", () => pushHistory());
    c.on("object:moving", (e) => {
      const obj = e.target as CanvasObject;
      obj.set({
        left: Math.round((obj.left || 0) / GRID_SIZE) * GRID_SIZE,
        top: Math.round((obj.top || 0) / GRID_SIZE) * GRID_SIZE,
      });
    });
    c.on("object:scaling", (e) => {
      const obj = e.target as CanvasObject;
      const width = (obj.width || 0) * (obj.scaleX || 1);
      const height = (obj.height || 0) * (obj.scaleY || 1);
      const snappedW = Math.round(width / GRID_SIZE) * GRID_SIZE;
      const snappedH = Math.round(height / GRID_SIZE) * GRID_SIZE;
      obj.set({
        scaleX: snappedW / (obj.width || 1),
        scaleY: snappedH / (obj.height || 1),
      });
    });

    return () => {
      canvasElement.parentElement?.removeChild(gridBg);
      c.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template]);

  useEffect(() => {
    if (canvas) {
      canvas.setBackgroundColor(TEMPLATES[template], () => canvas.renderAll());
    }
  }, [template, canvas]);

  const addRect = () => {
    if (!canvas) return;
    const rect = new Rect({
      left: 100,
      top: 100,
      width: 100,
      height: 100,
      fill: "rgba(0,0,0,0.1)",
      stroke: "#000",
    });
    canvas.add(rect);
    canvas.setActiveObject(rect);
    canvas.renderAll();
    pushHistory();
  };

  const addText = () => {
    if (!canvas) return;
    const text = new Textbox("Text", {
      left: 120,
      top: 120,
      fontSize: 24,
      fill: "#000000",
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
    pushHistory();
  };

  const addImage = (file: File) => {
    if (!canvas) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      FabricImage.fromURL(url, (img) => {
        img.set({ left: 150, top: 150, scaleX: 0.5, scaleY: 0.5 });
        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
        pushHistory();
      });
    };
    reader.readAsDataURL(file);
  };

  const addTable = () => {
    if (!canvas) return;
    const rows = 2;
    const cols = 2;
    const cellW = 80;
    const cellH = 40;
    const lines: Line[] = [];
    for (let i = 0; i <= rows; i++) {
      lines.push(
        new Line([0, i * cellH, cols * cellW, i * cellH], {
          stroke: "#000",
          selectable: false,
        })
      );
    }
    for (let i = 0; i <= cols; i++) {
      lines.push(
        new Line([i * cellW, 0, i * cellW, rows * cellH], {
          stroke: "#000",
          selectable: false,
        })
      );
    }
    const group = new Group(lines, {
      left: 100,
      top: 100,
    });
    canvas.add(group);
    canvas.setActiveObject(group);
    canvas.renderAll();
    pushHistory();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) addImage(file);
  };

  const updateSelected = (prop: string, value: unknown) => {
    if (!selected || !canvas) return;
    (selected as unknown as FabricObject).set(prop as never, value as never);
    canvas.renderAll();
    pushHistory();
  };

  const undo = async () => {
    if (!canvas || historyIndex <= 0) return;
    const prev = history[historyIndex - 1];
    await canvas.loadFromJSON(prev);
    canvas.renderAll();
    setHistoryIndex(historyIndex - 1);
  };

  const redo = async () => {
    if (!canvas || historyIndex >= history.length - 1) return;
    const next = history[historyIndex + 1];
    await canvas.loadFromJSON(next);
    canvas.renderAll();
    setHistoryIndex(historyIndex + 1);
  };

  const zoomIn = () => setZoom((z) => Math.min(z + 0.1, 2));
  const zoomOut = () => setZoom((z) => Math.max(z - 0.1, 0.5));

  useEffect(() => {
    if (!canvas) return;
    canvas.setZoom(zoom);
  }, [zoom, canvas]);

  return (
    <div className="flex h-full">
        <div className="w-48 p-2 border-r space-y-2">
          <div>
            <Label htmlFor="template">Template</Label>
            <select
              id="template"
              className="w-full border rounded"
              value={template}
              onChange={(e) => setTemplate(e.target.value as keyof typeof TEMPLATES)}
            >
              {Object.keys(TEMPLATES).map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
          </div>
          <Button onClick={addRect} className="w-full">
            Rectangle
          </Button>
        <Button onClick={addText} className="w-full">
          Text
        </Button>
        <div>
          <Label htmlFor="image-upload" className="mb-1 block">
            Image
          </Label>
          <Input id="image-upload" type="file" onChange={handleImageUpload} />
        </div>
        <Button onClick={addTable} className="w-full">
          Table
        </Button>
        <div className="flex gap-2 pt-4">
          <Button onClick={undo} variant="outline" className="flex-1">
            Undo
          </Button>
          <Button onClick={redo} variant="outline" className="flex-1">
            Redo
          </Button>
        </div>
        <div className="flex gap-2 pt-4">
          <Button onClick={zoomOut} variant="outline" className="flex-1">
            -
          </Button>
          <Button onClick={zoomIn} variant="outline" className="flex-1">
            +
          </Button>
        </div>
      </div>

      <div className="flex-1 relative flex items-center justify-center">
        <div
          className="relative border"
          style={{
            width: 800,
            height: 1000,
            transform: `scale(${zoom})`,
            transformOrigin: "0 0",
          }}
        >
          <canvas ref={canvasRef} />
        </div>
      </div>

      {selected && (
        <div className="w-64 p-2 border-l space-y-2">
          <div>
            <Label htmlFor="fill">Color</Label>
            <Input
              id="fill"
              type="color"
              value={
                selected && "fill" in selected && typeof (selected as { fill?: string }).fill === "string"
                  ? (selected as { fill?: string }).fill
                  : "#000000"
              }
              onChange={(e) => updateSelected("fill", e.target.value)}
            />
          </div>
          {selected instanceof Textbox && (
            <div>
              <Label htmlFor="fontSize">Font Size</Label>
              <Input
                id="fontSize"
                type="number"
                value={selected.fontSize || 16}
                onChange={(e) => updateSelected("fontSize", parseInt(e.target.value, 10))}
              />
            </div>
          )}
          <div>
            <Label htmlFor="width">Width</Label>
            <Input
              id="width"
              type="number"
              value={(selected.width || 0) * (selected.scaleX || 1)}
              onChange={(e) => {
                const w = parseInt(e.target.value, 10);
                updateSelected("scaleX", w / (selected.width || 1));
              }}
            />
          </div>
          <div>
            <Label htmlFor="height">Height</Label>
            <Input
              id="height"
              type="number"
              value={(selected.height || 0) * (selected.scaleY || 1)}
              onChange={(e) => {
                const h = parseInt(e.target.value, 10);
                updateSelected("scaleY", h / (selected.height || 1));
              }}
            />
          </div>
          <div>
            <Label htmlFor="angle">Rotation</Label>
            <Input
              id="angle"
              type="number"
              value={selected.angle || 0}
              onChange={(e) => updateSelected("angle", parseInt(e.target.value, 10))}
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                if (selected && canvas) {
                  canvas.bringForward(selected);
                  canvas.renderAll();
                  pushHistory();
                }
              }}
            >
              Forward
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                if (selected && canvas) {
                  canvas.sendBackwards(selected);
                  canvas.renderAll();
                  pushHistory();
                }
              }}
            >
              Backward
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

