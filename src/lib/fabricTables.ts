import {Group, Rect, Textbox} from "fabric";
import {enableScalingHandles} from "./fabricShapes";

export interface TableData {
    type: "table";
    rows: number;
    cols: number;
    /** Default cell width */
    cellW: number;
    /** Default cell height */
    cellH: number;
    borderColor: string;
    borderWidth: number;
    /** Default horizontal padding */
    cellPadX: number;
    /** Default vertical padding */
    cellPadY: number;
    headerRow?: boolean;
    /** Per-column widths */
    colWidths: number[];
    /** Per-row heights */
    rowHeights: number[];
    /** Per-cell padding */
    cellPaddings: {x: number; y: number}[][];
    /** Per-cell background colors */
    cellBgColors: string[][];
}

export function createTable(
    rows: number,
    cols: number,
    cellW: number,
    cellH: number,
    borderColor: string,
    borderWidth: number,
    left = 100,
    top = 100,
    cellPadX = 8,
    cellPadY = 4
) {
    const data: TableData = {
        type: "table",
        rows,
        cols,
        cellW,
        cellH,
        borderColor,
        borderWidth,
        cellPadX,
        cellPadY,
        colWidths: Array(cols).fill(cellW),
        rowHeights: Array(rows).fill(cellH),
        cellPaddings: Array.from({length: rows}, () =>
            Array.from({length: cols}, () => ({x: cellPadX, y: cellPadY}))
        ),
        cellBgColors: Array.from({length: rows}, () =>
            Array.from({length: cols}, () => "white")
        ),
    };
    const cells: Group[] = [];
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const cell = createCell(r, c, data);
            cells.push(cell);
        }
    }
    const group = new Group(cells, {
        left,
        top,
        name: "Table",
        subTargetCheck: true,
        originX: "left",
        originY: "top",
    });
    (group as any).data = data;
    enableScalingHandles(group);
    layoutTable(group);
    return group;
}

export function getCell(table: Group, row: number, col: number) {
    return table
        .getObjects()
        .find((o) => (o as any).data?.row === row && (o as any).data?.col === col) as
        | Group
        | undefined;
}

export function setCellContent(
    table: Group,
    row: number,
    col: number,
    content: string,
) {
    const cell = getCell(table, row, col);
    if (!cell) return;
    const textbox = cell
        .getObjects()
        .find((o) => o.type === "textbox") as Textbox | undefined;
    if (textbox) {
        textbox.set({text: content});
    }
    const data = (cell as any).data;
    if (data) data.content = content;
    table.dirty = true;
    table.canvas?.requestRenderAll();
}

export function startCellEdit(table: Group, row: number, col: number) {
    const cell = getCell(table, row, col);
    if (!cell) return;
    const canvas = table.canvas;
    if (!canvas) return;
    const data = (table as any).data as TableData;
    const pad = data.cellPaddings[row][col];
    const cellRect = cell.getBoundingRect(true);
    const editor = new Textbox((cell as any).data?.content || "", {
        left: cellRect.left + pad.x,
        top: cellRect.top + pad.y,
        width: cellRect.width - 2 * pad.x,
        height: cellRect.height - 2 * pad.y,
        absolutePositioned: true,
    });
    canvas.add(editor);
    canvas.setActiveObject(editor);
    editor.enterEditing();
    editor.selectAll();
    const commit = () => {
        setCellContent(table, row, col, editor.text || "");
        canvas.remove(editor);
        canvas.requestRenderAll();
    };
    editor.on("editing:exited", commit);
    editor.on("keydown", (opt) => {
        if ((opt as any).e.key === "Enter" && !(opt as any).e.shiftKey) {
            editor.exitEditing();
        }
    });
}

export function layoutTable(table: Group) {
    const data = (table as any).data as TableData;
    let top = 0;
    for (let r = 0; r < data.rows; r++) {
        let left = 0;
        for (let c = 0; c < data.cols; c++) {
            const cell = getCell(table, r, c);
            if (!cell) continue;
            const width = data.colWidths[c];
            const height = data.rowHeights[r];
            const pad = data.cellPaddings[r][c];
            const bg = data.cellBgColors[r][c];
            cell.set({left, top});
            const rect = cell
                .getObjects()
                .find((o) => o.type === "rect") as Rect | undefined;
            const textbox = cell
                .getObjects()
                .find((o) => o.type === "textbox") as Textbox | undefined;
            if (rect)
                rect.set({width, height, fill: bg, stroke: data.borderColor, strokeWidth: data.borderWidth});
            if (textbox)
                textbox.set({
                    left: pad.x,
                    top: pad.y,
                    width: width - 2 * pad.x,
                    height: height - 2 * pad.y,
                });
            left += width;
        }
        top += data.rowHeights[r];
    }
    table.width = data.colWidths.reduce((a, b) => a + b, 0);
    table.height = data.rowHeights.reduce((a, b) => a + b, 0);
    attachResizeHandles(table);
    table.setCoords();
    table.dirty = true;
    table.canvas?.requestRenderAll();
}

