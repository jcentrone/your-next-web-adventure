import { useEffect, useRef, useState, type ComponentType } from "react";
import { useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import {
  Canvas as FabricCanvas,
  Rect,
  Textbox,
  Image as FabricImage,
  Group,
  Line,
  Circle,
  Polygon,
  FabricObject,
  loadSVGFromString,
  util as FabricUtil,
} from "fabric";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import useCoverPages from "@/hooks/useCoverPages";
import useImageLibrary from "@/hooks/useImageLibrary";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowDown,
  ArrowUp,
  Bold,
  Italic,
  Plus,
  Redo2,
  Table as TableIcon,
  Square,
  Circle as CircleIcon,
  Star as StarIcon,
  ArrowRight as ArrowRightIcon,
  Trash2,
  Undo2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import { icons as lucideIcons } from "lucide";

const TEMPLATES: Record<string, string> = {
  default: "#ffffff",
  blue: "#ebf8ff",
};

const REPORT_TYPES = [
  { value: "home_inspection", label: "Home Inspection" },
  { value: "wind_mitigation", label: "Wind Mitigation" },
];

const FONTS = ["Arial", "Times New Roman", "Courier New", "Georgia", "Verdana"];

const GRID_SIZE = 20;

type CanvasObject = Rect | Circle | Polygon | Textbox | FabricImage | Group;

interface FormValues {
  name: string;
  template: keyof typeof TEMPLATES;
  reportTypes: string[];
}

export default function CoverPageEditorPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<FabricCanvas | null>(null);
  const [selected, setSelected] = useState<CanvasObject | null>(null);
  const [zoom, setZoom] = useState(1);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    createCoverPage,
    updateCoverPage,
    assignments,
    assignCoverPageToReportType,
    removeAssignmentFromReportType,
    coverPages,
  } = useCoverPages();
  const form = useForm<FormValues>({
    defaultValues: { name: "", template: "default", reportTypes: [] },
  });
  const { register, handleSubmit, setValue, watch } = form;
  const template = watch("template") as keyof typeof TEMPLATES;
  const reportTypes = watch("reportTypes");
  const [bgColor, setBgColor] = useState(TEMPLATES[template]);
  const { images, uploadImage, deleteImage } = useImageLibrary();
  const [iconSearch, setIconSearch] = useState("");

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
      backgroundColor: bgColor,
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
    const initialJson = JSON.stringify(c.toJSON());
    setHistory([initialJson]);
    setHistoryIndex(0);

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
  }, []);

  useEffect(() => {
    setBgColor(TEMPLATES[template]);
  }, [template]);

  useEffect(() => {
    if (canvas) {
      canvas.set({ backgroundColor: bgColor });
      canvas.requestRenderAll();
    }
  }, [bgColor, canvas]);

  useEffect(() => {
    if (!canvas || !id) return;
    const cp = coverPages.find((c) => c.id === id);
    if (!cp) return;
    setValue("name", cp.name);
    setValue("template", (cp.template_slug as keyof typeof TEMPLATES) || "default");
    const selected = Object.entries(assignments)
      .filter(([_, cpId]) => cpId === id)
      .map(([rt]) => rt);
    setValue("reportTypes", selected);
    (async () => {
      await canvas.loadFromJSON(cp.design_json || {});
      canvas.renderAll();
      const json = JSON.stringify(canvas.toJSON());
      setHistory([json]);
      setHistoryIndex(0);
    })();
  }, [canvas, id, coverPages, assignments, setValue]);


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

  const addCircle = () => {
    if (!canvas) return;
    const circle = new Circle({
      left: 100,
      top: 100,
      radius: 50,
      fill: "rgba(0,0,0,0.1)",
      stroke: "#000",
      strokeWidth: 2,
    });
    canvas.add(circle);
    canvas.setActiveObject(circle);
    canvas.renderAll();
    pushHistory();
  };

  const addStar = () => {
    if (!canvas) return;
    const points: { x: number; y: number }[] = [];
    const outer = 50;
    const inner = 20;
    for (let i = 0; i < 10; i++) {
      const angle = (Math.PI / 5) * i;
      const r = i % 2 === 0 ? outer : inner;
      points.push({
        x: 50 + r * Math.sin(angle),
        y: 50 - r * Math.cos(angle),
      });
    }
    const star = new Polygon(points, {
      left: 100,
      top: 100,
      fill: "rgba(0,0,0,0.1)",
      stroke: "#000",
      strokeWidth: 2,
    });
    canvas.add(star);
    canvas.setActiveObject(star);
    canvas.renderAll();
    pushHistory();
  };

  const addArrow = () => {
    if (!canvas) return;
    const line = new Line([0, 0, 80, 0], {
      stroke: "#000",
      strokeWidth: 2,
    });
    const head = new Polygon(
      [
        { x: 80, y: 0 },
        { x: 60, y: -10 },
        { x: 60, y: 10 },
      ],
      { fill: "#000", stroke: "#000", strokeWidth: 2 }
    );
    const arrow = new Group([line, head], { left: 100, top: 100 });
    canvas.add(arrow);
    canvas.setActiveObject(arrow);
    canvas.renderAll();
    pushHistory();
  };

  const addIcon = (name: string) => {
    if (!canvas) return;
    const icon = lucideIcons[name];
    if (!icon) return;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${icon.iconNode
      .map(([tag, attrs]) => {
        const attrString = Object.entries(attrs)
          .map(([k, v]) => `${k}="${v}"`)
          .join(" ");
        return `<${tag} ${attrString} />`;
      })
      .join("")}</svg>`;
    loadSVGFromString(svg, (objects, options) => {
      const obj = FabricUtil.groupSVGElements(objects, options);
      obj.set({ left: 100, top: 100, stroke: "#000", fill: "none" });
      canvas.add(obj);
      canvas.setActiveObject(obj);
      canvas.renderAll();
      pushHistory();
    });
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

  const addImageFromUrl = (url: string) => {
    if (!canvas) return;
    FabricImage.fromURL(url, (img) => {
      img.set({ left: 150, top: 150, scaleX: 0.5, scaleY: 0.5 });
      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
      pushHistory();
    });
  };

  const addImage = (file: File) => {
    if (!canvas) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      addImageFromUrl(url);
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      addImage(file);
      await uploadImage(file);
    }
  };

  const toggleReportType = (rt: string) => {
    const current = watch("reportTypes");
    if (current.includes(rt)) {
      setValue(
        "reportTypes",
        current.filter((t: string) => t !== rt),
      );
    } else {
      setValue("reportTypes", [...current, rt]);
    }
  };

  const onSubmit = async (values: FormValues) => {
    if (!canvas) return;
    const design = canvas.toJSON();
    let coverPageId = id;
    if (id) {
      await updateCoverPage({
        id,
        updates: {
          name: values.name,
          template_slug: values.template,
          design_json: design,
        },
      });
    } else {
      const cp = await createCoverPage({
        name: values.name,
        template_slug: values.template,
        design_json: design,
      });
      coverPageId = cp.id;
    }

    const assigned = Object.entries(assignments)
      .filter(([_, cpId]) => cpId === coverPageId)
      .map(([rt]) => rt);
    for (const rt of values.reportTypes) {
      if (!assigned.includes(rt)) {
        await assignCoverPageToReportType(rt, coverPageId!);
      }
    }
    for (const rt of assigned) {
      if (!values.reportTypes.includes(rt)) {
        await removeAssignmentFromReportType(rt);
      }
    }
    navigate("/cover-page-manager");
  };

  const updateSelected = (prop: string, value: unknown) => {
    if (!selected || !canvas) return;
    if (selected instanceof Group) {
      selected.getObjects().forEach((obj) =>
        (obj as unknown as FabricObject).set(prop as never, value as never)
      );
      selected.addWithUpdate();
    } else {
      (selected as unknown as FabricObject).set(prop as never, value as never);
      if (selected instanceof Textbox) {
        selected.initDimensions();
        selected.setCoords();
      }
    }
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
      <div className="w-[22rem] p-2 border-r space-y-2">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register("name")} />
          </div>
          <div className="space-y-1">
            <Label>Report Types</Label>
            {REPORT_TYPES.map((rt) => (
              <div key={rt.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`rt-${rt.value}`}
                  checked={reportTypes.includes(rt.value)}
                  onCheckedChange={() => toggleReportType(rt.value)}
                />
                <label htmlFor={`rt-${rt.value}`} className="text-sm">
                  {rt.label}
                </label>
              </div>
            ))}
          </div>
          <Button type="submit" className="w-full">
            Save
          </Button>
        </form>
        <Accordion type="single" collapsible defaultValue="text" className="w-full">
          <AccordionItem value="text">
            <AccordionTrigger>Text</AccordionTrigger>
                       <AccordionContent className="space-y-2">
              <Button onClick={addText} className="w-full">
                <Plus className="mr-2 h-4 w-4" /> Add Text Box
              </Button>
              {selected instanceof Textbox && (
                <>
                  <div>
                    <Label htmlFor="text-color">Color</Label>
                    <Input
                      id="text-color"
                      type="color"
                      value={
                        typeof selected.fill === "string" ? selected.fill : "#000000"
                      }
                      onChange={(e) => updateSelected("fill", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="text-font-size">Font Size</Label>
                    <Input
                      id="text-font-size"
                      type="number"
                      value={selected.fontSize || 16}
                      onChange={(e) =>
                        updateSelected("fontSize", parseInt(e.target.value, 10))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="fontFamily">Font Family</Label>
                    <select
                      id="fontFamily"
                      className="w-full border rounded"
                      value={selected.fontFamily || ""}
                      onChange={(e) => updateSelected("fontFamily", e.target.value)}
                    >
                      {FONTS.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="icon"
                      aria-label="Bold"
                      variant={selected.fontWeight === "bold" ? "default" : "outline"}
                      onClick={() =>
                        updateSelected(
                          "fontWeight",
                          selected.fontWeight === "bold" ? "normal" : "bold"
                        )
                      }
                    >
                      <Bold className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      aria-label="Italic"
                      variant={selected.fontStyle === "italic" ? "default" : "outline"}
                      onClick={() =>
                        updateSelected(
                          "fontStyle",
                          selected.fontStyle === "italic" ? "normal" : "italic"
                        )
                      }
                    >
                      <Italic className="h-4 w-4" />
                    </Button>
                  </div>
                  <div>
                    <Label>Alignment</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="icon"
                        aria-label="Align Left"
                        variant={
                          selected.textAlign === "left" ? "default" : "outline"
                        }
                        onClick={() => updateSelected("textAlign", "left")}
                      >
                        <AlignLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        aria-label="Align Center"
                        variant={
                          selected.textAlign === "center" ? "default" : "outline"
                        }
                        onClick={() => updateSelected("textAlign", "center")}
                      >
                        <AlignCenter className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        aria-label="Align Right"
                        variant={
                          selected.textAlign === "right" ? "default" : "outline"
                        }
                        onClick={() => updateSelected("textAlign", "right")}
                      >
                        <AlignRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="images">
            <AccordionTrigger>Images</AccordionTrigger>
            <AccordionContent>
              <Label htmlFor="image-upload" className="mb-1 block">
                Image Upload
              </Label>
              <Input id="image-upload" type="file" onChange={handleImageUpload} />
              <div className="mt-4 grid grid-cols-3 gap-2">
                {images.map((img) => (
                  <div
                    key={img.path}
                    className="relative group"
                    onClick={() => addImageFromUrl(img.url)}
                  >
                    <img
                      src={img.url}
                      alt={img.name}
                      className="h-20 w-full object-cover cursor-pointer"
                    />
                    <button
                      type="button"
                      className="absolute top-1 right-1 rounded-full bg-white p-1 text-red-500 opacity-0 group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteImage(img.path);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="graphics">
            <AccordionTrigger>Graphics</AccordionTrigger>
            <AccordionContent className="space-y-2">
              <Button onClick={addRect} className="w-full">
                <Square className="mr-2 h-4 w-4" /> Rectangle
              </Button>
              <Button onClick={addCircle} className="w-full">
                <CircleIcon className="mr-2 h-4 w-4" /> Circle
              </Button>
              <Button onClick={addStar} className="w-full">
                <StarIcon className="mr-2 h-4 w-4" /> Star
              </Button>
              <Button onClick={addArrow} className="w-full">
                <ArrowRightIcon className="mr-2 h-4 w-4" /> Arrow
              </Button>
              <div className="pt-2">
                <Label htmlFor="icon-search">Icons</Label>
                <Input
                  id="icon-search"
                  placeholder="Search icons..."
                  value={iconSearch}
                  onChange={(e) => setIconSearch(e.target.value)}
                />
                <div className="mt-2 grid grid-cols-6 gap-2 max-h-32 overflow-y-auto">
                  {Object.keys(lucideIcons)
                    .filter((name) =>
                      name.toLowerCase().includes(iconSearch.toLowerCase())
                    )
                    .slice(0, 50)
                    .map((name) => {
                      const pascal = name
                        .split("-")
                        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
                        .join("");
                      const IconComp = (
                        LucideIcons as Record<string, ComponentType<unknown>>
                      )[pascal];
                      if (!IconComp) return null;
                      return (
                        <button
                          key={name}
                          type="button"
                          className="p-1 border rounded hover:bg-accent flex items-center justify-center"
                          onClick={() => addIcon(name)}
                          title={name}
                        >
                          <IconComp className="h-4 w-4" />
                        </button>
                      );
                    })}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="tables">
            <AccordionTrigger>Tables</AccordionTrigger>
            <AccordionContent>
              <Button onClick={addTable} className="w-full">
                <TableIcon className="mr-2 h-4 w-4" /> Add Table
              </Button>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="design">
            <AccordionTrigger>Design Palette</AccordionTrigger>
            <AccordionContent>
              <Label htmlFor="template">Template</Label>
              <select id="template" className="w-full border rounded" {...register("template")}>
                {Object.keys(TEMPLATES).map((key) => (
                  <option key={key} value={key}>
                    {key}
                  </option>
                ))}
              </select>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="background">
            <AccordionTrigger>Background</AccordionTrigger>
            <AccordionContent>
              <Label htmlFor="bg-color">Background Color</Label>
              <Input
                id="bg-color"
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <div className="flex gap-2 pt-4">
          <Button onClick={undo} variant="outline" size="icon" aria-label="Undo">
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button onClick={redo} variant="outline" size="icon" aria-label="Redo">
            <Redo2 className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-2 pt-4">
          <Button onClick={zoomOut} variant="outline" size="icon" aria-label="Zoom Out">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button onClick={zoomIn} variant="outline" size="icon" aria-label="Zoom In">
            <ZoomIn className="h-4 w-4" />
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
        <div className="w-[22rem] p-2 border-l space-y-2">
          <div>
            <Label htmlFor="fill">Fill</Label>
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
          <div>
            <Label htmlFor="stroke">Stroke</Label>
            <Input
              id="stroke"
              type="color"
              value={
                selected && "stroke" in selected && typeof (selected as { stroke?: string }).stroke === "string"
                  ? (selected as { stroke?: string }).stroke
                  : "#000000"
              }
              onChange={(e) => updateSelected("stroke", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="strokeWidth">Stroke Width</Label>
            <Input
              id="strokeWidth"
              type="number"
              value={
                selected && "strokeWidth" in selected
                  ? (selected as { strokeWidth?: number }).strokeWidth ?? 1
                  : 1
              }
              onChange={(e) =>
                updateSelected("strokeWidth", parseInt(e.target.value, 10))
              }
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
              size="icon"
              aria-label="Bring Forward"
              onClick={() => {
                if (selected && canvas) {
                  canvas.bringForward(selected);
                  canvas.renderAll();
                  pushHistory();
                }
              }}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              aria-label="Send Backward"
              onClick={() => {
                if (selected && canvas) {
                  canvas.sendBackwards(selected);
                  canvas.renderAll();
                  pushHistory();
                }
              }}
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

