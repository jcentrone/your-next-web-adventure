import {useEffect, useRef, useState, type ChangeEvent} from "react";
import {useForm} from "react-hook-form";
import {useNavigate, useParams} from "react-router-dom";
import {
    Canvas as FabricCanvas,
    FabricObject,
    Group,
    Image as FabricImage,
    loadSVGFromString,
} from "fabric";
import {
    addRect as fabricAddRect,
    addCircle as fabricAddCircle,
    addStar as fabricAddStar,
    addTriangle as fabricAddTriangle,
    addPolygon as fabricAddPolygon,
    addArrow as fabricAddArrow,
    addBidirectionalArrow as fabricAddBidirectionalArrow,
    addText as fabricAddText,
} from "@/lib/fabricShapes";
import {handleCoverElementDrop} from "@/lib/handleCoverElementDrop";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {EditorToolbar} from "@/components/cover-pages/EditorToolbar";
import {EditorSidebar} from "@/components/cover-pages/EditorSidebar";
import {PropertiesPanel} from "@/components/cover-pages/PropertiesPanel";
import {CanvasWorkspace} from "@/components/cover-pages/CanvasWorkspace";
import useCoverPages from "@/hooks/useCoverPages";
import useImageLibrary from "@/hooks/useImageLibrary";
import {COLOR_PALETTES, type ColorPalette} from "@/constants/colorPalettes";
import {PRESET_BG_COLORS, REPORT_TYPES, TEMPLATES} from "@/constants/coverPageEditor";
import * as LucideIcons from "lucide-react";
import {toast} from "sonner";

interface FormValues {
    name: string;
    template: keyof typeof TEMPLATES;
    reportTypes: string[];
}

export default function CoverPageEditorPage() {
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
                canvas.getObjects().forEach((obj) => obj.set({ visible: true }));
                canvas.requestRenderAll();
                const json = JSON.stringify(canvas.toJSON());
                setHistory([json]);
                setHistoryIndex(0);
            });
        }
    }, [canvas, id, coverPages, assignments, setValue]);

    useEffect(() => {
        if (canvas) {
            canvas.set({ backgroundColor: bgColor });
            canvas.renderAll();
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
        fabricAddText(canvas, palette, content || "Add your text here", x, y);
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
                    visible: true,
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
                if (objects) {
                    // In Fabric.js v6, objects is the parsed SVG group already
                    const obj = objects as any;
                    obj.set({left: x, top: y, scaleX: 0.5, scaleY: 0.5, visible: true});
                    canvas.add(obj);
                    canvas.setActiveObject(obj);
                    canvas.renderAll();
                    pushHistory();
                }
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
                visible: true,
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

    const handleDropElement = ({type, data, x, y}: {type: string; data: unknown; x: number; y: number}) =>
        handleCoverElementDrop(
            canvas,
            palette,
            {type, data, x, y},
            {
                addImage: handleAddImage,
                addIcon: handleAddIcon,
                addClipart: handleAddClipart,
            },
            pushHistory,
        );

    const addText = () => {
        if (!canvas) return;
        fabricAddText(canvas, palette, "Add your text here");
        pushHistory();
    };
    const addRect = () => {
        if (!canvas) return;
        fabricAddRect(canvas, palette);
        pushHistory();
    };
    const addCircle = () => {
        if (!canvas) return;
        fabricAddCircle(canvas, palette);
        pushHistory();
    };
    const addStar = () => {
        if (!canvas) return;
        fabricAddStar(canvas, palette);
        pushHistory();
    };
    const addTriangle = () => {
        if (!canvas) return;
        fabricAddTriangle(canvas, palette);
        pushHistory();
    };
    const addPolygonShape = () => {
        if (!canvas) return;
        fabricAddPolygon(canvas, palette);
        pushHistory();
    };
    const addArrow = () => {
        if (!canvas) return;
        fabricAddArrow(canvas, palette);
        pushHistory();
    };
    const addBidirectionalArrow = () => {
        if (!canvas) return;
        fabricAddBidirectionalArrow(canvas, palette);
        pushHistory();
    };
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

    const handleToggleLayerVisibility = (layer: FabricObject) => {
        if (!canvas) return;

        layer.set("visible", !layer.visible);
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
                selected={selectedObject}
                isTable={false}
                updateSelected={updateSelected}
                updateTable={() => {}}
                onBringForward={handleBringForward}
                onSendBackward={handleSendBackward}
            />

            {/* Main Layout */}
            <div className="flex flex-1 overflow-hidden">
                {/* Left Sidebar */}
                <div className="flex-none">
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
                </div>

                {/* Canvas Workspace */}
                <div className="mt-4 flex-1 overflow-auto">
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
                <div className="flex-none">
                    <PropertiesPanel
                        selectedObject={selectedObject}
                        onUpdateProperty={handleUpdateProperty}
                        onDeleteObject={handleDelete}
                        onDuplicateObject={handleCopy}
                        onBringForward={handleBringForward}
                        onSendBackward={handleSendBackward}
                        onToggleLock={handleToggleLock}
                        onToggleVisible={handleToggleVisible}
                        onToggleLayerVisibility={handleToggleLayerVisibility}
                        layers={layers}
                        onSelectLayer={handleSelectLayer}
                    />
                </div>
            </div>
        </div>

    );
}