function attachResizeHandles(table: Group) {
    const data = (table as any).data as TableData;
    const canvas = table.canvas;
    const existing = (table as any).tableHandles as Group[] | undefined;
    if (existing) {
        existing.forEach((h) => canvas?.remove(h));
    }
    const moveHandler = (table as any)._tableMoveHandler as (() => void) | undefined;
    if (moveHandler) table.off("moving", moveHandler);
    if (!canvas || canvas.getActiveObject() !== table) {
        (table as any)._tableMoveHandler = undefined;
        (table as any).tableHandles = undefined;
        canvas?.requestRenderAll();
        return;
    }
    const handles: Group[] = [];
    const totalHeight = data.rowHeights.reduce((a, b) => a + b, 0);
    const totalWidth = data.colWidths.reduce((a, b) => a + b, 0);
    const {left: tableLeft, top: tableTop} = table.getBoundingRect(true);
    // Column handles
    for (let c = 1; c < data.cols; c++) {
        const x = data.colWidths.slice(0, c).reduce((a, b) => a + b, 0) - 2;
        const baseX = tableLeft + x;
        const baseY = tableTop;
        const handle = new Rect({
            left: baseX,
            top: baseY,
            width: 4,
            height: totalHeight,
            fill: "transparent",
            hasBorders: false,
            hasControls: false,
            lockMovementY: true,
            cursor: "ew-resize",
        });
        (handle as any).data = {type: "col-handle", col: c};
        handle.on("moving", () => {
            const boundary = tableLeft + data.colWidths.slice(0, c).reduce((a, b) => a + b, 0);
            const delta = handle.left + handle.width / 2 - boundary;
            if (delta === 0) return;
            const prev = data.colWidths[c - 1] + delta;
            const next = data.colWidths[c] - delta;
            if (prev <= 10 || next <= 10) {
                updateHandles(table);
                return;
            }
            data.colWidths[c - 1] = prev;
            data.colWidths[c] = next;
            layoutTable(table);
        });
        handle.set({absolutePositioned: true, excludeFromExport: true});
        handles.push(handle);
        canvas.add(handle);
    }
    // Row handles
    for (let r = 1; r < data.rows; r++) {
        const y = data.rowHeights.slice(0, r).reduce((a, b) => a + b, 0) - 2;
        const baseY = tableTop + y;
        const baseX = tableLeft;
        const handle = new Rect({
            left: baseX,
            top: baseY,
            width: totalWidth,
            height: 4,
            fill: "transparent",
            hasBorders: false,
            hasControls: false,
            lockMovementX: true,
            cursor: "ns-resize",
        });
        (handle as any).data = {type: "row-handle", row: r};
        handle.on("moving", () => {
            const boundary = tableTop + data.rowHeights.slice(0, r).reduce((a, b) => a + b, 0);
            const delta = handle.top + handle.height / 2 - boundary;
            if (delta === 0) return;
            const prev = data.rowHeights[r - 1] + delta;
            const next = data.rowHeights[r] - delta;
            if (prev <= 10 || next <= 10) {
                updateHandles(table);
                return;
            }
            data.rowHeights[r - 1] = prev;
            data.rowHeights[r] = next;
            layoutTable(table);
        });
        handle.set({absolutePositioned: true, excludeFromExport: true});
        handles.push(handle);
        canvas.add(handle);
    }
    (table as any).tableHandles = handles;
    const newMoveHandler = () => updateHandles(table);
    (table as any)._tableMoveHandler = newMoveHandler;
    table.on("moving", newMoveHandler);
    table.setCoords();
}

function updateHandles(table: Group) {
    const data = (table as any).data as TableData;
    const canvas = table.canvas;
    const handles = (table as any).tableHandles as Group[] | undefined;
    if (!canvas || !handles) return;
    if (canvas.getActiveObject() !== table) {
        handles.forEach((h) => canvas.remove(h));
        (table as any).tableHandles = undefined;
        canvas.requestRenderAll();
        return;
    }
    const totalHeight = data.rowHeights.reduce((a, b) => a + b, 0);
    const totalWidth = data.colWidths.reduce((a, b) => a + b, 0);
    const {left: tableLeft, top: tableTop} = table.getBoundingRect(true);
    handles.forEach((h) => {
        const d = (h as any).data;
        if (d?.type === "col-handle") {
            const x = data.colWidths.slice(0, d.col).reduce((a, b) => a + b, 0) - h.width / 2;
            const baseX = tableLeft + x;
            h.set({left: baseX, top: tableTop, height: totalHeight});
        } else if (d?.type === "row-handle") {
            const y = data.rowHeights.slice(0, d.row).reduce((a, b) => a + b, 0) - h.height / 2;
            const baseY = tableTop + y;
            h.set({top: baseY, left: tableLeft, width: totalWidth});
        }
        h.setCoords();
    });
    canvas.requestRenderAll();
}
function createCell(
    row: number,
    col: number,
    data: TableData
) {
    const width = data.colWidths[col];
    const height = data.rowHeights[row];
    const pad = data.cellPaddings[row][col];
    const bg = data.cellBgColors[row][col];
    const left = data.colWidths.slice(0, col).reduce((a, b) => a + b, 0);
    const top = data.rowHeights.slice(0, row).reduce((a, b) => a + b, 0);
    const rect = new Rect({
        left: 0,
        top: 0,
        width,
        height,
        fill: bg,
        stroke: data.borderColor,
        strokeWidth: data.borderWidth,
        selectable: false,
    });
    const textbox = new Textbox("", {
        left: pad.x,
        top: pad.y,
        width: width - 2 * pad.x,
        height: height - 2 * pad.y,
        fontSize: 14,
        fill: "#000",
        selectable: false,
    });
    const cell = new Group([rect, textbox], {
        left,
        top,
        selectable: false,
        name: "Cell",
    });
    (cell as any).data = {row, col, content: "", imageUrl: ""};
    return cell;
}

