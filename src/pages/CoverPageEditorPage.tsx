import {type ChangeEvent, useEffect, useRef, useState} from "react";
import {useForm} from "react-hook-form";
import {useNavigate, useParams} from "react-router-dom";
import {Canvas as FabricCanvas, FabricObject, Group, Image as FabricImage, loadSVGFromString,} from "fabric";
import {
    addArrow as fabricAddArrow,
    addBidirectionalArrow as fabricAddBidirectionalArrow,
    addCircle as fabricAddCircle,
    addPolygon as fabricAddPolygon,
    addRect as fabricAddRect,
    addStar as fabricAddStar,
    addText as fabricAddText,
    addTriangle as fabricAddTriangle,
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
import {useCanvasKeyboardShortcuts} from "@/hooks/useCanvasKeyboardShortcuts";
import {KeyboardShortcutsModal} from "@/components/modals/KeyboardShortcutsModal";
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
    const [layers, setLayers] = useState<FabricObject[]>([]);
    const [zoom, setZoom] = useState(1);
    const [showGrid, setShowGrid] = useState(true);
    const [showRulers, setShowRulers] = useState(true);
    const [snapEnabled, setSnapEnabled] = useState(false);
    const [history, setHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [palette, setPalette] = useState<ColorPalette>(COLOR_PALETTES[0]);
    const [bgColor, setBgColor] = useState(TEMPLATES["default"]);
    const [activePanel, setActivePanel] = useState<string | null>("settings");
    const [shortcutsOpen, setShortcutsOpen] = useState(false);

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

    useEffect(() => {
        register("reportTypes");
    }, [register]);

    const template = watch("template") as keyof typeof TEMPLATES;
    const reportTypes = watch("reportTypes");
    const loaded = useRef(false);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "/") {
                e.preventDefault();
                setShortcutsOpen((o) => !o);
            }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, []);

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
        const updateSelection = () => setSelectedObjects([...c.getActiveObjects()]);
        const clearSelection = () => setSelectedObjects([]);
        const updateLayers = () => setLayers([...c.getObjects()]);
        c.on("selection:created", updateSelection);
        c.on("selection:updated", updateSelection);
        c.on("selection:cleared", clearSelection);
        c.on("object:added", updateLayers);
        c.on("object:removed", updateLayers);
        c.on("object:modified", () => {
            updateLayers();
            pushHistory();
        });

        // Initial layers
        updateLayers();

        // Initial history
        const initialJson = JSON.stringify(c.toJSON());
        setHistory([initialJson]);
        setHistoryIndex(0);

        return () => {
            c.off("selection:created", updateSelection);
            c.off("selection:updated", updateSelection);
            c.off("selection:cleared", clearSelection);
            c.off("object:added", updateLayers);
            c.off("object:removed", updateLayers);
            c.off("object:modified");
            c.dispose();
        };
    }, []);

    // Load existing cover page
    useEffect(() => {
        if (!canvas || !id || !coverPages.length) return;
        const cp = coverPages.find((c) => c.id === id);
        if (!cp) return;
        const selectedReportTypes = Object.entries(assignments)
            .filter(([_, cpId]) => cpId === id)
            .map(([rt]) => rt);
        form.reset({
            name: cp.name,
            template: (cp.template_slug as keyof typeof TEMPLATES) || "default",
            reportTypes: selectedReportTypes,
        });
        if (!loaded.current && cp.design_json) {
            canvas.loadFromJSON(cp.design_json as any, () => {
                canvas.requestRenderAll();
                setLayers([...canvas.getObjects()]);
            });
            loaded.current = true;
        }
    }, [canvas, id, coverPages, assignments, form]);

    useEffect(() => {
        if (canvas) {
            canvas.set({backgroundColor: bgColor});
            canvas.renderAll();
        }
    }, [canvas, bgColor]);

    useEffect(() => {
        if (!canvas) return;
        const handleObjectMoving = (e: any) => {
            if (!snapEnabled || !e.target) return;
            const grid = 16; // pixels per grid step
            e.target.set({
                left: Math.round(e.target.left / grid) * grid,
                top: Math.round(e.target.top / grid) * grid,
            });
        };
        canvas.on("object:moving", handleObjectMoving);
        return () => {
            canvas.off("object:moving", handleObjectMoving);
        };
    }, [canvas, snapEnabled]);

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
        if (!canvas) return;
        const objects = canvas.getActiveObjects();
        if (objects.length < 2) return;

        const bounds = objects.reduce(
            (acc, obj) => {
                const rect = obj.getBoundingRect(true);
                return {
                    left: Math.min(acc.left, rect.left),
                    top: Math.min(acc.top, rect.top),
                    right: Math.max(acc.right, rect.left + rect.width),
                    bottom: Math.max(acc.bottom, rect.top + rect.height),
                };
            },
            {left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity},
        );

        objects.forEach((obj) => {
            const rect = obj.getBoundingRect(true);
            const offsetX = rect.left - (obj.left ?? 0);
            const offsetY = rect.top - (obj.top ?? 0);

            switch (type) {
                case "left":
                    obj.set({left: bounds.left - offsetX});
                    break;
                case "right":
                    obj.set({left: bounds.right - rect.width - offsetX});
                    break;
                case "centerH":
                    obj.set({
                        left:
                            bounds.left + (bounds.right - bounds.left - rect.width) / 2 -
                            offsetX,
                    });
                    break;
                case "top":
                    obj.set({top: bounds.top - offsetY});
                    break;
                case "bottom":
                    obj.set({top: bounds.bottom - rect.height - offsetY});
                    break;
                case "centerV":
                    obj.set({
                        top:
                            bounds.top + (bounds.bottom - bounds.top - rect.height) / 2 -
                            offsetY,
                    });
                    break;
            }

            obj.setCoords();
        });

        canvas.requestRenderAll();
        pushHistory();
    };

    const handleDistribute = (axis: "h" | "v") => {
        if (!canvas || selectedObjects.length < 2) return;

        const activeSelection = canvas.getActiveObject();
        if (!activeSelection || activeSelection.type !== "activeSelection") return;

        const objects = (activeSelection as any).getObjects();
        if (!objects || objects.length < 2) return;

        if (axis === "h") {
            const sorted = objects
                .map((o: any) => ({obj: o, bounds: o.getBoundingRect(true)}))
                .sort((a: any, b: any) => a.bounds.left - b.bounds.left);

            const first = sorted[0].bounds;
            const last = sorted[sorted.length - 1].bounds;
            const minX = first.left;
            const maxX = last.left + last.width;
            const totalWidth = sorted.reduce((sum: number, o: any) => sum + o.bounds.width, 0);
            const spacing = sorted.length > 1 ? (maxX - minX - totalWidth) / (sorted.length - 1) : 0;

            let currentX = minX;
            sorted.forEach(({obj, bounds}: any) => {
                const offset = (obj.left || 0) - bounds.left;
                obj.set({left: currentX + offset});
                obj.setCoords();
                currentX += bounds.width + spacing;
            });
        } else {
            const sorted = objects
                .map((o: any) => ({obj: o, bounds: o.getBoundingRect(true)}))
                .sort((a: any, b: any) => a.bounds.top - b.bounds.top);

            const first = sorted[0].bounds;
            const last = sorted[sorted.length - 1].bounds;
            const minY = first.top;
            const maxY = last.top + last.height;
            const totalHeight = sorted.reduce((sum: number, o: any) => sum + o.bounds.height, 0);
            const spacing = sorted.length > 1 ? (maxY - minY - totalHeight) / (sorted.length - 1) : 0;

            let currentY = minY;
            sorted.forEach(({obj, bounds}: any) => {
                const offset = (obj.top || 0) - bounds.top;
                obj.set({top: currentY + offset});
                obj.setCoords();
                currentY += bounds.height + spacing;
            });
        }

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

    const handleDropElement = ({type, data, x, y}: { type: string; data: unknown; x: number; y: number }) =>
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

    const handleBringToFront = () => {
        if (!canvas || selectedObjects.length === 0) return;

        selectedObjects.forEach((obj) => {
            canvas.bringObjectToFront(obj);
        });
        canvas.renderAll();
        pushHistory();
    };

    const handleSendToBack = () => {
        if (!canvas || selectedObjects.length === 0) return;

        selectedObjects.forEach((obj) => {
            canvas.sendObjectToBack(obj);
        });
        canvas.renderAll();
        pushHistory();
    };

    const handleToggleLayerVisibility = (layer: FabricObject) => {
        if (!canvas) return;

        layer.set("visible", !layer.visible);
        setLayers([...canvas.getObjects()]);
        canvas.requestRenderAll();
    };

    const handleDeleteLayer = (layer: FabricObject) => {
        canvas.remove(layer);
        canvas.discardActiveObject();
        setSelectedObjects(canvas.getActiveObjects());
        canvas.renderAll();
        pushHistory();
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

    useCanvasKeyboardShortcuts({
        canvas,
        onUndo: handleUndo,
        onRedo: handleRedo,
        onCopy: handleCopy,
        onDelete: handleDelete,
        onGroup: handleGroup,
        onUngroup: handleUngroup,
        onZoomIn: handleZoomIn,
        onZoomOut: handleZoomOut,
        setZoom,
        onSave: () => handleSubmit(onSubmit)(),
        onEscape: () => canvas?.discardActiveObject(),
        onBringForward: handleBringForward,
        onSendBackward: handleSendBackward,
    });

    return (
        <>
            <KeyboardShortcutsModal
                open={shortcutsOpen}
                onClose={() => setShortcutsOpen(false)}
            />
            <div className=" flex flex-col bg-background">
            {/* Header */}
            <div className="flex items-center justify-between px-4 border-b">
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
                    snapEnabled={snapEnabled}
                    onToggleSnap={() => setSnapEnabled((v) => !v)}
                    selectedObjects={selectedObjects}
                    onCopy={handleCopy}
                    onDelete={handleDelete}
                    onGroup={handleGroup}
                    onUngroup={handleUngroup}
                    onAlign={handleAlign}
                    onDistribute={handleDistribute}
                    selected={selectedObject}
                    isTable={false}
                    updateSelected={updateSelected}
                    updateTable={() => {
                    }}
                    onBringForward={handleBringForward}
                    onSendBackward={handleSendBackward}
                    onBringToFront={handleBringToFront}
                    onSendToBack={handleSendToBack}
                />

                {/* Action Buttons */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        onClick={() => navigate("/cover-page-manager")}
                    >
                        Back
                    </Button>
                    <Button onClick={handleSubmit(onSubmit)}>
                        {id ? "Update" : "Create"}
                    </Button>
                </div>
            </div>

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
                        onShowShortcuts={() => setShortcutsOpen(true)}
                    />
                </div>

                {/* Canvas Workspace */}
                <div className="flex-1 overflow-auto">
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
                        selectedObjects={selectedObjects}
                        onAlign={handleAlign}
                        onUpdateProperty={handleUpdateProperty}
                        onToggleLayerVisibility={handleToggleLayerVisibility}
                        onDeleteLayer={handleDeleteLayer}
                        layers={layers}
                        onSelectLayer={handleSelectLayer}
                    />
                </div>
            </div>
        </div>
        </>

    );
}