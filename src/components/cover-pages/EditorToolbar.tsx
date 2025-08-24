// src/components/cover-pages/EditorToolbar.tsx
import React, {useMemo, useState} from "react";
import {Button} from "@/components/ui/button";
import {Separator} from "@/components/ui/separator";
import {Input} from "@/components/ui/input";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";

import {
    AlignCenter,
    AlignHorizontalJustifyCenter,
    AlignLeft,
    AlignRight,
    AlignVerticalJustifyCenter,
    ArrowDown,
    ArrowUp,
    BetweenHorizontalStart,
    BetweenVerticalStart,
    Copy,
    Grid3X3,
    Group as GroupIcon,
    Layers as LayersIcon,
    Magnet,
    Redo2,
    Ruler,
    SlidersHorizontal,
    Table as TableIcon,
    Trash2,
    Type as TypeIcon,
    Undo2,
    Ungroup,
    ZoomIn,
    ZoomOut,
} from "lucide-react";

type TableData = {
    type: "table";
    rows: number;
    cols: number;
    cellW: number;
    cellH: number;
    borderColor: string;
    borderWidth: number;
    cellPadX: number;
    cellPadY: number;
};

interface EditorToolbarProps {
    onUndo: () => void;
    onRedo: () => void;
    canUndo: boolean;
    canRedo: boolean;

    onZoomIn: () => void;
    onZoomOut: () => void;
    zoom: number; // logical zoom factor (0.1 - 5)
    onZoomChange: (zoom: number) => void;

    showGrid: boolean;
    onToggleGrid: () => void;
    showRulers: boolean;
    onToggleRulers: () => void;

    selectedObjects: any[];
    onCopy: () => void;   // your handler duplicates with offset
    onDelete: () => void;
    onGroup: () => void;
    onUngroup: () => void;
    onAlign: (type: "left" | "centerH" | "right" | "top" | "centerV" | "bottom") => void;

    // Context
    selected: any | null;
    isTable: boolean;
    tableData?: TableData;
    updateSelected: (prop: string, value: unknown) => void;
    updateTable: (updates: Partial<TableData>) => void;

    // Layering (existing)
    onBringForward: () => void;
    onSendBackward: () => void;

    // ---- Optional niceties (wire up when ready) ----
    isPanning?: boolean;
    onTogglePan?: () => void;
    snapEnabled?: boolean;
    onToggleSnap?: () => void;
    onDistribute?: (axis: "h" | "v") => void;
    onBringToFront?: () => void;
    onSendToBack?: () => void;
}

