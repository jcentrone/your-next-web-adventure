import {Group, Line} from "fabric";
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

export function createTableGroup(
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
    const lines: Line[] = [];
    for (let i = 0; i <= rows; i++) {
        lines.push(
            new Line([0, i * cellH, cols * cellW, i * cellH], {
                stroke: borderColor,
                strokeWidth: borderWidth,
                selectable: false,
            }),
        );
    }
    for (let i = 0; i <= cols; i++) {
        lines.push(
            new Line([i * cellW, 0, i * cellW, rows * cellH], {
                stroke: borderColor,
                strokeWidth: borderWidth,
                selectable: false,
            }),
        );
    }
    const group = new Group(lines, {left, top, name: "Table"});
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
