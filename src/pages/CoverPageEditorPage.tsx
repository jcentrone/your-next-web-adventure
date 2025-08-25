import {type ChangeEvent, useEffect, useRef, useState} from "react";
import {useForm, useWatch} from "react-hook-form";
import {useNavigate, useParams} from "react-router-dom";
import {Canvas as FabricCanvas, FabricObject, Group, Image as FabricImage} from "fabric";
import {
    addArrow as fabricAddArrow,
    addBidirectionalArrow as fabricAddBidirectionalArrow,
    addCircle as fabricAddCircle,
    addLucideIconByName,
    addOpenmojiClipart,
    addPolygon as fabricAddPolygon,
    addRect as fabricAddRect,
    addStar as fabricAddStar,
    addText as fabricAddText,
    addTriangle as fabricAddTriangle,
} from "@/lib/fabricShapes";
import {createTableGroup} from "@/lib/fabricTables";
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
import {SUPABASE_URL} from "@/integrations/supabase/client";
import {toast} from "sonner";
const DEFAULT_PROXY = `${SUPABASE_URL}/functions/v1/image-proxy`;
const IMAGE_PROXY_URL = import.meta.env.VITE_IMAGE_PROXY_URL ?? DEFAULT_PROXY;

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
        isLoadingAssignments,
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
    const reportTypes = useWatch({ control: form.control, name: "reportTypes", defaultValue: [] });
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
        if (!canvas || !id || !coverPages.length || isLoadingAssignments) return;
        const cp = coverPages.find((c) => c.id === id);
        if (!cp) return;
        const selectedReportTypes = Object.entries(assignments)
            .filter(([_, cpId]) => cpId === id)
            .map(([rt]) => rt);
        
        console.log("Loading cover page data:", {
            name: cp.name,
            template: cp.template_slug,
            selectedReportTypes,
            assignments
        });
        
        form.reset({
            name: cp.name,
            template: (cp.template_slug as keyof typeof TEMPLATES) || "default",
            reportTypes: selectedReportTypes,
        });
        
        // Force update the form values
        setValue("name", cp.name);
        setValue("template", (cp.template_slug as keyof typeof TEMPLATES) || "default");
        setValue("reportTypes", selectedReportTypes);
        console.log("After setValue reportTypes:", {selectedReportTypes, watched: watch("reportTypes")});
        
        if (!loaded.current && cp.design_json) {
            canvas.loadFromJSON(cp.design_json as any, () => {
                canvas.requestRenderAll();
                setLayers([...canvas.getObjects()]);
            });
            loaded.current = true;
        }
    }, [canvas, id, coverPages, assignments, isLoadingAssignments, form, setValue]);

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
                const rect = obj.getBoundingRect();
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
            const rect = obj.getBoundingRect();
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

    const handleAddIcon = async (iconName: string, x?: number, y?: number) => {
        if (!canvas) return;

        if (x === undefined || y === undefined) {
            const transform = canvas.viewportTransform || [1, 0, 0, 1, 0, 0];
            const left = transform[4];
            const top = transform[5];
            x = canvas.getWidth() / 2 - left;
            y = canvas.getHeight() / 2 - top;
        }

        await addLucideIconByName(canvas, iconName, palette.colors[0], x, y);
        setLayers([...canvas.getObjects()]);
        pushHistory();
    };

    const handleAddClipart = async (hex: string, x = 100, y = 100) => {
        if (!canvas) return;
        await addOpenmojiClipart(canvas, palette, hex, x, y);
        pushHistory();
    };

    const handleAddImage = async (imageUrl: string, x?: number, y?: number) => {
        if (!canvas) return;
        
        console.log("handleAddImage called with:", { imageUrl, x, y });

        if (x === undefined || y === undefined) {
            const transform = canvas.viewportTransform || [1, 0, 0, 1, 0, 0];
            const left = transform[4];
            const top = transform[5];
            x = canvas.getWidth() / 2 - left;
            y = canvas.getHeight() / 2 - top;
            console.log("Calculated position:", { x, y, canvasSize: { width: canvas.getWidth(), height: canvas.getHeight() } });
        }

        try {
            const sameOrigin = imageUrl.startsWith(window.location.origin);
            const finalUrl = sameOrigin
                ? imageUrl
                : `${IMAGE_PROXY_URL}?url=${encodeURIComponent(imageUrl)}`;
            
            let img: FabricImage;
            console.log("Loading image from URL:", finalUrl);
            try {
                img = await FabricImage.fromURL(
                    finalUrl,
                    sameOrigin ? undefined : {crossOrigin: "anonymous"},
                );
                console.log("Image loaded via proxy successfully");
            } catch (proxyError) {
                console.error("Proxy load failed, retrying original URL", proxyError);
                img = await FabricImage.fromURL(
                    imageUrl,
                    sameOrigin ? undefined : {crossOrigin: "anonymous"},
                );
                console.log("Loaded image directly from original URL");
            }

            console.log("Image loaded successfully, dimensions:", { width: img.width, height: img.height });
            
            // Ensure the image is positioned within canvas bounds
            const maxWidth = canvas.getWidth();
            const maxHeight = canvas.getHeight();
            
            // Calculate scale to fit image nicely
            const scaleX = Math.min(200 / (img.width || 200), 0.8);
            const scaleY = Math.min(200 / (img.height || 200), 0.8);
            const scale = Math.min(scaleX, scaleY);
            
            img.set({
                left: Math.max(0, Math.min(x || 100, maxWidth - 100)),
                top: Math.max(0, Math.min(y || 100, maxHeight - 100)),
                scaleX: scale,
                scaleY: scale,
                visible: true,
                selectable: true,
                evented: true,
            });
            
            console.log("Adding image to canvas with properties:", {
                left: img.left,
                top: img.top,
                scaleX: img.scaleX,
                scaleY: img.scaleY,
                visible: img.visible
            });
            
            canvas.add(img);
            canvas.setActiveObject(img);
            canvas.renderAll();
            setLayers([...canvas.getObjects()]);
            pushHistory();
            
            console.log("Image successfully added to canvas");
            toast.success("Image added to canvas");
        } catch (error) {
            console.error("Error adding image:", error);
            const message = error instanceof Error ? error.message : String(error);
            toast.error(`Failed to add image: ${message}`);
        }
    };

    const handleUploadImage = async (file: File) => {
        try {
            const {url} = await uploadImage(file);
            if (url) {
                await handleAddImage(url);
                toast.success("Image uploaded successfully");
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
                addImage: (url, px, py) => {
                    void handleAddImage(url, px, py);
                },
                addIcon: handleAddIcon,
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
        const transform = canvas.viewportTransform || [1, 0, 0, 1, 0, 0];
        const left = transform[4];
        const top = transform[5];
        const x = canvas.getWidth() / 2 - left;
        const y = canvas.getHeight() / 2 - top;
        fabricAddRect(canvas, palette, x, y);
        setLayers([...canvas.getObjects()]);
        pushHistory();
    };
    const addCircle = () => {
        if (!canvas) return;
        const transform = canvas.viewportTransform || [1, 0, 0, 1, 0, 0];
        const left = transform[4];
        const top = transform[5];
        const x = canvas.getWidth() / 2 - left;
        const y = canvas.getHeight() / 2 - top;
        fabricAddCircle(canvas, palette, x, y);
        setLayers([...canvas.getObjects()]);
        pushHistory();
    };
    const addStar = () => {
        if (!canvas) return;
        const transform = canvas.viewportTransform || [1, 0, 0, 1, 0, 0];
        const left = transform[4];
        const top = transform[5];
        const x = canvas.getWidth() / 2 - left;
        const y = canvas.getHeight() / 2 - top;
        fabricAddStar(canvas, palette, x, y);
        setLayers([...canvas.getObjects()]);
        pushHistory();
    };
    const addTriangle = () => {
        if (!canvas) return;
        const transform = canvas.viewportTransform || [1, 0, 0, 1, 0, 0];
        const left = transform[4];
        const top = transform[5];
        const x = canvas.getWidth() / 2 - left;
        const y = canvas.getHeight() / 2 - top;
        fabricAddTriangle(canvas, palette, x, y);
        setLayers([...canvas.getObjects()]);
        pushHistory();
    };
    const addPolygonShape = () => {
        if (!canvas) return;
        const transform = canvas.viewportTransform || [1, 0, 0, 1, 0, 0];
        const left = transform[4];
        const top = transform[5];
        const x = canvas.getWidth() / 2 - left;
        const y = canvas.getHeight() / 2 - top;
        fabricAddPolygon(canvas, palette, 5, 50, x, y);
        setLayers([...canvas.getObjects()]);
        pushHistory();
    };
    const addArrow = () => {
        if (!canvas) return;
        const transform = canvas.viewportTransform || [1, 0, 0, 1, 0, 0];
        const left = transform[4];
        const top = transform[5];
        const x = canvas.getWidth() / 2 - left;
        const y = canvas.getHeight() / 2 - top;
        fabricAddArrow(canvas, palette, x, y);
        setLayers([...canvas.getObjects()]);
        pushHistory();
    };
    const addBidirectionalArrow = () => {
        if (!canvas) return;
        const transform = canvas.viewportTransform || [1, 0, 0, 1, 0, 0];
        const left = transform[4];
        const top = transform[5];
        const x = canvas.getWidth() / 2 - left;
        const y = canvas.getHeight() / 2 - top;
        fabricAddBidirectionalArrow(canvas, palette, x, y);
        setLayers([...canvas.getObjects()]);
        pushHistory();
    };
    const addTable = (rows: number, cols: number, borderColor: string) => {
        if (!canvas) return;
        const tbl = createTableGroup(rows, cols, 80, 24, borderColor, 2);
        canvas.add(tbl);
        canvas.setActiveObject(tbl);
        canvas.requestRenderAll();
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
        if (!canvas) return;

        const applyToObject = (obj: FabricObject, inGroup = false) => {
            if (obj instanceof Group) {
                obj.getObjects().forEach((child) => applyToObject(child, true));
                return;
            }

            if (obj.type === "image") return;

            if (obj.type === "textbox") {
                obj.set({fill: p.colors[3] || p.colors[0]});
                return;
            }

            if (obj.type === "line") {
                obj.set({stroke: p.colors[1] || p.colors[0]});
                return;
            }

            obj.set({
                fill: inGroup ? p.colors[1] || p.colors[0] : p.colors[0],
                stroke: p.colors[1] || p.colors[0],
            });
        };

        canvas.getObjects().forEach((obj) => applyToObject(obj));
        canvas.requestRenderAll();
        pushHistory();
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
                            const updatedReportTypes = reportTypes.includes(rt)
                                ? reportTypes.filter((t) => t !== rt)
                                : [...reportTypes, rt];
                            setValue("reportTypes", updatedReportTypes);
                            console.log("Toggled report type:", rt, "watch result:", watch("reportTypes"));
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
                        addTable={addTable}
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