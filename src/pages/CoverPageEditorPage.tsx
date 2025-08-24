// src/pages/CoverPageEditorPage.tsx
import {useEffect, useRef, useState} from "react";
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
} from "fabric";

import useCoverPages from "@/hooks/useCoverPages";
import useImageLibrary from "@/hooks/useImageLibrary";

import {EditorToolbar} from "@/components/cover-pages/EditorToolbar";
import {CanvasWorkspace} from "@/components/cover-pages/CanvasWorkspace";
import {EditorSidebar} from "@/components/cover-pages/EditorSidebar";
import {KeyboardShortcutsModal} from "@/components/modals/KeyboardShortcutsModal";

import {useCanvasKeyboardShortcuts} from "@/hooks/useCanvasKeyboardShortcuts";
import {useCanvasHistory} from "@/hooks/useCanvasHistory";

import {FONTS, GRID_SIZE, PRESET_BG_COLORS, REPORT_TYPES, TEMPLATES} from "@/constants/coverPageEditor";

import {createTableGroup, type TableData} from "@/lib/fabricTables";

import {
  addArrow as addArrowShape,
  addBidirectionalArrow as addBidirectionalArrowShape,
  addCircle as addCircleShape,
  addImageFromUrl as addImageFromUrlShape,
  addLucideIconByName,
  addPolygon,
  addRect as addRectShape,
  addStar as addStarShape,
  addText as addTextShape,
  addTriangle as addTriangleShape,
  type Palette,
} from "@/lib/fabricShapes";

import {COLOR_PALETTES, type ColorPalette} from "@/constants/colorPalettes";

type CanvasObject = Rect | Circle | Polygon | Textbox | FabricImage | Group;

interface FormValues {
    name: string;
    template: keyof typeof TEMPLATES;
    reportTypes: string[];
}

