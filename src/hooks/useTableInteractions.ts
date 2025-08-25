import {useEffect, useRef} from "react";
import {Group, Rect, Image} from "fabric";
import type {Canvas as FabricCanvas, FabricObject} from "fabric";
import type {TableData} from "@/lib/fabricTables";
import {startCellEdit} from "@/lib/fabricTables";

type CellPos = {row: number; col: number};

type Selection = {
    table: Group;
    start: CellPos;
    end: CellPos;
};

type Args = {
    canvas: FabricCanvas | null;
};

export function useTableInteractions({canvas}: Args) {
    const selectionRef = useRef<Selection | null>(null);
    const overlayRef = useRef<Rect | null>(null);
    const draggingRef = useRef(false);

    useEffect(() => {
        if (!canvas) return;

        const clear = () => {
            const sel = selectionRef.current;
            if (sel) {
                sel.table.off("moving", updateOverlay);
            }
            if (sel && overlayRef.current) {
                canvas.remove(overlayRef.current);
                overlayRef.current = null;
                canvas.requestRenderAll();
            }
            selectionRef.current = null;
        };

        const updateOverlay = () => {
            const sel = selectionRef.current;
            if (!sel) return;
            sel.table.setCoords();
            const data = (sel.table as unknown as {data: TableData}).data;
            const r1 = Math.min(sel.start.row, sel.end.row);
            const r2 = Math.max(sel.start.row, sel.end.row);
            const c1 = Math.min(sel.start.col, sel.end.col);
            const c2 = Math.max(sel.start.col, sel.end.col);
            const left = data.colWidths.slice(0, c1).reduce((a, b) => a + b, 0);
            const top = data.rowHeights.slice(0, r1).reduce((a, b) => a + b, 0);
            const width = data.colWidths.slice(c1, c2 + 1).reduce((a, b) => a + b, 0);
            const height = data.rowHeights.slice(r1, r2 + 1).reduce((a, b) => a + b, 0);
            const tableLeft = sel.table.left ?? 0;
            const tableTop = sel.table.top ?? 0;
            const baseLeft = tableLeft + left;
            const baseTop = tableTop + top;
            if (!overlayRef.current) {
                overlayRef.current = new Rect({
                    left: baseLeft,
                    top: baseTop,
                    width,
                    height,
                    fill: "rgba(33,150,243,0.1)",
                    stroke: "#2196f3",
                    strokeWidth: 1,
                    selectable: false,
                    evented: false,
                    absolutePositioned: true,
                    excludeFromExport: true,
                });
                canvas.add(overlayRef.current);
            } else {
                overlayRef.current.set({left: baseLeft, top: baseTop, width, height});
            }
            overlayRef.current.bringToFront?.();
            canvas.requestRenderAll();
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            const sel = selectionRef.current;
            if (!sel) return;
            const data = (sel.table as unknown as {data: TableData}).data;
            let {row, col} = sel.end;
            let handled = false;
            switch (e.key) {
                case "ArrowUp":
                    if (row > 0) {row -= 1; handled = true;}
                    break;
                case "ArrowDown":
                    if (row < data.rows - 1) {row += 1; handled = true;}
                    break;
                case "ArrowLeft":
                    if (col > 0) {col -= 1; handled = true;}
                    break;
                case "ArrowRight":
                    if (col < data.cols - 1) {col += 1; handled = true;}
                    break;
                case "Tab":
                    handled = true;
                    if (e.shiftKey) {
                        if (col > 0) {
                            col -= 1;
                        } else if (row > 0) {
                            row -= 1;
                            col = data.cols - 1;
                        }
                    } else {
                        if (col < data.cols - 1) {
                            col += 1;
                        } else if (row < data.rows - 1) {
                            row += 1;
                            col = 0;
                        }
                    }
                    break;
                default:
                    break;
            }
            if (!handled) return;
            e.preventDefault();
            e.stopImmediatePropagation();
            if (e.shiftKey && e.key.startsWith("Arrow")) {
                sel.end = {row, col};
            } else if (e.shiftKey && e.key === "Tab") {
                sel.end = {row, col};
            } else {
                sel.start = {row, col};
                sel.end = {row, col};
            }
            updateOverlay();
        };

        const handleMouseDown = (opt: {target?: FabricObject | null; e: MouseEvent}) => {
            const target = opt.target as (FabricObject & {name?: string; group?: Group | null; data?: Record<string, unknown>}) | undefined;
            if (!target) {
                clear();
                return;
            }
            let cell: Group | null = null;
            let table: Group | null = null;
            if (target.name === "Cell") {
                cell = target as unknown as Group;
                table = (cell.group as Group) || null;
            } else if (target.group && target.group.name === "Cell") {
                cell = target.group as Group;
                table = (cell.group as Group) || null;
            } else if ((target.data as Record<string, unknown> | undefined)?.type === "table") {
                table = target as unknown as Group;
            } else {
                clear();
                return;
            }
            if (!table) {
                clear();
                return;
            }
            if (cell) {
                const cellData = (cell as unknown as {data: {row: number; col: number}}).data;
                const row = cellData.row;
                const col = cellData.col;
                if (opt.e.shiftKey && selectionRef.current?.table === table) {
                    selectionRef.current!.end = {row, col};
                } else {
                    selectionRef.current = {table, start: {row, col}, end: {row, col}};
                }
            } else {
                selectionRef.current = {table, start: {row: 0, col: 0}, end: {row: 0, col: 0}};
            }
            table.bringToFront?.();
            canvas.setActiveObject(table);
            canvas.requestRenderAll();
            selectionRef.current.table.on("moving", updateOverlay);
            updateOverlay();
            draggingRef.current = true;
        };

        const handleMouseMove = (opt: {target?: FabricObject | null; e: MouseEvent}) => {
            if (!draggingRef.current) return;
            const sel = selectionRef.current;
            if (!sel) return;
            const t = canvas.findTarget(opt.e, true) as (FabricObject & {
                name?: string;
                group?: Group | null;
                data?: Record<string, unknown>;
            }) | null;
            if (!t) return;
            let cell: Group | null = null;
            if (t.name === "Cell") {
                cell = t as unknown as Group;
            } else if (t.group && t.group.name === "Cell") {
                cell = t.group as Group;
            }
            if (!cell || cell.group !== sel.table) return;
            const cellData = (cell as unknown as {data: {row: number; col: number}}).data;
            sel.end = {row: cellData.row, col: cellData.col};
            updateOverlay();
        };

        const handleMouseUp = () => {
            draggingRef.current = false;
        };

        const handleDblClick = (opt: {target?: FabricObject | null; e: MouseEvent}) => {
            const target = opt.target as (FabricObject & {name?: string; group?: Group | null; data?: Record<string, unknown>}) | undefined;
            if (!target) return;
            let cell: Group | null = null;
            let table: Group | null = null;
            if (target.name === "Cell") {
                cell = target as unknown as Group;
                table = (cell.group as Group) || null;
            } else if (target.group && target.group.name === "Cell") {
                cell = target.group as Group;
                table = (cell.group as Group) || null;
            }
            if (!cell || !table) return;
            const cellData = (cell as unknown as {data: {row: number; col: number}}).data;
            startCellEdit(table, cellData.row, cellData.col);
        };

        const handleDrop = (opt: {e: DragEvent}) => {
            opt.e.preventDefault();
            const file = opt.e.dataTransfer?.files?.[0];
            if (!file) return;
            const target = canvas.findTarget(opt.e, true) as (FabricObject & {
                name?: string;
                group?: Group | null;
                data?: Record<string, unknown>;
            }) | null;
            if (!target) return;
            let cell: Group | null = null;
            let table: Group | null = null;
            if (target.name === "Cell") {
                cell = target as unknown as Group;
                table = (cell.group as Group) || null;
            } else if (target.group && target.group.name === "Cell") {
                cell = target.group as Group;
                table = (cell.group as Group) || null;
            }
            if (!cell || !table) return;
            const reader = new FileReader();
            reader.onload = () => {
                Image.fromURL(reader.result as string, (img) => {
                    const cellData = (cell as unknown as {data: {row: number; col: number}}).data;
                    const data = (table as unknown as {data: TableData}).data;
                    const pad = data.cellPaddings[cellData.row][cellData.col];
                    const width = data.colWidths[cellData.col] - 2 * pad.x;
                    const height = data.rowHeights[cellData.row] - 2 * pad.y;
                    cell.getObjects("image").forEach((o) => cell.remove(o));
                    const clip = new Rect({
                        left: 0,
                        top: 0,
                        width,
                        height,
                        originX: "left",
                        originY: "top",
                    });
                    const scale = Math.min(
                        width / (img.width || 1),
                        height / (img.height || 1),
                    );
                    img.set({
                        left: pad.x,
                        top: pad.y,
                        originX: "left",
                        originY: "top",
                        selectable: false,
                        clipPath: clip,
                    });
                    img.scale(scale);
                    cell.addWithUpdate(img);
                    (cell as unknown as {data: {imageUrl?: string}}).data.imageUrl = reader.result as string;
                    table.dirty = true;
                    canvas.requestRenderAll();
                });
            };
            reader.readAsDataURL(file);
        };

        const handleDragOver = (opt: {e: DragEvent}) => {
            opt.e.preventDefault();
        };

        const handleSelectionCleared = () => {
            clear();
        };

        canvas.on("mouse:down", handleMouseDown);
        canvas.on("mouse:move", handleMouseMove);
        canvas.on("mouse:up", handleMouseUp);
        canvas.on("mouse:dblclick", handleDblClick);
        canvas.on("drop", handleDrop);
        canvas.on("dragover", handleDragOver);
        canvas.on("selection:cleared", handleSelectionCleared);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            canvas.off("mouse:down", handleMouseDown);
            canvas.off("mouse:move", handleMouseMove);
            canvas.off("mouse:up", handleMouseUp);
            canvas.off("mouse:dblclick", handleDblClick);
            canvas.off("drop", handleDrop);
            canvas.off("dragover", handleDragOver);
            canvas.off("selection:cleared", handleSelectionCleared);
            document.removeEventListener("keydown", handleKeyDown);
            draggingRef.current = false;
            clear();
        };
    }, [canvas]);
    return selectionRef;
}

