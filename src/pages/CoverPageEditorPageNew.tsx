import {useEffect, useRef, useState, type ChangeEvent} from "react";
import {useForm} from "react-hook-form";
import {useNavigate, useParams} from "react-router-dom";
import {
    Canvas as FabricCanvas,
    Circle,
    FabricObject,
    Group,
    Image as FabricImage,
    loadSVGFromString,
    Polygon,
    Rect,
    Textbox,
    util as FabricUtil,
} from "fabric";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {EditorToolbar} from "@/components/cover-pages/EditorToolbar";
import {EditorSidebar} from "@/components/cover-pages/EditorSidebar";
import {PropertiesPanel} from "@/components/cover-pages/PropertiesPanel";
import {CanvasWorkspace} from "@/components/cover-pages/CanvasWorkspace";
import useCoverPages from "@/hooks/useCoverPages";
import useImageLibrary from "@/hooks/useImageLibrary";
import {COLOR_PALETTES, type ColorPalette} from "@/constants/colorPalettes";
import * as LucideIcons from "lucide-react";
import {toast} from "sonner";

const TEMPLATES: Record<string, string> = {
    default: "#ffffff",
    blue: "#ebf8ff",
};

const REPORT_TYPES = [
    {value: "home_inspection", label: "Home Inspection"},
    {value: "wind_mitigation", label: "Wind Mitigation"},
];

const FONTS = ["Arial", "Helvetica", "Times New Roman", "Courier New"];
const PRESET_BG_COLORS = Object.values(TEMPLATES);

interface FormValues {
    name: string;
    template: keyof typeof TEMPLATES;
    reportTypes: string[];
}

