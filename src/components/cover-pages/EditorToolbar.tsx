// src/components/cover-pages/EditorToolbar.tsx
import React from "react";
import {Button} from "@/components/ui/button";
import {Separator} from "@/components/ui/separator";
import {Tooltip, TooltipContent, TooltipTrigger, TooltipProvider} from "@/components/ui/tooltip";

import {
    AlignHorizontalJustifyCenter,
    AlignStartVertical,
    AlignEndVertical,
    AlignVerticalJustifyCenter,
    AlignVerticalJustifyStart,
    AlignVerticalJustifyEnd,
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
    Trash2,
    Undo2,
    Ungroup,
    ZoomIn,
    ZoomOut,
} from "lucide-react";


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
        onBringForward, onSendBackward,

        // optional
        isPanning, onTogglePan,
        snapEnabled, onToggleSnap,
        onDistribute,
        onBringToFront, onSendToBack,
    } = props;
    const hasSelection = selectedObjects.length > 0;
    const hasMultipleSelection = selectedObjects.length > 1;

    return (
        <TooltipProvider>
            <div id="editor_toolbar" className="w-full">
                <div className="w-full overflow-x-auto">
                    <div className="flex w-max items-center justify-center gap-2 p-3 bg-transparent">
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
                            <Tip label={hasMultipleSelection ? "Align left" : "Select multiple objects to align"}>
                                <Button variant="ghost" size="sm" onClick={() => onAlign("left")}
                                        disabled={!hasMultipleSelection} aria-disabled={!hasMultipleSelection} className="h-8 w-8 p-0">
                                    <AlignStartVertical className="h-4 w-4"/>
                                </Button>
                            </Tip>
                            <Tip label={hasMultipleSelection ? "Align horizontal center" : "Select multiple objects to align"}>
                                <Button variant="ghost" size="sm" onClick={() => onAlign("centerH")}
                                        disabled={!hasMultipleSelection} aria-disabled={!hasMultipleSelection} className="h-8 w-8 p-0">
                                    <AlignHorizontalJustifyCenter className="h-4 w-4"/>
                                </Button>
                            </Tip>
                            <Tip label={hasMultipleSelection ? "Align right" : "Select multiple objects to align"}>
                                <Button variant="ghost" size="sm" onClick={() => onAlign("right")}
                                        disabled={!hasMultipleSelection} aria-disabled={!hasMultipleSelection} className="h-8 w-8 p-0">
                                    <AlignEndVertical className="h-4 w-4"/>
                                </Button>
                            </Tip>
                            <Tip label={hasMultipleSelection ? "Align top" : "Select multiple objects to align"}>
                                <Button variant="ghost" size="sm" onClick={() => onAlign("top")}
                                        disabled={!hasMultipleSelection} aria-disabled={!hasMultipleSelection} className="h-8 w-8 p-0">
                                    <AlignVerticalJustifyStart className="h-4 w-4"/>
                                </Button>
                            </Tip>
                            <Tip label={hasMultipleSelection ? "Align vertical center" : "Select multiple objects to align"}>
                                <Button variant="ghost" size="sm" onClick={() => onAlign("centerV")}
                                        disabled={!hasMultipleSelection} aria-disabled={!hasMultipleSelection} className="h-8 w-8 p-0">
                                    <AlignVerticalJustifyCenter className="h-4 w-4"/>
                                </Button>
                            </Tip>
                            <Tip label={hasMultipleSelection ? "Align bottom" : "Select multiple objects to align"}>
                                <Button variant="ghost" size="sm" onClick={() => onAlign("bottom")}
                                        disabled={!hasMultipleSelection} aria-disabled={!hasMultipleSelection} className="h-8 w-8 p-0">
                                    <AlignVerticalJustifyEnd className="h-4 w-4"/>
                                </Button>
                            </Tip>

                            {/* Distribute (optional) */}
                            <Tip label={hasMultipleSelection ? "Distribute horizontally" : "Select multiple objects to align"}>
                                <Button
                                    variant="ghost" size="sm"
                                    onClick={() => onDistribute?.("h")}
                                    disabled={!hasMultipleSelection || !onDistribute}
                                    aria-disabled={!hasMultipleSelection || !onDistribute}
                                    className="h-8 w-8 p-0"
                                >
                                    <BetweenHorizontalStart className="h-4 w-4"/>
                                </Button>
                            </Tip>
                            <Tip label={hasMultipleSelection ? "Distribute vertically" : "Select multiple objects to align"}>
                                <Button
                                    variant="ghost" size="sm"
                                    onClick={() => onDistribute?.("v")}
                                    disabled={!hasMultipleSelection || !onDistribute}
                                    aria-disabled={!hasMultipleSelection || !onDistribute}
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
                                <input
                                    type="number"
                                    value={Math.round(zoom * 100)}
                                    onChange={(e) => {
                                        const value = Math.min(500, Math.max(10, Number(e.target.value || 0)));
                                        onZoomChange(value / 100);
                                    }}
                                    className="w-16 h-8 text-xs text-center border rounded"
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

                             <Separator orientation="vertical" className="h-6"/>

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

                    </div>
                </div>
            </div>
        </div>
        </TooltipProvider>
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
