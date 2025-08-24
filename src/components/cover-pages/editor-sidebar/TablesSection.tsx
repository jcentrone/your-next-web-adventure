import {useState} from "react";
import {Button} from "@/components/ui/button.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Label} from "@/components/ui/label.tsx";
import {Table as TableIcon} from "lucide-react";

export function TablesSection({
                                  addTable,
                              }: {
    addTable?: (rows: number, cols: number, borderColor: string) => void;
}) {
    const [tableRows, setTableRows] = useState(2);
    const [tableCols, setTableCols] = useState(2);
    const [tableBorderColor, setTableBorderColor] = useState("#000000");

    return (
        <div className="space-y-2">
            <div>
                <Label htmlFor="table-rows">Rows</Label>
                <Input
                    id="table-rows"
                    type="number"
                    value={tableRows}
                    onChange={(e) => setTableRows(parseInt(e.target.value, 10))}
                />
            </div>
            <div>
                <Label htmlFor="table-cols">Columns</Label>
                <Input
                    id="table-cols"
                    type="number"
                    value={tableCols}
                    onChange={(e) => setTableCols(parseInt(e.target.value, 10))}
                />
            </div>
            <div>
                <Label htmlFor="table-border-color">Border Color</Label>
                <Input
                    id="table-border-color"
                    type="color"
                    value={tableBorderColor}
                    onChange={(e) => setTableBorderColor(e.target.value)}
                />
            </div>

            <Button
                onClick={() => addTable?.(tableRows, tableCols, tableBorderColor)}
                className="w-full"
            >
                <TableIcon className="mr-2 h-4 w-4"/> Add Table
            </Button>
        </div>
    );
}
