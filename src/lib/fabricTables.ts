import {Group, Rect, Textbox} from "fabric";
import {enableScalingHandles} from "./fabricShapes";

export interface TableData {
    type: "table";
    rows: number;
    cols: number;
    cellW: number;
    cellH: number;
    borderColor: string;
    borderWidth: number;
    cellPadX: number;
    cellPadY: number;
    headerRow?: boolean;
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
    const cells: Group[] = [];
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const rect = new Rect({
                left: 0,
                top: 0,
                width: cellW,
                height: cellH,
                fill: "white",
                stroke: borderColor,
                strokeWidth: borderWidth,
                selectable: false,
            });
            const textbox = new Textbox("", {
                left: cellPadX,
                top: cellPadY,
                width: cellW - 2 * cellPadX,
                height: cellH - 2 * cellPadY,
                fontSize: 14,
                fill: "#000",
                selectable: false,
            });
            const cell = new Group([rect, textbox], {
                left: c * cellW,
                top: r * cellH,
                selectable: false,
                name: "Cell",
            });
            (cell as any).data = {row: r, col: c, content: "", imageUrl: ""};
            cells.push(cell);
        }
    }
    const group = new Group(cells, {left, top, name: "Table"});
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
    };
    (group as any).data = data;
    enableScalingHandles(group);
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

function createCell(
    row: number,
    col: number,
    data: TableData
) {
    const rect = new Rect({
        left: 0,
        top: 0,
        width: data.cellW,
        height: data.cellH,
        fill: "white",
        stroke: data.borderColor,
        strokeWidth: data.borderWidth,
        selectable: false,
    });
    const textbox = new Textbox("", {
        left: data.cellPadX,
        top: data.cellPadY,
        width: data.cellW - 2 * data.cellPadX,
        height: data.cellH - 2 * data.cellPadY,
        fontSize: 14,
        fill: "#000",
        selectable: false,
    });
    const cell = new Group([rect, textbox], {
        left: col * data.cellW,
        top: row * data.cellH,
        selectable: false,
        name: "Cell",
    });
    (cell as any).data = {row, col, content: "", imageUrl: ""};
    return cell;
}

export function insertRow(table: Group, index?: number) {
    const data = (table as any).data as TableData;
    const rowIndex = index ?? data.rows;
    for (let c = 0; c < data.cols; c++) {
        const cell = createCell(rowIndex, c, data);
        table.addWithUpdate(cell);
    }
    data.rows += 1;
    table.height = data.rows * data.cellH;
    table.dirty = true;
    table.canvas?.requestRenderAll();
}

export function deleteRow(table: Group, index?: number) {
    const data = (table as any).data as TableData;
    if (data.rows <= 1) return;
    const rowIndex = index ?? data.rows - 1;
    table.getObjects()
        .filter((o) => (o as any).data?.row === rowIndex)
        .forEach((o) => table.remove(o));
    // Shift rows above removed row
    table.getObjects().forEach((o) => {
        const d = (o as any).data;
        if (d && typeof d.row === "number" && d.row > rowIndex) {
            d.row -= 1;
            o.top = d.row * data.cellH;
        }
    });
    data.rows -= 1;
    table.height = data.rows * data.cellH;
    table.dirty = true;
    table.canvas?.requestRenderAll();
}

export function insertColumn(table: Group, index?: number) {
    const data = (table as any).data as TableData;
    const colIndex = index ?? data.cols;
    for (let r = 0; r < data.rows; r++) {
        const cell = createCell(r, colIndex, data);
        table.addWithUpdate(cell);
    }
    data.cols += 1;
    table.width = data.cols * data.cellW;
    table.dirty = true;
    table.canvas?.requestRenderAll();
}

export function deleteColumn(table: Group, index?: number) {
    const data = (table as any).data as TableData;
    if (data.cols <= 1) return;
    const colIndex = index ?? data.cols - 1;
    table.getObjects()
        .filter((o) => (o as any).data?.col === colIndex)
        .forEach((o) => table.remove(o));
    table.getObjects().forEach((o) => {
        const d = (o as any).data;
        if (d && typeof d.col === "number" && d.col > colIndex) {
            d.col -= 1;
            o.left = d.col * data.cellW;
        }
    });
    data.cols -= 1;
    table.width = data.cols * data.cellW;
    table.dirty = true;
    table.canvas?.requestRenderAll();
}

export function toggleHeaderRow(table: Group) {
    const data = (table as any).data as TableData;
    data.headerRow = !data.headerRow;
    table.getObjects().forEach((o) => {
        const d = (o as any).data;
        if (d?.row === 0) {
            const rect = o
                .getObjects()
                .find((obj) => obj.type === "rect") as Rect | undefined;
            const textbox = o
                .getObjects()
                .find((obj) => obj.type === "textbox") as Textbox | undefined;
            if (rect) rect.set({fill: data.headerRow ? "#f0f0f0" : "white"});
            if (textbox) textbox.set({fontWeight: data.headerRow ? "bold" : "normal"});
        }
    });
    table.dirty = true;
    table.canvas?.requestRenderAll();
}