export default function CoverPageEditorPageNew() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [canvas, setCanvas] = useState<FabricCanvas | null>(null);
    const [selectedObjects, setSelectedObjects] = useState<FabricObject[]>([]);
    const [zoom, setZoom] = useState(1);
    const [showGrid, setShowGrid] = useState(true);
    const [showRulers, setShowRulers] = useState(true);
    const [history, setHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [palette, setPalette] = useState<ColorPalette>(COLOR_PALETTES[0]);
    const [bgColor, setBgColor] = useState(TEMPLATES["default"]);
    const [activePanel, setActivePanel] = useState<string | null>("settings");

    const {id} = useParams<{ id: string }>();
    const navigate = useNavigate();

    const {
        createCoverPage,
        updateCoverPage,
        assignments,
        assignCoverPageToReportType,
        removeAssignmentFromReportType,
        coverPages,
    } = useCoverPages();

    const {images, uploadImage, deleteImage} = useImageLibrary();

    const form = useForm<FormValues>({
        defaultValues: {name: "", template: "default", reportTypes: []},
    });

    const {register, handleSubmit, setValue, watch} = form;
    const template = watch("template") as keyof typeof TEMPLATES;
    const reportTypes = watch("reportTypes");

    // Initialize canvas
    useEffect(() => {
        const canvasElement = canvasRef.current;
        if (!canvasElement) return;

        const c = new FabricCanvas(canvasElement, {
            width: 800,
            height: 1000,
            backgroundColor: "#ffffff",
        });

        setCanvas(c);

        // Event listeners
        c.on("selection:cleared", () => setSelectedObjects([]));
        c.on("selection:updated", (e) => setSelectedObjects(e.selected || []));
        c.on("selection:created", (e) => setSelectedObjects(e.selected || []));
        c.on("object:modified", () => pushHistory());

        // Initial history
        const initialJson = JSON.stringify(c.toJSON());
        setHistory([initialJson]);
        setHistoryIndex(0);

        return () => {
            c.dispose();
        };
    }, []);

    // Load existing cover page
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

        if (cp.design_json) {
            canvas.loadFromJSON(cp.design_json as any, () => {
                canvas.renderAll();
                const json = JSON.stringify(canvas.toJSON());
                setHistory([json]);
                setHistoryIndex(0);
            });
        }
    }, [canvas, id, coverPages, assignments, setValue]);

    useEffect(() => {
        if (canvas) {
            canvas.setBackgroundColor(bgColor, () => canvas.renderAll());
        }
    }, [canvas, bgColor]);

    const pushHistory = () => {
        if (!canvas) return;
        const json = JSON.stringify(canvas.toJSON());
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(json);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    };

    // Toolbar handlers
    const handleUndo = () => {
        if (historyIndex > 0) {
            setHistoryIndex(historyIndex - 1);
            canvas?.loadFromJSON(JSON.parse(history[historyIndex - 1]), () => {
                canvas.renderAll();
            });
        }
    };

    const handleRedo = () => {
        if (historyIndex < history.length - 1) {
            setHistoryIndex(historyIndex + 1);
            canvas?.loadFromJSON(JSON.parse(history[historyIndex + 1]), () => {
                canvas.renderAll();
            });
        }
    };

    const handleZoomIn = () => setZoom(Math.min(zoom * 1.2, 5));
    const handleZoomOut = () => setZoom(Math.max(zoom / 1.2, 0.1));
    const handleZoomChange = (newZoom: number) => setZoom(Math.max(0.1, Math.min(5, newZoom)));

    const handleCopy = () => {
        if (!canvas || selectedObjects.length === 0) return;

        selectedObjects.forEach((obj) => {
            obj.clone().then((cloned: FabricObject) => {
                cloned.set({
                    left: (cloned.left || 0) + 10,
                    top: (cloned.top || 0) + 10,
                });
                canvas.add(cloned);
                canvas.setActiveObject(cloned);
                canvas.renderAll();
                pushHistory();
            });
        });
    };

    const handleDelete = () => {
        if (!canvas || selectedObjects.length === 0) return;

        selectedObjects.forEach((obj) => {
            canvas.remove(obj);
        });
        canvas.renderAll();
        pushHistory();
    };

    const handleGroup = () => {
        if (!canvas || selectedObjects.length < 2) return;

        const group = new Group(selectedObjects, {
            left: 0,
            top: 0,
        });

        selectedObjects.forEach((obj) => canvas.remove(obj));
        canvas.add(group);
        canvas.setActiveObject(group);
        canvas.renderAll();
        pushHistory();
    };

    const handleUngroup = () => {
        if (!canvas || selectedObjects.length !== 1) return;

        const obj = selectedObjects[0];
        if (obj.type === "group") {
            const group = obj as Group;
            const objects = group.getObjects();
            canvas.remove(group);

            objects.forEach((o) => {
                canvas.add(o);
            });

            canvas.renderAll();
            pushHistory();
        }
    };

    const handleAlign = (type: string) => {
        if (!canvas || selectedObjects.length < 2) return;

        const activeSelection = canvas.getActiveObject();
        if (!activeSelection || activeSelection.type !== "activeSelection") return;

        const objects = (activeSelection as any).getObjects();
        if (!objects || objects.length < 2) return;

        // Get bounds
        const bounds = objects.reduce((acc: any, obj: any) => {
            const objBounds = obj.getBoundingRect();
            return {
                left: Math.min(acc.left || objBounds.left, objBounds.left),
                top: Math.min(acc.top || objBounds.top, objBounds.top),
                right: Math.max(acc.right || objBounds.left + objBounds.width, objBounds.left + objBounds.width),
                bottom: Math.max(acc.bottom || objBounds.top + objBounds.height, objBounds.top + objBounds.height),
            };
        }, {});

        objects.forEach((obj: any) => {
            const objBounds = obj.getBoundingRect();

            switch (type) {
                case "left":
                    obj.set({left: bounds.left});
                    break;
                case "right":
                    obj.set({left: bounds.right - objBounds.width});
                    break;
                case "centerH":
                    obj.set({left: bounds.left + (bounds.right - bounds.left) / 2 - objBounds.width / 2});
                    break;
                case "top":
                    obj.set({top: bounds.top});
                    break;
                case "bottom":
                    obj.set({top: bounds.bottom - objBounds.height});
                    break;
                case "centerV":
                    obj.set({top: bounds.top + (bounds.bottom - bounds.top) / 2 - objBounds.height / 2});
                    break;
            }

            obj.setCoords();
        });

        canvas.renderAll();
        pushHistory();
    };

    // Sidebar handlers
    const handleAddText = (content?: string, x = 100, y = 100) => {
        if (!canvas) return;

        const text = new Textbox(content || "Add your text here", {
            left: x,
            top: y,
            fontFamily: "Arial",
            fontSize: 20,
            fill: palette.colors[0],
        });

        canvas.add(text);
        canvas.setActiveObject(text);
        canvas.renderAll();
        pushHistory();
    };

    const handleAddShape = (shape: string, x = 100, y = 100) => {
        if (!canvas) return;

        let obj: FabricObject;

        switch (shape) {
            case "rectangle":
                obj = new Rect({
                    left: x,
                    top: y,
                    width: 100,
                    height: 100,
                    fill: palette.colors[0],
                    stroke: palette.colors[1] || palette.colors[0],
                    strokeWidth: 2,
                });
                break;
            case "circle":
                obj = new Circle({
                    left: x,
                    top: y,
                    radius: 50,
                    fill: palette.colors[0],
                    stroke: palette.colors[1] || palette.colors[0],
                    strokeWidth: 2,
                });
                break;
            case "star":
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
                obj = new Polygon(points, {
                    left: x,
                    top: y,
                    fill: palette.colors[0],
                    stroke: palette.colors[1] || palette.colors[0],
                    strokeWidth: 2,
                });
                break;
            case "triangle":
                obj = new Polygon([
                    {x: 50, y: 0},
                    {x: 0, y: 100},
                    {x: 100, y: 100}
                ], {
                    left: x,
                    top: y,
                    fill: palette.colors[0],
                    stroke: palette.colors[1] || palette.colors[0],
                    strokeWidth: 2,
                });
                break;
            case "polygon":
                const sides = 5;
                const radius = 50;
                const polyPoints: { x: number; y: number }[] = [];
                for (let i = 0; i < sides; i++) {
                    const angle = (2 * Math.PI * i) / sides;
                    polyPoints.push({
                        x: radius + radius * Math.sin(angle),
                        y: radius - radius * Math.cos(angle),
                    });
                }
                obj = new Polygon(polyPoints, {
                    left: x,
                    top: y,
                    fill: palette.colors[0],
                    stroke: palette.colors[1] || palette.colors[0],
                    strokeWidth: 2,
                });
                break;
            case "arrow":
                obj = new Polygon([
                    {x: 0, y: 40},
                    {x: 60, y: 40},
                    {x: 60, y: 20},
                    {x: 100, y: 50},
                    {x: 60, y: 80},
                    {x: 60, y: 60},
                    {x: 0, y: 60},
                ], {
                    left: x,
                    top: y,
                    fill: palette.colors[0],
                    stroke: palette.colors[1] || palette.colors[0],
                    strokeWidth: 2,
                });
                break;
            case "bidirectionalArrow":
                obj = new Polygon([
                    {x: 0, y: 50},
                    {x: 20, y: 20},
                    {x: 20, y: 40},
                    {x: 80, y: 40},
                    {x: 80, y: 20},
                    {x: 100, y: 50},
                    {x: 80, y: 80},
                    {x: 80, y: 60},
                    {x: 20, y: 60},
                    {x: 20, y: 80},
                ], {
                    left: x,
                    top: y,
                    fill: palette.colors[0],
                    stroke: palette.colors[1] || palette.colors[0],
                    strokeWidth: 2,
                });
                break;
            default:
                return;
        }

        canvas.add(obj);
        canvas.setActiveObject(obj);
        canvas.renderAll();
        pushHistory();
    };

    const handleAddIcon = (iconName: string, x = 100, y = 100) => {
        if (!canvas) return;

        const IconComponent = (LucideIcons as any)[iconName];
        if (!IconComponent) return;

        // Create SVG string from Lucide icon
        const svg = `<svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="${palette.colors[0]}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <!-- This would need to be the actual SVG path for the icon -->
    </svg>`;

        loadSVGFromString(svg, (objects) => {
            const obj = objects[0];
            if (obj) {
                obj.set({
                    left: x,
                    top: y,
                    scaleX: 2,
                    scaleY: 2,
                });
                canvas.add(obj);
                canvas.setActiveObject(obj);
                canvas.renderAll();
                pushHistory();
            }
        });
    };

    const handleAddClipart = async (hex: string, x = 100, y = 100) => {
        if (!canvas) return;
        try {
            const url = `https://cdn.jsdelivr.net/npm/openmoji@16.0.0/color/svg/${hex}.svg`;
            const svg = await fetch(url).then((r) => r.text());
            loadSVGFromString(svg, (objects, options) => {
                const obj = FabricUtil.groupSVGElements(objects, options);
                obj.set({left: x, top: y, scaleX: 0.5, scaleY: 0.5});
                canvas.add(obj);
                canvas.setActiveObject(obj);
                canvas.renderAll();
                pushHistory();
            });
        } catch {
        }
    };

    const handleAddImage = (imageUrl: string, x = 100, y = 100) => {
        if (!canvas) return;

        FabricImage.fromURL(imageUrl, {
            crossOrigin: "anonymous",
        }).then((img) => {
            img.set({
                left: x,
                top: y,
                scaleX: 0.5,
                scaleY: 0.5,
            });
            canvas.add(img);
            canvas.setActiveObject(img);
            canvas.renderAll();
            pushHistory();
        });
    };

    const handleUploadImage = async (file: File) => {
        try {
            const uploadedImageData = await uploadImage(file);
            if (uploadedImageData) {
                const imageUrl = typeof uploadedImageData === 'string'
                    ? uploadedImageData
                    : (uploadedImageData as any)?.url || '';
                if (imageUrl) {
                    handleAddImage(imageUrl);
                    toast.success("Image uploaded successfully");
                }
            }
        } catch (error) {
            toast.error("Failed to upload image");
        }
    };

    const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            await handleUploadImage(file);
        }
    };

    const handleDeleteImage = async (path: string) => {
        try {
            await deleteImage(path);
            toast.success("Image deleted");
        } catch {
            toast.error("Failed to delete image");
        }
    };

    const handleDropElement = ({type, data, x, y}: {type: string; data: any; x: number; y: number}) => {
        switch (type) {
            case "text":
                handleAddText(undefined, x, y);
                break;
            case "rectangle":
            case "circle":
            case "star":
            case "triangle":
            case "polygon":
            case "arrow":
            case "bidirectionalArrow":
                handleAddShape(type, x, y);
                break;
            case "image":
                if (data?.url) handleAddImage(data.url, x, y);
                break;
            case "icon":
                if (data?.name) handleAddIcon(data.name, x, y);
                break;
            case "clipart":
                if (data?.hex) handleAddClipart(data.hex, x, y);
                break;
            default:
                break;
        }
    };

    const addText = () => handleAddText();
    const addRect = () => handleAddShape("rectangle");
    const addCircle = () => handleAddShape("circle");
    const addStar = () => handleAddShape("star");
    const addTriangle = () => handleAddShape("triangle");
    const addPolygonShape = () => handleAddShape("polygon");
    const addArrow = () => handleAddShape("arrow");
    const addBidirectionalArrow = () => handleAddShape("bidirectionalArrow");
    const addIcon = (name: string) => handleAddIcon(name);
    const addClipart = (hex: string) => handleAddClipart(hex);

    const updateSelected = (prop: string, value: unknown) => {
        if (!canvas || selectedObjects.length !== 1) return;
        const obj = selectedObjects[0];
        (obj as any).set(prop, value);
        obj.setCoords();
        canvas.renderAll();
        pushHistory();
    };

    const handleAddPlaceholder = (token: string) => {
        handleAddText(token);
    };

    const applyPalette = (p: ColorPalette) => {
        setPalette(p);
    };

    const updateBgColor = (color: string) => {
        setBgColor(color);
    };

    // Properties panel handlers
    const handleUpdateProperty = (property: string, value: any) => {
        if (!canvas || selectedObjects.length === 0) return;

        selectedObjects.forEach((obj) => {
            obj.set(property, value);
            obj.setCoords();
        });

        canvas.renderAll();
        pushHistory();
    };

    const handleBringForward = () => {
        if (!canvas || selectedObjects.length === 0) return;

        selectedObjects.forEach((obj) => {
            canvas.bringObjectForward(obj);
        });
        canvas.renderAll();
        pushHistory();
    };

    const handleSendBackward = () => {
        if (!canvas || selectedObjects.length === 0) return;

        selectedObjects.forEach((obj) => {
            canvas.sendObjectBackwards(obj);
        });
        canvas.renderAll();
        pushHistory();
    };

    const handleToggleLock = () => {
        if (!canvas || selectedObjects.length === 0) return;

        selectedObjects.forEach((obj) => {
            const isLocked = obj.lockMovementX;
            obj.set({
                lockMovementX: !isLocked,
                lockMovementY: !isLocked,
                lockRotation: !isLocked,
                lockScalingX: !isLocked,
                lockScalingY: !isLocked,
            });
        });

        canvas.renderAll();
    };

    const handleToggleVisible = () => {
        if (!canvas || selectedObjects.length === 0) return;

        selectedObjects.forEach((obj) => {
            obj.set("visible", !obj.visible);
        });

        canvas.renderAll();
    };

    const handleSelectLayer = (object: FabricObject) => {
        if (!canvas) return;

        canvas.setActiveObject(object);
        canvas.renderAll();
    };

    // Save handlers
    const onSubmit = async (data: FormValues) => {
        if (!canvas) return;

        try {
            const designJson = canvas.toJSON();

            if (id) {
                await updateCoverPage({
                    id,
                    updates: {
                        name: data.name,
                        template_slug: data.template,
                        design_json: designJson as any,
                    },
                });
            } else {
                const newCoverPage = await createCoverPage({
                    name: data.name,
                    template_slug: data.template,
                    design_json: designJson as any,
                });

                // Handle assignments
                for (const reportType of data.reportTypes) {
                    await assignCoverPageToReportType(reportType, newCoverPage.id);
                }
            }

            toast.success(id ? "Cover page updated!" : "Cover page created!");
            navigate("/cover-page-manager");
        } catch (error) {
            toast.error("Failed to save cover page");
        }
    };

    const selectedObject = selectedObjects[0] || null;
    const layers = canvas?.getObjects() || [];

    return (
        <div className=" flex flex-col bg-background">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        onClick={() => navigate("/cover-page-manager")}
                    >
                        Back
                    </Button>
                    <h1 className="text-xl font-semibold">
                        {id ? "Edit Cover Page" : "Create Cover Page"}
                    </h1>
                </div>

                {/* Save Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="flex items-center gap-2">
                    <Input
                        {...register("name", {required: true})}
                        placeholder="Cover page name"
                        className="w-48"
                    />
                    <Button type="submit">
                        {id ? "Update" : "Create"}
                    </Button>
                </form>
            </div>

            {/* Toolbar */}
            <EditorToolbar
                onUndo={handleUndo}
                onRedo={handleRedo}
                canUndo={historyIndex > 0}
                canRedo={historyIndex < history.length - 1}
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                zoom={zoom}
                onZoomChange={handleZoomChange}
                showGrid={showGrid}
                onToggleGrid={() => setShowGrid(!showGrid)}
                showRulers={showRulers}
                onToggleRulers={() => setShowRulers(!showRulers)}
                selectedObjects={selectedObjects}
                onCopy={handleCopy}
                onDelete={handleDelete}
                onGroup={handleGroup}
                onUngroup={handleUngroup}
                onAlign={handleAlign}
            />

            {/* Main Layout */}
            <div className="flex flex-1 overflow-hidden">
                {/* Left Sidebar */}
                <EditorSidebar
                    activePanel={activePanel}
                    setActivePanel={setActivePanel}
                    onSettingsSubmit={handleSubmit(onSubmit)}
                    register={register}
                    reportTypes={reportTypes}
                    reportTypeOptions={REPORT_TYPES}
                    toggleReportType={(rt) => {
                        if (reportTypes.includes(rt)) {
                            setValue("reportTypes", reportTypes.filter((t) => t !== rt));
                        } else {
                            setValue("reportTypes", [...reportTypes, rt]);
                        }
                    }}
                    addText={addText}
                    selected={selectedObject}
                    updateSelected={updateSelected}
                    fonts={FONTS}
                    images={images}
                    onImageUpload={handleImageUpload}
                    onDeleteImage={handleDeleteImage}
                    onAddImageFromUrl={handleAddImage}
                    addRect={addRect}
                    addCircle={addCircle}
                    addStar={addStar}
                    addTriangle={addTriangle}
                    addPolygonShape={addPolygonShape}
                    addArrow={addArrow}
                    addBidirectionalArrow={addBidirectionalArrow}
                    addIcon={addIcon}
                    addClipart={addClipart}
                    templateOptions={Object.keys(TEMPLATES)}
                    palette={palette}
                    onApplyPalette={applyPalette}
                    bgColor={bgColor}
                    presetBgColors={PRESET_BG_COLORS}
                    updateBgColor={updateBgColor}
                    onAddPlaceholder={handleAddPlaceholder}
                />

                {/* Canvas Workspace */}
                <div className={"mt-4"}>
                    <CanvasWorkspace
                        canvasRef={canvasRef}
                        canvas={canvas}
                        zoom={zoom}
                        showGrid={showGrid}
                        showRulers={showRulers}
                        onDropElement={handleDropElement}
                    />
                </div>

                {/* Right Properties Panel */}
                <PropertiesPanel
                    selectedObject={selectedObject}
                    onUpdateProperty={handleUpdateProperty}
                    onDeleteObject={handleDelete}
                    onDuplicateObject={handleCopy}
                    onBringForward={handleBringForward}
                    onSendBackward={handleSendBackward}
                    onToggleLock={handleToggleLock}
                    onToggleVisible={handleToggleVisible}
                    layers={layers}
                    onSelectLayer={handleSelectLayer}
                />
            </div>
        </div>

    );
}