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
            (cell as any).data = {row: r, col: c, content: ""};
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