export function insertRow(table: Group, index?: number) {
    const data = (table as any).data as TableData;
    const rowIndex = index ?? data.rows;
    data.rowHeights.splice(rowIndex, 0, data.cellH);
    data.cellPaddings.splice(
        rowIndex,
        0,
        Array.from({length: data.cols}, () => ({x: data.cellPadX, y: data.cellPadY}))
    );
    data.cellBgColors.splice(
        rowIndex,
        0,
        Array.from({length: data.cols}, () => "white")
    );
    for (let c = 0; c < data.cols; c++) {
        const cell = createCell(rowIndex, c, data);
        table.addWithUpdate(cell);
    }
    table.getObjects().forEach((o) => {
        const d = (o as any).data;
        if (d && !d.type && typeof d.row === "number" && d.row >= rowIndex) {
            d.row += 1;
        }
    });
    data.rows += 1;
    layoutTable(table);
}

export function deleteRow(table: Group, index?: number) {
    const data = (table as any).data as TableData;
    if (data.rows <= 1) return;
    const rowIndex = index ?? data.rows - 1;
    table.getObjects()
        .filter((o) => (o as any).data?.row === rowIndex && !(o as any).data?.type)
        .forEach((o) => table.remove(o));
    table.getObjects().forEach((o) => {
        const d = (o as any).data;
        if (d && !d.type && typeof d.row === "number" && d.row > rowIndex) {
            d.row -= 1;
        }
    });
    data.rows -= 1;
    data.rowHeights.splice(rowIndex, 1);
    data.cellPaddings.splice(rowIndex, 1);
    data.cellBgColors.splice(rowIndex, 1);
    layoutTable(table);
}

export function insertColumn(table: Group, index?: number) {
    const data = (table as any).data as TableData;
    const colIndex = index ?? data.cols;
    data.colWidths.splice(colIndex, 0, data.cellW);
    for (let r = 0; r < data.rows; r++) {
        data.cellPaddings[r].splice(colIndex, 0, {x: data.cellPadX, y: data.cellPadY});
        data.cellBgColors[r].splice(colIndex, 0, "white");
        const cell = createCell(r, colIndex, data);
        table.addWithUpdate(cell);
    }
    table.getObjects().forEach((o) => {
        const d = (o as any).data;
        if (d && !d.type && typeof d.col === "number" && d.col >= colIndex) {
            d.col += 1;
        }
    });
    data.cols += 1;
    layoutTable(table);
}

export function deleteColumn(table: Group, index?: number) {
    const data = (table as any).data as TableData;
    if (data.cols <= 1) return;
    const colIndex = index ?? data.cols - 1;
    table.getObjects()
        .filter((o) => (o as any).data?.col === colIndex && !(o as any).data?.type)
        .forEach((o) => table.remove(o));
    table.getObjects().forEach((o) => {
        const d = (o as any).data;
        if (d && !d.type && typeof d.col === "number" && d.col > colIndex) {
            d.col -= 1;
        }
    });
    data.cols -= 1;
    data.colWidths.splice(colIndex, 1);
    for (let r = 0; r < data.rows; r++) {
        data.cellPaddings[r].splice(colIndex, 1);
        data.cellBgColors[r].splice(colIndex, 1);
    }
    layoutTable(table);
}

export function toggleHeaderRow(table: Group) {
    const data = (table as any).data as TableData;
    data.headerRow = !data.headerRow;
    table.getObjects().forEach((o) => {
        const d = (o as any).data;
        if (d?.row === 0 && !d.type) {
            const rect = o
                .getObjects()
                .find((obj) => obj.type === "rect") as Rect | undefined;
            const textbox = o
                .getObjects()
                .find((obj) => obj.type === "textbox") as Textbox | undefined;
            if (rect) rect.set({fill: data.headerRow ? "#f0f0f0" : data.cellBgColors[0][d.col]});
            if (textbox) textbox.set({fontWeight: data.headerRow ? "bold" : "normal"});
        }
    });
    table.dirty = true;
    table.canvas?.requestRenderAll();
}