export function EditorToolbar(props: EditorToolbarProps) {
    const {
        onUndo, onRedo, canUndo, canRedo,
        onZoomIn, onZoomOut, zoom, onZoomChange,
        showGrid, onToggleGrid, showRulers, onToggleRulers,
        selectedObjects, onCopy, onDelete, onGroup, onUngroup, onAlign,
        selected, isTable, tableData, updateSelected, updateTable,
        onBringForward, onSendBackward,

        // optional
        isPanning, onTogglePan,
        snapEnabled, onToggleSnap,
        onDistribute,
        onBringToFront, onSendToBack,
    } = props;

    const hasSelection = selectedObjects.length > 0;
    const hasMultipleSelection = selectedObjects.length > 1;
    const isText = !!selected && selected.type === "textbox";

    const currentFill = (selected && "fill" in selected && typeof (selected as any).fill === "string")
        ? (selected as any).fill : "#000000";
    const currentStroke = (selected && "stroke" in selected && typeof (selected as any).stroke === "string")
        ? (selected as any).stroke : "#000000";
    const currentStrokeWidth = (selected && "strokeWidth" in selected)
        ? ((selected as any).strokeWidth ?? 1) : 1;

    const currentWidth = selected ? Math.round(((selected.width || 0) * (selected.scaleX || 1)) as number) : 0;
    const currentHeight = selected ? Math.round(((selected.height || 0) * (selected.scaleY || 1)) as number) : 0;
    const currentAngle = selected ? (selected.angle || 0) : 0;

    const [lockAspect, setLockAspect] = useState(true);

    const aspect = useMemo(() => {
        if (!selected) return 1;
        const w = (selected.width || 1) * (selected.scaleX || 1);
        const h = (selected.height || 1) * (selected.scaleY || 1);
        return w && h ? w / h : 1;
    }, [selected, currentWidth, currentHeight]);

    const setWidth = (w: number) => {
        if (!selected) return;
        updateSelected("scaleX", w / ((selected.width || 1) as number));
        if (lockAspect) {
            const h = Math.max(1, Math.round(w / (aspect || 1)));
            updateSelected("scaleY", h / ((selected.height || 1) as number));
        }
    };

    const setHeight = (h: number) => {
        if (!selected) return;
        updateSelected("scaleY", h / ((selected.height || 1) as number));
        if (lockAspect) {
            const w = Math.max(1, Math.round(h * (aspect || 1)));
            updateSelected("scaleX", w / ((selected.width || 1) as number));
        }
    };

    const pct = (z: number) => `${Math.round(z * 100)}%`;

    return (
        <div id="editor_toolbar" className="w-full overflow-x-auto">
            <div className="w-full">
                <div className="flex items-center justify-center gap-2 p-3 bg-transparent">
                    <div className="flex items-center gap-2 p-3 bg-white text-foreground border rounded-md shadow-sm">

                        {/* History */}
                        <div className="flex items-center gap-1">
                            <Tip label="Undo (⌘/Ctrl+Z)">
                                <Button variant="ghost" size="sm" onClick={onUndo} disabled={!canUndo}
                                        className="h-8 w-8 p-0">
                                    <Undo2 className="h-4 w-4"/>
                                </Button>
                            </Tip>
                            <Tip label="Redo (⌘/Ctrl+Shift+Z / ⌘/Ctrl+Y)">
                                <Button variant="ghost" size="sm" onClick={onRedo} disabled={!canRedo}
                                        className="h-8 w-8 p-0">
                                    <Redo2 className="h-4 w-4"/>
                                </Button>
                            </Tip>
                        </div>

                        <Separator orientation="vertical" className="h-6"/>

                        {/* Clipboard / group */}
                        <div className="flex items-center gap-1">
                            <Tip label="Duplicate (⌘/Ctrl+D or ⌘/Ctrl+V)">
                                <Button variant="ghost" size="sm" onClick={onCopy} disabled={!hasSelection}
                                        className="h-8 w-8 p-0">
                                    <Copy className="h-4 w-4"/>
                                </Button>
                            </Tip>
                            <Tip label="Delete (Delete / Backspace)">
                                <Button variant="ghost" size="sm" onClick={onDelete} disabled={!hasSelection}
                                        className="h-8 w-8 p-0">
                                    <Trash2 className="h-4 w-4"/>
                                </Button>
                            </Tip>
                            <Tip label="Group (⌘/Ctrl+G)">
                                <Button variant="ghost" size="sm" onClick={onGroup} disabled={!hasMultipleSelection}
                                        className="h-8 w-8 p-0">
                                    <GroupIcon className="h-4 w-4"/>
                                </Button>
                            </Tip>
                            <Tip label="Ungroup (⌘/Ctrl+Shift+G)">
                                <Button variant="ghost" size="sm" onClick={onUngroup} disabled={!hasSelection}
                                        className="h-8 w-8 p-0">
                                    <Ungroup className="h-4 w-4"/>
                                </Button>
                            </Tip>
                        </div>

                        <Separator orientation="vertical" className="h-6"/>

                        {/* Align + Distribute */}
                        <div className="flex items-center gap-1">
                            <Tip label="Align left">
                                <Button variant="ghost" size="sm" onClick={() => onAlign("left")}
                                        disabled={!hasMultipleSelection} className="h-8 w-8 p-0">
                                    <AlignLeft className="h-4 w-4"/>
                                </Button>
                            </Tip>
                            <Tip label="Align horizontal center">
                                <Button variant="ghost" size="sm" onClick={() => onAlign("centerH")}
                                        disabled={!hasMultipleSelection} className="h-8 w-8 p-0">
                                    <AlignHorizontalJustifyCenter className="h-4 w-4"/>
                                </Button>
                            </Tip>
                            <Tip label="Align right">
                                <Button variant="ghost" size="sm" onClick={() => onAlign("right")}
                                        disabled={!hasMultipleSelection} className="h-8 w-8 p-0">
                                    <AlignRight className="h-4 w-4"/>
                                </Button>
                            </Tip>
                            <Tip label="Align top">
                                <Button variant="ghost" size="sm" onClick={() => onAlign("top")}
                                        disabled={!hasMultipleSelection} className="h-8 w-8 p-0">
                                    <ArrowUp className="h-4 w-4"/>
                                </Button>
                            </Tip>
                            <Tip label="Align vertical center">
                                <Button variant="ghost" size="sm" onClick={() => onAlign("centerV")}
                                        disabled={!hasMultipleSelection} className="h-8 w-8 p-0">
                                    <AlignVerticalJustifyCenter className="h-4 w-4"/>
                                </Button>
                            </Tip>
                            <Tip label="Align bottom">
                                <Button variant="ghost" size="sm" onClick={() => onAlign("bottom")}
                                        disabled={!hasMultipleSelection} className="h-8 w-8 p-0">
                                    <ArrowDown className="h-4 w-4"/>
                                </Button>
                            </Tip>

                            {/* Distribute (optional) */}
                            <Tip label="Distribute horizontally">
                                <Button
                                    variant="ghost" size="sm"
                                    onClick={() => onDistribute?.("h")}
                                    disabled={!hasMultipleSelection || !onDistribute}
                                    className="h-8 w-8 p-0"
                                >
                                    <BetweenHorizontalStart className="h-4 w-4"/>
                                </Button>
                            </Tip>
                            <Tip label="Distribute vertically">
                                <Button
                                    variant="ghost" size="sm"
                                    onClick={() => onDistribute?.("v")}
                                    disabled={!hasMultipleSelection || !onDistribute}
                                    className="h-8 w-8 p-0"
                                >
                                    <BetweenVerticalStart className="h-4 w-4"/>
                                </Button>
                            </Tip>
                        </div>

                        <Separator orientation="vertical" className="h-6"/>

                        {/* Layering (quick) */}
                        <div className="flex items-center gap-1">
                            <Tip label="Bring forward (])">
                                <Button variant="ghost" size="sm" onClick={onBringForward} disabled={!hasSelection}
                                        className="h-8 w-8 p-0">
                                    <ArrowUp className="h-4 w-4"/>
                                </Button>
                            </Tip>
                            <Tip label="Send backward ([)">
                                <Button variant="ghost" size="sm" onClick={onSendBackward} disabled={!hasSelection}
                                        className="h-8 w-8 p-0">
                                    <ArrowDown className="h-4 w-4"/>
                                </Button>
                            </Tip>
                            <Tip label="Bring to front">
                                <Button
                                    variant="ghost" size="sm"
                                    onClick={() => onBringToFront?.()}
                                    disabled={!hasSelection || !onBringToFront}
                                    className="h-8 w-8 p-0"
                                >
                                    <LayersIcon className="h-4 w-4 rotate-180"/>
                                </Button>
                            </Tip>
                            <Tip label="Send to back">
                                <Button
                                    variant="ghost" size="sm"
                                    onClick={() => onSendToBack?.()}
                                    disabled={!hasSelection || !onSendToBack}
                                    className="h-8 w-8 p-0"
                                >
                                    <LayersIcon className="h-4 w-4"/>
                                </Button>
                            </Tip>
                        </div>

                        <Separator orientation="vertical" className="h-6"/>

                        {/* View */}
                        <div className="flex items-center gap-2">
                            <Tip label="Zoom out (⌘/Ctrl -)">
                                <Button variant="ghost" size="sm" onClick={onZoomOut} className="h-8 w-8 p-0">
                                    <ZoomOut className="h-4 w-4"/>
                                </Button>
                            </Tip>

                            <div className="flex items-center gap-1">
                                <Input
                                    type="number"
                                    value={Math.round(zoom * 100)}
                                    onChange={(e) => {
                                        const value = Math.min(500, Math.max(10, Number(e.target.value || 0)));
                                        onZoomChange(value / 100);
                                    }}
                                    className="w-16 h-8 text-xs text-center"
                                    min={10}
                                    max={500}
                                />
                                <span className="text-xs text-muted-foreground">%</span>
                            </div>

                            <Tip label="Zoom in (⌘/Ctrl +)">
                                <Button variant="ghost" size="sm" onClick={onZoomIn} className="h-8 w-8 p-0">
                                    <ZoomIn className="h-4 w-4"/>
                                </Button>
                            </Tip>

                            {/* Presets */}
                            <div className="flex items-center gap-1">
                                <Button variant="outline" size="sm" className="h-7 px-2 text-xs"
                                        onClick={() => onZoomChange(1)}>
                                    100%
                                </Button>
                                <Button variant="outline" size="sm" className="h-7 px-2 text-xs"
                                        onClick={() => onZoomChange(2)}>
                                    200%
                                </Button>
                                {/* "Fit" -> your layout already auto-fits via outer fitScale; 1 works as a reset */}
                                <Button variant="outline" size="sm" className="h-7 px-2 text-xs"
                                        onClick={() => onZoomChange(1)}>
                                    Fit
                                </Button>
                            </div>

                            <Tip label="Toggle grid">
                                <Button variant={showGrid ? "default" : "ghost"} size="sm" onClick={onToggleGrid}
                                        className="h-8 w-8 p-0">
                                    <Grid3X3 className="h-4 w-4"/>
                                </Button>
                            </Tip>
                            <Tip label="Toggle rulers">
                                <Button variant={showRulers ? "default" : "ghost"} size="sm" onClick={onToggleRulers}
                                        className="h-8 w-8 p-0">
                                    <Ruler className="h-4 w-4"/>
                                </Button>
                            </Tip>

                            {/* Snap (optional) */}
                            <Tip label="Snap to grid">
                                <Button
                                    variant={snapEnabled ? "default" : "ghost"}
                                    size="sm"
                                    onClick={() => onToggleSnap?.()}
                                    className="h-8 w-8 p-0"
                                    aria-pressed={!!snapEnabled}
                                >
                                    <Magnet className="h-4 w-4"/>
                                </Button>
                            </Tip>

                            {/* Pan toggle (optional) — if you wire a spacebar/hand tool */}
                            {/* <Tip label="Pan (hold Space)">
                <Button
                  variant={isPanning ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onTogglePan?.()}
                  className="h-8 w-8 p-0"
                  aria-pressed={!!isPanning}
                >
                  <HandIcon className="h-4 w-4" />
                </Button>
              </Tip> */}
                        </div>

                        {/* ===== Context panels ===== */}

                        {/* OBJECT panel */}
                        <Separator orientation="vertical" className="h-6"/>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant={hasSelection ? "default" : "ghost"} size="sm" disabled={!hasSelection}
                                        className="h-8">
                                    <SlidersHorizontal className="h-4 w-4 mr-2"/>
                                    Object
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-72" align="end">
                                {!hasSelection ? (
                                    <div className="text-sm text-muted-foreground">No object selected</div>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="text-xs">Fill</label>
                                                <Input type="color" value={currentFill}
                                                       onChange={(e) => updateSelected("fill", e.target.value)}/>
                                            </div>
                                            <div>
                                                <label className="text-xs">Stroke</label>
                                                <Input type="color" value={currentStroke}
                                                       onChange={(e) => updateSelected("stroke", e.target.value)}/>
                                            </div>
                                            <div>
                                                <label className="text-xs">Stroke Width</label>
                                                <Input
                                                    type="number"
                                                    value={currentStrokeWidth}
                                                    onChange={(e) => updateSelected("strokeWidth", parseInt(e.target.value || "0", 10))}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs">Rotation</label>
                                                <Input
                                                    type="number"
                                                    value={currentAngle}
                                                    onChange={(e) => updateSelected("angle", parseInt(e.target.value || "0", 10))}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs">Width</label>
                                                <Input
                                                    type="number"
                                                    value={currentWidth}
                                                    onChange={(e) => setWidth(Math.max(1, parseInt(e.target.value || "1", 10)))}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs">Height</label>
                                                <Input
                                                    type="number"
                                                    value={currentHeight}
                                                    onChange={(e) => setHeight(Math.max(1, parseInt(e.target.value || "1", 10)))}
                                                />
                                            </div>
                                            <div className="col-span-2 flex items-center gap-2">
                                                <input
                                                    id="lockAspect"
                                                    type="checkbox"
                                                    className="h-4 w-4"
                                                    checked={lockAspect}
                                                    onChange={(e) => setLockAspect(e.target.checked)}
                                                />
                                                <label htmlFor="lockAspect" className="text-xs">Lock aspect
                                                    ratio</label>
                                                <span
                                                    className="ml-auto text-xs text-muted-foreground">{pct(1)} = {currentWidth}×{Math.round(currentWidth / (aspect || 1))}</span>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" className="flex-1"
                                                    onClick={onBringForward} aria-label="Bring Forward">
                                                <ArrowUp className="h-4 w-4 mr-1"/> Forward
                                            </Button>
                                            <Button variant="outline" size="sm" className="flex-1"
                                                    onClick={onSendBackward} aria-label="Send Backward">
                                                <ArrowDown className="h-4 w-4 mr-1"/> Backward
                                            </Button>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline" size="sm" className="flex-1"
                                                onClick={() => onBringToFront?.()} disabled={!onBringToFront}
                                            >
                                                <LayersIcon className="h-4 w-4 mr-1 rotate-180"/> To Front
                                            </Button>
                                            <Button
                                                variant="outline" size="sm" className="flex-1"
                                                onClick={() => onSendToBack?.()} disabled={!onSendToBack}
                                            >
                                                <LayersIcon className="h-4 w-4 mr-1"/> To Back
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </PopoverContent>
                        </Popover>

                        {/* TEXT panel */}
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant={isText ? "default" : "ghost"} size="sm" disabled={!isText}
                                        className="h-8">
                                    <TypeIcon className="h-4 w-4 mr-2"/>
                                    Text
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-72" align="end">
                                {!isText ? (
                                    <div className="text-sm text-muted-foreground">Select a text box</div>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="text-xs">Color</label>
                                                <Input
                                                    type="color"
                                                    value={typeof selected.fill === "string" ? selected.fill : "#000000"}
                                                    onChange={(e) => updateSelected("fill", e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs">Font Size</label>
                                                <Input
                                                    type="number"
                                                    value={selected.fontSize || 16}
                                                    onChange={(e) => updateSelected("fontSize", parseInt(e.target.value || "0", 10))}
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <label className="text-xs">Font Family</label>
                                                <select
                                                    className="w-full border rounded h-9 px-2 text-sm"
                                                    value={selected.fontFamily || ""}
                                                    onChange={(e) => updateSelected("fontFamily", e.target.value)}
                                                >
                                                    {["Arial", "Times New Roman", "Courier New", "Georgia", "Verdana"].map(f => (
                                                        <option key={f} value={f}>{f}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant={selected.fontWeight === "bold" ? "default" : "outline"}
                                                onClick={() => updateSelected("fontWeight", selected.fontWeight === "bold" ? "normal" : "bold")}
                                            >
                                                Bold
                                            </Button>
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant={selected.fontStyle === "italic" ? "default" : "outline"}
                                                onClick={() => updateSelected("fontStyle", selected.fontStyle === "italic" ? "normal" : "italic")}
                                            >
                                                Italic
                                            </Button>
                                        </div>

                                        <div>
                                            <label className="text-xs">Align</label>
                                            <div className="flex gap-2 mt-1">
                                                <Button size="sm"
                                                        variant={selected.textAlign === "left" ? "default" : "outline"}
                                                        onClick={() => updateSelected("textAlign", "left")}>
                                                    <AlignLeft className="h-4 w-4"/>
                                                </Button>
                                                <Button size="sm"
                                                        variant={selected.textAlign === "center" ? "default" : "outline"}
                                                        onClick={() => updateSelected("textAlign", "center")}>
                                                    <AlignCenter className="h-4 w-4"/>
                                                </Button>
                                                <Button size="sm"
                                                        variant={selected.textAlign === "right" ? "default" : "outline"}
                                                        onClick={() => updateSelected("textAlign", "right")}>
                                                    <AlignRight className="h-4 w-4"/>
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </PopoverContent>
                        </Popover>

                        {/* TABLE panel */}
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant={isTable ? "default" : "ghost"} size="sm" disabled={!isTable}
                                        className="h-8">
                                    <TableIcon className="h-4 w-4 mr-2"/>
                                    Table
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80" align="end">
                                {!isTable || !tableData ? (
                                    <div className="text-sm text-muted-foreground">Select a table</div>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-2 gap-2">
                                            <Button variant="outline" size="sm"
                                                    onClick={() => updateTable({rows: tableData.rows + 1})}>
                                                Add Row
                                            </Button>
                                            <Button variant="outline" size="sm"
                                                    onClick={() => updateTable({rows: Math.max(1, tableData.rows - 1)})}>
                                                Remove Row
                                            </Button>
                                            <Button variant="outline" size="sm"
                                                    onClick={() => updateTable({cols: tableData.cols + 1})}>
                                                Add Column
                                            </Button>
                                            <Button variant="outline" size="sm"
                                                    onClick={() => updateTable({cols: Math.max(1, tableData.cols - 1)})}>
                                                Remove Column
                                            </Button>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="text-xs">Cell Width</label>
                                                <Input
                                                    type="number"
                                                    value={tableData.cellW}
                                                    onChange={(e) => updateTable({cellW: parseInt(e.target.value || "0", 10)})}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs">Cell Height</label>
                                                <Input
                                                    type="number"
                                                    value={tableData.cellH}
                                                    onChange={(e) => updateTable({cellH: parseInt(e.target.value || "0", 10)})}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs">Border Color</label>
                                                <Input
                                                    type="color"
                                                    value={tableData.borderColor}
                                                    onChange={(e) => updateTable({borderColor: e.target.value})}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs">Border Width</label>
                                                <Input
                                                    type="number"
                                                    value={tableData.borderWidth}
                                                    onChange={(e) => updateTable({borderWidth: parseInt(e.target.value || "0", 10)})}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs">Padding X</label>
                                                <Input
                                                    type="number"
                                                    value={tableData.cellPadX}
                                                    onChange={(e) => updateTable({cellPadX: parseInt(e.target.value || "0", 10)})}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs">Padding Y</label>
                                                <Input
                                                    type="number"
                                                    value={tableData.cellPadY}
                                                    onChange={(e) => updateTable({cellPadY: parseInt(e.target.value || "0", 10)})}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </PopoverContent>
                        </Popover>

                    </div>
                </div>
            </div>
        </div>
    );
}

/** Tiny tooltip wrapper to keep JSX clean */
function Tip({label, children}: { label: string; children: React.ReactNode }) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>{children}</TooltipTrigger>
            <TooltipContent>{label}</TooltipContent>
        </Tooltip>
    );
}