export default function CoverPageEditorPage() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const [canvas, setCanvas] = useState<FabricCanvas | null>(null);
    const [selectedObjects, setSelectedObjects] = useState<FabricObject[]>([]);
    const [selected, setSelected] = useState<CanvasObject | null>(null);

    const [fitScale, setFitScale] = useState(1);
    const [zoom, setZoom] = useState(0.85);

    const {id} = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [showShortcuts, setShowShortcuts] = useState(false);

    const {
        createCoverPage,
        updateCoverPage,
        assignments,
        assignCoverPageToReportType,
        removeAssignmentFromReportType,
        coverPages,
    } = useCoverPages();

    const form = useForm<FormValues>({
        defaultValues: {name: "", template: "default", reportTypes: []},
    });

    const {register, handleSubmit, setValue, watch} = form;
    const template = watch("template") as keyof typeof TEMPLATES;
    const reportTypes = watch("reportTypes");

    const [bgColor, setBgColor] = useState(TEMPLATES[template]);
    const [palette, setPalette] = useState<ColorPalette>(COLOR_PALETTES[0]);
    const [showGrid, setShowGrid] = useState(true);
    const [showRulers, setShowRulers] = useState(false);
    const [activePanel, setActivePanel] = useState<string | null>("settings");

    const {images, uploadImage, deleteImage} = useImageLibrary();

    // history
    const {snapshot: pushHistory, undo, redo, canUndo, canRedo} = useCanvasHistory({
        canvas,
        onBgFromJSON: setBgColor,
    });

    // ----- helpers -----
    const updateBgColor = (color: string) => setBgColor(color);

    const onAddPlaceholder = (token: string) => {
        if (!canvas) return;
        const tb = new Textbox(`${token}`, {
            left: 120,
            top: 120,
            fontSize: 20,
            fill: palette.colors[3] || palette.colors[0],
        });
        canvas.add(tb);
        canvas.setActiveObject(tb);
        canvas.requestRenderAll();
        pushHistory();
    };

    const paletteAsHelper: Palette = {colors: [...palette.colors]};

    /**
     * Utility: ensure the most recently created/active object gets positioned at (x, y)
     * Works whether helpers return the object or just set it active.
     */
    const placeAt = (obj: any | null, x: number, y: number) => {
        if (!canvas) return;
        const target =
            obj ||
            canvas.getActiveObject() ||
            (canvas.getObjects().length ? canvas.getObjects()[canvas.getObjects().length - 1] : null);

        if (!target) return;

        target.set?.({left: x, top: y});
        target.setCoords?.();
        canvas.setActiveObject?.(target);
    };

    // Handle drag & drop from sidebar (robust position regardless of helper behavior)
    const handleDropElement = (item: { type: string; data: any; x: number; y: number }) => {
        if (!canvas) return;

        let created: any = null;

        switch (item.type) {
            case "rectangle":
                // helpers appear to support coords, but we still place after as a safeguard
                created = (addRectShape(canvas, paletteAsHelper, item.x, item.y) as any) ?? null;
                placeAt(created, item.x, item.y);
                break;

            case "circle":
                created = (addCircleShape(canvas, paletteAsHelper, item.x, item.y) as any) ?? null;
                placeAt(created, item.x, item.y);
                break;

            case "star":
                created = (addStarShape(canvas, paletteAsHelper, item.x, item.y) as any) ?? null;
                placeAt(created, item.x, item.y);
                break;

            case "triangle":
                created = (addTriangleShape(canvas, paletteAsHelper, item.x, item.y) as any) ?? null;
                placeAt(created, item.x, item.y);
                break;

            case "polygon":
                created = (addPolygon(canvas, paletteAsHelper, 5, 50, item.x, item.y) as any) ?? null;
                placeAt(created, item.x, item.y);
                break;

            case "arrow":
                created = (addArrowShape(canvas, paletteAsHelper, item.x, item.y) as any) ?? null;
                placeAt(created, item.x, item.y);
                break;

            case "bidirectionalArrow":
                created = (addBidirectionalArrowShape(canvas, paletteAsHelper, item.x, item.y) as any) ?? null;
                placeAt(created, item.x, item.y);
                break;

            case "text": {
                created = (addTextShape(canvas, paletteAsHelper, "Text", item.x, item.y) as any) ?? null;
                console.log("created text:", created);
                placeAt(created, item.x, item.y);
                // make sure it's visible on light backgrounds
                try {
                    created?.set?.({fill: palette.colors[3] || "#111111"});
                } catch {
                }
                break;
            }

            case "icon":
                if (item.data?.name) {
                    created = (addLucideIconByName(canvas, item.data.name, paletteAsHelper.colors[0], item.x, item.y) as any) ?? null;
                    placeAt(created, item.x, item.y);
                }
                break;

            case "clipart":
                if (item.data?.hex) {
                    // this helper already accepts coords and sets left/top internally
                    void addClipartAtPosition(item.data.hex, item.x, item.y);
                }
                break;
        }

        canvas.requestRenderAll();
        pushHistory();
    };

    // Sidebar "click to add" actions (keep existing UX)
    const addRect = () => {
        if (!canvas) return;
        addRectShape(canvas, paletteAsHelper);
        pushHistory();
    };
    const addCircle = () => {
        if (!canvas) return;
        addCircleShape(canvas, paletteAsHelper);
        pushHistory();
    };
    const addStar = () => {
        if (!canvas) return;
        addStarShape(canvas, paletteAsHelper);
        pushHistory();
    };
    const addTriangle = () => {
        if (!canvas) return;
        addTriangleShape(canvas, paletteAsHelper);
        pushHistory();
    };
    const addPolygonShape = () => {
        if (!canvas) return;
        addPolygon(canvas, paletteAsHelper, 5, 50);
        pushHistory();
    };
    const addArrow = () => {
        if (!canvas) return;
        addArrowShape(canvas, paletteAsHelper);
        pushHistory();
    };
    const addBidirectionalArrow = () => {
        if (!canvas) return;
        addBidirectionalArrowShape(canvas, paletteAsHelper);
        pushHistory();
    };
    const addText = () => {
        if (!canvas) return;
        const tb = addTextShape(canvas, paletteAsHelper, "Text") as any;
        tb?.set?.({fill: palette.colors[3] || "#111111"});
        canvas?.requestRenderAll();
        pushHistory();
    };
    const addImageFromUrl = async (url: string) => {
        if (!canvas) return;
        await addImageFromUrlShape(canvas, url);
        pushHistory();
    };
    const addIcon = async (name: string) => {
        if (!canvas) return;
        await addLucideIconByName(canvas, name, palette.colors[1] || palette.colors[0]);
        pushHistory();
    };

    const addClipartAtPosition = async (hex: string, x: number, y: number) => {
        if (!canvas) return;
        try {
            const url = `https://cdn.jsdelivr.net/npm/openmoji@16.0.0/color/svg/${hex}.svg`;
            const svg = await fetch(url).then((r) => r.text());
            await new Promise<void>((resolve) => {
                loadSVGFromString(svg, (objects) => {
                    if (objects) {
                        const obj = objects as any; // Fabric v6: parsed group
                        obj.set({left: x, top: y, scaleX: 0.5, scaleY: 0.5});
                        canvas.add(obj);
                        canvas.setActiveObject(obj);
                        canvas.requestRenderAll();
                    }
                    resolve();
                });
            });
            pushHistory();
        } catch {
            // ignore
        }
    };

    const addClipart = async (hex: string) => {
        if (!canvas) return;
        await addClipartAtPosition(hex, 100, 100);
    };

    const addImage = (file: File) => {
        if (!canvas) return;
        const reader = new FileReader();
        reader.onload = () => addImageFromUrl(reader.result as string);
        reader.readAsDataURL(file);
    };

    const applyPalette = (p: ColorPalette) => {
        setPalette(p);
        if (!canvas) return;
        const [fillColor, strokeColor, , textColor] = p.colors;
        canvas.getObjects().forEach((obj: any) => {
            if (obj.type === "textbox") {
                obj.set("fill", textColor || fillColor);
            } else {
                if ("fill" in obj) obj.set("fill", fillColor);
                if ("stroke" in obj) obj.set("stroke", strokeColor || fillColor);
            }
        });
        canvas.requestRenderAll();
        pushHistory();
    };

    const handleCopy = () => {
        if (!canvas || selectedObjects.length === 0) return;
        Promise.all(selectedObjects.map((obj) => obj.clone())).then((clones) => {
            clones.forEach((cloned: FabricObject) => {
                cloned.set({
                    left: (cloned.left || 0) + 10,
                    top: (cloned.top || 0) + 10,
                });
                canvas.add(cloned);
                canvas.setActiveObject(cloned);
            });
            canvas.requestRenderAll();
            pushHistory();
        });
    };

    const handleDelete = () => {
        if (!canvas || selectedObjects.length === 0) return;
        selectedObjects.forEach((obj) => canvas.remove(obj));
        canvas.requestRenderAll();
        pushHistory();
    };

    const handleGroup = () => {
        if (!canvas) return;
        const active = canvas.getActiveObject();
        if (active && active.type === "activeSelection") {
            const group = (active as any).toGroup();
            canvas.setActiveObject(group);
            canvas.requestRenderAll();
            pushHistory();
        }
    };

    const handleUngroup = () => {
        if (!canvas) return;
        const active = canvas.getActiveObject();
        if (active && active.type === "group") {
            (active as any).toActiveSelection();
            canvas.requestRenderAll();
            pushHistory();
        }
    };

    const handleAlign = (type: "left" | "right" | "centerH" | "top" | "bottom" | "centerV") => {
        if (!canvas) return;
        const active = canvas.getActiveObject();
        if (!active || active.type !== "activeSelection") return;

        const objects = (active as any).getObjects?.() as FabricObject[] | undefined;
        if (!objects || objects.length < 2) return;

        const bounds = objects.reduce(
            (acc, obj: any) => {
                const b = obj.getBoundingRect();
                return {
                    left: Math.min(acc.left, b.left),
                    top: Math.min(acc.top, b.top),
                    right: Math.max(acc.right, b.left + b.width),
                    bottom: Math.max(acc.bottom, b.top + b.height),
                };
            },
            {left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity}
        );

        objects.forEach((obj: any) => {
            const b = obj.getBoundingRect();
            switch (type) {
                case "left":
                    obj.set({left: bounds.left});
                    break;
                case "right":
                    obj.set({left: bounds.right - b.width});
                    break;
                case "centerH":
                    obj.set({left: bounds.left + (bounds.right - bounds.left) / 2 - b.width / 2});
                    break;
                case "top":
                    obj.set({top: bounds.top});
                    break;
                case "bottom":
                    obj.set({top: bounds.bottom - b.height});
                    break;
                case "centerV":
                    obj.set({top: bounds.top + (bounds.bottom - bounds.top) / 2 - b.height / 2});
                    break;
            }
            obj.setCoords();
        });

        canvas.requestRenderAll();
        pushHistory();
    };

    const updateSelected = (prop: string, value: unknown) => {
        if (!selected || !canvas) return;

        if (selected instanceof Group) {
            selected.getObjects().forEach((obj) => (obj as unknown as FabricObject).set(prop as never, value as never));
        } else {
            (selected as unknown as FabricObject).set(prop as never, value as never);
            if (selected instanceof Textbox) {
                selected.initDimensions();
                selected.setCoords();
            }
        }

        canvas.requestRenderAll();
        pushHistory();
    };

    const addTable = (rows: number, cols: number, borderColor: string) => {
        if (!canvas) return;
        const group = createTableGroup(rows, cols, 80, 40, borderColor, 1, 100, 100, 8, 4);
        canvas.add(group);
        canvas.setActiveObject(group);
        canvas.requestRenderAll();
        pushHistory();
    };

    const updateTable = (updates: Partial<TableData>) => {
        if (!canvas || !selected || !(selected instanceof Group)) return;
        const data = {...(selected as any).data} as TableData;
        if (data?.type !== "table") return;

        const newData = {...data, ...updates} as TableData;
        const group = createTableGroup(
            newData.rows,
            newData.cols,
            newData.cellW,
            newData.cellH,
            newData.borderColor,
            newData.borderWidth,
            selected.left,
            selected.top,
            newData.cellPadX,
            newData.cellPadY
        );
        canvas.remove(selected);
        canvas.add(group);
        canvas.setActiveObject(group);
        setSelected(group);
        canvas.requestRenderAll();
        pushHistory();
    };

    // ----- data submit -----
    const onSubmit = async (values: FormValues) => {
        if (!canvas) return;
        const design = canvas.toJSON() as any;
        design.backgroundColor = bgColor;

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
    const onSettingsSubmit = handleSubmit(onSubmit);

    // ----- canvas init / events -----
    useEffect(() => {
        const canvasEl = canvasRef.current;
        if (!canvasEl) return;

        const c = new FabricCanvas(canvasEl, {
            width: 816,
            height: 1056,
            backgroundColor: bgColor,
        });
        setCanvas(c);

        // initial snapshot after mount
        setTimeout(() => pushHistory(), 0);

        const onSelectionCleared = () => {
            setSelected(null);
            setSelectedObjects([]);
        };
        const onSelectionUpdated = (e: any) => {
            const objs = e.selected || [];
            setSelectedObjects(objs);
            setSelected((objs[0] as CanvasObject) || null);
        };
        const onSelectionCreated = (e: any) => {
            const objs = e.selected || [];
            setSelectedObjects(objs);
            setSelected((objs[0] as CanvasObject) || null);
        };

        c.on("selection:cleared", onSelectionCleared);
        c.on("selection:updated", onSelectionUpdated);
        c.on("selection:created", onSelectionCreated);
        c.on("object:modified", () => pushHistory());

        return () => {
            c.off("selection:cleared", onSelectionCleared);
            c.off("selection:updated", onSelectionUpdated);
            c.off("selection:created", onSelectionCreated);
            c.dispose();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // grid snap (only when grid is shown)
    useEffect(() => {
        if (!canvas) return;

        const onMoving = (e: any) => {
            if (!showGrid) return;
            const obj = e.target as CanvasObject;
            obj.set({
                left: Math.round((obj.left || 0) / GRID_SIZE) * GRID_SIZE,
                top: Math.round((obj.top || 0) / GRID_SIZE) * GRID_SIZE,
            });
        };
        const onScaling = (e: any) => {
            if (!showGrid) return;
            const obj = e.target as CanvasObject;
            const width = (obj.width || 0) * (obj.scaleX || 1);
            const height = (obj.height || 0) * (obj.scaleY || 1);
            const snappedW = Math.round(width / GRID_SIZE) * GRID_SIZE;
            const snappedH = Math.round(height / GRID_SIZE) * GRID_SIZE;
            obj.set({
                scaleX: snappedW / (obj.width || 1),
                scaleY: snappedH / (obj.height || 1),
            });
        };

        canvas.on("object:moving", onMoving);
        canvas.on("object:scaling", onScaling);
        return () => {
            canvas.off("object:moving", onMoving);
            canvas.off("object:scaling", onScaling);
        };
    }, [canvas, showGrid]);

    // template change -> bg color default
    useEffect(() => setBgColor(TEMPLATES[template]), [template]);

    // bg color -> canvas background
    useEffect(() => {
        if (!canvas) return;
        canvas.set({backgroundColor: bgColor});
        canvas.requestRenderAll();
    }, [bgColor, canvas]);

    // load existing design
    useEffect(() => {
        if (!canvas || !id) return;
        const cp = coverPages.find((c) => c.id === id);
        if (!cp) return;

        setValue("name", cp.name);
        setValue("template", (cp.template_slug as keyof typeof TEMPLATES) || "default");

        const selectedRT = Object.entries(assignments)
            .filter(([_, cpId]) => cpId === id)
            .map(([rt]) => rt);
        setValue("reportTypes", selectedRT);

        canvas.loadFromJSON((cp.design_json as any) || {}, () => {
            canvas.renderAll();
            const loadedBg =
                (cp.design_json as any)?.backgroundColor ||
                (cp.design_json as any)?.background ||
                TEMPLATES[(cp.template_slug as keyof typeof TEMPLATES) || "default"];
            setBgColor(loadedBg);
            pushHistory();
        });
    }, [canvas, id, coverPages, assignments, setValue, pushHistory]);

    // close flyouts when clicking outside
    useEffect(() => {
        if (!activePanel) return;
        const onPointerDown = (e: PointerEvent) => {
            const el = e.target as HTMLElement | null;
            if (!el?.closest('[data-flyout="true"]')) setActivePanel(null);
        };
        document.addEventListener("pointerdown", onPointerDown, true);
        return () => document.removeEventListener("pointerdown", onPointerDown, true);
    }, [activePanel]);

    // fit-to-wrapper scaling (drives CanvasWorkspace's zoom prop)
    useEffect(() => {
        const updateScale = () => {
            const wrapper = wrapperRef.current;
            if (!wrapper) return;
            const scale = Math.min((wrapper.clientWidth - 32) / 816, (wrapper.clientHeight - 32) / 1056, 1);
            setFitScale(scale);
        };
        updateScale();
        window.addEventListener("resize", updateScale);
        return () => window.removeEventListener("resize", updateScale);
    }, []);

    // keyboard shortcuts
    useCanvasKeyboardShortcuts({
        canvas,
        onUndo: undo,
        onRedo: redo,
        onCopy: handleCopy,
        onDelete: handleDelete,
        onGroup: handleGroup,
        onUngroup: handleUngroup,
        onZoomIn: () => setZoom((z) => Math.min(5, z * 1.1)),
        onZoomOut: () => setZoom((z) => Math.max(0.1, z / 1.1)),
        setZoom,
        onSave: onSettingsSubmit,
        onEscape: () => setActivePanel(null),
        nudgeStep: 1,
        nudgeStepBig: 10,
        onBringForward: (obj) => {
            if (!canvas) return;
            canvas.bringObjectForward(obj);
            canvas.requestRenderAll();
            pushHistory();
        },
        onSendBackward: (obj) => {
            if (!canvas) return;
            canvas.sendObjectBackwards(obj);
            canvas.requestRenderAll();
            pushHistory();
        },
    });

    // ----- render -----
    return (
        <div className="fixed inset-x-0 top-14 h-[calc(100vh-3.5rem)] w-screen overflow-hidden z-30">
            <div className="flex h-full">
                {/* Right panel: toolbar on top, then sidebar + canvas */}
                <div className="flex-1 relative flex h-full flex-col bg-[#ededed]">
                    {/* Sticky toolbar */}
                    <div
                        className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75 border-b">
                        <EditorToolbar
                            onUndo={undo}
                            onRedo={redo}
                            canUndo={canUndo}
                            canRedo={canRedo}
                            onZoomIn={() => setZoom((z) => Math.min(5, z * 1.1))}
                            onZoomOut={() => setZoom((z) => Math.max(0.1, z / 1.1))}
                            zoom={zoom}
                            onZoomChange={setZoom}
                            showGrid={showGrid}
                            onToggleGrid={() => setShowGrid((v) => !v)}
                            showRulers={showRulers}
                            onToggleRulers={() => setShowRulers((v) => !v)}
                            selectedObjects={selectedObjects}
                            onCopy={handleCopy}
                            onDelete={handleDelete}
                            onGroup={handleGroup}
                            onUngroup={handleUngroup}
                            onAlign={handleAlign}
                            selected={selected}
                            isTable={Boolean(selected instanceof Group && (selected as any).data?.type === "table")}
                            tableData={selected instanceof Group ? ((selected as any).data as TableData) : undefined}
                            updateSelected={updateSelected}
                            updateTable={updateTable}
                            onBringForward={() => {
                                if (!selected || !canvas) return;
                                canvas.bringObjectForward(selected);
                                canvas.requestRenderAll();
                                pushHistory();
                            }}
                            onSendBackward={() => {
                                if (!selected || !canvas) return;
                                canvas.sendObjectBackwards(selected);
                                canvas.requestRenderAll();
                                pushHistory();
                            }}
                            onBringToFront={() => {
                                if (!selected || !canvas) return;
                                canvas.bringObjectToFront(selected);
                                canvas.requestRenderAll();
                                pushHistory();
                            }}
                            onSendToBack={() => {
                                if (!selected || !canvas) return;
                                canvas.sendObjectToBack(selected);
                                canvas.requestRenderAll();
                                pushHistory();
                            }}
                        />
                    </div>

                    {/* Main row: Sidebar + Canvas */}
                    <div className="flex-1 flex overflow-hidden">
                        {/* Sidebar */}
                        <EditorSidebar
                            activePanel={activePanel}
                            setActivePanel={setActivePanel}
                            // SETTINGS
                            onSettingsSubmit={onSettingsSubmit}
                            register={register}
                            reportTypes={reportTypes}
                            reportTypeOptions={REPORT_TYPES}
                            toggleReportType={(rt) => {
                                const current = watch("reportTypes");
                                if (current.includes(rt)) {
                                    setValue("reportTypes", current.filter((t: string) => t !== rt));
                                } else {
                                    setValue("reportTypes", [...current, rt]);
                                }
                            }}
                            // TEXT
                            addText={addText}
                            selected={selected}
                            updateSelected={updateSelected}
                            fonts={FONTS}
                            // IMAGES
                            images={images}
                            onImageUpload={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    addImage(file);
                                    await uploadImage(file);
                                }
                            }}
                            onDeleteImage={deleteImage}
                            onAddImageFromUrl={addImageFromUrl}
                            // GRAPHICS
                            addRect={addRect}
                            addCircle={addCircle}
                            addStar={addStar}
                            addTriangle={addTriangle}
                            addPolygonShape={addPolygonShape}
                            addArrow={addArrow}
                            addBidirectionalArrow={addBidirectionalArrow}
                            addIcon={addIcon}
                            addClipart={addClipart}
                            // DESIGN
                            templateOptions={Object.keys(TEMPLATES)}
                            palette={palette}
                            onApplyPalette={applyPalette}
                            // BACKGROUND
                            bgColor={bgColor}
                            presetBgColors={PRESET_BG_COLORS}
                            updateBgColor={updateBgColor}
                            // FORM FIELDS
                            onAddPlaceholder={onAddPlaceholder}
                            // KEYBOARD SHORTCUTS
                            onShowShortcuts={() => setShowShortcuts(true)}
                            addTable={addTable}
                        />

                        {/* Scrollable canvas region */}
                        <div ref={wrapperRef}
                             className="flex-1 overflow-auto flex items-center justify-center [scroll-padding-top:3rem]">
                            <CanvasWorkspace
                                canvasRef={canvasRef}
                                canvas={canvas}
                                zoom={fitScale * zoom}
                                showGrid={showGrid}
                                showRulers={showRulers}
                                onDropElement={handleDropElement}
                            />
                        </div>
                    </div>

                    {/* Modals */}
                    <KeyboardShortcutsModal open={showShortcuts} onClose={() => setShowShortcuts(false)}/>
                </div>
            </div>
        </div>
    );
}
